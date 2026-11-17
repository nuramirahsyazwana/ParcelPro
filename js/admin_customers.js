
/* =========================================================
   PARCELPRO - ADMIN_CUSTOMERS.JS
   Customer Management
   Add + Edit + Delete + Search
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

  if (!STORAGE || !STORAGE.customers || !STORAGE.parcels) {
    console.error("ParcelPro storage keys are missing.");
    return;
  }

  const $ = Admin.$ || (selector => document.querySelector(selector));

  // =======================================================
  // 2. HELPER FUNCTIONS
  // =======================================================

  function getElement(selectors) {
    for (const selector of selectors) {
      const element = $(selector);
      if (element) return element;
    }

    return null;
  }

  function readData(key) {
    if (typeof Admin.readList === "function") {
      return Admin.readList(key);
    }

    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Unable to read storage:", key, error);
      return [];
    }
  }

  function saveData(key, data) {
    if (typeof Admin.save === "function") {
      Admin.save(key, data);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }

    window.dispatchEvent(
      new CustomEvent("parcelpro:dataUpdated", {
        detail: { key }
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

  function getCustomerName(customer) {
    return (
      customer.name ||
      customer.fullName ||
      customer.customerName ||
      customer.username ||
      "Unnamed Customer"
    );
  }

  function getCustomerEmail(customer) {
    return customer.email || customer.customerEmail || "-";
  }

  function getCustomerPhone(customer) {
    return (
      customer.phone ||
      customer.phoneNumber ||
      customer.contactNumber ||
      "-"
    );
  }

  function getCustomerAddress(customer) {
    return customer.address || customer.fullAddress || "-";
  }

  function generateCustomerId() {
    const customers = readData(STORAGE.customers);
    let id;

    do {
      id = "CUS" + Date.now().toString().slice(-8) +
        Math.floor(Math.random() * 1000);
    } while (
      customers.some(customer => String(customer.id) === id)
    );

    return id;
  }

  // =======================================================
  // 3. DOM ELEMENTS
  // =======================================================

  const elements = {
    table: getElement([
      "#customersTableBody",
      "#customerTableBody",
      "#customersTable tbody",
      "#customerTable tbody"
    ]),

    search: getElement([
      "#customerSearch",
      "#customerSearchInput",
      "#searchCustomer",
      'input[name="customerSearch"]'
    ]),

    modal: getElement([
      "#customerModal"
    ]),

    form: getElement([
      "#customerForm"
    ]),

    editId: getElement([
      "#customerEditId",
      "#editCustomerId",
      'input[name="editCustomerId"]'
    ]),

    name: getElement([
      "#customerName",
      "#customerFullName",
      "#fullName",
      'input[name="customerName"]',
      'input[name="name"]'
    ]),

    email: getElement([
      "#customerEmail",
      'input[name="customerEmail"]',
      'input[name="email"]'
    ]),

    phone: getElement([
      "#customerPhone",
      "#customerPhoneNumber",
      'input[name="phone"]'
    ]),

    address: getElement([
      "#customerAddress",
      'textarea[name="address"]',
      'input[name="address"]'
    ]),

    status: getElement([
      "#customerStatus",
      'select[name="status"]'
    ]),

    count: getElement([
      "#customerCountLabel",
      "#customersCount"
    ])
  };

  // =======================================================
  // 4. READ CUSTOMER DATA
  // =======================================================

  function getCustomers() {
    return readData(STORAGE.customers);
  }

  // =======================================================
  // 5. RENDER CUSTOMER TABLE
  // =======================================================

  function renderCustomers() {
    if (!elements.table) {
      console.warn("Customer table element was not found.");
      return;
    }

    const customers = getCustomers();

    const keyword = elements.search
      ? elements.search.value.trim().toLowerCase()
      : "";

    const filteredCustomers = customers.filter(customer => {
      const searchable = [
        customer.id,
        getCustomerName(customer),
        getCustomerEmail(customer),
        getCustomerPhone(customer),
        getCustomerAddress(customer)
      ].join(" ").toLowerCase();

      return searchable.includes(keyword);
    });

    if (elements.count) {
      elements.count.textContent =
        `${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? "s" : ""}`;
    }

    if (filteredCustomers.length === 0) {
      elements.table.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="text-muted">
              <i class="bi bi-people fs-3 d-block mb-2"></i>
              No customers found.
            </div>
          </td>
        </tr>
      `;

      return;
    }

    elements.table.innerHTML = filteredCustomers.map(customer => {
      const id = customer.id || "-";
      const name = getCustomerName(customer);
      const email = getCustomerEmail(customer);
      const phone = getCustomerPhone(customer);
      const address = getCustomerAddress(customer);

      return `
        <tr>
          <td>
            <strong>${escapeHTML(id)}</strong>
          </td>

          <td>
            <div class="fw-semibold">
              ${escapeHTML(name)}
            </div>
          </td>

          <td>${escapeHTML(email)}</td>

          <td>${escapeHTML(phone)}</td>

          <td>
            <span class="d-inline-block text-truncate"
                  style="max-width:180px;"
                  title="${escapeHTML(address)}">
              ${escapeHTML(address)}
            </span>
          </td>

          <td>
            <span class="badge bg-success">
              ${escapeHTML(customer.status || "Active")}
            </span>
          </td>

          <td>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                data-edit-customer="${escapeHTML(id)}"
                title="Edit customer">
                <i class="bi bi-pencil-square"></i>
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                data-delete-customer="${escapeHTML(id)}"
                title="Delete customer">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // =======================================================
  // 6. BOOTSTRAP MODAL
  // =======================================================

  function showModal() {
    if (!elements.modal) return;

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal
        .getOrCreateInstance(elements.modal)
        .show();
    } else {
      elements.modal.style.display = "block";
      elements.modal.classList.add("show");
    }
  }

  function hideModal() {
    if (!elements.modal) return;

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal
        .getOrCreateInstance(elements.modal)
        .hide();
    } else {
      elements.modal.style.display = "none";
      elements.modal.classList.remove("show");
    }
  }

  // =======================================================
  // 7. OPEN ADD CUSTOMER MODAL
  // =======================================================

  function openAddModal() {
    if (!elements.form) {
      console.error("Customer form was not found.");
      return;
    }

    elements.form.reset();

    if (elements.editId) {
      elements.editId.value = "";
    }

    const title = getElement([
      "#customerModalTitle",
      "#customerModal .modal-title"
    ]);

    if (title) {
      title.textContent = "Add New Customer";
    }

    if (elements.status) {
      elements.status.value = "Active";
    }

    showModal();
  }

  // =======================================================
  // 8. OPEN EDIT CUSTOMER MODAL
  // =======================================================

  function editCustomer(id) {
    const customer = getCustomers().find(item =>
      String(item.id) === String(id)
    );

    if (!customer || !elements.form) return;

    elements.form.reset();

    if (elements.editId) {
      elements.editId.value = customer.id;
    }

    if (elements.name) {
      elements.name.value = getCustomerName(customer);
    }

    if (elements.email) {
      elements.email.value = customer.email || customer.customerEmail || "";
    }

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

    if (elements.status) {
      elements.status.value = customer.status || "Active";
    }

    const title = getElement([
      "#customerModalTitle",
      "#customerModal .modal-title"
    ]);

    if (title) {
      title.textContent = "Edit Customer";
    }

    showModal();
  }

  // =======================================================
  // 9. VALIDATE CUSTOMER FORM
  // =======================================================

  function validateForm() {
    const name = elements.name?.value.trim() || "";
    const email = elements.email?.value.trim() || "";

    if (!name) {
      showToast("Please enter the customer's name.", "error");
      elements.name?.focus();
      return false;
    }

    if (!email) {
      showToast("Please enter the customer's email.", "error");
      elements.email?.focus();
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showToast("Please enter a valid email address.", "error");
      elements.email?.focus();
      return false;
    }

    return true;
  }

  // =======================================================
  // 10. SAVE CUSTOMER
  // =======================================================

  function saveCustomer(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const customers = getCustomers();

    const editId = elements.editId
      ? elements.editId.value.trim()
      : "";

    const existingCustomer = editId
      ? customers.find(customer =>
          String(customer.id) === String(editId)
        )
      : null;

    const name = elements.name.value.trim();
    const email = elements.email.value.trim().toLowerCase();

    const duplicateEmail = customers.some(customer =>
      String(customer.email || customer.customerEmail || "").toLowerCase() === email &&
      String(customer.id) !== String(editId)
    );

    if (duplicateEmail) {
      showToast("This email address is already registered.", "error");
      return;
    }

    const customerData = {
      ...(existingCustomer || {}),

      id: existingCustomer
        ? existingCustomer.id
        : generateCustomerId(),

      name,
      fullName: existingCustomer?.fullName || name,
      email,

      phone: elements.phone
        ? elements.phone.value.trim()
        : existingCustomer?.phone || "",

      address: elements.address
        ? elements.address.value.trim()
        : existingCustomer?.address || "",

      status: elements.status
        ? elements.status.value || "Active"
        : existingCustomer?.status || "Active",

      createdAt: existingCustomer
        ? existingCustomer.createdAt
        : new Date().toISOString(),

      updatedAt: new Date().toISOString()
    };

    if (existingCustomer) {
      const index = customers.findIndex(customer =>
        String(customer.id) === String(editId)
      );

      customers[index] = customerData;
    } else {
      customers.unshift(customerData);
    }

    saveData(STORAGE.customers, customers);

    // Keep customer references in existing parcel records.
    if (existingCustomer) {
      syncCustomerWithParcels(customerData);
    }

    renderCustomers();
    hideModal();

    showToast(
      existingCustomer
        ? "Customer updated successfully."
        : "New customer added successfully."
    );
  }

  // =======================================================
  // 11. SYNC CUSTOMER DETAILS WITH PARCELS
  // =======================================================

  function syncCustomerWithParcels(customer) {
    const parcels = readData(STORAGE.parcels);
    let changed = false;

    const updatedParcels = parcels.map(parcel => {
      const sameCustomer =
        String(parcel.customerId || "") === String(customer.id) ||
        (
          parcel.customerEmail &&
          String(parcel.customerEmail).toLowerCase() ===
            String(customer.email).toLowerCase()
        );

      if (!sameCustomer) return parcel;

      changed = true;

      return {
        ...parcel,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name
      };
    });

    if (changed) {
      saveData(STORAGE.parcels, updatedParcels);
    }
  }

  // =======================================================
  // 12. DELETE CUSTOMER
  // =======================================================

  function deleteCustomer(id) {
    const customers = getCustomers();

    const customer = customers.find(item =>
      String(item.id) === String(id)
    );

    if (!customer) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${getCustomerName(customer)}?`
    );

    if (!confirmed) return;

    const updatedCustomers = customers.filter(item =>
      String(item.id) !== String(id)
    );

    saveData(STORAGE.customers, updatedCustomers);

    // Existing parcel records are intentionally preserved.
    renderCustomers();

    showToast("Customer deleted successfully.");
  }

  // =======================================================
  // 13. EVENT LISTENERS
  // =======================================================

  function bindEvents() {

    // Customer search
    if (elements.search) {
      elements.search.addEventListener("input", renderCustomers);
    }

    // Customer form
    if (elements.form) {
      elements.form.addEventListener("submit", saveCustomer);
    }

    // Add customer buttons
    document.querySelectorAll(
      '[data-add-customer], #addCustomerBtn'
    ).forEach(button => {
      button.addEventListener("click", openAddModal);
    });

    // Customer table actions
    if (elements.table) {
      elements.table.addEventListener("click", event => {
        const editButton = event.target.closest("[data-edit-customer]");
        const deleteButton = event.target.closest("[data-delete-customer]");

        if (editButton) {
          editCustomer(editButton.dataset.editCustomer);
        }

        if (deleteButton) {
          deleteCustomer(deleteButton.dataset.deleteCustomer);
        }
      });
    }

    // Listen for changes from other admin pages or Customer Portal
    window.addEventListener("parcelpro:dataUpdated", event => {
      if (
        !event.detail?.key ||
        event.detail.key === STORAGE.customers
      ) {
        renderCustomers();
      }
    });

    // Listen for changes from other browser tabs
    window.addEventListener("storage", event => {
      if (
        event.key === STORAGE.customers ||
        event.key === null
      ) {
        renderCustomers();
      }
    });
  }

  // =======================================================
  // 14. INITIALISE
  // =======================================================

  function initialise() {
    bindEvents();
    renderCustomers();

    console.log("ParcelPro Customer Management loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }

})();
