
/* =========================================================
   PARCELPRO - ADMIN_DELIVERIES.JS
   Delivery Management
   Delivery Statistics + Search + Filter + Status Update
   Customer Portal Integration
   Storage: localStorage
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. CHECK SHARED ADMIN
  // =======================================================

  const Admin = window.ParcelProAdmin;

  if (!Admin) {
    console.error(
      "ParcelProAdmin not found. Please load admin_common.js first."
    );
    return;
  }

  const STORAGE = Admin.STORAGE;

  if (!STORAGE || !STORAGE.parcels) {
    console.error("ParcelPro parcel storage key is missing.");
    return;
  }

  const $ = Admin.$ || (selector => document.querySelector(selector));

  // =======================================================
  // 2. DOM ELEMENTS
  // =======================================================

  const elements = {
    table: findElement([
      "#deliveriesTableBody",
      "#deliveryTableBody",
      "#deliveryManagementTableBody",
      "#deliveriesTable tbody",
      "#deliveryTable tbody"
    ]),

    search: findElement([
      "#deliverySearch",
      "#deliveriesSearch",
      "#searchDelivery",
      'input[name="deliverySearch"]'
    ]),

    filter: findElement([
      "#deliveryStatusFilter",
      "#deliveryFilter",
      "#statusFilter"
    ]),

    count: findElement([
      "#deliveryCountLabel",
      "#deliveriesCount"
    ])
  };

  function findElement(selectors) {
    for (const selector of selectors) {
      const element = $(selector);
      if (element) return element;
    }

    return null;
  }

  // =======================================================
  // 3. DELIVERY STATUS
  // =======================================================

  const DELIVERY_STATUSES = [
    "Pending",
    "Processing",
    "Picked Up",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Failed",
    "Cancelled"
  ];

  // =======================================================
  // 4. DATA FUNCTIONS
  // =======================================================

  function getParcels() {
    if (typeof Admin.readList === "function") {
      return Admin.readList(STORAGE.parcels);
    }

    try {
      const data = JSON.parse(
        localStorage.getItem(STORAGE.parcels) || "[]"
      );

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Unable to read parcel data:", error);
      return [];
    }
  }

  function saveParcels(parcels) {
    if (typeof Admin.save === "function") {
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
  }

  function escapeHTML(value) {
    if (typeof Admin.escapeHTML === "function") {
      return Admin.escapeHTML(value ?? "");
    }

    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function showToast(message, type = "success") {
    if (typeof Admin.toast === "function") {
      Admin.toast(message, type);
    } else {
      alert(message);
    }
  }

  function formatDate(value) {
    if (!value) return "-";

    if (typeof Admin.dateFormat === "function") {
      return Admin.dateFormat(value);
    }

    return value;
  }

  // =======================================================
  // 5. PARCEL INFORMATION
  // =======================================================

  function getTrackingNumber(parcel) {
    return parcel.trackingNumber || parcel.id || "-";
  }

  function getRecipient(parcel) {
    return (
      parcel.recipient ||
      parcel.receiverName ||
      parcel.customerName ||
      "-"
    );
  }

  function getCourier(parcel) {
    return parcel.courier || "-";
  }

  function getPhone(parcel) {
    return parcel.phone || parcel.receiverPhone || "-";
  }

  function getStatus(parcel) {
    return parcel.status || "Pending";
  }

  function normaliseStatus(status) {
    return String(status || "")
      .trim()
      .toLowerCase();
  }

  function getStatusClass(status) {
    if (typeof Admin.statusClass === "function") {
      return Admin.statusClass(status);
    }

    const value = normaliseStatus(status);

    const classes = {
      pending: "bg-warning text-dark",
      processing: "bg-info text-dark",
      "picked up": "bg-primary",
      shipped: "bg-primary",
      "in transit": "bg-primary",
      "out for delivery": "bg-info text-dark",
      delivered: "bg-success",
      failed: "bg-danger",
      cancelled: "bg-secondary"
    };

    return classes[value] || "bg-secondary";
  }

  // =======================================================
  // 6. FILTER DELIVERY RECORDS
  // =======================================================

  function getFilteredDeliveries() {
    const parcels = getParcels();

    const keyword = elements.search
      ? elements.search.value.trim().toLowerCase()
      : "";

    const selectedStatus = elements.filter
      ? normaliseStatus(elements.filter.value)
      : "";

    return parcels.filter(parcel => {
      const searchable = [
        getTrackingNumber(parcel),
        getRecipient(parcel),
        getCourier(parcel),
        getPhone(parcel),
        parcel.address,
        getStatus(parcel)
      ].join(" ").toLowerCase();

      const matchesSearch = searchable.includes(keyword);

      const matchesStatus =
        !selectedStatus ||
        selectedStatus === "all" ||
        normaliseStatus(getStatus(parcel)) === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // =======================================================
  // 7. DELIVERY STATISTICS
  // =======================================================

  function updateStat(selectors, value) {
    const element = findElement(selectors);

    if (element) {
      element.textContent = String(value);
    }
  }

  function renderDeliveryStats() {
    const parcels = getParcels();

    const total = parcels.length;

    const pending = parcels.filter(parcel =>
      normaliseStatus(getStatus(parcel)) === "pending"
    ).length;

    const inTransit = parcels.filter(parcel =>
      [
        "picked up",
        "shipped",
        "in transit",
        "out for delivery",
        "processing"
      ].includes(normaliseStatus(getStatus(parcel)))
    ).length;

    const delivered = parcels.filter(parcel =>
      normaliseStatus(getStatus(parcel)) === "delivered"
    ).length;

    const failed = parcels.filter(parcel =>
      ["failed", "cancelled"].includes(
        normaliseStatus(getStatus(parcel))
      )
    ).length;

    updateStat(
      ["#totalDeliveries", "#totalDelivery", "[data-delivery-stat='total']"],
      total
    );

    updateStat(
      ["#pendingDeliveries", "#pendingDelivery", "[data-delivery-stat='pending']"],
      pending
    );

    updateStat(
      ["#inTransitDeliveries", "#inTransitDelivery", "[data-delivery-stat='in-transit']"],
      inTransit
    );

    updateStat(
      ["#deliveredDeliveries", "#deliveredDelivery", "[data-delivery-stat='delivered']"],
      delivered
    );

    updateStat(
      ["#failedDeliveries", "#failedDelivery", "[data-delivery-stat='failed']"],
      failed
    );
  }

  // =======================================================
  // 8. RENDER DELIVERY TABLE
  // =======================================================

  function renderDeliveries() {
    if (!elements.table) {
      console.warn(
        "Delivery table body was not found. Check the HTML table ID."
      );
      return;
    }

    const deliveries = getFilteredDeliveries();

    if (elements.count) {
      elements.count.textContent =
        `${deliveries.length} delivery${deliveries.length !== 1 ? "ies" : ""}`;
    }

    if (deliveries.length === 0) {
      elements.table.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="text-muted">
              <i class="bi bi-truck fs-3 d-block mb-2"></i>
              No delivery records found.
            </div>
          </td>
        </tr>
      `;

      renderDeliveryStats();
      return;
    }

    elements.table.innerHTML = deliveries.map(parcel => {
      const id = parcel.id;
      const tracking = getTrackingNumber(parcel);
      const recipient = getRecipient(parcel);
      const courier = getCourier(parcel);
      const phone = getPhone(parcel);
      const status = getStatus(parcel);
      const deliveryDate = parcel.date || parcel.created || "";

      const statusOptions = [
        ...new Set([...DELIVERY_STATUSES, status])
      ].map(option => `
        <option
          value="${escapeHTML(option)}"
          ${normaliseStatus(option) === normaliseStatus(status) ? "selected" : ""}>
          ${escapeHTML(option)}
        </option>
      `).join("");

      return `
        <tr>
          <td>
            <strong>${escapeHTML(tracking)}</strong>
          </td>

          <td>${escapeHTML(recipient)}</td>

          <td>${escapeHTML(phone)}</td>

          <td>${escapeHTML(courier)}</td>

          <td>
            <span class="badge ${escapeHTML(getStatusClass(status))}">
              ${escapeHTML(status)}
            </span>
          </td>

          <td>${escapeHTML(formatDate(deliveryDate))}</td>

          <td>
            <div class="d-flex align-items-center gap-2 flex-wrap">

              <select
                class="form-select form-select-sm"
                style="min-width:145px;"
                data-delivery-status="${escapeHTML(id)}">
                ${statusOptions}
              </select>

              <button
                type="button"
                class="btn btn-sm btn-primary"
                data-save-delivery="${escapeHTML(id)}"
                title="Update delivery status">
                <i class="bi bi-check-lg"></i>
              </button>

            </div>
          </td>
        </tr>
      `;
    }).join("");

    renderDeliveryStats();
  }

  // =======================================================
  // 9. UPDATE DELIVERY STATUS
  // =======================================================

  function updateDeliveryStatus(id) {
    const statusSelect = elements.table.querySelector(
      `[data-delivery-status="${CSS.escape(String(id))}"]`
    );

    if (!statusSelect) {
      showToast("Unable to find the selected delivery.", "error");
      return;
    }

    const newStatus = statusSelect.value;

    if (!newStatus) {
      showToast("Please select a delivery status.", "error");
      return;
    }

    const parcels = getParcels();

    const index = parcels.findIndex(parcel =>
      String(parcel.id) === String(id)
    );

    if (index === -1) {
      showToast("Parcel record not found.", "error");
      return;
    }

    const parcel = parcels[index];
    const oldStatus = getStatus(parcel);

    if (normaliseStatus(oldStatus) === normaliseStatus(newStatus)) {
      showToast("The delivery status has not changed.", "info");
      return;
    }

    const now = new Date().toISOString();

    const updatedParcel = {
      ...parcel,
      status: newStatus,
      updatedAt: now
    };

    const historyEntry = {
      status: newStatus,
      date: now,
      description: getStatusDescription(newStatus)
    };

    // Preserve the existing tracking history format.
    if (Array.isArray(parcel.history)) {
      updatedParcel.history = [
        ...parcel.history,
        historyEntry
      ];
    } else if (Array.isArray(parcel.trackingHistory)) {
      updatedParcel.trackingHistory = [
        ...parcel.trackingHistory,
        historyEntry
      ];
    } else {
      updatedParcel.history = [historyEntry];
    }

    parcels[index] = updatedParcel;

    saveParcels(parcels);

    renderDeliveries();

    showToast(
      `Delivery status updated to ${newStatus}.`
    );
  }

  function getStatusDescription(status) {
    const descriptions = {
      "Pending": "Your parcel is waiting to be processed.",
      "Processing": "Your parcel is being processed.",
      "Picked Up": "Your parcel has been picked up by the courier.",
      "Shipped": "Your parcel has been shipped.",
      "In Transit": "Your parcel is currently in transit.",
      "Out for Delivery": "Your parcel is out for delivery.",
      "Delivered": "Your parcel has been successfully delivered.",
      "Failed": "The delivery attempt was unsuccessful.",
      "Cancelled": "The parcel delivery has been cancelled."
    };

    return descriptions[status] || "Parcel delivery status updated.";
  }

  // =======================================================
  // 10. EVENT LISTENERS
  // =======================================================

  function bindEvents() {

    // Search delivery
    if (elements.search) {
      elements.search.addEventListener("input", renderDeliveries);
    }

    // Filter delivery status
    if (elements.filter) {
      elements.filter.addEventListener("change", renderDeliveries);
    }

    // Update delivery status
    if (elements.table) {
      elements.table.addEventListener("click", event => {
        const button = event.target.closest("[data-save-delivery]");

        if (!button) return;

        updateDeliveryStatus(button.dataset.saveDelivery);
      });
    }

    // Listen for updates from other admin pages
    window.addEventListener("parcelpro:dataUpdated", event => {
      if (
        !event.detail?.key ||
        event.detail.key === STORAGE.parcels
      ) {
        renderDeliveries();
      }
    });

    // Listen for updates from other browser tabs
    window.addEventListener("storage", event => {
      if (
        event.key === STORAGE.parcels ||
        event.key === null
      ) {
        renderDeliveries();
      }
    });
  }

  // =======================================================
  // 11. INITIALISE
  // =======================================================

  function initialise() {
    bindEvents();
    renderDeliveryStats();
    renderDeliveries();

    console.log("ParcelPro Delivery Management loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }

})();
