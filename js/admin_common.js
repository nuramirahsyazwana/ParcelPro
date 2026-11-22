/* =========================================================
   PARCELPRO - ADMIN COMMON
   Shared Data + Authentication + Helpers
   Storage: localStorage

   UPDATED:
   - Customer ID menggunakan Tracking Number (PP1001 - PP1005)
   - Migrasi ID lama 1-5 kepada PP1001-PP1005
   - Parcel dan shipping fee dikemas kini mengikut Customer ID
   - Data localStorage sedia ada dikekalkan
   - Shipping fee sebenar dikekalkan
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. STORAGE KEYS
  // =======================================================

  const STORAGE = {
    parcels: "parcelpro_parcels",
    customers: "parcelpro_customers",
    users: "parcelpro_users",
    session: "parcelpro_session",
    payments: "parcelpro_payments",
    language: "parcelpro_admin_language",
    adminCustomerFees: "parcelpro_admin_customer_shipping_fees"
  };

  // =======================================================
  // 2. DEFAULT CUSTOMER DATA
  // Customer ID sama dengan Tracking Number
  // =======================================================

  const seedCustomers = [
    {
      id: "PP1001",
      name: "Aisyah Rahman",
      email: "aisyah.rahman@email.com",
      phone: "012-345 6789",
      location: "Shah Alam, Selangor"
    },
    {
      id: "PP1002",
      name: "Daniel Tan",
      email: "daniel.tan@email.com",
      phone: "013-222 4567",
      location: "Petaling Jaya, Selangor"
    },
    {
      id: "PP1003",
      name: "Nur Izzati",
      email: "nur.izzati@email.com",
      phone: "017-888 1234",
      location: "Bangi, Selangor"
    },
    {
      id: "PP1004",
      name: "Muhammad Amir",
      email: "amir.m@email.com",
      phone: "016-555 9087",
      location: "Cyberjaya, Selangor"
    },
    {
      id: "PP1005",
      name: "Lim Wei Jian",
      email: "lim.weijian@email.com",
      phone: "011-333 8765",
      location: "Kuala Lumpur"
    }
  ];

  // =======================================================
  // 3. DEFAULT PARCEL DATA
  // =======================================================

  const seedParcels = [
    {
      id: "PP1001",
      trackingNumber: "PP1001",
      recipient: "Aisyah Rahman",
      customerName: "Aisyah Rahman",
      customerId: "PP1001",
      customerEmail: "aisyah.rahman@email.com",
      phone: "012-345 6789",
      address: "Shah Alam, Selangor",
      type: "Small package",
      date: "2026-11-15",
      status: "In Transit",
      courier: "Daniel Lee",
      created: "2026-11-10",
      shippingType: "Domestic",
      destinationCountry: "Malaysia",
      weight: 1,
      shippingFee: 10.00,
      finalPrice: 10.00,
      price: 10.00,
      paymentStatus: "Paid",
      proofPhoto: "",
      history: [
        {
          status: "Pending",
          date: "2026-11-10",
          description: "Your parcel has been registered."
        },
        {
          status: "In Transit",
          date: "2026-11-15",
          description: "Your parcel is currently in transit."
        }
      ]
    },
    {
      id: "PP1002",
      trackingNumber: "PP1002",
      recipient: "Daniel Tan",
      customerName: "Daniel Tan",
      customerId: "PP1002",
      customerEmail: "daniel.tan@email.com",
      phone: "013-222 4567",
      address: "Petaling Jaya, Selangor",
      type: "Document",
      date: "2026-11-13",
      status: "Delivered",
      courier: "Farid Ahmad",
      created: "2026-11-09",
      shippingType: "Domestic",
      destinationCountry: "Malaysia",
      weight: 1,
      shippingFee: 6.00,
      finalPrice: 6.00,
      price: 6.00,
      paymentStatus: "Paid",
      proofPhoto: "",
      history: [
        {
          status: "Delivered",
          date: "2026-11-13",
          description: "Your parcel has been successfully delivered."
        }
      ]
    },
    {
      id: "PP1003",
      trackingNumber: "PP1003",
      recipient: "Nur Izzati",
      customerName: "Nur Izzati",
      customerId: "PP1003",
      customerEmail: "nur.izzati@email.com",
      phone: "017-888 1234",
      address: "Bangi, Selangor",
      type: "Medium package",
      date: "2026-11-16",
      status: "Pending",
      courier: "Not assigned",
      created: "2026-11-12",
      shippingType: "Domestic",
      destinationCountry: "Malaysia",
      weight: 1,
      shippingFee: 15.00,
      finalPrice: 15.00,
      price: 15.00,
      paymentStatus: "Paid",
      proofPhoto: "",
      history: [
        {
          status: "Pending",
          date: "2026-11-12",
          description: "Your parcel has been registered."
        }
      ]
    },
    {
      id: "PP1004",
      trackingNumber: "PP1004",
      recipient: "Muhammad Amir",
      customerName: "Muhammad Amir",
      customerId: "PP1004",
      customerEmail: "amir.m@email.com",
      phone: "016-555 9087",
      address: "Cyberjaya, Selangor",
      type: "Medium package",
      date: "2026-11-18",
      status: "Pending",
      courier: "Not assigned",
      created: "2026-11-18",
      shippingType: "Domestic",
      destinationCountry: "Malaysia",
      weight: 2,
      shippingFee: 17.50,
      finalPrice: 17.50,
      price: 17.50,
      paymentStatus: "Paid",
      proofPhoto: "",
      history: [
        {
          status: "Pending",
          date: "2026-11-18",
          description: "Your parcel has been registered."
        }
      ]
    },
    {
      id: "PP1005",
      trackingNumber: "PP1005",
      recipient: "Lim Wei Jian",
      customerName: "Lim Wei Jian",
      customerId: "PP1005",
      customerEmail: "lim.weijian@email.com",
      phone: "011-333 8765",
      address: "Kuala Lumpur",
      type: "Small package",
      date: "2026-11-19",
      status: "Pending",
      courier: "Not assigned",
      created: "2026-11-19",
      shippingType: "Domestic",
      destinationCountry: "Malaysia",
      weight: 3,
      shippingFee: 15.00,
      finalPrice: 15.00,
      price: 15.00,
      paymentStatus: "Paid",
      proofPhoto: "",
      history: [
        {
          status: "Pending",
          date: "2026-11-19",
          description: "Your parcel has been registered."
        }
      ]
    }
  ];

  // =======================================================
  // 4. ADMIN CUSTOMER SHIPPING FEES
  // =======================================================

  const seedAdminCustomerFees = [
    {
      customerId: "PP1001",
      customerEmail: "aisyah.rahman@email.com",
      trackingNumber: "PP1001",
      shippingFee: 10.00,
      packageType: "Small package",
      weight: 1,
      shippingType: "Domestic",
      destinationCountry: "Malaysia"
    },
    {
      customerId: "PP1002",
      customerEmail: "daniel.tan@email.com",
      trackingNumber: "PP1002",
      shippingFee: 6.00,
      packageType: "Document",
      weight: 1,
      shippingType: "Domestic",
      destinationCountry: "Malaysia"
    },
    {
      customerId: "PP1003",
      customerEmail: "nur.izzati@email.com",
      trackingNumber: "PP1003",
      shippingFee: 15.00,
      packageType: "Medium package",
      weight: 1,
      shippingType: "Domestic",
      destinationCountry: "Malaysia"
    },
    {
      customerId: "PP1004",
      customerEmail: "amir.m@email.com",
      trackingNumber: "PP1004",
      shippingFee: 17.50,
      packageType: "Medium package",
      weight: 2,
      shippingType: "Domestic",
      destinationCountry: "Malaysia"
    },
    {
      customerId: "PP1005",
      customerEmail: "lim.weijian@email.com",
      trackingNumber: "PP1005",
      shippingFee: 15.00,
      packageType: "Small package",
      weight: 3,
      shippingType: "Domestic",
      destinationCountry: "Malaysia"
    }
  ];

  // =======================================================
  // 5. STORAGE HELPERS
  // =======================================================

  function read(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error("ParcelPro storage read error:", error);
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("ParcelPro storage save error:", error);
      return false;
    }
  }

  function readList(key) {
    const value = read(key, []);
    return Array.isArray(value) ? value : [];
  }

  // =======================================================
  // 6. GENERAL HELPERS
  // =======================================================

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function initials(name) {
    return String(name || "Admin")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join("");
  }

  // =======================================================
  // 7. MIGRATE OLD CUSTOMER IDs
  // Tukar ID 1-5 kepada PP1001-PP1005
  // =======================================================

  function initialiseStorage() {
    const seedByEmail = new Map(
      seedCustomers.map(customer => [
        normalizeEmail(customer.email),
        customer
      ])
    );

    // -----------------------------------------------------
    // CUSTOMERS
    // -----------------------------------------------------

    const existingCustomers = readList(STORAGE.customers);
    const mergedCustomers = [...existingCustomers];

    seedCustomers.forEach(seed => {
      const index = mergedCustomers.findIndex(customer =>
        normalizeEmail(customer.email || customer.customerEmail) ===
        normalizeEmail(seed.email)
      );

      if (index >= 0) {
        // Kekalkan maklumat pelanggan, tetapi betulkan ID.
        mergedCustomers[index] = {
          ...mergedCustomers[index],
          id: seed.id
        };
      } else {
        mergedCustomers.push({ ...seed });
      }
    });

    save(STORAGE.customers, mergedCustomers);

    // -----------------------------------------------------
    // PARCELS
    // -----------------------------------------------------

    const existingParcels = readList(STORAGE.parcels);
    const mergedParcels = [...existingParcels];

    seedParcels.forEach(seed => {
      const index = mergedParcels.findIndex(parcel => {
        const tracking = String(
          parcel.trackingNumber || parcel.id || ""
        ).trim().toUpperCase();

        const email = normalizeEmail(
          parcel.customerEmail || parcel.senderEmail
        );

        return (
          tracking === seed.trackingNumber ||
          email === normalizeEmail(seed.customerEmail)
        );
      });

      if (index >= 0) {
        const oldParcel = mergedParcels[index];

        // Kekalkan rekod parcel dan shipping fee yang sedia ada.
        const updatedParcel = {
          ...oldParcel,
          customerId: seed.customerId,
          customerEmail: seed.customerEmail,
          customerName: oldParcel.customerName || seed.customerName,
          trackingNumber:
            oldParcel.trackingNumber || seed.trackingNumber
        };

        // Jika parcel lama tiada fee atau RM0, guna fee seed.
        const oldFee = getValidFeeFromRecord(oldParcel);

        if (oldFee <= 0) {
          updatedParcel.shippingFee = seed.shippingFee;
          updatedParcel.finalPrice = seed.finalPrice;
          updatedParcel.price = seed.price;
        }

        mergedParcels[index] = updatedParcel;
      } else {
        mergedParcels.push({ ...seed });
      }
    });

    // Migrasi rekod lama berdasarkan email pelanggan.
    mergedParcels.forEach((parcel, index) => {
      const email = normalizeEmail(
        parcel.customerEmail || parcel.senderEmail
      );

      const seed = seedByEmail.get(email);

      if (seed) {
        mergedParcels[index] = {
          ...parcel,
          customerId: seed.id,
          customerEmail: seed.email
        };
      }
    });

    save(STORAGE.parcels, mergedParcels);

    // -----------------------------------------------------
    // ADMIN USERS
    // -----------------------------------------------------

    if (localStorage.getItem(STORAGE.users) === null) {
      save(STORAGE.users, [{
        id: "admin-default",
        name: "Admin User",
        email: "admin@parcelpro.com",
        password: "admin123",
        role: "admin"
      }]);
    }

    // -----------------------------------------------------
    // ADMIN SHIPPING FEES
    // -----------------------------------------------------

    const existingFees = readList(STORAGE.adminCustomerFees);
    const mergedFees = [...existingFees];

    seedAdminCustomerFees.forEach(seed => {
      const index = mergedFees.findIndex(item =>
        normalizeEmail(item.customerEmail) ===
        normalizeEmail(seed.customerEmail)
      );

      if (index >= 0) {
        mergedFees[index] = {
          ...mergedFees[index],
          customerId: seed.customerId,
          trackingNumber: seed.trackingNumber
        };

        const oldFee = Number(
          String(mergedFees[index].shippingFee ?? 0)
            .replace(/RM\s*/i, "")
            .replace(/,/g, "")
            .trim()
        );

        if (!Number.isFinite(oldFee) || oldFee <= 0) {
          mergedFees[index].shippingFee = seed.shippingFee;
        }
      } else {
        mergedFees.push({ ...seed });
      }
    });

    save(STORAGE.adminCustomerFees, mergedFees);
  }

  function getValidFeeFromRecord(parcel = {}) {
    const fields = [
      parcel.shippingFee,
      parcel.finalPrice,
      parcel.price
    ];

    for (const value of fields) {
      if (value === null || value === undefined || value === "") {
        continue;
      }

      const amount = Number(
        String(value)
          .replace(/RM\s*/i, "")
          .replace(/,/g, "")
          .trim()
      );

      if (Number.isFinite(amount) && amount > 0) {
        return amount;
      }
    }

    return 0;
  }

  initialiseStorage();

  // =======================================================
  // 8. SHARED DATA
  // =======================================================

  let parcels = readList(STORAGE.parcels);
  let customers = readList(STORAGE.customers);
  let users = readList(STORAGE.users);
  let currentUser = read(STORAGE.session, null);

  // =======================================================
  // 9. DOM HELPERS
  // =======================================================

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  // =======================================================
  // 10. MONEY FORMAT
  // =======================================================

  function money(value) {
    const amount = Number(value);

    return "RM " +
      (Number.isFinite(amount) ? amount : 0).toFixed(2);
  }

  // =======================================================
  // 11. SHIPPING FEE HELPER
  // =======================================================

  function getParcelFee(parcel = {}) {
    const actualFee = getValidFeeFromRecord(parcel);

    if (actualFee > 0) {
      return actualFee;
    }

    const trackingId = String(
      parcel.trackingNumber || parcel.id || ""
    ).trim().toUpperCase();

    const defaultParcel = seedParcels.find(item =>
      String(item.trackingNumber || item.id).trim().toUpperCase() ===
      trackingId
    );

    if (defaultParcel) {
      return Number(defaultParcel.shippingFee) || 0;
    }

    return 0;
  }

  // =======================================================
  // 12. DATE HELPERS
  // =======================================================

  function dateFormat(value) {
    if (!value) return "—";

    const dateValue = String(value).slice(0, 10);
    const date = new Date(dateValue + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
      return escapeHTML(value);
    }

    return date.toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getToday() {
    const now = new Date();

    const local = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 10);
  }

  // =======================================================
  // 13. STATUS HELPERS
  // =======================================================

  function normalizeStatus(status) {
    const value = String(status || "Pending")
      .trim()
      .toLowerCase();

    const aliases = {
      "pending": "Pending",
      "processing": "Processing",
      "picked up": "Picked Up",
      "picked-up": "Picked Up",
      "shipped": "In Transit",
      "in transit": "In Transit",
      "out for delivery": "Out for Delivery",
      "out of delivery": "Out for Delivery",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      "canceled": "Cancelled",
      "failed": "Failed"
    };

    return aliases[value] || "Pending";
  }

  function statusClass(status) {
    const value = normalizeStatus(status);

    if (value === "Delivered") return "status-delivered";

    if (
      value === "In Transit" ||
      value === "Out for Delivery" ||
      value === "Picked Up"
    ) {
      return "status-transit";
    }

    if (
      value === "Cancelled" ||
      value === "Failed"
    ) {
      return "status-cancelled";
    }

    return "status-pending";
  }

  function getShippingType(parcel = {}) {
    return parcel.shippingType || "Domestic";
  }

  function getDestination(parcel = {}) {
    return parcel.destinationCountry ||
      parcel.destination ||
      "Malaysia";
  }

  // =======================================================
  // 14. CUSTOMER HELPERS
  // =======================================================

  function getCustomerForParcel(parcel = {}) {
    return customers.find(customer =>
      String(customer.id) === String(parcel.customerId)
    ) || customers.find(customer =>
      normalizeEmail(customer.email) ===
      normalizeEmail(parcel.customerEmail || parcel.senderEmail)
    ) || null;
  }

  function getCustomerName(parcel = {}) {
    const customer = getCustomerForParcel(parcel);

    return (
      parcel.customerName ||
      parcel.senderName ||
      customer?.name ||
      parcel.recipient ||
      "Unknown customer"
    );
  }

  function getReceiverName(parcel = {}) {
    return parcel.receiverName || parcel.recipient || "—";
  }

  function getCustomerParcels(customer = {}) {
    const currentParcels = readList(STORAGE.parcels);

    return currentParcels.filter(parcel => {
      const sameId =
        String(parcel.customerId) === String(customer.id);

      const sameEmail =
        customer.email &&
        normalizeEmail(parcel.customerEmail || parcel.senderEmail) ===
        normalizeEmail(customer.email);

      return sameId || sameEmail;
    });
  }

  function getCustomerTrackingNumbers(customer = {}) {
    return getCustomerParcels(customer)
      .map(parcel =>
        String(parcel.trackingNumber || parcel.id || "").trim()
      )
      .filter(Boolean);
  }

  // =======================================================
  // 15. ADMIN CUSTOMER SHIPPING FEE
  // =======================================================

  function getAdminCustomerShippingFee(customer = {}) {
    const customerParcels = getCustomerParcels(customer);

    const actualTotal = customerParcels.reduce(
      (total, parcel) => total + getParcelFee(parcel),
      0
    );

    if (Number.isFinite(actualTotal) && actualTotal > 0) {
      return actualTotal;
    }

    const fees = readList(STORAGE.adminCustomerFees);
    const customerEmail = normalizeEmail(customer.email);

    const record = fees.find(item =>
      normalizeEmail(item.customerEmail) === customerEmail
    );

    if (record) {
      const amount = Number(
        String(record.shippingFee ?? 0)
          .replace(/RM\s*/i, "")
          .replace(/,/g, "")
          .trim()
      );

      if (Number.isFinite(amount) && amount > 0) {
        return amount;
      }
    }

    const defaultRecord = seedAdminCustomerFees.find(item =>
      normalizeEmail(item.customerEmail) === customerEmail
    );

    return defaultRecord
      ? Number(defaultRecord.shippingFee)
      : null;
  }

  function getCustomerShippingDetails(customer = {}) {
    const fees = readList(STORAGE.adminCustomerFees);

    return fees.find(item =>
      normalizeEmail(item.customerEmail) ===
      normalizeEmail(customer.email)
    ) || seedAdminCustomerFees.find(item =>
      normalizeEmail(item.customerEmail) ===
      normalizeEmail(customer.email)
    ) || null;
  }

  // =======================================================
  // 16. LINK OLD PARCELS TO CUSTOMERS
  // =======================================================

  function linkOldParcelsToCustomers() {
    let changed = false;

    parcels = readList(STORAGE.parcels).map(parcel => {
      let customer = getCustomerForParcel(parcel);

      if (!customer) {
        const recipient = String(
          parcel.customerName ||
          parcel.senderName ||
          parcel.recipient ||
          ""
        ).trim().toLowerCase();

        customer = customers.find(item =>
          String(item.name || "").trim().toLowerCase() === recipient
        );
      }

      if (!customer) return parcel;

      const updated = {
        ...parcel,
        customerId: customer.id,
        customerEmail: parcel.customerEmail || customer.email || "",
        customerName: parcel.customerName || customer.name || ""
      };

      if (!updated.senderName) {
        updated.senderName = customer.name || "";
      }

      if (!updated.senderPhone) {
        updated.senderPhone = customer.phone || "";
      }

      if (!updated.senderAddress) {
        updated.senderAddress =
          customer.location || customer.address || "";
      }

      if (JSON.stringify(updated) !== JSON.stringify(parcel)) {
        changed = true;
      }

      return updated;
    });

    if (changed) {
      save(STORAGE.parcels, parcels);
    }
  }

  // =======================================================
  // 17. DATA REFRESH + EVENT SYSTEM
  // =======================================================

  function refreshData() {
    parcels = readList(STORAGE.parcels);
    customers = readList(STORAGE.customers);
    users = readList(STORAGE.users);
    currentUser = read(STORAGE.session, null);

    return { parcels, customers, users, currentUser };
  }

  function dispatchDataUpdated(key = STORAGE.parcels) {
    const detail = {
      key,
      parcels: readList(STORAGE.parcels),
      customers: readList(STORAGE.customers),
      users: readList(STORAGE.users)
    };

    refreshData();

    window.dispatchEvent(
      new CustomEvent("parcelpro:dataUpdated", { detail })
    );

    document.dispatchEvent(
      new CustomEvent("parcelpro:dataUpdated", { detail })
    );
  }

  function setParcels(value) {
    if (!Array.isArray(value)) return false;
    if (!save(STORAGE.parcels, value)) return false;

    parcels = value;
    dispatchDataUpdated(STORAGE.parcels);
    return true;
  }

  function setCustomers(value) {
    if (!Array.isArray(value)) return false;
    if (!save(STORAGE.customers, value)) return false;

    customers = value;
    dispatchDataUpdated(STORAGE.customers);
    return true;
  }

  function persist() {
    const parcelsSaved = save(STORAGE.parcels, parcels);
    const customersSaved = save(STORAGE.customers, customers);

    if (parcelsSaved && customersSaved) {
      dispatchDataUpdated(STORAGE.parcels);
      return true;
    }

    return false;
  }

  // =======================================================
  // 18. TOAST + ALERT
  // =======================================================

  function toast(message) {
    const toastElement = $("#appToast");

    if (!toastElement || !window.bootstrap) {
      alert(message);
      return;
    }

    const messageElement = $("#toastMessage");

    if (messageElement) {
      messageElement.textContent = message;
    }

    bootstrap.Toast.getOrCreateInstance(toastElement, {
      delay: 2600
    }).show();
  }

  function showAlert(selector, message) {
    const element = $(selector);
    if (!element) return;

    element.textContent = message;
    element.classList.remove("d-none");
  }

  function hideAlert(selector) {
    $(selector)?.classList.add("d-none");
  }

  // =======================================================
  // 19. USER INTERFACE
  // =======================================================

  function updateUserUI() {
    if (!currentUser) return;

    const name = currentUser.name || "Admin User";
    const photo = currentUser.photo || "";

    const headerName = $("#headerName");
    const welcomeName = $("#welcomeName");
    const headerAvatar = $("#headerAvatar");
    const profileAvatar = $("#profileAvatar");

    if (headerName) headerName.textContent = name;

    if (welcomeName) {
      welcomeName.textContent = name.split(" ")[0];
    }

    const photoHTML = photo
      ? `<img class="admin-avatar-photo" src="${escapeHTML(photo)}" alt="Admin profile">`
      : initials(name);

    if (headerAvatar) headerAvatar.innerHTML = photoHTML;
    if (profileAvatar) profileAvatar.innerHTML = photoHTML;

    if ($("#profileDisplayName")) {
      $("#profileDisplayName").textContent = name;
    }

    if ($("#profileDisplayEmail")) {
      $("#profileDisplayEmail").textContent = currentUser.email || "";
    }

    if ($("#profileName")) $("#profileName").value = name;

    if ($("#profileEmail")) {
      $("#profileEmail").value = currentUser.email || "";
    }
  }

  // =======================================================
  // 20. NAVIGATION
  // =======================================================

  function closeSidebar() {
    $("#sidebar")?.classList.remove("open");
    $("#sidebarBackdrop")?.classList.remove("show");
  }

  function navigate(page) {
    const pageURLs = {
      dashboard: "admin.html",
      parcels: "admin_parcels.html",
      tracking: "admin_tracking.html",
      customers: "admin_customers.html",
      deliveries: "admin_deliveries.html",
      profile: "admin_profile.html"
    };

    const target = pageURLs[page] || pageURLs.dashboard;
    const currentFile = location.pathname.split("/").pop();

    if (currentFile !== target) {
      location.href = target;
    }

    closeSidebar();
  }

  function initialiseNavigation() {
    $$("[data-page]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        navigate(link.dataset.page);
      });
    });

    $$("[data-page-link]").forEach(button => {
      button.addEventListener("click", () => {
        navigate(button.dataset.pageLink);
      });
    });

    $("#openSidebar")?.addEventListener("click", () => {
      $("#sidebar")?.classList.add("open");
      $("#sidebarBackdrop")?.classList.add("show");
    });

    $("#closeSidebar")?.addEventListener("click", closeSidebar);
    $("#sidebarBackdrop")?.addEventListener("click", closeSidebar);
  }

  // =======================================================
  // 21. AUTHENTICATION
  // =======================================================

  function showApp(user) {
    if (!user) return;

    currentUser = {
      id: user.id || user.email,
      name: user.name || "Admin User",
      email: normalizeEmail(user.email),
      photo: user.photo || ""
    };

    save(STORAGE.session, currentUser);

    $("#authScreen")?.classList.add("d-none");
    $("#appShell")?.classList.remove("d-none");

    updateUserUI();

    document.dispatchEvent(
      new CustomEvent("parcelpro:login", {
        detail: { user: currentUser }
      })
    );

    window.dispatchEvent(
      new CustomEvent("parcelpro:login", {
        detail: { user: currentUser }
      })
    );
  }

  function isLoggedIn() {
    refreshData();

    if (!currentUser?.email) return false;

    return users.some(user =>
      normalizeEmail(user.email) ===
      normalizeEmail(currentUser.email) &&
      (!user.role || user.role === "admin")
    );
  }

  function requireAdmin() {
    if (!isLoggedIn()) {
      location.replace("admin.html");
      return false;
    }

    $("#appShell")?.classList.remove("d-none");
    updateUserUI();

    return true;
  }

  function getSession() {
    refreshData();
    return currentUser;
  }

  function logout() {
    localStorage.removeItem(STORAGE.session);
    currentUser = null;

    const appShell = $("#appShell");
    const authScreen = $("#authScreen");

    appShell?.classList.add("d-none");

    if (authScreen) {
      authScreen.classList.remove("d-none");
    } else {
      location.href = "admin.html";
      return;
    }

    $("#loginForm")?.reset();
    $("#registerForm")?.reset();
    $("#registerPanel")?.classList.add("d-none");
    $("#loginPanel")?.classList.remove("d-none");

    hideAlert("#loginAlert");
    hideAlert("#registerAlert");
  }

  function initialiseAuthentication() {
    const authScreen = $("#authScreen");
    const appShell = $("#appShell");

    if (authScreen && appShell) {
      if (currentUser && isLoggedIn()) {
        const matchedUser = users.find(user =>
          normalizeEmail(user.email) ===
          normalizeEmail(currentUser.email)
        );

        showApp(matchedUser);
      } else {
        localStorage.removeItem(STORAGE.session);
        currentUser = null;

        authScreen.classList.remove("d-none");
        appShell.classList.add("d-none");
      }
    } else {
      if (!requireAdmin()) return;
    }

    $("#loginForm")?.addEventListener("submit", event => {
      event.preventDefault();
      hideAlert("#loginAlert");
      refreshData();

      const email = normalizeEmail($("#loginEmail")?.value);
      const password = $("#loginPassword")?.value || "";

      const user = users.find(item =>
        normalizeEmail(item.email) === email &&
        item.password === password
      );

      if (!user) {
        showAlert(
          "#loginAlert",
          "Invalid email address or password. Please try again."
        );
        return;
      }

      if (user.role && user.role !== "admin") {
        showAlert(
          "#loginAlert",
          "Please use the Customer Portal to access your account."
        );
        return;
      }

      showApp(user);
    });

    $("#registerForm")?.addEventListener("submit", event => {
      event.preventDefault();
      hideAlert("#registerAlert");
      refreshData();

      const name = $("#registerName")?.value.trim() || "";
      const email = normalizeEmail($("#registerEmail")?.value);
      const password = $("#registerPassword")?.value || "";

      if (!name || !email || password.length < 6) {
        showAlert(
          "#registerAlert",
          "Please complete all fields. Password must contain at least 6 characters."
        );
        return;
      }

      if (users.some(user =>
        normalizeEmail(user.email) === email
      )) {
        showAlert(
          "#registerAlert",
          "An account with this email already exists."
        );
        return;
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: "admin"
      };

      users.push(newUser);

      if (!save(STORAGE.users, users)) {
        showAlert("#registerAlert", "Unable to save your account.");
        return;
      }

      showApp(newUser);
      toast("Your account has been created.");
    });

    $("#showRegister")?.addEventListener("click", event => {
      event.preventDefault();
      $("#loginPanel")?.classList.add("d-none");
      $("#registerPanel")?.classList.remove("d-none");
    });

    $("#showLogin")?.addEventListener("click", event => {
      event.preventDefault();
      $("#registerPanel")?.classList.add("d-none");
      $("#loginPanel")?.classList.remove("d-none");
    });

    $("#logoutButton")?.addEventListener("click", logout);

    $$("[data-toggle-password]").forEach(button => {
      button.addEventListener("click", () => {
        const input = $("#" + button.dataset.togglePassword);
        if (!input) return;

        input.type = input.type === "password" ? "text" : "password";

        button.innerHTML = input.type === "password"
          ? '<i class="bi bi-eye"></i>'
          : '<i class="bi bi-eye-slash"></i>';
      });
    });
  }

  // =======================================================
  // 22. DATE + LANGUAGE
  // =======================================================

  function initialiseDate() {
    const dateElement = $("#currentDate");

    if (dateElement) {
      dateElement.textContent =
        new Date().toLocaleDateString("en-MY", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        });
    }
  }

  function initialiseLanguage() {
    const select = $("#adminLanguageSelect");

    const savedLanguage =
      localStorage.getItem(STORAGE.language) || "en";

    if (select) {
      select.value = savedLanguage;

      select.addEventListener("change", event => {
        const language = event.target.value;

        localStorage.setItem(STORAGE.language, language);
        document.documentElement.lang = language;

        toast(
          language === "ms"
            ? "Pilihan bahasa disimpan."
            : language === "zh"
              ? "语言设置已保存。"
              : "Language preference saved."
        );
      });
    }

    document.documentElement.lang = savedLanguage;
  }

  // =======================================================
  // 23. CUSTOMER DROPDOWN
  // =======================================================

  function populateParcelCustomers(selectedId = "") {
    const select = $("#parcelRecipient");
    if (!select) return;

    select.innerHTML =
      '<option value="">Select customer</option>';

    customers.forEach(customer => {
      const option = document.createElement("option");

      option.value = String(customer.id);
      option.textContent =
        `${customer.name || customer.email} (${customer.email || ""})`;

      if (String(customer.id) === String(selectedId)) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  }

  function fillCustomerDetails() {
    const select = $("#parcelRecipient");
    if (!select) return;

    const customer = customers.find(item =>
      String(item.id) === String(select.value)
    );

    const phone = $("#parcelPhone");
    const address = $("#parcelAddress");

    if (!customer) {
      if (phone) phone.value = "";
      if (address) address.value = "";
      return;
    }

    if (phone) phone.value = customer.phone || "";

    if (address) {
      address.value = customer.location || customer.address || "";
    }
  }

  function initialiseCustomerDropdown() {
    populateParcelCustomers();

    $("#parcelRecipient")?.addEventListener(
      "change",
      fillCustomerDetails
    );
  }

  // =======================================================
  // 24. CROSS-TAB STORAGE UPDATES
  // =======================================================

  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE.customers ||
      event.key === STORAGE.parcels ||
      event.key === STORAGE.users ||
      event.key === STORAGE.payments ||
      event.key === STORAGE.adminCustomerFees ||
      event.key === null
    ) {
      refreshData();

      dispatchDataUpdated(event.key || STORAGE.parcels);
      updateUserUI();
      populateParcelCustomers();
    }
  });

  // =======================================================
  // 25. INITIALISE
  // =======================================================

  function initialise() {
    refreshData();
    linkOldParcelsToCustomers();

    initialiseNavigation();
    initialiseAuthentication();
    initialiseDate();
    initialiseLanguage();
    initialiseCustomerDropdown();
  }

  // =======================================================
  // 26. PUBLIC API
  // =======================================================

  window.ParcelProAdmin = {
    STORAGE,

    $,
    $$,

    read,
    save,
    readList,

    get parcels() {
      parcels = readList(STORAGE.parcels);
      return parcels;
    },

    set parcels(value) {
      parcels = Array.isArray(value) ? value : [];
    },

    get customers() {
      customers = readList(STORAGE.customers);
      return customers;
    },

    set customers(value) {
      customers = Array.isArray(value) ? value : [];
    },

    get users() {
      users = readList(STORAGE.users);
      return users;
    },

    set users(value) {
      users = Array.isArray(value) ? value : [];
    },

    get currentUser() {
      return currentUser;
    },

    set currentUser(value) {
      currentUser = value;
    },

    refreshData,
    persist,
    setParcels,
    setCustomers,
    dispatchDataUpdated,

    toast,
    showAlert,
    hideAlert,

    escapeHTML,
    normalizeEmail,
    initials,
    money,

    getParcelFee,
    getAdminCustomerShippingFee,
    getCustomerShippingDetails,

    dateFormat,
    getToday,

    normalizeStatus,
    statusClass,

    getShippingType,
    getDestination,

    getCustomerForParcel,
    getCustomerName,
    getReceiverName,
    getCustomerParcels,
    getCustomerTrackingNumbers,

    linkOldParcelsToCustomers,

    populateParcelCustomers,
    fillCustomerDetails,

    navigate,
    logout,
    updateUserUI,

    isLoggedIn,
    requireAdmin,
    getSession,

    getCurrentUser: () => currentUser,
    getCurrentAdmin: () => currentUser,

    getParcels: () => readList(STORAGE.parcels),
    getCustomers: () => readList(STORAGE.customers)
  };

  // =======================================================
  // 27. DOCUMENT INITIALISATION
  // =======================================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }

})();
