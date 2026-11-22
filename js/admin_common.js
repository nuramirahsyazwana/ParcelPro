
/* =========================================================
   PARCELPRO - ADMIN COMMON
   Shared Data + Authentication + Helpers
   Storage: localStorage
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
    language: "parcelpro_admin_language"
  };

  // =======================================================
  // 2. DEFAULT DATA
  // Seed data is added ONLY when storage is empty.
  // Existing user data will not be overwritten.
  // =======================================================

 
const seedCustomers = [
  {
    id: 1,
    name: "Aisyah Rahman",
    email: "aisyah.rahman@email.com",
    phone: "012-345 6789",
    location: "Shah Alam, Selangor"
  },
  {
    id: 2,
    name: "Daniel Tan",
    email: "daniel.tan@email.com",
    phone: "013-222 4567",
    location: "Petaling Jaya, Selangor"
  },
  {
    id: 3,
    name: "Nur Izzati",
    email: "nur.izzati@email.com",
    phone: "017-888 1234",
    location: "Bangi, Selangor"
  },
  {
    id: 4,
    name: "Muhammad Amir",
    email: "amir.m@email.com",
    phone: "016-555 9087",
    location: "Cyberjaya, Selangor"
  },
  {
    id: 5,
    name: "Lim Wei Jian",
    email: "lim.weijian@email.com",
    phone: "011-333 8765",
    location: "Kuala Lumpur"
  },
  {
    id: 6,
    name: "Siti Nur Aina",
    email: "aina.siti@email.com",
    phone: "013-456 7890",
    location: "Kota Bharu, Kelantan"
  },
  {
    id: 7,
    name: "Adam Hakim",
    email: "adam.hakim@email.com",
    phone: "014-567 8901",
    location: "Kuantan, Pahang"
  },
  {
    id: 8,
    name: "Nurul Huda",
    email: "nurul.huda@email.com",
    phone: "016-234 5678",
    location: "Johor Bahru, Johor"
  },
  {
    id: 9,
    name: "Jason Lee",
    email: "jason.lee@email.com",
    phone: "017-345 6789",
    location: "George Town, Penang"
  },
  {
    id: 10,
    name: "Farah Nadia",
    email: "farah.nadia@email.com",
    phone: "018-456 7890",
    location: "Ipoh, Perak"
  }
];

const seedParcels = [
  {
    id: "PP2026007998",
    trackingNumber: "PP2026007998",
    recipient: "Aisyah Rahman",
    customerName: "Aisyah Rahman",
    customerId: 1,
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
    shippingFee: 10,
    finalPrice: 10,
    price: 10,
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
    id: "PP2026007999",
    trackingNumber: "PP2026007999",
    recipient: "Daniel Tan",
    customerName: "Daniel Tan",
    customerId: 2,
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
    shippingFee: 6,
    finalPrice: 6,
    price: 6,
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
    id: "PP2026008000",
    trackingNumber: "PP2026008000",
    recipient: "Nur Izzati",
    customerName: "Nur Izzati",
    customerId: 3,
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
    shippingFee: 15,
    finalPrice: 15,
    price: 15,
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
    id: "PP2026008001",
    trackingNumber: "PP2026008001",
    recipient: "Muhammad Amir",
    customerName: "Muhammad Amir",
    customerId: 4,
    customerEmail: "amir.m@email.com",
    phone: "016-555 9087",
    address: "Cyberjaya, Selangor",
    type: "Large package",
    date: "2026-11-18",
    status: "In Transit",
    courier: "Ahmad Firdaus",
    created: "2026-11-14",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 3,
    shippingFee: 25,
    finalPrice: 25,
    price: 25,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-14",
        description: "Your parcel has been registered."
      },
      {
        status: "In Transit",
        date: "2026-11-18",
        description: "Your parcel is currently in transit."
      }
    ]
  },
  {
    id: "PP2026008002",
    trackingNumber: "PP2026008002",
    recipient: "Lim Wei Jian",
    customerName: "Lim Wei Jian",
    customerId: 5,
    customerEmail: "lim.weijian@email.com",
    phone: "011-333 8765",
    address: "Kuala Lumpur",
    type: "Document",
    date: "2026-11-19",
    status: "Delivered",
    courier: "Sarah Lim",
    created: "2026-11-16",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 1,
    shippingFee: 6,
    finalPrice: 6,
    price: 6,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-16",
        description: "Your parcel has been registered."
      },
      {
        status: "Delivered",
        date: "2026-11-19",
        description: "Your parcel has been successfully delivered."
      }
    ]
  },
  {
    id: "PP2026008003",
    trackingNumber: "PP2026008003",
    recipient: "Siti Nur Aina",
    customerName: "Siti Nur Aina",
    customerId: 6,
    customerEmail: "aina.siti@email.com",
    phone: "013-456 7890",
    address: "Kota Bharu, Kelantan",
    type: "Small package",
    date: "2026-11-20",
    status: "Pending",
    courier: "Not assigned",
    created: "2026-11-20",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 1,
    shippingFee: 10,
    finalPrice: 10,
    price: 10,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-20",
        description: "Your parcel has been registered."
      }
    ]
  },
  {
    id: "PP2026008004",
    trackingNumber: "PP2026008004",
    recipient: "Adam Hakim",
    customerName: "Adam Hakim",
    customerId: 7,
    customerEmail: "adam.hakim@email.com",
    phone: "014-567 8901",
    address: "Kuantan, Pahang",
    type: "Medium package",
    date: "2026-11-21",
    status: "In Transit",
    courier: "Mohd Rizal",
    created: "2026-11-17",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 2,
    shippingFee: 15,
    finalPrice: 15,
    price: 15,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-17",
        description: "Your parcel has been registered."
      },
      {
        status: "In Transit",
        date: "2026-11-21",
        description: "Your parcel is currently in transit."
      }
    ]
  },
  {
    id: "PP2026008005",
    trackingNumber: "PP2026008005",
    recipient: "Nurul Huda",
    customerName: "Nurul Huda",
    customerId: 8,
    customerEmail: "nurul.huda@email.com",
    phone: "016-234 5678",
    address: "Johor Bahru, Johor",
    type: "Large package",
    date: "2026-11-21",
    status: "Pending",
    courier: "Not assigned",
    created: "2026-11-21",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 3,
    shippingFee: 25,
    finalPrice: 25,
    price: 25,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-21",
        description: "Your parcel has been registered."
      }
    ]
  },
  {
    id: "PP2026008006",
    trackingNumber: "PP2026008006",
    recipient: "Jason Lee",
    customerName: "Jason Lee",
    customerId: 9,
    customerEmail: "jason.lee@email.com",
    phone: "017-345 6789",
    address: "George Town, Penang",
    type: "Small package",
    date: "2026-11-22",
    status: "In Transit",
    courier: "Kumar Raj",
    created: "2026-11-19",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 1,
    shippingFee: 10,
    finalPrice: 10,
    price: 10,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-19",
        description: "Your parcel has been registered."
      },
      {
        status: "In Transit",
        date: "2026-11-22",
        description: "Your parcel is currently in transit."
      }
    ]
  },
  {
    id: "PP2026008007",
    trackingNumber: "PP2026008007",
    recipient: "Farah Nadia",
    customerName: "Farah Nadia",
    customerId: 10,
    customerEmail: "farah.nadia@email.com",
    phone: "018-456 7890",
    address: "Ipoh, Perak",
    type: "Document",
    date: "2026-11-22",
    status: "Pending",
    courier: "Not assigned",
    created: "2026-11-22",
    shippingType: "Domestic",
    destinationCountry: "Malaysia",
    weight: 1,
    shippingFee: 6,
    finalPrice: 6,
    price: 6,
    paymentStatus: "Paid",
    proofPhoto: "",
    history: [
      {
        status: "Pending",
        date: "2026-11-22",
        description: "Your parcel has been registered."
      }
    ]
  }
];


  // =======================================================
  // 3. STORAGE HELPERS
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

  function initialiseStorage() {
    if (localStorage.getItem(STORAGE.customers) === null) {
      save(STORAGE.customers, seedCustomers);
    }

    if (localStorage.getItem(STORAGE.parcels) === null) {
      save(STORAGE.parcels, seedParcels);
    }

    if (localStorage.getItem(STORAGE.users) === null) {
      save(STORAGE.users, [{
        id: "admin-default",
        name: "Admin User",
        email: "admin@parcelpro.com",
        password: "admin123",
        role: "admin"
      }]);
    }
  }

  initialiseStorage();

  // =======================================================
  // 4. SHARED DATA
  // =======================================================

  let parcels = readList(STORAGE.parcels);
  let customers = readList(STORAGE.customers);
  let users = readList(STORAGE.users);
  let currentUser = read(STORAGE.session, null);

  // =======================================================
  // 5. GENERAL HELPERS
  // =======================================================

  const $ = selector => document.querySelector(selector);

  const $$ = selector => [
    ...document.querySelectorAll(selector)
  ];

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

  function money(value) {
    const amount = Number(value);
    return "RM " + (Number.isFinite(amount) ? amount : 0).toFixed(2);
  }

  function getParcelFee(parcel = {}) {
    const value =
      parcel.finalPrice ??
      parcel.shippingFee ??
      parcel.price ??
      0;

    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }

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

  // Standard status values used across admin pages.
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

    if (value === "Cancelled" || value === "Failed") {
      return "status-cancelled";
    }

    return "status-pending";
  }

  function getShippingType(parcel = {}) {
    return parcel.shippingType || "Domestic";
  }

  function getDestination(parcel = {}) {
    return (
      parcel.destinationCountry ||
      parcel.destination ||
      "Malaysia"
    );
  }

  // =======================================================
  // 6. CUSTOMER HELPERS
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
    return (
      parcel.receiverName ||
      parcel.recipient ||
      "—"
    );
  }

  function getCustomerParcels(customer = {}) {
    return parcels.filter(parcel =>
      String(parcel.customerId) === String(customer.id) ||
      (
        customer.email &&
        normalizeEmail(parcel.customerEmail) ===
        normalizeEmail(customer.email)
      )
    );
  }

  function linkOldParcelsToCustomers() {
    let changed = false;

    parcels = parcels.map(parcel => {
      let customer = getCustomerForParcel(parcel);

      if (!customer) {
        const recipient = String(
          parcel.customerName || parcel.senderName || parcel.recipient || ""
        ).trim().toLowerCase();

        customer = customers.find(item =>
          String(item.name || "").trim().toLowerCase() === recipient
        );
      }

      if (!customer) return parcel;

      const updated = {
        ...parcel,
        customerId: parcel.customerId || customer.id,
        customerEmail: parcel.customerEmail || customer.email || "",
        customerName: parcel.customerName || customer.name || ""
      };

      if (!updated.senderName) updated.senderName = customer.name || "";
      if (!updated.senderPhone) updated.senderPhone = customer.phone || "";
      if (!updated.senderAddress) {
        updated.senderAddress = customer.location || customer.address || "";
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
  // 7. DATA REFRESH + EVENT SYSTEM
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

    // Dashboard listens on document; other pages listen on window.
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
  // 8. TOAST + ALERT
  // =======================================================

  function toast(message) {
    const toastElement = $("#appToast");

    if (!toastElement || !window.bootstrap) {
      alert(message);
      return;
    }

    const messageElement = $("#toastMessage");
    if (messageElement) messageElement.textContent = message;

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
  // 9. USER INTERFACE
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
    if (welcomeName) welcomeName.textContent = name.split(" ")[0];

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
  // 10. NAVIGATION
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

    if (currentFile !== target) location.href = target;
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
  // 11. AUTHENTICATION
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
      normalizeEmail(user.email) === normalizeEmail(currentUser.email) &&
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
          normalizeEmail(user.email) === normalizeEmail(currentUser.email)
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
        showAlert("#registerAlert", "An account with this email already exists.");
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
  // 12. DATE + LANGUAGE
  // =======================================================

  function initialiseDate() {
    const dateElement = $("#currentDate");

    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }

  function initialiseLanguage() {
    const select = $("#adminLanguageSelect");
    const savedLanguage = localStorage.getItem(STORAGE.language) || "en";

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
  // 13. CUSTOMER DROPDOWN
  // =======================================================

  function populateParcelCustomers(selectedId = "") {
    const select = $("#parcelRecipient");
    if (!select) return;

    select.innerHTML = '<option value="">Select customer</option>';

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
  // 14. CROSS-TAB STORAGE UPDATES
  // =======================================================

  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE.customers ||
      event.key === STORAGE.parcels ||
      event.key === STORAGE.users ||
      event.key === STORAGE.payments ||
      event.key === null
    ) {
      refreshData();

      const changedKey = event.key || STORAGE.parcels;

      dispatchDataUpdated(changedKey);
      updateUserUI();
      populateParcelCustomers();
    }
  });

  // =======================================================
  // 15. INITIALISE
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
  // 16. PUBLIC API
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }

})();
