
/* =========================================================
   PARCELPRO - ADMIN_PARCELS.JS
   Parcel Management System
   Add + Edit + Delete + Search + Filter
   Customer Portal Integration
   Data Visualisation - Infographic Dashboard
   Storage: localStorage
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. SHARED ADMIN SYSTEM
  // =======================================================

  const Admin = window.ParcelProAdmin;

  if (!Admin) {
    console.error("ParcelProAdmin not found. Check admin_common.js.");
    return;
  }

  // Authentication
  if (typeof Admin.requireAdmin === "function") {
    Admin.requireAdmin();
  } else if (
    typeof Admin.isLoggedIn === "function" &&
    !Admin.isLoggedIn()
  ) {
    window.location.href = "admin.html";
    return;
  }

  const STORAGE = Admin.STORAGE || {
    parcels: "parcelpro_parcels",
    customers: "parcelpro_customers"
  };

  const $ = Admin.$ || (selector =>
    document.querySelector(selector)
  );

  // =======================================================
  // 2. DOM ELEMENTS
  // =======================================================

  const elements = {
    table: $("#parcelsTableBody"),
    search: $("#parcelSearch"),
    filter: $("#statusFilter"),
    count: $("#parcelCountLabel"),

    // Infographic elements
    chart: $("#parcelStatusChart"),
    chartEmpty: $("#chartEmptyMessage"),

    total: $("#analyticsTotal"),
    pending: $("#analyticsPending"),
    transit: $("#analyticsTransit"),
    delivered: $("#analyticsDelivered"),

    deliveryRateLabel: $("#deliveryRateLabel"),
    deliveryRateBar: $("#deliveryRateBar"),
    deliveryRateDescription: $("#deliveryRateDescription"),

    activeRateLabel: $("#activeRateLabel"),
    activeRateBar: $("#activeRateBar"),
    activeRateDescription: $("#activeRateDescription"),

    cancelledRateLabel: $("#cancelledRateLabel"),
    cancelledRateBar: $("#cancelledRateBar"),
    cancelledRateDescription: $("#cancelledRateDescription"),

    performanceTotal: $("#performanceTotal"),

    modal: $("#parcelModal"),
    modalTitle: $("#parcelModalTitle"),
    form: $("#parcelForm"),
    editId: $("#parcelEditId"),

    recipient: $("#parcelRecipient"),
    phone: $("#parcelPhone"),
    address: $("#parcelAddress"),
    type: $("#parcelType"),
    shippingFee: $("#parcelShippingFee"),
    date: $("#parcelDate"),
    status: $("#parcelStatus"),
    courier: $("#parcelCourier"),

    proof: $("#deliveryProof"),
    proofPreview: $("#proofPreview")
  };

  // =======================================================
  // 3. STORAGE FUNCTIONS
  // =======================================================

  function readList(key) {
    try {
      if (typeof Admin.readList === "function") {
        const result = Admin.readList(key);
        return Array.isArray(result) ? result : [];
      }

      const result = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(result) ? result : [];

    } catch (error) {
      console.error("Unable to read storage:", key, error);
      return [];
    }
  }

  function getParcels() {
    return readList(STORAGE.parcels);
  }

  function getCustomers() {
    return readList(STORAGE.customers);
  }

  function saveParcels(parcels) {
    try {
      if (typeof Admin.saveList === "function") {
        Admin.saveList(STORAGE.parcels, parcels);
      } else if (typeof Admin.save === "function") {
        Admin.save(STORAGE.parcels, parcels);
      } else {
        localStorage.setItem(
          STORAGE.parcels,
          JSON.stringify(parcels)
        );
      }

      window.dispatchEvent(
        new CustomEvent("parcelpro:dataUpdated", {
          detail: { key: STORAGE.parcels }
        })
      );

      return true;

    } catch (error) {
      console.error("Unable to save parcels:", error);

      showToast(
        "Unable to save. Browser storage may be full.",
        "error"
      );

      return false;
    }
  }

  // =======================================================
  // 4. HELPER FUNCTIONS
  // =======================================================

  function escapeHTML(value) {
    if (typeof Admin.escapeHTML === "function") {
      return Admin.escapeHTML(value ?? "");
    }

    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function money(value) {
    if (typeof Admin.money === "function") {
      return Admin.money(Number(value) || 0);
    }

    return "RM " + (Number(value) || 0).toFixed(2);
  }

  function dateFormat(value) {
    if (!value) return "-";

    if (typeof Admin.dateFormat === "function") {
      return Admin.dateFormat(value);
    }

    const date = new Date(value + "T00:00:00");

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-MY");
  }

  function statusClass(status) {
    if (typeof Admin.statusClass === "function") {
      return Admin.statusClass(status);
    }

    return String(status || "pending")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function showToast(message, type = "success") {
    if (typeof Admin.toast === "function") {
      Admin.toast(message, type);
      return;
    }

    const toastElement = $("#appToast");
    const messageElement = $("#toastMessage");

    if (toastElement && messageElement && window.bootstrap) {
      messageElement.textContent = message;

      bootstrap.Toast.getOrCreateInstance(
        toastElement
      ).show();
    } else {
      alert(message);
    }
  }

  function getCustomerName(customer) {
    return (
      customer.name ||
      customer.fullName ||
      customer.customerName ||
      customer.username ||
      customer.email ||
      "Customer"
    );
  }

  function findCustomer(value) {
    const searchValue = String(value || "").toLowerCase();

    return getCustomers().find(customer =>
      String(customer.id || "") === String(value) ||
      String(customer.email || "").toLowerCase() === searchValue ||
      getCustomerName(customer).toLowerCase() === searchValue
    );
  }

  function generateParcelId() {
    const parcels = getParcels();
    let id;

    do {
      id = "PCL" +
        Date.now().toString().slice(-8) +
        Math.floor(Math.random() * 1000);
    } while (
      parcels.some(parcel => String(parcel.id) === id)
    );

    return id;
  }

  // =======================================================
  // 4A. INFOGRAPHIC - PARCEL STATUS CONFIGURATION
  // =======================================================

  let parcelStatusChart = null;

  const chartStatuses = [
    "Pending",
    "Processing",
    "Picked Up",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Failed",
    "Cancelled"
  ];

  const chartColors = [
    "#f0ad4e",
    "#6c8ebf",
    "#8874bd",
    "#36a2eb",
    "#5bc0de",
    "#45b878",
    "#dc6b6b",
    "#9299a3"
  ];

  function normalizeStatus(parcel) {
    return String(parcel.status || "Pending")
      .trim()
      .toLowerCase();
  }

  function getStatusCount(parcels, status) {
    return parcels.filter(parcel =>
      normalizeStatus(parcel) === status.toLowerCase()
    ).length;
  }

  function calculatePercentage(value, total) {
    if (!total) return 0;

    return Math.round((value / total) * 1000) / 10;
  }

  // =======================================================
  // 4B. INFOGRAPHIC - UPDATE SUMMARY CARDS
  // =======================================================

  function updateSummaryCards(parcels) {

    const total = parcels.length;

    const pending = getStatusCount(
      parcels,
      "Pending"
    );

    const transit = parcels.filter(parcel => [
      "processing",
      "picked up",
      "in transit",
      "out for delivery"
    ].includes(normalizeStatus(parcel))).length;

    const delivered = getStatusCount(
      parcels,
      "Delivered"
    );

    if (elements.total) {
      elements.total.textContent = total;
    }

    if (elements.pending) {
      elements.pending.textContent = pending;
    }

    if (elements.transit) {
      elements.transit.textContent = transit;
    }

    if (elements.delivered) {
      elements.delivered.textContent = delivered;
    }
  }

  // =======================================================
  // 4C. INFOGRAPHIC - UPDATE PERFORMANCE BARS
  // =======================================================

  function updatePerformance(parcels) {

    const total = parcels.length;

    const delivered = getStatusCount(
      parcels,
      "Delivered"
    );

    const cancelled = getStatusCount(
      parcels,
      "Cancelled"
    );

    const active = parcels.filter(parcel => [
      "processing",
      "picked up",
      "in transit",
      "out for delivery"
    ].includes(normalizeStatus(parcel))).length;

    const deliveryRate = calculatePercentage(
      delivered,
      total
    );

    const activeRate = calculatePercentage(
      active,
      total
    );

    const cancelledRate = calculatePercentage(
      cancelled,
      total
    );

    if (elements.deliveryRateLabel) {
      elements.deliveryRateLabel.textContent =
        deliveryRate + "%";
    }

    if (elements.deliveryRateBar) {
      elements.deliveryRateBar.style.width =
        deliveryRate + "%";
    }

    if (elements.deliveryRateDescription) {
      elements.deliveryRateDescription.textContent =
        `${delivered} of ${total} parcels delivered`;
    }

    if (elements.activeRateLabel) {
      elements.activeRateLabel.textContent =
        activeRate + "%";
    }

    if (elements.activeRateBar) {
      elements.activeRateBar.style.width =
        activeRate + "%";
    }

    if (elements.activeRateDescription) {
      elements.activeRateDescription.textContent =
        `${active} active shipments`;
    }

    if (elements.cancelledRateLabel) {
      elements.cancelledRateLabel.textContent =
        cancelledRate + "%";
    }

    if (elements.cancelledRateBar) {
      elements.cancelledRateBar.style.width =
        cancelledRate + "%";
    }

    if (elements.cancelledRateDescription) {
      elements.cancelledRateDescription.textContent =
        `${cancelled} cancelled parcels`;
    }

    if (elements.performanceTotal) {
      elements.performanceTotal.textContent = total;
    }
  }

  // =======================================================
  // 4D. INFOGRAPHIC - DOUGHNUT CHART
  // =======================================================

  function renderParcelChart(parcels) {

    if (!elements.chart) return;

    if (typeof Chart === "undefined") {
      console.error(
        "Chart.js not loaded. Check your internet connection or Chart.js script."
      );
      return;
    }

    const statusCounts = chartStatuses.map(status =>
      getStatusCount(parcels, status)
    );

    const hasData = parcels.length > 0;

    if (elements.chartEmpty) {
      elements.chartEmpty.classList.toggle(
        "d-none",
        hasData
      );
    }

    const chartData = {
      labels: chartStatuses,

      datasets: [{
        label: "Number of Parcels",
        data: statusCounts,

        backgroundColor: chartColors,

        borderColor: "#ffffff",
        borderWidth: 3,

        hoverOffset: 8
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,

      cutout: "65%",

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 16,
            boxWidth: 8,
            font: {
              family: "DM Sans",
              size: 11
            }
          }
        },

        tooltip: {
          callbacks: {
            label: function(context) {

              const value = context.parsed;

              const percentage = calculatePercentage(
                value,
                parcels.length
              );

              return ` ${context.label}: ${value} parcels (${percentage}%)`;
            }
          }
        }
      }
    };

    if (parcelStatusChart) {

      parcelStatusChart.data = chartData;
      parcelStatusChart.options = chartOptions;
      parcelStatusChart.update();

    } else {

      parcelStatusChart = new Chart(
        elements.chart,
        {
          type: "doughnut",
          data: chartData,
          options: chartOptions
        }
      );
    }
  }

  // =======================================================
  // 4E. INFOGRAPHIC - MAIN UPDATE FUNCTION
  // =======================================================

  function updateParcelAnalytics(parcels = getParcels()) {

    updateSummaryCards(parcels);

    updatePerformance(parcels);

    renderParcelChart(parcels);
  }

  // =======================================================
  // 5. POPULATE CUSTOMER DROPDOWN
  // =======================================================

  function populateCustomers() {
    if (!elements.recipient) return;

    const customers = getCustomers();
    const previousValue = elements.recipient.value;

    elements.recipient.innerHTML = `
      <option value="">Select customer</option>
    `;

    customers.forEach(customer => {
      const option = document.createElement("option");

      option.value =
        customer.id ||
        customer.email ||
        getCustomerName(customer);

      option.textContent =
        getCustomerName(customer);

      elements.recipient.appendChild(option);
    });

    if (
      previousValue &&
      [...elements.recipient.options].some(
        option => option.value === previousValue
      )
    ) {
      elements.recipient.value = previousValue;
    }
  }

  // =======================================================
  // 6. RENDER PARCEL TABLE
  // =======================================================

  function renderParcels() {

    const parcels = getParcels();

    // Update infographic using all parcel records
    updateParcelAnalytics(parcels);

    if (!elements.table) {
      console.error("parcelsTableBody not found.");
      return;
    }

    const keyword = elements.search
      ? elements.search.value.trim().toLowerCase()
      : "";

    const selectedStatus = elements.filter
      ? elements.filter.value.toLowerCase()
      : "";

    const filtered = parcels.filter(parcel => {

      const searchable = [
        parcel.id,
        parcel.trackingNumber,
        parcel.recipient,
        parcel.customerName,
        parcel.customerEmail,
        parcel.phone,
        parcel.courier,
        parcel.type,
        parcel.address
      ].join(" ").toLowerCase();

      const parcelStatus = String(
        parcel.status || "Pending"
      ).toLowerCase();

      const matchesSearch = searchable.includes(keyword);

      const matchesStatus =
        !selectedStatus ||
        selectedStatus === "all" ||
        parcelStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    if (elements.count) {
      elements.count.textContent =
        `${filtered.length} parcel${filtered.length !== 1 ? "s" : ""}`;
    }

    if (filtered.length === 0) {
      elements.table.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
            <strong>No parcels found.</strong>
            <p class="text-muted small mb-0">
              Add a new parcel or change your search.
            </p>
          </td>
        </tr>
      `;
      return;
    }

    elements.table.innerHTML = filtered.map(parcel => {

      const id = parcel.id || "";
      const tracking = parcel.trackingNumber || id || "-";

      const recipient =
        parcel.recipient ||
        parcel.receiverName ||
        parcel.customerName ||
        "N/A";

      const fee =
        parcel.finalPrice ??
        parcel.shippingFee ??
        parcel.price ??
        0;

      const status = parcel.status || "Pending";

      return `
        <tr>
          <td>
            <strong>${escapeHTML(tracking)}</strong>
          </td>

          <td>${escapeHTML(recipient)}</td>

          <td>${escapeHTML(parcel.phone || "-")}</td>

          <td>${escapeHTML(parcel.type || "-")}</td>

          <td>${money(fee)}</td>

          <td>
            <span class="badge ${escapeHTML(statusClass(status))}">
              ${escapeHTML(status)}
            </span>
          </td>

          <td>
            ${escapeHTML(dateFormat(parcel.date || parcel.created || ""))}
          </td>

          <td class="text-end">
            <div class="d-flex justify-content-end gap-2">

              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                data-edit-parcel="${escapeHTML(id)}"
                title="Edit parcel">
                <i class="bi bi-pencil-square"></i>
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                data-delete-parcel="${escapeHTML(id)}"
                title="Delete parcel">
                <i class="bi bi-trash"></i>
              </button>

            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // =======================================================
  // 7. MODAL FUNCTIONS
  // =======================================================

  function showModal() {
    if (!elements.modal) return;

    if (window.bootstrap && bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(
        elements.modal
      ).show();
    }
  }

  function hideModal() {
    if (!elements.modal) return;

    if (window.bootstrap && bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(
        elements.modal
      ).hide();
    }
  }

  // =======================================================
  // 8. ADD PARCEL
  // =======================================================

  function openAddModal() {
    if (!elements.form) return;

    elements.form.reset();

    populateCustomers();

    if (elements.editId) {
      elements.editId.value = "";
    }

    if (elements.modalTitle) {
      elements.modalTitle.textContent = "Add New Parcel";
    }

    if (elements.status) {
      elements.status.value = "Pending";
    }

    if (elements.date) {
      elements.date.value =
        typeof Admin.getToday === "function"
          ? Admin.getToday()
          : new Date().toISOString().slice(0, 10);
    }

    if (elements.proofPreview) {
      elements.proofPreview.textContent =
        "No proof photo selected.";
    }

    showModal();
  }

  // =======================================================
  // 9. EDIT PARCEL
  // =======================================================

  function editParcel(id) {

    const parcel = getParcels().find(item =>
      String(item.id) === String(id)
    );

    if (!parcel || !elements.form) return;

    elements.form.reset();

    populateCustomers();

    if (elements.editId) {
      elements.editId.value = parcel.id;
    }

    if (elements.modalTitle) {
      elements.modalTitle.textContent = "Edit Parcel";
    }

    if (elements.recipient) {
      elements.recipient.value =
        parcel.customerId ||
        parcel.customerEmail ||
        parcel.recipient ||
        "";
    }

    if (elements.phone) {
      elements.phone.value = parcel.phone || "";
    }

    if (elements.address) {
      elements.address.value =
        parcel.address ||
        parcel.destination ||
        "";
    }

    if (elements.type) {
      elements.type.value = parcel.type || "Document";
    }

    if (elements.shippingFee) {
      elements.shippingFee.value =
        parcel.shippingFee ??
        parcel.finalPrice ??
        parcel.price ??
        "";
    }

    if (elements.date) {
      elements.date.value = parcel.date || "";
    }

    if (elements.status) {
      elements.status.value = parcel.status || "Pending";
    }

    if (elements.courier) {
      elements.courier.value = parcel.courier || "";
    }

    if (elements.proofPreview) {
      elements.proofPreview.innerHTML = parcel.proofPhoto
        ? `<img src="${escapeHTML(parcel.proofPhoto)}"
             alt="Delivery proof"
             style="max-width:120px;max-height:120px;object-fit:cover;border-radius:8px;">`
        : "No proof photo selected.";
    }

    showModal();
  }

  // =======================================================
  // 10. CUSTOMER DETAILS
  // =======================================================

  function updateCustomerDetails() {

    const customer = findCustomer(elements.recipient?.value);

    if (!customer) return;

    if (elements.phone) {
      elements.phone.value =
        customer.phone ||
        customer.phoneNumber ||
        customer.contactNumber ||
        "";
    }

    if (elements.address) {
      elements.address.value =
        customer.address ||
        customer.fullAddress ||
        "";
    }
  }

  // =======================================================
  // 11. DELIVERY PROOF IMAGE
  // =======================================================

  function readProofPhoto() {

    return new Promise(resolve => {

      if (!elements.proof?.files?.length) {
        resolve(null);
        return;
      }

      const file = elements.proof.files[0];

      if (!file.type.startsWith("image/")) {
        showToast("Please select a valid image.", "error");
        resolve(false);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showToast("Image must not exceed 2MB.", "error");
        resolve(false);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(false);

      reader.readAsDataURL(file);
    });
  }

  function previewProof() {

    if (!elements.proof || !elements.proofPreview) return;

    const file = elements.proof.files[0];

    if (!file) {
      elements.proofPreview.textContent =
        "No proof photo selected.";
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      elements.proof.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must not exceed 2MB.", "error");
      elements.proof.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {

      const image = document.createElement("img");

      image.src = event.target.result;
      image.alt = "Delivery proof preview";
      image.style.maxWidth = "120px";
      image.style.maxHeight = "120px";
      image.style.objectFit = "cover";
      image.style.borderRadius = "8px";

      elements.proofPreview.replaceChildren(image);
    };

    reader.readAsDataURL(file);
  }

  // =======================================================
  // 12. SAVE PARCEL
  // =======================================================

  async function saveParcel(event) {

    event.preventDefault();

    const parcels = getParcels();

    const editId = elements.editId?.value.trim() || "";

    const existingParcel = editId
      ? parcels.find(parcel =>
          String(parcel.id) === String(editId)
        )
      : null;

    if (editId && !existingParcel) {
      showToast("Parcel record not found.", "error");
      return;
    }

    const customerValue = elements.recipient?.value || "";
    const customer = findCustomer(customerValue);

    const proofPhoto = await readProofPhoto();

    if (proofPhoto === false) return;

    const oldProof = existingParcel?.proofPhoto || "";

    const parcelId = existingParcel
      ? existingParcel.id
      : generateParcelId();

    const shippingFee = Math.max(
      0,
      Number(elements.shippingFee?.value || 0) || 0
    );

    const parcelData = {
      ...(existingParcel || {}),

      id: parcelId,

      trackingNumber:
        existingParcel?.trackingNumber || parcelId,

      customerId:
        customer?.id ||
        existingParcel?.customerId ||
        "",

      customerEmail:
        customer?.email ||
        existingParcel?.customerEmail ||
        "",

      customerName: customer
        ? getCustomerName(customer)
        : existingParcel?.customerName || "",

      recipient: customer
        ? getCustomerName(customer)
        : elements.recipient?.selectedOptions?.[0]?.textContent?.trim() ||
          customerValue,

      phone: elements.phone?.value.trim() || "",
      address: elements.address?.value.trim() || "",
      type: elements.type?.value || "",

      shippingFee,
      finalPrice: shippingFee,
      price: shippingFee,

      date: elements.date?.value || "",
      status: elements.status?.value || "Pending",
      courier: elements.courier?.value.trim() || "",

      proofPhoto: proofPhoto || oldProof,

      created: existingParcel?.created ||
        new Date().toISOString(),

      updated: new Date().toISOString()
    };

    if (existingParcel) {

      const index = parcels.findIndex(parcel =>
        String(parcel.id) === String(editId)
      );

      parcels[index] = parcelData;

    } else {

      parcels.unshift(parcelData);
    }

    if (!saveParcels(parcels)) return;

    renderParcels();

    hideModal();

    elements.form.reset();

    showToast(
      existingParcel
        ? "Parcel updated successfully."
        : "New parcel added successfully."
    );
  }

  // =======================================================
  // 13. DELETE PARCEL
  // =======================================================

  function deleteParcel(id) {

    const parcels = getParcels();

    const parcel = parcels.find(item =>
      String(item.id) === String(id)
    );

    if (!parcel) return;

    const confirmed = window.confirm(
      `Delete parcel ${parcel.trackingNumber || parcel.id}?`
    );

    if (!confirmed) return;

    const updatedParcels = parcels.filter(item =>
      String(item.id) !== String(id)
    );

    if (!saveParcels(updatedParcels)) return;

    renderParcels();

    showToast("Parcel deleted successfully.");
  }

  // =======================================================
  // 14. EVENT LISTENERS
  // =======================================================

  function bindEvents() {

    elements.search?.addEventListener(
      "input",
      renderParcels
    );

    elements.filter?.addEventListener(
      "change",
      renderParcels
    );

    document.querySelectorAll(
      '[data-open-modal="parcelModal"], [data-add-parcel], #addParcelBtn'
    ).forEach(button => {

      button.addEventListener(
        "click",
        openAddModal
      );
    });

    elements.form?.addEventListener(
      "submit",
      saveParcel
    );

    elements.recipient?.addEventListener(
      "change",
      updateCustomerDetails
    );

    elements.proof?.addEventListener(
      "change",
      previewProof
    );

    elements.table?.addEventListener("click", event => {

      const editButton = event.target.closest(
        "[data-edit-parcel]"
      );

      const deleteButton = event.target.closest(
        "[data-delete-parcel]"
      );

      if (editButton) {
        editParcel(editButton.dataset.editParcel);
      }

      if (deleteButton) {
        deleteParcel(deleteButton.dataset.deleteParcel);
      }
    });

    // Same-tab ParcelPro updates
    window.addEventListener(
      "parcelpro:dataUpdated",
      event => {

        if (
          !event.detail?.key ||
          event.detail.key === STORAGE.parcels ||
          event.detail.key === STORAGE.customers
        ) {
          populateCustomers();
          renderParcels();
        }
      }
    );

    // Other-tab localStorage updates
    window.addEventListener("storage", event => {

      if (
        event.key === STORAGE.parcels ||
        event.key === STORAGE.customers ||
        event.key === null
      ) {
        populateCustomers();
        renderParcels();
      }
    });
  }

  // =======================================================
  // 15. INITIALISE
  // =======================================================

  function initialise() {

    try {

      bindEvents();

      populateCustomers();

      renderParcels();

      console.log(
        "ParcelPro Parcel Management and Infographic initialized successfully."
      );

    } catch (error) {

      console.error(
        "Parcel Management initialization failed:",
        error
      );

      if (elements.table) {
        elements.table.innerHTML = `
          <tr>
            <td colspan="8" class="text-center text-danger py-4">
              Unable to load parcel records. Please check the browser console.
            </td>
          </tr>
        `;
      }
    }
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initialise
    );

  } else {

    initialise();
  }

})();
