
/* =========================================================
   PARCELPRO - ADMIN_TRACKING.JS
   Parcel Tracking Management
   Search + Display Parcel Details + Tracking History
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
  const $ = Admin.$ || ((selector) => document.querySelector(selector));

  // =======================================================
  // 2. DOM ELEMENTS
  // =======================================================

  const elements = {
    form: $("#trackingForm"),
    input: $("#trackingNumber"),
    result: $("#trackingResult"),
    message: $("#trackingMessage"),
    searchButton: $("#trackingSearchBtn")
  };

  // =======================================================
  // 3. DATA FUNCTIONS
  // =======================================================

  function getParcels() {
    return Admin.readList(STORAGE.parcels);
  }

  function escape(value) {
    return typeof Admin.escapeHTML === "function"
      ? Admin.escapeHTML(value ?? "")
      : String(value ?? "").replace(/[&<>"']/g, char => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[char]);
  }

  function formatDate(value) {
    if (!value) return "-";

    if (typeof Admin.dateFormat === "function") {
      return Admin.dateFormat(value);
    }

    return value;
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
    } else {
      console.log(message);
    }
  }

  // =======================================================
  // 4. FIND PARCEL
  // =======================================================

  function findParcel(trackingNumber) {
    const searchValue = trackingNumber.trim().toLowerCase();

    if (!searchValue) return null;

    return getParcels().find(parcel => {
      const id = String(parcel.id || "").toLowerCase();
      const trackingId = String(
        parcel.trackingNumber || ""
      ).toLowerCase();

      return id === searchValue || trackingId === searchValue;
    }) || null;
  }

  // =======================================================
  // 5. GET TRACKING HISTORY
  // =======================================================

  function getTrackingHistory(parcel) {
    const history = Array.isArray(parcel.history)
      ? parcel.history
      : Array.isArray(parcel.trackingHistory)
        ? parcel.trackingHistory
        : [];

    if (history.length > 0) {
      return history;
    }

    return [{
      status: parcel.status || "Pending",
      date: parcel.updatedAt || parcel.created || parcel.date || "",
      description: getStatusDescription(parcel.status)
    }];
  }

  function getStatusDescription(status) {
    const value = String(status || "").toLowerCase();

    const descriptions = {
      pending: "Your parcel has been registered.",
      processing: "Your parcel is being processed.",
      "picked up": "Your parcel has been picked up by the courier.",
      shipped: "Your parcel is on its way.",
      "in transit": "Your parcel is currently in transit.",
      "out for delivery": "Your parcel is out for delivery.",
      delivered: "Your parcel has been successfully delivered.",
      cancelled: "This parcel delivery has been cancelled.",
      failed: "Delivery attempt was unsuccessful."
    };

    return descriptions[value] || "Parcel status updated.";
  }

  // =======================================================
  // 6. RENDER TRACKING RESULT
  // =======================================================

  function renderTracking(parcel) {
    if (!elements.result) return;

    const trackingNumber =
      parcel.trackingNumber || parcel.id || "-";

    const recipient =
      parcel.recipient ||
      parcel.receiverName ||
      parcel.customerName ||
      "-";

    const history = getTrackingHistory(parcel);

    const historyHTML = history
      .slice()
      .reverse()
      .map(item => {
        const status = item.status || "Updated";
        const date = item.date || item.createdAt || "";

        const description =
          item.description ||
          item.message ||
          getStatusDescription(status);

        return `
          <div class="tracking-history-item">
            <div class="tracking-history-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>

            <div class="tracking-history-content">
              <strong>${escape(status)}</strong>
              <p>${escape(description)}</p>
              <small>${escape(formatDate(date))}</small>
            </div>
          </div>
        `;
      })
      .join("");

    elements.result.innerHTML = `
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">

          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

            <div>
              <small class="text-muted">TRACKING NUMBER</small>
              <h5 class="fw-bold mb-1">
                ${escape(trackingNumber)}
              </h5>
            </div>

            <span class="badge ${escape(statusClass(parcel.status))} px-3 py-2">
              ${escape(parcel.status || "Pending")}
            </span>

          </div>

          <hr>

          <div class="row g-3 mb-4">

            <div class="col-md-6">
              <small class="text-muted">Recipient</small>
              <div class="fw-semibold">
                ${escape(recipient)}
              </div>
            </div>

            <div class="col-md-6">
              <small class="text-muted">Phone Number</small>
              <div class="fw-semibold">
                ${escape(parcel.phone || "-")}
              </div>
            </div>

            <div class="col-md-6">
              <small class="text-muted">Delivery Address</small>
              <div class="fw-semibold">
                ${escape(parcel.address || parcel.receiverAddress || "-")}
              </div>
            </div>

            <div class="col-md-6">
              <small class="text-muted">Courier</small>
              <div class="fw-semibold">
                ${escape(parcel.courier || "-")}
              </div>
            </div>

            <div class="col-md-6">
              <small class="text-muted">Parcel Type</small>
              <div class="fw-semibold">
                ${escape(parcel.type || "-")}
              </div>
            </div>

            <div class="col-md-6">
              <small class="text-muted">Shipping Date</small>
              <div class="fw-semibold">
                ${escape(formatDate(parcel.date || parcel.created || ""))}
              </div>
            </div>

          </div>

          <hr>

          <h6 class="fw-bold mb-3">
            <i class="bi bi-clock-history me-2"></i>
            Tracking History
          </h6>

          <div class="tracking-history">
            ${historyHTML}
          </div>

        </div>
      </div>
    `;

    elements.result.style.display = "block";

    if (elements.message) {
      elements.message.textContent = "";
    }
  }

  // =======================================================
  // 7. SEARCH TRACKING
  // =======================================================

  function searchTracking(event) {
    if (event) event.preventDefault();

    if (!elements.input) return;

    const trackingNumber = elements.input.value.trim();

    if (!trackingNumber) {
      showMessage("Please enter a tracking number.", "warning");
      return;
    }

    const parcel = findParcel(trackingNumber);

    if (!parcel) {
      if (elements.result) {
        elements.result.innerHTML = "";
        elements.result.style.display = "none";
      }

      showMessage(
        "No parcel found. Please check the tracking number.",
        "danger"
      );

      return;
    }

    renderTracking(parcel);
  }

  // =======================================================
  // 8. MESSAGE
  // =======================================================

  function showMessage(message, type = "info") {
    if (elements.message) {
      elements.message.innerHTML = `
        <div class="alert alert-${type}" role="alert">
          ${escape(message)}
        </div>
      `;

      return;
    }

    showToast(message, type);
  }

  // =======================================================
  // 9. CLEAR RESULT
  // =======================================================

  function clearTracking() {
    if (elements.result) {
      elements.result.innerHTML = "";
      elements.result.style.display = "none";
    }

    if (elements.message) {
      elements.message.innerHTML = "";
    }
  }

  // =======================================================
  // 10. EVENT LISTENERS
  // =======================================================

  function bindEvents() {

    if (elements.form) {
      elements.form.addEventListener("submit", searchTracking);
    }

    if (elements.searchButton) {
      elements.searchButton.addEventListener("click", searchTracking);
    }

    if (elements.input) {
      elements.input.addEventListener("input", clearTracking);
    }

    window.addEventListener("parcelpro:dataUpdated", event => {
      if (
        !event.detail?.key ||
        event.detail.key === STORAGE.parcels
      ) {
        if (elements.input && elements.input.value.trim()) {
          const parcel = findParcel(elements.input.value);

          if (parcel) {
            renderTracking(parcel);
          } else {
            clearTracking();
          }
        }
      }
    });

    window.addEventListener("storage", event => {
      if (
        event.key === STORAGE.parcels ||
        event.key === null
      ) {
        if (elements.input && elements.input.value.trim()) {
          const parcel = findParcel(elements.input.value);

          if (parcel) {
            renderTracking(parcel);
          } else {
            clearTracking();
          }
        }
      }
    });
  }

  // =======================================================
  // 11. INITIALISE
  // =======================================================

  function initialise() {
    bindEvents();

    if (elements.result) {
      elements.result.style.display = "none";
    }

    console.log("ParcelPro Tracking Management loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }

})();
