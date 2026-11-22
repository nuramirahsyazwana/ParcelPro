/* =========================================================
   PARCELPRO - USER.JS
   CUSTOMER PORTAL + ADMIN PORTAL INTEGRATION

   Features:
   - Customer Registration and Login
   - Domestic and International Shipment
   - Shipping Fee Calculation
   - Demo Payment
   - Payment Receipt
   - Customer Dashboard
   - Customer and Admin Data Synchronisation

   Tracking Number:
   PP1001 until PP2000

   Storage: localStorage
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. ELEMENT HELPER
  // =======================================================

  const $ = id => document.getElementById(id);

  const requiredElements = [
    "userLoginForm", "userRegisterForm",
    "loginTab", "registerTab", "userMessage",
    "userEmail", "userPassword",
    "newUserName", "newUserEmail", "newUserPhone",
    "newUserLocation", "newUserPassword", "confirmUserPassword",
    "authView", "customerDashboard", "customerLogout",

    "shipmentForm", "senderName", "senderPhone", "senderAddress",
    "receiverName", "receiverPhone", "receiverAddress",
    "shipmentType", "shipmentWeight", "shipmentDescription",
    "shipmentDate", "shipmentFee", "shipmentFeeNote",

    "domesticOption", "internationalOption",
    "destinationGroup", "destinationCountry",

    "summaryTotal", "summaryPending", "summaryPayments",
    "summaryDomestic", "summaryInternational",

    "profileCustomerName", "profileCustomerEmail",
    "profileCustomerPhone", "profileCustomerLocation",

    "customerParcelsBody", "paymentHistoryBody",

    "paymentForm", "paymentModal", "paymentAmount",
    "paymentParcelSummary", "closePaymentModal",

    "receiptModal", "receiptContent", "printReceiptBtn",
    "closeReceiptModal", "doneReceiptBtn",

    "weight", "pack", "estimateShippingType",
    "estimateDestinationGroup", "estimateDestination",
    "estimateBtn", "estimateResult"
  ];

  const missingElements = requiredElements.filter(id => !$(id));

  if (missingElements.length > 0) {
    console.error(
      "ParcelPro: Missing HTML elements:",
      missingElements
    );

    return;
  }

  // =======================================================
  // 2. STORAGE KEYS
  // =======================================================

  const KEYS = {
    users: "parcelpro_users",
    customers: "parcelpro_customers",
    parcels: "parcelpro_parcels",
    payments: "parcelpro_payments",

    // Customer session is separate from Admin session.
    session: "parcelpro_customer_session",

    // Previous Customer Portal session key.
    legacySession: "parcelpro_user_session"
  };

  let currentCustomer = null;
  let pendingShipment = null;
  let currentReceipt = null;

  // =======================================================
  // 3. SHIPPING RATES
  // =======================================================

  const BASE_RATES = {
    Malaysia: 6,
    Singapore: 22,
    Brunei: 24,
    Indonesia: 28,
    Thailand: 30
  };

  const PACKAGE_FEES = {
    "Document": 0,
    "Small package": 4,
    "Medium package": 9,
    "Large package": 16
  };

  const DOMESTIC_EXTRA_WEIGHT = 2.5;
  const INTERNATIONAL_EXTRA_WEIGHT = 7;

  // =======================================================
  // 4. STORAGE FUNCTIONS
  // =======================================================

  function read(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);

    } catch (error) {
      console.error(
        `ParcelPro: Unable to read ${key}:`,
        error
      );

      return fallback;
    }
  }

  function readList(key) {
    const data = read(key, []);

    return Array.isArray(data) ? data : [];
  }

  function save(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {
      console.error(
        `ParcelPro: Unable to save ${key}:`,
        error
      );

      return false;
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;

    } catch (error) {
      console.error(
        `ParcelPro: Unable to remove ${key}:`,
        error
      );

      return false;
    }
  }

  // =======================================================
  // 5. GENERAL HELPERS
  // =======================================================

  function normalizeEmail(email) {
    return String(email || "")
      .trim()
      .toLowerCase();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
    );
  }

  function money(amount) {
    return "RM " + Number(amount || 0).toFixed(2);
  }

  function dateToday() {
    const now = new Date();

    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-MY");
  }

  function generateCustomerId() {
    return "CUS-" + Date.now();
  }

  // =======================================================
  // 6. CUSTOMER MESSAGE
  // =======================================================

  function showMessage(message, isError = false) {
    const box = $("userMessage");

    box.textContent = message;

    box.classList.toggle("error", isError);

    box.style.display = "block";
  }

  function hideMessage() {
    const box = $("userMessage");

    box.style.display = "none";
    box.textContent = "";

    box.classList.remove("error");
  }

  // =======================================================
  // 7. CUSTOMER DATA SYNCHRONISATION
  // =======================================================

  /*
    This function keeps customer information in:
    parcelpro_customers

    It does not overwrite unrelated customer fields.
  */

  function syncCustomer(user) {
    if (!user || !user.email) {
      console.error("ParcelPro: Invalid customer information.");
      return null;
    }

    const customers = readList(KEYS.customers);

    const email = normalizeEmail(user.email);

    let customer = customers.find(item =>
      normalizeEmail(item.email) === email
    );

    const now = new Date().toISOString();

    if (customer) {
      customer.id = customer.id || user.id || generateCustomerId();

      customer.name = user.name || customer.name || "";
      customer.email = email;

      customer.phone = user.phone || customer.phone || "";

      customer.location =
        user.location || customer.location || "";

      customer.role = "customer";

      customer.status = customer.status || "Active";

      customer.updatedAt = now;

    } else {
      customer = {
        id: user.id || generateCustomerId(),

        name: user.name || "",
        email,

        phone: user.phone || "",
        location: user.location || "",

        role: "customer",
        status: "Active",

        createdAt: user.createdAt || now,
        updatedAt: now
      };

      customers.push(customer);
    }

    if (!save(KEYS.customers, customers)) {
      console.error("ParcelPro: Customer synchronisation failed.");
      return null;
    }

    return customer;
  }

  // =======================================================
  // 8. LOGIN AND REGISTER TABS
  // =======================================================

  function showLoginTab() {
    $("userLoginForm").style.display = "grid";
    $("userRegisterForm").style.display = "none";

    $("loginTab").classList.add("active");
    $("registerTab").classList.remove("active");

    hideMessage();
  }

  function showRegisterTab() {
    $("userLoginForm").style.display = "none";
    $("userRegisterForm").style.display = "grid";

    $("registerTab").classList.add("active");
    $("loginTab").classList.remove("active");

    hideMessage();
  }

  $("loginTab").addEventListener(
    "click",
    showLoginTab
  );

  $("registerTab").addEventListener(
    "click",
    showRegisterTab
  );

  // =======================================================
  // 9. CUSTOMER REGISTRATION
  // =======================================================

  $("userRegisterForm").addEventListener(
    "submit",
    event => {
      event.preventDefault();

      hideMessage();

      try {
        const name = $("newUserName").value.trim();

        const email = normalizeEmail(
          $("newUserEmail").value
        );

        const phone = $("newUserPhone").value.trim();

        const location = $("newUserLocation").value.trim();

        const password = $("newUserPassword").value;

        const confirmPassword =
          $("confirmUserPassword").value;

        // -----------------------------------------------
        // VALIDATION
        // -----------------------------------------------

        if (
          !name ||
          !email ||
          !phone ||
          !location ||
          !password ||
          !confirmPassword
        ) {
          showMessage(
            "Please complete all required fields.",
            true
          );

          return;
        }

        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
          showMessage(
            "Please enter a valid email address.",
            true
          );

          return;
        }

        if (password.length < 6) {
          showMessage(
            "Password must contain at least 6 characters.",
            true
          );

          return;
        }

        if (password !== confirmPassword) {
          showMessage(
            "Password and confirm password do not match.",
            true
          );

          return;
        }

        // -----------------------------------------------
        // CHECK EXISTING ACCOUNT
        // -----------------------------------------------

        const users = readList(KEYS.users);

        const existingUser = users.find(user =>
          normalizeEmail(user.email) === email
        );

        if (existingUser) {
          showMessage(
            "This email is already registered. Please log in.",
            true
          );

          return;
        }

        // -----------------------------------------------
        // CREATE CUSTOMER ACCOUNT
        // -----------------------------------------------

        const now = new Date().toISOString();

        const newUser = {
          id: Date.now(),

          name,
          email,
          phone,
          location,

          password,

          role: "customer",

          createdAt: now,
          updatedAt: now
        };

        const updatedUsers = [
          ...users,
          newUser
        ];

        if (!save(KEYS.users, updatedUsers)) {
          showMessage(
            "Unable to save your account. Please check browser storage.",
            true
          );

          return;
        }

        // -----------------------------------------------
        // CREATE CUSTOMER PROFILE
        // -----------------------------------------------

        const customer = syncCustomer(newUser);

        if (!customer) {
          // Roll back the account if profile creation fails.
          save(KEYS.users, users);

          showMessage(
            "Unable to synchronise customer information. Please try again.",
            true
          );

          return;
        }

        // -----------------------------------------------
        // COMPLETE REGISTRATION
        // -----------------------------------------------

        $("userRegisterForm").reset();

        $("userEmail").value = email;

        showLoginTab();

        showMessage(
          "Account created successfully! You can now log in."
        );

      } catch (error) {
        console.error(
          "ParcelPro registration error:",
          error
        );

        showMessage(
          "An error occurred while creating your account.",
          true
        );
      }
    }
  );

  // =======================================================
  // 10. CUSTOMER SESSION
  // =======================================================

  function saveCustomerSession(customer) {
    const session = {
      id: customer.id,
      customerId: customer.id,

      name: customer.name,
      email: normalizeEmail(customer.email),

      phone: customer.phone || "",
      location: customer.location || "",

      role: "customer",
      loginAt: new Date().toISOString()
    };

    return save(KEYS.session, session);
  }

  function clearCustomerSession() {
    removeStorage(KEYS.session);
    removeStorage(KEYS.legacySession);
  }

  // =======================================================
  // 11. OPEN CUSTOMER DASHBOARD
  // =======================================================

  function openDashboard(user) {
    if (!user || !user.email) {
      alert("Unable to open customer dashboard.");
      return;
    }

    if (user.role === "admin") {
      alert("Please use the Admin Login page.");
      return;
    }

    user.role = "customer";

    const customer = syncCustomer(user);

    if (!customer) {
      alert("Unable to load customer profile.");
      return;
    }

    currentCustomer = {
      id: customer.id,

      name: customer.name,
      email: normalizeEmail(customer.email),

      phone: customer.phone || "",
      location: customer.location || ""
    };

    if (!saveCustomerSession(currentCustomer)) {
      alert(
        "Unable to save login session. Please check browser storage."
      );

      currentCustomer = null;
      return;
    }

    $("authView").style.display = "none";

    $("customerDashboard").style.display = "block";

    // Fill sender information automatically.
    $("senderName").value = currentCustomer.name;

    $("senderPhone").value = currentCustomer.phone;

    $("senderAddress").value = currentCustomer.location;

    $("shipmentDate").min = dateToday();

    updateDestinationVisibility();
    updateShipmentFee();

    renderDashboard();
  }

  // =======================================================
  // 12. CUSTOMER LOGIN
  // =======================================================

  $("userLoginForm").addEventListener(
    "submit",
    event => {
      event.preventDefault();

      hideMessage();

      const email = normalizeEmail(
        $("userEmail").value
      );

      const password = $("userPassword").value;

      const users = readList(KEYS.users);

      const user = users.find(item =>
        normalizeEmail(item.email) === email &&
        item.password === password
      );

      if (!user) {
        showMessage(
          "Incorrect email or password.",
          true
        );

        return;
      }

      if (user.role === "admin") {
        showMessage(
          "Please use the Admin Login page.",
          true
        );

        return;
      }

      // Customer accounts must have an explicit role.
      user.role = "customer";
      user.updatedAt = new Date().toISOString();

      if (!save(KEYS.users, users)) {
        showMessage(
          "Unable to update account information.",
          true
        );

        return;
      }

      openDashboard(user);
    }
  );

  // =======================================================
  // 13. GET CUSTOMER PARCELS
  // =======================================================

  function getMyParcels() {
    if (!currentCustomer) {
      return [];
    }

    return readList(KEYS.parcels).filter(parcel => {
      const sameEmail =
        normalizeEmail(parcel.customerEmail) ===
        currentCustomer.email;

      const sameCustomer =
        String(parcel.customerId || "") ===
        String(currentCustomer.id || "");

      return sameEmail || sameCustomer;
    });
  }

  // =======================================================
  // 14. GET CUSTOMER PAYMENTS
  // =======================================================

  function getMyPayments() {
    if (!currentCustomer) {
      return [];
    }

    return readList(KEYS.payments).filter(payment => {
      const sameEmail =
        normalizeEmail(payment.customerEmail) ===
        currentCustomer.email;

      const sameCustomer =
        String(payment.customerId || "") ===
        String(currentCustomer.id || "");

      return sameEmail || sameCustomer;
    });
  }

  // =======================================================
  // 15. DASHBOARD SUMMARY
  // =======================================================

  function renderDashboard() {
    if (!currentCustomer) {
      return;
    }

    $("dashboardName").textContent =
      currentCustomer.name.split(" ")[0];

    $("profileCustomerName").textContent =
      currentCustomer.name;

    $("profileCustomerEmail").textContent =
      currentCustomer.email;

    $("profileCustomerPhone").textContent =
      currentCustomer.phone || "-";

    $("profileCustomerLocation").textContent =
      currentCustomer.location || "-";

    const parcels = getMyParcels();

    const payments = getMyPayments();

    $("summaryTotal").textContent =
      parcels.length;

    $("summaryPending").textContent =
      parcels.filter(parcel =>
        String(parcel.status || "").toLowerCase() === "pending"
      ).length;

    $("summaryPayments").textContent =
      payments.filter(payment =>
        String(payment.status || "").toLowerCase() === "paid"
      ).length;

    $("summaryDomestic").textContent =
      parcels.filter(parcel =>
        (parcel.shippingType || "Domestic") === "Domestic"
      ).length;

    $("summaryInternational").textContent =
      parcels.filter(parcel =>
        parcel.shippingType === "International"
      ).length;

    renderParcels(parcels);

    renderPayments(payments);
  }

  // =======================================================
  // 16. DISPLAY CUSTOMER PARCELS
  // =======================================================

  function renderParcels(parcels) {
    const tbody = $("customerParcelsBody");

    if (!parcels.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-row">
            No shipment records available.
            Register your first parcel above.
          </td>
        </tr>
      `;

      return;
    }

    tbody.innerHTML = [...parcels]
      .reverse()
      .map(parcel => {
        const shippingType =
          parcel.shippingType || "Domestic";

        const destination =
          parcel.destinationCountry ||
          parcel.destination ||
          "Malaysia";

        const status =
          parcel.status || "Pending";

        const paymentStatus =
          parcel.paymentStatus || "Pending";

        const trackingNumber =
          parcel.trackingNumber ||
          parcel.id ||
          "-";

        const statusClass =
          String(status).toLowerCase() === "delivered"
            ? "delivered"
            : "";

        const paymentClass =
          String(paymentStatus).toLowerCase() === "paid"
            ? "paid"
            : "failed";

        const fee =
          parcel.shippingFee ??
          parcel.finalPrice ??
          parcel.price ??
          0;

        return `
          <tr>
            <td>
              <strong>${escapeHTML(trackingNumber)}</strong>
            </td>

            <td>${escapeHTML(shippingType)}</td>

            <td>${escapeHTML(destination)}</td>

            <td>
              ${escapeHTML(
                parcel.receiverName ||
                parcel.recipient ||
                "-"
              )}
            </td>

            <td>${escapeHTML(parcel.type || "-")}</td>

            <td>${escapeHTML(formatDate(parcel.date))}</td>

            <td><strong>${money(fee)}</strong></td>

            <td>
              <span class="status-badge ${statusClass}">
                ${escapeHTML(status)}
              </span>
            </td>

            <td>
              <span class="status-badge ${paymentClass}">
                ${escapeHTML(paymentStatus)}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // =======================================================
  // 17. DISPLAY PAYMENT HISTORY
  // =======================================================

  function renderPayments(payments) {
    const tbody = $("paymentHistoryBody");

    if (!payments.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-row">
            No payment records available.
          </td>
        </tr>
      `;

      return;
    }

    tbody.innerHTML = [...payments]
      .reverse()
      .map(payment => {
        const paymentStatus =
          payment.status || "Pending";

        const statusClass =
          String(paymentStatus).toLowerCase() === "paid"
            ? "paid"
            : "failed";

        return `
          <tr>
            <td>
              <strong>
                ${escapeHTML(payment.receiptNo || "-")}
              </strong>
            </td>

            <td>
              ${escapeHTML(
                payment.trackingId ||
                payment.trackingNumber ||
                "-"
              )}
            </td>

            <td>${escapeHTML(payment.method || "-")}</td>

            <td><strong>${money(payment.amount)}</strong></td>

            <td>
              ${escapeHTML(formatDateTime(payment.date))}
            </td>

            <td>
              <span class="status-badge ${statusClass}">
                ${escapeHTML(paymentStatus)}
              </span>
            </td>

            <td>
              <button
                class="table-action"
                type="button"
                data-receipt="${escapeHTML(payment.receiptNo || "")}"
              >
                <i class="bi bi-receipt"></i>
                View
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // =======================================================
  // 18. VIEW PAYMENT RECEIPT
  // =======================================================

  $("paymentHistoryBody").addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-receipt]");

      if (!button) {
        return;
      }

      const receiptNo = button.dataset.receipt;

      const payment = getMyPayments().find(item =>
        item.receiptNo === receiptNo
      );

      if (payment) {
        showReceipt(payment);
      }
    }
  );

  // =======================================================
  // 19. SHIPPING TYPE AND DESTINATION
  // =======================================================

  function getShippingType() {
    return $("internationalOption").checked
      ? "International"
      : "Domestic";
  }

  function getDestination() {
    return getShippingType() === "Domestic"
      ? "Malaysia"
      : $("destinationCountry").value;
  }

  function updateDestinationVisibility() {
    const international =
      getShippingType() === "International";

    $("destinationGroup").classList.toggle(
      "hidden",
      !international
    );

    $("destinationCountry").disabled =
      !international;

    $("destinationCountry").required =
      international;

    updateShipmentFee();
  }

  $("domesticOption").addEventListener(
    "change",
    updateDestinationVisibility
  );

  $("internationalOption").addEventListener(
    "change",
    updateDestinationVisibility
  );

  $("destinationCountry").addEventListener(
    "change",
    updateShipmentFee
  );

  // =======================================================
  // 20. SHIPPING FEE CALCULATION
  // =======================================================

  function calculateFee(
    type,
    weight,
    shippingType,
    destination
  ) {
    const selectedDestination =
      shippingType === "Domestic"
        ? "Malaysia"
        : destination;

    const baseRate =
      BASE_RATES[selectedDestination];

    if (baseRate === undefined) {
      return 0;
    }

    const packageFee =
      PACKAGE_FEES[type] ?? 4;

    const parcelWeight = Number(weight);

    if (
      !Number.isFinite(parcelWeight) ||
      parcelWeight <= 0
    ) {
      return 0;
    }

    const extraWeight = Math.max(
      0,
      parcelWeight - 1
    );

    const weightRate =
      shippingType === "International"
        ? INTERNATIONAL_EXTRA_WEIGHT
        : DOMESTIC_EXTRA_WEIGHT;

    const total =
      baseRate +
      packageFee +
      extraWeight * weightRate;

    return Number(total.toFixed(2));
  }

  function updateShipmentFee() {
    const type = $("shipmentType").value;

    const weight =
      Number($("shipmentWeight").value);

    const shippingType =
      getShippingType();

    const destination =
      getDestination();

    const fee = calculateFee(
      type,
      weight,
      shippingType,
      destination
    );

    $("shipmentFee").textContent =
      money(fee);

    $("shipmentFeeNote").textContent =
      `${shippingType} · ${destination} · ${weight || 0} kg · Demo rate`;

    return fee;
  }

  $("shipmentType").addEventListener(
    "change",
    updateShipmentFee
  );

  $("shipmentWeight").addEventListener(
    "input",
    updateShipmentFee
  );

  // =======================================================
  // 21. CREATE SHIPMENT AND OPEN PAYMENT MODAL
  // =======================================================

  $("shipmentForm").addEventListener(
    "submit",
    event => {
      event.preventDefault();

      if (!currentCustomer) {
        alert("Please log in first.");
        return;
      }

      const expectedDate =
        $("shipmentDate").value;

      if (
        !expectedDate ||
        expectedDate < dateToday()
      ) {
        alert("Please select a valid shipping date.");
        return;
      }

      const shippingType =
        getShippingType();

      const destinationCountry =
        getDestination();

      if (
        shippingType === "International" &&
        !destinationCountry
      ) {
        alert("Please select a destination country.");
        return;
      }

      const weight =
        Number($("shipmentWeight").value);

      if (!Number.isFinite(weight) || weight <= 0) {
        alert("Please enter a valid parcel weight.");
        return;
      }

      const fee = updateShipmentFee();

      pendingShipment = {
        shippingType,
        destinationCountry,

        senderName:
          $("senderName").value.trim(),

        senderPhone:
          $("senderPhone").value.trim(),

        senderAddress:
          $("senderAddress").value.trim(),

        receiverName:
          $("receiverName").value.trim(),

        receiverPhone:
          $("receiverPhone").value.trim(),

        receiverAddress:
          $("receiverAddress").value.trim(),

        type:
          $("shipmentType").value,

        weight,

        description:
          $("shipmentDescription").value.trim(),

        date: expectedDate,

        shippingFee: fee
      };

      const requiredFields = [
        pendingShipment.senderName,
        pendingShipment.senderPhone,
        pendingShipment.senderAddress,
        pendingShipment.receiverName,
        pendingShipment.receiverPhone,
        pendingShipment.receiverAddress
      ];

      if (
        requiredFields.some(value => !value)
      ) {
        pendingShipment = null;

        alert(
          "Please complete all required shipment details."
        );

        return;
      }

      $("paymentAmount").textContent =
        money(fee);

      $("paymentParcelSummary").textContent =
        `${shippingType} · ${destinationCountry} · ` +
        `${pendingShipment.type} · ${pendingShipment.weight} kg · ` +
        `Receiver: ${pendingShipment.receiverName}`;

      $("paymentForm").reset();

      $("paymentModal").classList.add("show");
    }
  );

  // =======================================================
  // 22. GENERATE TRACKING NUMBER
  // Format: PP1001 until PP2000
  // Shared with Admin Portal through localStorage
  // =======================================================

  function generateTrackingId() {
    const parcels = readList(KEYS.parcels);

    let highestNumber = 1000;

    parcels.forEach(parcel => {
      const trackingNumbers = [
        parcel.trackingNumber,
        parcel.id
      ];

      trackingNumbers.forEach(value => {
        const match = String(value || "")
          .trim()
          .match(/^PP(\d{4})$/);

        if (match) {
          const number = Number(match[1]);

          if (number >= 1001 && number <= 2000) {
            highestNumber = Math.max(
              highestNumber,
              number
            );
          }
        }
      });
    });

    const nextNumber = highestNumber + 1;

    // Stop when the tracking number limit is reached.
    if (nextNumber > 2000) {
      return null;
    }

    const trackingId =
      "PP" + String(nextNumber).padStart(4, "0");

    // Double-check that the tracking number is not already used.
    const exists = parcels.some(parcel =>
      String(parcel.id || "").trim() === trackingId ||
      String(parcel.trackingNumber || "").trim() === trackingId
    );

    if (exists) {
      return null;
    }

    return trackingId;
  }

  // =======================================================
  // 23. GENERATE RECEIPT NUMBER
  // =======================================================

  function generateReceiptNo() {
    return (
      "PPR-" +
      Date.now().toString().slice(-10)
    );
  }

  // =======================================================
  // 24. DEMO PAYMENT
  // =======================================================

  $("paymentForm").addEventListener(
    "submit",
    event => {
      event.preventDefault();

      if (!pendingShipment || !currentCustomer) {
        alert(
          "Shipment information is missing. Please register your shipment again."
        );

        return;
      }

      const method = document.querySelector(
        'input[name="paymentMethod"]:checked'
      )?.value;

      if (!method) {
        alert("Please select a payment method.");
        return;
      }

      // -----------------------------------------------
      // SYNCHRONISE CUSTOMER PROFILE
      // -----------------------------------------------

      const customer = syncCustomer({
        id: currentCustomer.id,

        name: currentCustomer.name,
        email: currentCustomer.email,

        phone: currentCustomer.phone,
        location: currentCustomer.location
      });

      if (!customer) {
        alert(
          "Unable to synchronise customer information."
        );

        return;
      }

      // -----------------------------------------------
      // GENERATE TRACKING NUMBER
      // -----------------------------------------------

      const trackingId = generateTrackingId();

      if (!trackingId) {
        alert(
          "Tracking number limit reached. ParcelPro supports tracking numbers from PP1001 until PP2000."
        );

        return;
      }

      // -----------------------------------------------
      // GENERATE RECEIPT NUMBER
      // -----------------------------------------------

      const receiptNo =
        generateReceiptNo();

      const paidAt =
        new Date().toISOString();

      const fee =
        Number(pendingShipment.shippingFee);

      // -----------------------------------------------
      // PARCEL RECORD
      // Compatible with Admin Portal
      // -----------------------------------------------

      const parcel = {
        // Main parcel identifiers
        id: trackingId,
        trackingNumber: trackingId,

        // Customer information
        customerId: customer.id,
        customerEmail: currentCustomer.email,
        customerName: currentCustomer.name,

        // Admin Portal recipient fields
        recipient: pendingShipment.receiverName,
        phone: pendingShipment.receiverPhone,
        address: pendingShipment.receiverAddress,

        // Receiver information
        receiverName: pendingShipment.receiverName,
        receiverPhone: pendingShipment.receiverPhone,
        receiverAddress: pendingShipment.receiverAddress,

        // Sender information
        senderName: pendingShipment.senderName,
        senderPhone: pendingShipment.senderPhone,
        senderAddress: pendingShipment.senderAddress,

        // Parcel information
        type: pendingShipment.type,
        weight: pendingShipment.weight,
        description: pendingShipment.description,

        // Shipping information
        shippingType: pendingShipment.shippingType,
        destinationCountry: pendingShipment.destinationCountry,
        destination: pendingShipment.destinationCountry,

        // Date information
        date: pendingShipment.date,
        created: dateToday(),
        createdAt: paidAt,

        // Delivery information
        status: "Pending",
        courier: "Not assigned",
        proofPhoto: "",

        // Price fields used by Admin Portal
        shippingFee: fee,
        finalPrice: fee,
        price: fee,

        // Payment information
        paymentStatus: "Paid",
        paid: true,
        paymentReceipt: receiptNo,
        receiptNo: receiptNo,
        paymentMethod: method,
        paidAt: paidAt,

        // Parcel tracking history
        history: [
          {
            status: "Pending",
            date: paidAt,
            timestamp: paidAt,
            note: "Parcel registered by customer."
          }
        ]
      };

      // -----------------------------------------------
      // PAYMENT RECORD
      // -----------------------------------------------

      const payment = {
        id: receiptNo,
        paymentId: receiptNo,

        receiptNo,

        trackingId,
        trackingNumber: trackingId,
        parcelId: trackingId,

        customerId: customer.id,
        customerEmail: currentCustomer.email,
        customerName: currentCustomer.name,

        shippingType: pendingShipment.shippingType,
        destinationCountry: pendingShipment.destinationCountry,

        method,

        amount: fee,

        status: "Paid",

        date: paidAt,
        createdAt: paidAt
      };

      // -----------------------------------------------
      // READ CURRENT DATA
      // -----------------------------------------------

      const parcels =
        readList(KEYS.parcels);

      const payments =
        readList(KEYS.payments);

      // -----------------------------------------------
      // SAVE PARCEL
      // -----------------------------------------------

      const updatedParcels = [
        ...parcels,
        parcel
      ];

      if (!save(KEYS.parcels, updatedParcels)) {
        alert(
          "Unable to save parcel information. Please try again."
        );

        return;
      }

      // -----------------------------------------------
      // SAVE PAYMENT
      // -----------------------------------------------

      const updatedPayments = [
        ...payments,
        payment
      ];

      if (!save(KEYS.payments, updatedPayments)) {
        // Roll back the parcel if payment cannot be saved.
        const rollbackParcels =
          readList(KEYS.parcels).filter(item =>
            item.id !== trackingId
          );

        save(KEYS.parcels, rollbackParcels);

        alert(
          "Unable to save payment information. Please try again."
        );

        return;
      }

      // -----------------------------------------------
      // COMPLETE PAYMENT
      // -----------------------------------------------

      $("paymentModal").classList.remove("show");

      pendingShipment = null;

      $("shipmentForm").reset();

      $("domesticOption").checked = true;

      $("destinationCountry").value =
        "Singapore";

      // Restore sender information.
      $("senderName").value =
        currentCustomer.name;

      $("senderPhone").value =
        currentCustomer.phone;

      $("senderAddress").value =
        currentCustomer.location;

      $("shipmentDate").min =
        dateToday();

      updateDestinationVisibility();

      updateShipmentFee();

      renderDashboard();

      showReceipt(payment);
    }
  );

  // =======================================================
  // 25. DISPLAY PAYMENT RECEIPT
  // =======================================================

  function showReceipt(payment) {
    currentReceipt = payment;

    $("receiptContent").innerHTML = `
      <div class="receipt-logo">
        <i class="bi bi-box-seam"></i>
        ParcelPro
      </div>

      <p style="text-align:center;color:#15966a;font-weight:800;">
        PAYMENT SUCCESSFUL
      </p>

      <p style="text-align:center;font-size:12px;color:#78889b;">
        PAYMENT RECEIPT
      </p>

      <div class="receipt-row">
        <span>Receipt Number</span>
        <strong>
          ${escapeHTML(payment.receiptNo)}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Tracking ID</span>
        <strong>
          ${escapeHTML(payment.trackingId)}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Customer</span>
        <strong>
          ${escapeHTML(payment.customerName)}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Shipping Type</span>
        <strong>
          ${escapeHTML(payment.shippingType || "Domestic")}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Destination</span>
        <strong>
          ${escapeHTML(payment.destinationCountry || "Malaysia")}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Payment Method</span>
        <strong>
          ${escapeHTML(payment.method)}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Payment Date</span>
        <strong>
          ${escapeHTML(formatDateTime(payment.date))}
        </strong>
      </div>

      <div class="receipt-row">
        <span>Payment Status</span>
        <strong style="color:#15966a;">
          PAID
        </strong>
      </div>

      <div class="receipt-total">
        <span>Total Paid</span>
        <span>${money(payment.amount)}</span>
      </div>

      <p style="text-align:center;color:#78889b;font-size:11px;margin-top:20px;">
        Thank you for choosing ParcelPro.
        <br>
        This is a computer-generated demo receipt.
      </p>
    `;

    $("receiptModal").classList.add("show");
  }

  // =======================================================
  // 26. PRINT RECEIPT
  // =======================================================

  $("printReceiptBtn").addEventListener(
    "click",
    () => {
      if (!currentReceipt) {
        return;
      }

      window.print();
    }
  );

  // =======================================================
  // 27. CLOSE RECEIPT MODAL
  // =======================================================

  function closeReceipt() {
    $("receiptModal").classList.remove("show");
  }

  $("closeReceiptModal").addEventListener(
    "click",
    closeReceipt
  );

  $("doneReceiptBtn").addEventListener(
    "click",
    closeReceipt
  );

  // =======================================================
  // 28. CLOSE PAYMENT MODAL
  // =======================================================

  function closePayment() {
    $("paymentModal").classList.remove("show");

    pendingShipment = null;
  }

  $("closePaymentModal").addEventListener(
    "click",
    closePayment
  );

  // =======================================================
  // 29. MODAL BACKGROUND CLICK
  // =======================================================

  ["paymentModal", "receiptModal"].forEach(id => {
    $(id).addEventListener(
      "click",
      event => {
        if (event.target !== $(id)) {
          return;
        }

        $(id).classList.remove("show");

        if (id === "paymentModal") {
          pendingShipment = null;
        }
      }
    );
  });

  // =======================================================
  // 30. CUSTOMER LOGOUT
  // =======================================================

  $("customerLogout").addEventListener(
    "click",
    () => {
      // Remove only Customer Portal sessions.
      // Do not remove parcelpro_session (Admin session).
      clearCustomerSession();

      currentCustomer = null;
      pendingShipment = null;
      currentReceipt = null;

      $("customerDashboard").style.display = "none";

      $("authView").style.display = "block";

      $("userLoginForm").reset();

      $("userRegisterForm").reset();

      $("shipmentForm").reset();

      $("domesticOption").checked = true;

      $("destinationCountry").value =
        "Singapore";

      $("paymentModal").classList.remove("show");

      $("receiptModal").classList.remove("show");

      showLoginTab();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );

  // =======================================================
  // 31. ESTIMATOR DESTINATION VISIBILITY
  // =======================================================

  function updateEstimatorDestination() {
    const international =
      $("estimateShippingType").value === "International";

    $("estimateDestinationGroup").classList.toggle(
      "hidden",
      !international
    );

    $("estimateDestination").disabled =
      !international;

    $("estimateResult").classList.add("hidden");
  }

  $("estimateShippingType").addEventListener(
    "change",
    updateEstimatorDestination
  );

  $("estimateDestination").addEventListener(
    "change",
    () => {
      $("estimateResult").classList.add("hidden");
    }
  );

  // =======================================================
  // 32. SHIPPING ESTIMATOR
  // =======================================================

  $("estimateBtn").addEventListener(
    "click",
    () => {
      const weight =
        Number($("weight").value);

      const type =
        $("pack").value;

      const shippingType =
        $("estimateShippingType").value;

      const destination =
        shippingType === "Domestic"
          ? "Malaysia"
          : $("estimateDestination").value;

      if (!Number.isFinite(weight) || weight <= 0) {
        alert("Please enter a valid parcel weight.");
        return;
      }

      if (!destination) {
        alert("Please select a destination.");
        return;
      }

      const estimate = calculateFee(
        type,
        weight,
        shippingType,
        destination
      );

      $("estimateResult").innerHTML = `
        <div>
          <strong>Estimated Shipping Fee</strong>
        </div>

        <div style="font-size:24px;margin:7px 0;">
          ${money(estimate)}
        </div>

        <div>
          ${escapeHTML(shippingType)}
          ·
          ${escapeHTML(destination)}
        </div>

        <div>
          ${escapeHTML(type)}
          ·
          ${weight} kg
        </div>

        <div style="font-size:11px;font-weight:500;margin-top:8px;">
          This is a demo estimate. Final charges may vary.
        </div>
      `;

      $("estimateResult").classList.remove("hidden");
    }
  );

  // =======================================================
  // 33. RESTORE CUSTOMER SESSION
  // =======================================================

  function restoreSession() {
    let session = read(KEYS.session, null);

    // Support the previous session key.
    if (!session) {
      session = read(KEYS.legacySession, null);

      if (session) {
        save(KEYS.session, session);
        removeStorage(KEYS.legacySession);
      }
    }

    if (!session || !session.email) {
      return;
    }

    const users = readList(KEYS.users);

    const user = users.find(item =>
      normalizeEmail(item.email) ===
      normalizeEmail(session.email)
    );

    if (user && user.role !== "admin") {
      openDashboard(user);

    } else {
      clearCustomerSession();
    }
  }

  // =======================================================
  // 34. REFRESH DATA WHEN STORAGE CHANGES
  // =======================================================

  window.addEventListener(
    "storage",
    event => {
      const relevantKeys = [
        KEYS.parcels,
        KEYS.payments,
        KEYS.customers,
        KEYS.users
      ];

      if (
        relevantKeys.includes(event.key) &&
        currentCustomer
      ) {
        renderDashboard();
      }
    }
  );

  // Refresh when the customer returns to this page.
  window.addEventListener(
    "focus",
    () => {
      if (currentCustomer) {
        renderDashboard();
      }
    }
  );

  // =======================================================
  // 35. INITIALISE CUSTOMER PORTAL
  // =======================================================

  function initialise() {
    $("shipmentDate").min = dateToday();

    $("domesticOption").checked = true;

    $("destinationCountry").value =
      "Singapore";

    $("estimateShippingType").value =
      "Domestic";

    $("estimateDestination").value =
      "Singapore";

    showLoginTab();

    updateDestinationVisibility();

    updateEstimatorDestination();

    updateShipmentFee();

    restoreSession();

    console.log(
      "ParcelPro Customer Portal initialised successfully."
    );
  }

  initialise();

})();
