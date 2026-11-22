
/* =========================================================
   PARCELPRO - PUBLIC.JS
   Customer Tracking + Language Selector

   FEATURES:
   - Read shared parcelpro_parcels storage
   - Search by Tracking Number / Tracking ID
   - Support tracking up to 5 parcels
   - Display current parcel status
   - Display six-stage customer status progress
   - Display tracking history
   - Merge duplicate Out for Delivery / Out of Delivery
   - Map In Transit to Shipped for customer display
   - Support English, Malay and Chinese
   - Auto-refresh when Admin updates parcel data
   - Support legacy trackingHistory
   - Display delivery proof when available
   - Preserve language selector and mobile navigation

   IMPORTANT:
   - Does not modify Admin status data
   - Uses existing localStorage key
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. CONFIGURATION
  // =======================================================

  const $ = (selector) => document.querySelector(selector);

  const STORAGE_KEY = "parcelpro_parcels";
  const LANGUAGE_KEY = "parcelpro_language";

  const MAX_TRACKING = 5;

  let lastTrackedIds = [];
  let language = "en";

  // =======================================================
  // 2. LANGUAGE TRANSLATIONS
  // =======================================================

  const translations = {
    en: {
      pending: "Pending",
      processing: "Processing",
      pickedUp: "Picked Up",
      shipped: "Shipped",
      outOfDelivery: "Out of Delivery",
      delivered: "Delivered",
      failed: "Failed",
      cancelled: "Cancelled",

      deliveryProgress: "Delivery Progress",
      statusUnavailable: "Status information is unavailable.",

      trackingNotFound: "Tracking number not found.",
      enterTracking: "Please enter a tracking number.",
      maxTracking: "You can track up to 5 parcels at a time.",
      trackingResults: "Tracking Results",
      trackingNumber: "Tracking Number",
      recipient: "Recipient",
      destination: "Destination",
      currentStatus: "Current Status",
      trackingHistory: "Tracking History",
      noHistory: "No tracking history available yet.",
      noResults: "No parcel information available.",
      lastUpdated: "Last Updated",
      deliveryProof: "Delivery Proof",
      viewProof: "View delivery proof",
      unknown: "Unknown",
      parcelNotFound: "Parcel information could not be found."
    },

    ms: {
      pending: "Menunggu",
      processing: "Sedang diproses",
      pickedUp: "Telah diambil",
      shipped: "Telah dihantar",
      outOfDelivery: "Dalam proses penghantaran",
      delivered: "Telah dihantar",
      failed: "Penghantaran gagal",
      cancelled: "Dibatalkan",

      deliveryProgress: "Kemajuan Penghantaran",
      statusUnavailable: "Maklumat status tidak tersedia.",

      trackingNotFound: "Nombor penjejakan tidak dijumpai.",
      enterTracking: "Sila masukkan nombor penjejakan.",
      maxTracking: "Anda hanya boleh menjejak maksimum 5 bungkusan.",
      trackingResults: "Keputusan Penjejakan",
      trackingNumber: "Nombor Penjejakan",
      recipient: "Penerima",
      destination: "Destinasi",
      currentStatus: "Status Semasa",
      trackingHistory: "Sejarah Penjejakan",
      noHistory: "Tiada sejarah penjejakan buat masa ini.",
      noResults: "Maklumat bungkusan tidak tersedia.",
      lastUpdated: "Kemaskini Terakhir",
      deliveryProof: "Bukti Penghantaran",
      viewProof: "Lihat bukti penghantaran",
      unknown: "Tidak diketahui",
      parcelNotFound: "Maklumat bungkusan tidak dapat dijumpai."
    },

    zh: {
      pending: "等待处理",
      processing: "处理中",
      pickedUp: "已取件",
      shipped: "已发货",
      outOfDelivery: "派送中",
      delivered: "已送达",
      failed: "配送失败",
      cancelled: "已取消",

      deliveryProgress: "配送进度",
      statusUnavailable: "暂无状态信息。",

      trackingNotFound: "找不到追踪号码。",
      enterTracking: "请输入追踪号码。",
      maxTracking: "一次最多只能追踪 5 个包裹。",
      trackingResults: "追踪结果",
      trackingNumber: "追踪号码",
      recipient: "收件人",
      destination: "目的地",
      currentStatus: "当前状态",
      trackingHistory: "追踪记录",
      noHistory: "暂无追踪记录。",
      noResults: "暂无包裹信息。",
      lastUpdated: "最后更新",
      deliveryProof: "送货证明",
      viewProof: "查看送货证明",
      unknown: "未知",
      parcelNotFound: "找不到包裹信息。"
    }
  };

  // =======================================================
  // 3. LANGUAGE HELPER
  // =======================================================

  function t(key) {
    return translations[language]?.[key]
      || translations.en[key]
      || key;
  }

  function loadLanguage() {
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

      language = ["en", "ms", "zh"].includes(savedLanguage)
        ? savedLanguage
        : "en";

    } catch (error) {
      language = "en";
    }
  }

  // =======================================================
  // 4. HTML ESCAPE
  // =======================================================

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  // =======================================================
  // 5. READ SHARED PARCEL DATA
  // =======================================================

  function readParcels() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) {
        return [];
      }

      const parcels = JSON.parse(storedData);

      if (!Array.isArray(parcels)) {
        console.warn("ParcelPro: Invalid parcel storage format.");
        return [];
      }

      return parcels;

    } catch (error) {
      console.error("ParcelPro: Unable to read parcel data.", error);
      return [];
    }
  }

  // =======================================================
  // 6. NORMALIZE STATUS
  // =======================================================

  function normalizeStatus(status) {
    const value = String(status ?? "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

    if (!value) {
      return "pending";
    }

    const aliases = {
      "pending": "pending",
      "processing": "processing",
      "picked up": "picked up",

      "shipped": "shipped",
      "in transit": "shipped",

      "out of delivery": "out of delivery",
      "out for delivery": "out of delivery",

      "delivered": "delivered",
      "failed": "failed",
      "cancelled": "cancelled",
      "canceled": "cancelled"
    };

    return aliases[value] || value;
  }

  // =======================================================
  // 7. GET STATUS TRANSLATION KEY
  // =======================================================

  function getStatusKey(status) {
    const normalized = normalizeStatus(status);

    const keys = {
      "pending": "pending",
      "processing": "processing",
      "picked up": "pickedUp",
      "shipped": "shipped",
      "out of delivery": "outOfDelivery",
      "delivered": "delivered",
      "failed": "failed",
      "cancelled": "cancelled"
    };

    return keys[normalized] || null;
  }

  // =======================================================
  // 8. STATUS LABEL
  // =======================================================

  function statusLabel(status) {
    const key = getStatusKey(status);

    return key
      ? t(key)
      : escapeHTML(status || t("pending"));
  }

  // =======================================================
  // 9. STATUS CSS CLASS
  // =======================================================

  function statusClass(status) {
    const normalized = normalizeStatus(status);

    if (normalized === "delivered") {
      return "is-delivered";
    }

    if (
      [
        "processing",
        "picked up",
        "shipped",
        "out of delivery"
      ].includes(normalized)
    ) {
      return "is-transit";
    }

    if (
      [
        "failed",
        "cancelled"
      ].includes(normalized)
    ) {
      return "is-failed";
    }

    return "is-pending";
  }

  // =======================================================
  // 10. TRACKING NUMBER HELPER
  // =======================================================

  function getTrackingId(parcel) {
    return String(
      parcel?.trackingNumber
      || parcel?.trackingNo
      || parcel?.trackingId
      || parcel?.id
      || ""
    ).trim().toUpperCase();
  }

  // =======================================================
  // 11. FIND PARCEL BY TRACKING NUMBER
  // =======================================================

  function findParcelByTrackingId(trackingId) {
    const parcels = readParcels();

    const searchId = String(trackingId || "")
      .trim()
      .toUpperCase();

    return parcels.find((parcel) => {
      return getTrackingId(parcel) === searchId;
    }) || null;
  }

  // =======================================================
  // 12. GET PARCEL HISTORY
  // =======================================================

  function getHistory(parcel) {
    if (!parcel) {
      return [];
    }

    let history = [];

    if (
      Array.isArray(parcel.history)
      && parcel.history.length > 0
    ) {
      history = parcel.history;

    } else if (
      Array.isArray(parcel.trackingHistory)
      && parcel.trackingHistory.length > 0
    ) {
      history = parcel.trackingHistory;
    }

    return history
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        ...entry,
        status: entry.status || entry.title || "Pending",
        date:
          entry.date
          || entry.timestamp
          || entry.updatedAt
          || entry.createdAt
          || "",
        location: entry.location || entry.address || "",
        description:
          entry.description
          || entry.message
          || entry.remarks
          || ""
      }));
  }

  // =======================================================
  // 13. FORMAT DATE
  // =======================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return t("unknown");
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return escapeHTML(dateValue);
    }

    return date.toLocaleString(
      language === "ms"
        ? "ms-MY"
        : language === "zh"
          ? "zh-CN"
          : "en-MY",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  }

  // =======================================================
  // 14. HISTORY ICON
  // =======================================================

  function getHistoryIcon(status) {
    const normalized = normalizeStatus(status);

    const icons = {
      "pending": "bi-clock-history",
      "processing": "bi-box-seam",
      "picked up": "bi-box-arrow-up",
      "shipped": "bi-truck",
      "out of delivery": "bi-bicycle",
      "delivered": "bi-check-circle-fill",
      "failed": "bi-exclamation-circle-fill",
      "cancelled": "bi-x-circle-fill"
    };

    return icons[normalized] || "bi-circle";
  }

  // =======================================================
  // 15. REMOVE CONSECUTIVE DUPLICATE HISTORY STATUS
  // =======================================================

  function removeDuplicateHistory(entries) {
    const uniqueEntries = [];

    entries.forEach((entry) => {
      const currentStatus = normalizeStatus(
        entry.status || "Pending"
      );

      const previousEntry =
        uniqueEntries[uniqueEntries.length - 1];

      const previousStatus = previousEntry
        ? normalizeStatus(previousEntry.status || "Pending")
        : "";

      if (currentStatus === previousStatus) {
        uniqueEntries[uniqueEntries.length - 1] = entry;

      } else {
        uniqueEntries.push(entry);
      }
    });

    return uniqueEntries;
  }

  // =======================================================
  // 16. RENDER TRACKING HISTORY
  // =======================================================

  function renderHistory(parcel) {
    let entries = getHistory(parcel);

    entries = removeDuplicateHistory(entries);

    if (entries.length === 0) {
      entries = [
        {
          status: parcel.status || "Pending",
          date:
            parcel.updatedAt
            || parcel.lastUpdated
            || parcel.createdAt
            || "",
          location: parcel.location || "",
          description: ""
        }
      ];
    }

    return `
      <div class="public-tracking-history">

        <h5 class="tracking-history-title">
          <i class="bi bi-clock-history"></i>
          ${t("trackingHistory")}
        </h5>

        <div class="tracking-timeline">

          ${entries.map((entry, index) => {
            const icon = getHistoryIcon(entry.status);
            const isLatest = index === entries.length - 1;

            return `
              <div class="tracking-timeline-item
                ${isLatest ? "is-latest" : ""}">

                <div class="timeline-icon">
                  <i class="bi ${icon}"></i>
                </div>

                <div class="timeline-content">

                  <div class="timeline-status">
                    ${statusLabel(entry.status)}
                  </div>

                  ${
                    entry.date
                      ? `
                        <div class="timeline-date">
                          ${formatDate(entry.date)}
                        </div>
                      `
                      : ""
                  }

                  ${
                    entry.location
                      ? `
                        <div class="timeline-location">
                          <i class="bi bi-geo-alt"></i>
                          ${escapeHTML(entry.location)}
                        </div>
                      `
                      : ""
                  }

                  ${
                    entry.description
                      ? `
                        <div class="timeline-description">
                          ${escapeHTML(entry.description)}
                        </div>
                      `
                      : ""
                  }

                </div>

              </div>
            `;
          }).join("")}

        </div>
      </div>
    `;
  }

  // =======================================================
  // 17. DELIVERY PROOF
  // =======================================================

  function getDeliveryProof(parcel) {
    return (
      parcel.deliveryProof
      || parcel.proofImage
      || parcel.proofOfDelivery
      || parcel.deliveryPhoto
      || parcel.proof
      || ""
    );
  }

  function renderDeliveryProof(parcel) {
    const proof = getDeliveryProof(parcel);

    if (!proof || typeof proof !== "string") {
      return "";
    }

    const isAllowedImage =
      /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(proof)
      || /^https?:\/\/.+/i.test(proof);

    if (!isAllowedImage) {
      return "";
    }

    return `
      <div class="delivery-proof-section">

        <h5>
          <i class="bi bi-camera"></i>
          ${t("deliveryProof")}
        </h5>

        <a
          href="${escapeHTML(proof)}"
          target="_blank"
          rel="noopener noreferrer">

          <img
            src="${escapeHTML(proof)}"
            alt="${t("deliveryProof")}"
            class="delivery-proof-image"
            loading="lazy">

          <span>
            ${t("viewProof")}
          </span>

        </a>

      </div>
    `;
  }

  // =======================================================
  // 18. PARCEL MAP / LOCATION
  // =======================================================

  function getParcelLocation(parcel) {
    return (
      parcel.currentLocation
      || parcel.location
      || parcel.destination
      || parcel.address
      || ""
    );
  }

  function renderParcelMap(parcel) {
    const location = getParcelLocation(parcel);

    if (!location || typeof location !== "string") {
      return "";
    }

    const mapURL =
      "https://www.google.com/maps/search/?api=1&query="
      + encodeURIComponent(location);

    return `
      <div class="tracking-map-link">

        <a
          href="${mapURL}"
          target="_blank"
          rel="noopener noreferrer">

          <i class="bi bi-geo-alt-fill"></i>
          ${escapeHTML(location)}

          <span>
            <i class="bi bi-box-arrow-up-right"></i>
          </span>

        </a>

      </div>
    `;
  }

  // =======================================================
  // 19. PARCEL INFORMATION
  // =======================================================

  function getRecipient(parcel) {
    return (
      parcel.recipient
      || parcel.recipientName
      || parcel.customerName
      || parcel.name
      || t("unknown")
    );
  }

  function getDestination(parcel) {
    return (
      parcel.destination
      || parcel.deliveryAddress
      || parcel.address
      || t("unknown")
    );
  }

  function getLastUpdated(parcel) {
    return (
      parcel.updatedAt
      || parcel.lastUpdated
      || parcel.modifiedAt
      || parcel.createdAt
      || ""
    );
  }

  // =======================================================
  // 20. CUSTOMER STATUS PROGRESS
  // =======================================================

  function renderStatusProgress(status) {

    const stages = [
      {
        key: "pending",
        status: "pending",
        icon: "bi-receipt"
      },
      {
        key: "processing",
        status: "processing",
        icon: "bi-box-seam"
      },
      {
        key: "pickedUp",
        status: "picked up",
        icon: "bi-box-arrow-up"
      },
      {
        key: "shipped",
        status: "shipped",
        icon: "bi-truck"
      },
      {
        key: "outOfDelivery",
        status: "out of delivery",
        icon: "bi-bicycle"
      },
      {
        key: "delivered",
        status: "delivered",
        icon: "bi-check-circle-fill"
      }
    ];

    const currentStatus = normalizeStatus(status);

    const currentIndex = stages.findIndex((stage) => {
      return stage.status === currentStatus;
    });

    if (["failed", "cancelled"].includes(currentStatus)) {
      return `
        <div class="pp-status-progress-message is-exception">

          <i class="bi bi-exclamation-circle-fill"></i>

          <span>
            ${t("currentStatus")}: ${statusLabel(status)}
          </span>

        </div>
      `;
    }

    if (currentIndex === -1) {
      return `
        <div class="pp-status-progress-message">

          <i class="bi bi-info-circle"></i>

          <span>
            ${t("statusUnavailable")}
            ${statusLabel(status)}
          </span>

        </div>
      `;
    }

    return `
      <div class="pp-status-progress">

        <h5 class="pp-status-progress-title">
          <i class="bi bi-signpost-split"></i>
          ${t("deliveryProgress")}
        </h5>

        <div class="pp-status-steps">

          ${stages.map((stage, index) => {

            let stepClass = "is-upcoming";

            if (index < currentIndex) {
              stepClass = "is-complete";

            } else if (index === currentIndex) {
              stepClass = "is-current";
            }

            return `
              <div class="pp-status-step ${stepClass}">

                <div class="pp-status-step-icon">
                  <i class="bi ${stage.icon}"></i>
                </div>

                <span class="pp-status-step-label">
                  ${t(stage.key)}
                </span>

              </div>
            `;

          }).join("")}

        </div>

      </div>
    `;
  }

  // =======================================================
  // 21. RENDER ONE PARCEL
  // =======================================================

  function renderParcel(parcel) {
    const trackingId = getTrackingId(parcel);
    const status = parcel.status || "Pending";
    const recipient = getRecipient(parcel);
    const destination = getDestination(parcel);
    const lastUpdated = getLastUpdated(parcel);

    return `
      <div class="public-tracking-card">

        <div class="public-tracking-card-header">

          <div>
            <span class="tracking-label">
              ${t("trackingNumber")}
            </span>

            <h4 class="tracking-number">
              ${escapeHTML(trackingId)}
            </h4>
          </div>

          <span class="tracking-status-badge ${statusClass(status)}">
            ${statusLabel(status)}
          </span>

        </div>

        ${renderStatusProgress(status)}

        <div class="public-tracking-details">

          <div class="tracking-detail-item">
            <span>${t("recipient")}</span>
            <strong>${escapeHTML(recipient)}</strong>
          </div>

          <div class="tracking-detail-item">
            <span>${t("destination")}</span>
            <strong>${escapeHTML(destination)}</strong>
          </div>

          <div class="tracking-detail-item">
            <span>${t("currentStatus")}</span>
            <strong>${statusLabel(status)}</strong>
          </div>

          ${
            lastUpdated
              ? `
                <div class="tracking-detail-item">
                  <span>${t("lastUpdated")}</span>
                  <strong>${formatDate(lastUpdated)}</strong>
                </div>
              `
              : ""
          }

        </div>

        ${renderParcelMap(parcel)}

        ${renderHistory(parcel)}

        ${renderDeliveryProof(parcel)}

      </div>
    `;
  }

  // =======================================================
  // 22. RENDER MULTIPLE PARCELS
  // =======================================================

  function renderMultipleParcels(parcels) {
    return `
      <div class="public-tracking-multiple">

        <h4 class="tracking-results-heading">
          ${t("trackingResults")}
          <span>(${parcels.length})</span>
        </h4>

        ${parcels.map((parcel) => renderParcel(parcel)).join("")}

      </div>
    `;
  }

  // =======================================================
  // 23. DISPLAY MESSAGE
  // =======================================================

  function showMessage(message, type = "error") {
    const result = document.getElementById("publicTrackingResult");

    if (!result) {
      console.error("ParcelPro: Tracking result element not found.");
      return;
    }

    result.innerHTML = `
      <div class="tracking-message ${type}">

        <i class="bi ${
          type === "success"
            ? "bi-check-circle"
            : "bi-exclamation-circle"
        }"></i>

        <span>${escapeHTML(message)}</span>

      </div>
    `;
  }

  // =======================================================
  // 24. TRACKING INPUT VALIDATION
  // =======================================================

  function parseTrackingInput(value) {
    return [...new Set(
      String(value || "")
        .split(/[\s,;]+/)
        .map((id) => id.trim().toUpperCase())
        .filter(Boolean)
    )];
  }

  // =======================================================
  // 25. TRACK PARCELS
  // =======================================================

  function trackParcels(trackingIds) {
    const result = document.getElementById("publicTrackingResult");

    if (!result) {
      console.error("ParcelPro: Tracking result element not found.");
      return;
    }

    if (!trackingIds || trackingIds.length === 0) {
      showMessage(t("enterTracking"));
      return;
    }

    if (trackingIds.length > MAX_TRACKING) {
      showMessage(t("maxTracking"));
      return;
    }

    const parcels = readParcels();

    const foundParcels = [];
    const missingIds = [];

    trackingIds.forEach((trackingId) => {
      const parcel = parcels.find((item) => {
        return getTrackingId(item) === trackingId;
      });

      if (parcel) {
        foundParcels.push(parcel);
      } else {
        missingIds.push(trackingId);
      }
    });

    if (foundParcels.length === 0) {
      lastTrackedIds = [];
      showMessage(t("trackingNotFound"));
      return;
    }

    lastTrackedIds = trackingIds;

    result.innerHTML = `
      ${
        foundParcels.length === 1
          ? renderParcel(foundParcels[0])
          : renderMultipleParcels(foundParcels)
      }

      ${
        missingIds.length > 0
          ? `
            <div class="tracking-message error">

              <i class="bi bi-exclamation-circle"></i>

              <span>
                ${escapeHTML(missingIds.join(", "))}
                - ${t("trackingNotFound")}
              </span>

            </div>
          `
          : ""
      }
    `;
  }

  // =======================================================
  // 26. TRACKING FORM SUBMISSION
  // Direct form event listener
  // =======================================================

  function initialiseTrackingForm() {

    const trackingForm = document.getElementById("publicTrackingForm");
    const trackingInput = document.getElementById("publicTrackingInput");
    const trackingResult = document.getElementById("publicTrackingResult");

    if (!trackingForm || !trackingInput || !trackingResult) {
      console.error("ParcelPro: Tracking form elements not found.");
      return;
    }

    trackingForm.addEventListener("submit", function (event) {

      event.preventDefault();

      const trackingIds = parseTrackingInput(trackingInput.value);

      trackParcels(trackingIds);

    });

  }

  // =======================================================
  // 27. REFRESH TRACKING RESULTS
  // =======================================================

  function refreshTrackingResults() {
    if (lastTrackedIds.length === 0) {
      return;
    }

    trackParcels(lastTrackedIds);
  }

  // =======================================================
  // 28. LISTEN FOR LOCAL STORAGE UPDATES
  // =======================================================

  window.addEventListener("storage", (event) => {

    if (event.key === STORAGE_KEY) {
      refreshTrackingResults();
    }

    if (event.key === LANGUAGE_KEY) {
      loadLanguage();
      applyLanguage();
    }

  });

  // =======================================================
  // 29. LISTEN FOR ADMIN CUSTOM UPDATE EVENT
  // =======================================================

  window.addEventListener("parcelpro:dataUpdated", (event) => {

    const updatedKey = event.detail?.key;

    if (!updatedKey || updatedKey === STORAGE_KEY) {
      refreshTrackingResults();
    }

  });

  // =======================================================
  // 30. LANGUAGE SELECTOR
  // =======================================================

  function applyLanguage() {
    document.documentElement.lang = language;

    const languageSelectors = [
      "#languageSelect",
      "#languageSelector",
      "#language",
      "[data-language-selector]"
    ];

    languageSelectors.forEach((selector) => {
      const element = $(selector);

      if (element && element.value !== language) {
        element.value = language;
      }
    });

    refreshTrackingResults();
  }

  function changeLanguage(newLanguage) {
    if (!["en", "ms", "zh"].includes(newLanguage)) {
      return;
    }

    language = newLanguage;

    try {
      localStorage.setItem(LANGUAGE_KEY, language);

    } catch (error) {
      console.warn("ParcelPro: Unable to save language.", error);
    }

    applyLanguage();
  }

  [
    "#languageSelect",
    "#languageSelector",
    "#language",
    "[data-language-selector]"
  ].forEach((selector) => {

    const element = $(selector);

    if (element) {
      element.addEventListener("change", () => {
        changeLanguage(element.value);
      });
    }

  });

  document.querySelectorAll("[data-language]").forEach((button) => {

    button.addEventListener("click", () => {
      changeLanguage(button.dataset.language);
    });

  });

  // =======================================================
  // 31. MOBILE NAVIGATION
  // =======================================================

  function initialiseMobileNavigation() {

    const menuToggle =
      $("#menuToggle")
      || $("#mobileMenuToggle")
      || $(".menu-toggle");

    const navLinks =
      $("#navLinks")
      || $("#navbarNav")
      || $(".nav-links");

    if (!menuToggle || !navLinks) {
      return;
    }

    menuToggle.addEventListener("click", () => {

      const isOpen = navLinks.classList.toggle("active");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.classList.toggle("active", isOpen);

    });

    navLinks.querySelectorAll("a").forEach((link) => {

      link.addEventListener("click", () => {

        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

      });

    });

  }

  // =======================================================
  // 32. INITIALISE PUBLIC TRACKING
  // =======================================================

  function initialisePublicTracking() {

    loadLanguage();

    applyLanguage();

    initialiseMobileNavigation();

    initialiseTrackingForm();

    console.log("ParcelPro Public Tracking initialized.");

  }

  // =======================================================
  // 33. START
  // =======================================================

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initialisePublicTracking
    );

  } else {

    initialisePublicTracking();

  }

})();
