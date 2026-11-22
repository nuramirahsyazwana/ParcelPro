
/* =========================================================
   PARCELPRO - ADMIN_TRACKING.JS
   Parcel Tracking System
   Linked with ADMIN_PARCELS.JS
   Shared Storage: parcelpro_parcels
   Search by Tracking ID + Live Status Updates
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. SHARED ADMIN SYSTEM
  // =======================================================

  const Admin = window.ParcelProAdmin;

  if (!Admin) {
    console.error("ParcelProAdmin not found. Load admin_common.js first.");
    return;
  }

  const STORAGE = {
    parcels: Admin.STORAGE?.parcels || "parcelpro_parcels"
  };

  const $ = Admin.$ || (selector =>
    document.querySelector(selector)
  );

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
  // 3. SHARED PARCEL STORAGE
  // =======================================================

  function getParcels() {
    try {
      if (typeof Admin.readList === "function") {
        const records = Admin.readList(STORAGE.parcels);
        if (Array.isArray(records)) return records;
      }

      const records = JSON.parse(
        localStorage.getItem(STORAGE.parcels) || "[]"
      );

      return Array.isArray(records) ? records : [];

    } catch (error) {
      console.error("Unable to read parcel records:", error);
      return [];
    }
  }

  // =======================================================
  // 4. HELPER FUNCTIONS
  // =======================================================

  function escape(value) {
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

  function formatDate(value) {
    if (!value) return "-";

    if (typeof Admin.dateFormat === "function") {
      return Admin.dateFormat(value);
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
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

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function getTrackingId(parcel) {
    return String(
      parcel.trackingNumber ||
      parcel.trackingNo ||
      parcel.id ||
      ""
    ).trim();
  }

  // =======================================================
  // 5. FIND PARCEL BY TRACKING ID
  // =======================================================

  function findParcel(trackingNumber) {
    const searchValue = normalizeId(trackingNumber);

    if (!searchValue) return null;

    return getParcels().find(parcel => {
      const trackingId = normalizeId(
        parcel.trackingNumber || parcel.trackingNo
      );

      const parcelId = normalizeId(parcel.id);

      return (
        trackingId === searchValue ||
        parcelId === searchValue
      );
    }) || null;
  }

  // =======================================================
  // 6. TRACKING HISTORY
  // =======================================================

  function getStatusDescription(status) {
    const value = String(status || "")
      .trim()
      .toLowerCase();

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
      date:
        parcel.updated ||
        parcel.updatedAt ||
        parcel.created ||
        parcel.date ||
        "",
      description: getStatusDescription(parcel.status)
    }];
  }

  // =======================================================
  // 7. RENDER TRACKING RESULT
  // =======================================================

  function renderTracking(parcel) {
    if (!elements.result) return;

    const trackingNumber = getTrackingId(parcel) || "-";

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

        const date =
          item.date ||
          item.createdAt ||
          item.updated ||
          "";

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

    const fee =
      parcel.shippingFee ??
      parcel.finalPrice ??
      parcel.price;

    elements.result.innerHTML = `
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">

          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
            <div>
              <small class="text-muted">PARCEL TRACKING ID</small>
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
              <small class="text-muted">Customer ID</small>
              <div class="fw-semibold">
                ${escape(parcel.customerId || "-")}
              </div>
            </div>

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

            <div class="col-md-6">
              <small class="text-muted">Shipping Fee</small>
              <div class="fw-semibold">
                ${fee !== undefined && fee !== null
                  ? escape(typeof Admin.money === "function"
                      ? Admin.money(Number(fee) || 0)
                      : "RM " + (Number(fee) || 0).toFixed(2))
                  : "-"}
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
      elements.message.innerHTML = "";
    }
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
    } else {
      alert(message);
    }
  }

  // =======================================================
  // 9. SEARCH TRACKING
  // =======================================================

  function searchTracking(event) {
    if (event) event.preventDefault();

    const trackingNumber = elements.input?.value.trim() || "";

    if (!trackingNumber) {
      showMessage("Please enter a parcel tracking ID.", "warning");
      return;
    }

    const parcel = findParcel(trackingNumber);

    if (!parcel) {
      if (elements.result) {
        elements.result.innerHTML = "";
        elements.result.style.display = "none";
      }

      showMessage(
        "No parcel found. Please check your Tracking ID.",
        "danger"
      );

      return;
    }

    renderTracking(parcel);
  }

  // =======================================================
  // 10. CLEAR RESULT
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
  // 11. REFRESH CURRENT TRACKING
  // =======================================================

  function refreshCurrentTracking() {
    const trackingNumber = elements.input?.value.trim() || "";

    if (!trackingNumber) return;

    const parcel = findParcel(trackingNumber);

    if (parcel) {
      renderTracking(parcel);
    } else {
      clearTracking();
    }
  }

  // =======================================================
  // 12. EVENT LISTENERS
  // =======================================================

  function bindEvents() {

    if (elements.form) {
      elements.form.addEventListener(
        "submit",
        searchTracking
      );
    } else if (elements.searchButton) {
      elements.searchButton.addEventListener(
        "click",
        searchTracking
      );
    }

    elements.input?.addEventListener(
      "input",
      clearTracking
    );

    // Updates from Parcel Management in the same tab
    window.addEventListener(
      "parcelpro:dataUpdated",
      event => {
        if (
          !event.detail?.key ||
          event.detail.key === STORAGE.parcels
        ) {
          refreshCurrentTracking();
        }
      }
    );

    // Updates from another browser tab
    window.addEventListener("storage", event => {
      if (
        event.key === STORAGE.parcels ||
        event.key === null
      ) {
        refreshCurrentTracking();
      }
    });
  }

  // =======================================================
  // 13. INITIALISE
  // =======================================================

  function initialise() {
    bindEvents();

    if (elements.result) {
      elements.result.style.display = "none";
    }

    console.log(
      "ParcelPro Tracking connected to shared parcel storage:",
      STORAGE.parcels
    );
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
