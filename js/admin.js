
/* =========================================================
   PARCELPRO - ADMIN DASHBOARD
   Dashboard Statistics + Chart + Recent Parcels
   Uses Shared admin_common.js

   UPDATED:
   - Get actual shipping fee from parcel record
   - Fallback to admin customer shipping fee
   - Support existing customer records
   - Preserve dashboard statistics and chart
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. CHECK SHARED ADMIN SYSTEM
  // =======================================================

  const Admin = window.ParcelProAdmin;

  if (!Admin) {
    console.error(
      "ParcelProAdmin not found. Load admin_common.js first."
    );
    return;
  }

  const $ = Admin.$;

  let chartInstance = null;

  // =======================================================
  // 2. GET PARCEL TRACKING NUMBER
  // =======================================================

  function getTrackingNumber(parcel = {}) {
    return (
      parcel.trackingNumber ||
      parcel.tracking_number ||
      parcel.id ||
      "—"
    );
  }

  // =======================================================
  // 3. FIND CUSTOMER LINKED TO PARCEL
  // =======================================================

  function getCustomerForParcel(parcel = {}) {
    if (typeof Admin.getCustomers !== "function") {
      return null;
    }

    const customers = Admin.getCustomers();

    if (!Array.isArray(customers)) {
      return null;
    }

    const parcelCustomerId = String(
      parcel.customerId ||
      parcel.customer_id ||
      ""
    );

    const parcelEmail = String(
      parcel.customerEmail ||
      parcel.email ||
      parcel.senderEmail ||
      ""
    ).trim().toLowerCase();

    const parcelCustomerName = String(
      Admin.getCustomerName(parcel) || ""
    ).trim().toLowerCase();

    return customers.find(customer => {
      const customerId = String(
        customer.id || customer.customerId || ""
      );

      const customerEmail = String(
        customer.email || ""
      ).trim().toLowerCase();

      const customerName = String(
        customer.name || customer.fullName || ""
      ).trim().toLowerCase();

      if (
        parcelCustomerId &&
        customerId === parcelCustomerId
      ) {
        return true;
      }

      if (
        parcelEmail &&
        customerEmail === parcelEmail
      ) {
        return true;
      }

      if (
        parcelCustomerName &&
        customerName === parcelCustomerName
      ) {
        return true;
      }

      return false;
    }) || null;
  }

  // =======================================================
  // 4. GET SHIPPING FEE
  // =======================================================

  function getShippingFee(parcel = {}) {
    // First: Get fee from the parcel record.
    let fee = 0;

    if (typeof Admin.getParcelFee === "function") {
      fee = Number(Admin.getParcelFee(parcel));
    }

    if (!Number.isFinite(fee) || fee <= 0) {
      fee = Number(
        parcel.shippingFee ??
        parcel.finalPrice ??
        parcel.price ??
        0
      );
    }

    // If parcel has a valid fee, use it.
    if (Number.isFinite(fee) && fee > 0) {
      return fee;
    }

    // Second: Find the customer linked to this parcel.
    const customer = getCustomerForParcel(parcel);

    // Third: Get the admin customer shipping fee.
    if (
      customer &&
      typeof Admin.getAdminCustomerShippingFee === "function"
    ) {
      const customerFee = Number(
        Admin.getAdminCustomerShippingFee(customer)
      );

      if (
        Number.isFinite(customerFee) &&
        customerFee > 0
      ) {
        return customerFee;
      }
    }

    return 0;
  }

  // =======================================================
  // 5. DASHBOARD STATISTICS
  // =======================================================

  function renderStats() {
    const parcels = Array.isArray(Admin.parcels)
      ? Admin.parcels
      : [];

    const total = parcels.length;

    const delivered = parcels.filter(parcel =>
      parcel.status === "Delivered"
    ).length;

    const transit = parcels.filter(parcel =>
      parcel.status === "In Transit" ||
      parcel.status === "Out of Delivery"
    ).length;

    const pending = parcels.filter(parcel =>
      parcel.status === "Pending"
    ).length;

    const statTotal = $("#statTotal");
    const statDelivered = $("#statDelivered");
    const statTransit = $("#statTransit");
    const statPending = $("#statPending");
    const parcelNavCount = $("#parcelNavCount");

    if (statTotal) {
      statTotal.textContent = total;
    }

    if (statDelivered) {
      statDelivered.textContent = delivered;
    }

    if (statTransit) {
      statTransit.textContent = transit;
    }

    if (statPending) {
      statPending.textContent = pending;
    }

    if (parcelNavCount) {
      parcelNavCount.textContent = total;
    }

    const deliveryPending = $("#deliveryPending");
    const deliveryTransit = $("#deliveryTransit");
    const deliveryDone = $("#deliveryDone");

    if (deliveryPending) {
      deliveryPending.textContent = pending;
    }

    if (deliveryTransit) {
      deliveryTransit.textContent = transit;
    }

    if (deliveryDone) {
      deliveryDone.textContent = delivered;
    }
  }

  // =======================================================
  // 6. RECENT PARCELS
  // =======================================================

  function renderRecent() {
    const tbody = $("#recentParcelsBody");

    if (!tbody) return;

    const parcels = Array.isArray(Admin.parcels)
      ? Admin.parcels
      : [];

    const rows = [...parcels]
      .slice(-5)
      .reverse();

    // Debug shipping fee values in browser console.
    console.table(rows.map(parcel => ({
      trackingNumber: getTrackingNumber(parcel),
      customerName: Admin.getCustomerName(parcel),
      customerId: parcel.customerId,
      shippingFee: parcel.shippingFee,
      finalPrice: parcel.finalPrice,
      price: parcel.price,
      calculatedFee: getShippingFee(parcel)
    })));

    tbody.innerHTML = rows.map(parcel => {
      const trackingNumber = getTrackingNumber(parcel);

      const customerName =
        Admin.getCustomerName(parcel) || "—";

      const destination =
        Admin.getDestination(parcel) || "—";

      const address =
        parcel.address ||
        parcel.receiverAddress ||
        "—";

      const shippingFee = getShippingFee(parcel);

      return `
        <tr>
          <td>
            <span class="tracking-code">
              ${Admin.escapeHTML(trackingNumber)}
            </span>
          </td>

          <td>
            <span class="recipient-cell">
              ${Admin.escapeHTML(customerName)}
            </span>
          </td>

          <td>
            ${Admin.escapeHTML(destination)}

            <div class="text-muted small">
              ${Admin.escapeHTML(address)}
            </div>
          </td>

          <td>
            ${Admin.dateFormat(
              parcel.created ||
              parcel.createdAt ||
              parcel.date
            )}
          </td>

          <td>
            <strong>
              ${Admin.money(shippingFee)}
            </strong>
          </td>

          <td>
            <span class="status-badge ${
              Admin.statusClass(parcel.status)
            }">
              ${Admin.escapeHTML(
                parcel.status || "Pending"
              )}
            </span>
          </td>
        </tr>
      `;
    }).join("") || `
      <tr>
        <td colspan="6" class="empty-state">
          No parcel records yet.
        </td>
      </tr>
    `;
  }

  // =======================================================
  // 7. DELIVERY CHART
  // =======================================================

  function drawChart() {
    const canvas = $("#deliveryChart");

    if (!canvas) return;

    if (!window.Chart) {
      console.error(
        "Chart.js is missing. Please check the Chart.js script."
      );
      return;
    }

    const parcels = Array.isArray(Admin.parcels)
      ? Admin.parcels
      : [];

    const labels = [
      "Delivered",
      "Out of Delivery",
      "In Transit",
      "Pending"
    ];

    const data = labels.map(status =>
      parcels.filter(parcel =>
        parcel.status === status
      ).length
    );

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    chartInstance = new Chart(canvas, {
      type: "doughnut",

      data: {
        labels,

        datasets: [{
          data,

          backgroundColor: [
            "#15976b",
            "#f58220",
            "#164b83",
            "#f2a03b"
          ],

          borderWidth: 0,
          hoverOffset: 5
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            padding: 11
          }
        }
      }
    });
  }

  // =======================================================
  // 8. RENDER DASHBOARD
  // =======================================================

  function renderDashboard() {
    if (
      !$("#statTotal") &&
      !$("#recentParcelsBody") &&
      !$("#deliveryChart")
    ) {
      return;
    }

    renderStats();
    renderRecent();
    drawChart();
  }

  // =======================================================
  // 9. REFRESH WHEN DATA CHANGES
  // =======================================================

  document.addEventListener(
    "parcelpro:dataUpdated",
    renderDashboard
  );

  document.addEventListener(
    "parcelpro:login",
    renderDashboard
  );

  // =======================================================
  // 10. INITIALISE
  // =======================================================

  function initialise() {
    renderDashboard();
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
