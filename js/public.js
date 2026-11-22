
/* =========================================================
   PARCELPRO - PUBLIC.JS
   Customer Tracking + Language Selector

   UPDATED:
   - Use shared parcelpro_parcels storage only
   - Search by trackingNumber, trackingNo or id
   - Support all Admin parcel statuses
   - Display actual tracking history
   - Support legacy trackingHistory
   - Auto-refresh when Admin updates parcel data
   - Support tracking up to 5 parcels
   - Preserve language selector and mobile navigation
========================================================= */

(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);

  const STORAGE_KEY = "parcelpro_parcels";
  const LANGUAGE_KEY = "parcelpro_language";

  // =====================================================
  // 1. TRANSLATIONS
  // =====================================================

  const translations = {
    en: {
      navHome:"HOME",
      navTrack:"TRACK PARCEL",
      navServices:"SERVICES",
      navAbout:"ABOUT US",
      adminLogin:"ADMIN LOGIN",

      heroEyebrow:"SMARTER DELIVERY, SIMPLER LIFE",
      heroTitleOne:"Your parcel.",
      heroTitleTwo:"Our priority.",
      heroSubtitle:"A smoother delivery experience starts here. Track your shipment anytime, anywhere.",
      heroCta:"TRACK YOUR PARCEL",
      secureTracking:"Easy & secure tracking",
      realTime:"Status updates",
      fastReliable:"Fast. Reliable. Convenient.",

      trackHeading:"Where is your parcel?",
      trackDescription:"Enter your ParcelPro tracking number below.",
      trackingPlaceholder:"ENTER YOUR PARCELPRO TRACKING ID",
      trackButton:"TRACK",
      trackingNote:"No customer login is required. Just enter your Tracking ID.",

      whyEyebrow:"WHY PARCELPRO",
      featuresTitle:"Delivery made simple",
      featuresSubtitle:"Everything you need for a more convenient parcel experience.",
      featureOneTitle:"Track with ease",
      featureOneText:"Check your parcel progress anytime using your unique Tracking ID.",
      featureTwoTitle:"Stay updated",
      featureTwoText:"See the latest delivery status and expected arrival information.",
      featureThreeTitle:"Reliable handling",
      featureThreeText:"Your shipment details are organised throughout its delivery journey.",

      bannerEyebrow:"PARCEL DELIVERY MANAGEMENT",
      bannerTitle:"Delivering Smarter, Tracking Easier.",
      bannerText:"ParcelPro keeps your delivery journey simple and clear.",
      rights:"All rights reserved.",
      footerTagline:"Delivering Smarter, Tracking Easier.",
      backHome:"Back to homepage",

      notFoundTitle:"Tracking ID not found",
      notFoundText:"Please check your Tracking ID and try again.",
      resultTitle:"Shipment tracking details",
      currentStatus:"CURRENT STATUS",
      expected:"EXPECTED DELIVERY",
      destination:"DESTINATION",
      progress:"DELIVERY HISTORY",
      recipient:"RECIPIENT",
      trackingNumber:"TRACKING NUMBER",
      proofPhoto:"Delivery proof photo",
      openMap:"Open location in Google Maps",

      pending:"Pending",
      processing:"Processing",
      pickedUp:"Picked Up",
      shipped:"Shipped",
      transit:"In Transit",
      outForDelivery:"Out for Delivery",
      delivered:"Delivered",
      failed:"Failed",
      cancelled:"Cancelled",

      unknownDate:"Status updated by ParcelPro",
      noHistory:"No tracking history available yet.",
      invalid:"Please enter a Tracking ID.",
      maxFive:"Please enter no more than 5 tracking numbers.",
      separateIds:"Separate each tracking number with a comma or a space.",

      adminDashboard:"Dashboard",
      adminParcelManagement:"Parcel Management",
      adminParcelTracking:"Parcel Tracking",
      adminCustomers:"Customers",
      adminDeliveryManagement:"Delivery Management",
      adminProfile:"My Profile",
      adminLogout:"Log out",
      adminWorkspace:"WORKSPACE",
      adminPreferences:"PREFERENCES"
    },

    ms: {
      navHome:"LAMAN UTAMA",
      navTrack:"JEJAK PARCEL",
      navServices:"PERKHIDMATAN",
      navAbout:"TENTANG KAMI",
      adminLogin:"LOG MASUK ADMIN",

      heroEyebrow:"PENGHANTARAN LEBIH BIJAK, HIDUP LEBIH MUDAH",
      heroTitleOne:"Parcel anda.",
      heroTitleTwo:"Keutamaan kami.",
      heroSubtitle:"Nikmati pengalaman penghantaran yang lebih mudah. Jejak kiriman anda bila-bila masa dan di mana sahaja.",
      heroCta:"JEJAK PARCEL ANDA",
      secureTracking:"Penjejakan mudah dan selamat",
      realTime:"Kemaskini status",
      fastReliable:"Pantas. Dipercayai. Mudah.",

      trackHeading:"Di manakah parcel anda?",
      trackDescription:"Masukkan nombor penjejakan ParcelPro anda di bawah.",
      trackingPlaceholder:"MASUKKAN ID PENJEJAKAN PARCELPRO",
      trackButton:"JEJAK",
      trackingNote:"Pelanggan tidak perlu log masuk. Hanya masukkan ID Penjejakan anda.",

      whyEyebrow:"MENGAPA PARCELPRO",
      featuresTitle:"Penghantaran lebih mudah",
      featuresSubtitle:"Semua yang anda perlukan untuk pengalaman penghantaran yang lebih mudah.",
      featureOneTitle:"Jejak dengan mudah",
      featureOneText:"Semak perkembangan parcel anda pada bila-bila masa menggunakan ID Penjejakan.",
      featureTwoTitle:"Sentiasa dikemaskini",
      featureTwoText:"Lihat status penghantaran terkini dan maklumat jangkaan ketibaan.",
      featureThreeTitle:"Pengendalian dipercayai",
      featureThreeText:"Maklumat kiriman anda disusun sepanjang proses penghantaran.",

      bannerEyebrow:"SISTEM PENGURUSAN PENGHANTARAN PARCEL",
      bannerTitle:"Penghantaran Lebih Bijak, Penjejakan Lebih Mudah.",
      bannerText:"ParcelPro menjadikan perjalanan penghantaran anda lebih mudah dan jelas.",
      rights:"Hak cipta terpelihara.",
      footerTagline:"Penghantaran Lebih Bijak, Penjejakan Lebih Mudah.",
      backHome:"Kembali ke laman utama",

      notFoundTitle:"ID Penjejakan tidak ditemui",
      notFoundText:"Sila semak ID Penjejakan anda dan cuba sekali lagi.",
      resultTitle:"Maklumat penjejakan kiriman",
      currentStatus:"STATUS TERKINI",
      expected:"JANGKAAN PENGHANTARAN",
      destination:"DESTINASI",
      progress:"SEJARAH PENGHANTARAN",
      recipient:"PENERIMA",
      trackingNumber:"NOMBOR PENJEJAKAN",
      proofPhoto:"Gambar bukti penghantaran",
      openMap:"Buka lokasi di Google Maps",

      pending:"Menunggu",
      processing:"Sedang diproses",
      pickedUp:"Telah diambil",
      shipped:"Telah dihantar",
      transit:"Dalam perjalanan",
      outForDelivery:"Sedang dihantar kepada penerima",
      delivered:"Telah dihantar",
      failed:"Penghantaran gagal",
      cancelled:"Dibatalkan",

      unknownDate:"Status dikemaskini oleh ParcelPro",
      noHistory:"Tiada sejarah penjejakan buat masa ini.",
      invalid:"Sila masukkan ID Penjejakan.",
      maxFive:"Sila masukkan maksimum 5 nombor penjejakan.",
      separateIds:"Asingkan setiap nombor penjejakan menggunakan koma atau ruang.",

      adminDashboard:"Papan Pemuka",
      adminParcelManagement:"Pengurusan Parcel",
      adminParcelTracking:"Penjejakan Parcel",
      adminCustomers:"Pelanggan",
      adminDeliveryManagement:"Pengurusan Penghantaran",
      adminProfile:"Profil Saya",
      adminLogout:"Log Keluar",
      adminWorkspace:"RUANG KERJA",
      adminPreferences:"PREFERENSI"
    },

    zh: {
      navHome:"首页",
      navTrack:"查询包裹",
      navServices:"服务",
      navAbout:"关于我们",
      adminLogin:"管理员登录",

      heroEyebrow:"更智能的配送，更轻松的生活",
      heroTitleOne:"您的包裹。",
      heroTitleTwo:"我们的优先事项。",
      heroSubtitle:"从这里开始享受更轻松的配送体验。随时随地查询您的包裹。",
      heroCta:"查询您的包裹",
      secureTracking:"简单安全的查询",
      realTime:"状态更新",
      fastReliable:"快速。可靠。便捷。",

      trackHeading:"您的包裹在哪里？",
      trackDescription:"请在下方输入您的 ParcelPro 查询号码。",
      trackingPlaceholder:"输入 PARCELPRO 查询号码",
      trackButton:"查询",
      trackingNote:"客户无需登录，只需输入您的查询号码。",

      whyEyebrow:"为什么选择 PARCELPRO",
      featuresTitle:"让配送更简单",
      featuresSubtitle:"为您提供更方便的包裹配送体验。",
      featureOneTitle:"轻松查询",
      featureOneText:"使用专属查询号码，随时查看包裹进度。",
      featureTwoTitle:"及时更新",
      featureTwoText:"查看最新配送状态和预计送达信息。",
      featureThreeTitle:"可靠处理",
      featureThreeText:"在整个配送过程中妥善整理您的包裹信息。",

      bannerEyebrow:"包裹配送管理系统",
      bannerTitle:"智能配送，轻松查询。",
      bannerText:"ParcelPro 让您的配送过程简单明了。",
      rights:"版权所有。",
      footerTagline:"智能配送，轻松查询。",
      backHome:"返回首页",

      notFoundTitle:"找不到查询号码",
      notFoundText:"请检查您的查询号码并重试。",
      resultTitle:"包裹查询详情",
      currentStatus:"当前状态",
      expected:"预计送达",
      destination:"目的地",
      progress:"配送记录",
      recipient:"收件人",
      trackingNumber:"查询号码",
      proofPhoto:"配送证明照片",
      openMap:"在 Google Maps 中查看位置",

      pending:"等待处理",
      processing:"处理中",
      pickedUp:"已取件",
      shipped:"已发货",
      transit:"运输中",
      outForDelivery:"派送中",
      delivered:"已送达",
      failed:"配送失败",
      cancelled:"已取消",

      unknownDate:"ParcelPro 已更新状态",
      noHistory:"暂无包裹查询记录。",
      invalid:"请输入查询号码。",
      maxFive:"最多只能输入 5 个查询号码。",
      separateIds:"请使用逗号或空格分隔每个查询号码。",

      adminDashboard:"控制面板",
      adminParcelManagement:"包裹管理",
      adminParcelTracking:"包裹查询",
      adminCustomers:"客户",
      adminDeliveryManagement:"配送管理",
      adminProfile:"我的资料",
      adminLogout:"退出登录",
      adminWorkspace:"工作区",
      adminPreferences:"偏好设置"
    }
  };

  let language = localStorage.getItem(LANGUAGE_KEY) || "en";

  if (!translations[language]) {
    language = "en";
  }

  let lastTrackedIds = [];

  // =====================================================
  // 2. GENERAL HELPERS
  // =====================================================

  function t(key) {
    return translations[language]?.[key] ||
      translations.en[key] ||
      key;
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

  function readParcels() {
    try {
      const value = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(value) ? value : [];

    } catch (error) {
      console.error(
        "ParcelPro: Unable to read parcel data.",
        error
      );

      return [];
    }
  }

  function normalizeStatus(status) {
    const value = String(status || "Pending")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

    const aliases = {
      "out of delivery": "out for delivery",
      "out for delivery": "out for delivery",
      "in transit": "in transit",
      "picked up": "picked up"
    };

    return aliases[value] || value;
  }

  function getStatusKey(status) {
    const normalized = normalizeStatus(status);

    const keys = {
      "pending": "pending",
      "processing": "processing",
      "picked up": "pickedUp",
      "shipped": "shipped",
      "in transit": "transit",
      "out for delivery": "outForDelivery",
      "delivered": "delivered",
      "failed": "failed",
      "cancelled": "cancelled"
    };

    return keys[normalized] || "pending";
  }

  function statusLabel(status) {
    const normalized = normalizeStatus(status);

    const keys = {
      "pending": "pending",
      "processing": "processing",
      "picked up": "pickedUp",
      "shipped": "shipped",
      "in transit": "transit",
      "out for delivery": "outForDelivery",
      "delivered": "delivered",
      "failed": "failed",
      "cancelled": "cancelled"
    };

    const key = keys[normalized];

    return key ? t(key) : escapeHTML(status || t("pending"));
  }

  function statusClass(status) {
    const normalized = normalizeStatus(status);

    if (normalized === "delivered") {
      return "is-delivered";
    }

    if (
      ["processing", "picked up", "shipped", "in transit", "out for delivery"]
        .includes(normalized)
    ) {
      return "is-transit";
    }

    if (["failed", "cancelled"].includes(normalized)) {
      return "is-failed";
    }

    return "is-pending";
  }

  function getTrackingId(parcel) {
    return String(
      parcel?.trackingNumber ||
      parcel?.trackingNo ||
      parcel?.id ||
      ""
    ).trim();
  }

  // Search tracking number first, then fallback to parcel ID.
  function findParcelByTrackingId(id, parcels = readParcels()) {
    const searchId = String(id || "").trim().toUpperCase();

    if (!searchId) return null;

    const trackingMatch = parcels.find(parcel => {
      const tracking = String(
        parcel.trackingNumber ||
        parcel.trackingNo ||
        ""
      ).trim().toUpperCase();

      return tracking === searchId;
    });

    if (trackingMatch) return trackingMatch;

    return parcels.find(parcel =>
      String(parcel.id || "").trim().toUpperCase() === searchId
    ) || null;
  }

  function formatHistoryDate(value) {
    if (!value) return t("unknownDate");

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return escapeHTML(value);
    }

    return date.toLocaleString(
      language === "ms" ? "ms-MY" :
      language === "zh" ? "zh-CN" : "en-MY",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function getHistory(parcel) {
    if (Array.isArray(parcel.history) && parcel.history.length) {
      return [...parcel.history];
    }

    if (
      Array.isArray(parcel.trackingHistory) &&
      parcel.trackingHistory.length
    ) {
      return [...parcel.trackingHistory];
    }

    return [];
  }

  function getHistoryIcon(status) {
    const normalized = normalizeStatus(status);

    if (normalized === "delivered") return "bi-check-circle-fill";

    if (normalized === "failed") return "bi-exclamation-circle-fill";

    if (normalized === "cancelled") return "bi-x-circle-fill";

    if (normalized === "out for delivery") return "bi-geo-alt-fill";

    if (
      ["picked up", "shipped", "in transit"].includes(normalized)
    ) {
      return "bi-truck";
    }

    if (normalized === "processing") return "bi-box-seam";

    return "bi-clock-history";
  }

  // =====================================================
  // 3. LANGUAGE
  // =====================================================

  function applyLanguage() {
    document.documentElement.lang =
      language === "ms" ? "ms" :
      language === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.dataset.i18n;
      element.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    const languageSelect = $("#languageSelect");
    if (languageSelect) languageSelect.value = language;

    const adminLanguageSelect = $("#adminLanguageSelect");
    if (adminLanguageSelect) {
      adminLanguageSelect.value = language;
    }

    if (lastTrackedIds.length) {
      renderTrackingResults(lastTrackedIds);
    }
  }

  function changeLanguage(event) {
    const selectedLanguage = event.target.value;

    if (!translations[selectedLanguage]) return;

    language = selectedLanguage;

    localStorage.setItem(LANGUAGE_KEY, language);

    applyLanguage();
  }

  // =====================================================
  // 4. TRACKING HISTORY HTML
  // =====================================================

  function renderHistory(parcel) {
    const history = getHistory(parcel);

    // Do not create fake historical events.
    // If there is no history, show the current status only.
    const entries = history.length
      ? history
      : parcel.status
        ? [{
            status: parcel.status,
            date: parcel.updated || parcel.created || parcel.date || "",
            description: t("unknownDate")
          }]
        : [];

    if (!entries.length) {
      return `
        <div class="public-timeline">
          <p class="text-muted small">${t("noHistory")}</p>
        </div>
      `;
    }

    // History is saved oldest-to-newest by Admin.
    // Display in chronological order.
    return `
      <div class="public-timeline">
        ${entries.map((entry, index) => {
          const status = entry.status || "Pending";
          const description = entry.description || t("unknownDate");

          const isLatest = index === entries.length - 1;

          return `
            <div class="public-timeline-step done ${isLatest ? "current" : ""}">
              <span class="public-timeline-icon">
                <i class="bi ${getHistoryIcon(status)}"></i>
              </span>

              <strong>${statusLabel(status)}</strong>

              <small>${formatHistoryDate(entry.date || entry.created || "")}</small>

              <p class="small mb-0">
                ${escapeHTML(description)}
              </p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // =====================================================
  // 5. SINGLE PARCEL RESULT
  // =====================================================

  function renderParcel(id, parcels = readParcels()) {
    const result = $("#publicTrackingResult");

    if (!result) return;

    const parcel = findParcelByTrackingId(id, parcels);

    result.classList.add("visible");

    if (!parcel) {
      result.dataset.parcelId = "";

      result.innerHTML = `
        <div class="public-track-error">
          <i class="bi bi-exclamation-circle-fill"></i>

          <div>
            <strong>${t("notFoundTitle")}</strong>
            <p>${t("notFoundText")}</p>
          </div>
        </div>
      `;

      return;
    }

    const trackingId = getTrackingId(parcel);

    result.dataset.parcelId = trackingId;

    const status = parcel.status || "Pending";
    const address = parcel.address || parcel.destination || "";

    const safeAddress = escapeHTML(address);

    const mapQuery = encodeURIComponent(address || "Malaysia");

    const proofPhoto = String(parcel.proofPhoto || "");

    // Only allow image data URLs or normal HTTP/HTTPS image URLs.
    const safeProofPhoto =
      /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(proofPhoto) ||
      /^https?:\/\//i.test(proofPhoto)
        ? proofPhoto
        : "";

    result.innerHTML = `
      <article class="public-result-card">

        <div class="public-result-head">
          <div>
            <span class="public-result-kicker">${t("resultTitle")}</span>
            <h3>${escapeHTML(trackingId)}</h3>
          </div>

          <span class="public-status-pill ${statusClass(status)}">
            ${statusLabel(status)}
          </span>
        </div>

        <div class="public-result-meta">

          <div>
            <small>${t("currentStatus")}</small>
            <strong>${statusLabel(status)}</strong>
          </div>

          <div>
            <small>${t("expected")}</small>
            <strong>${escapeHTML(parcel.date || "—")}</strong>
          </div>

          <div>
            <small>${t("destination")}</small>
            <strong>${safeAddress || "—"}</strong>
          </div>

        </div>

        <div class="public-progress-title">
          ${t("progress")}
        </div>

        ${renderHistory(parcel)}

        ${safeProofPhoto ? `
          <div class="mt-3">
            <strong>${t("proofPhoto")}</strong><br>

            <img
              class="proof-photo"
              src="${escapeHTML(safeProofPhoto)}"
              alt="${t("proofPhoto")}"
              loading="lazy">
          </div>
        ` : ""}

        <iframe
          class="public-map"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=${mapQuery}&output=embed"
          title="Parcel destination map">
        </iframe>

        <a
          class="small d-inline-block mt-2"
          target="_blank"
          rel="noopener"
          href="https://www.google.com/maps/search/?api=1&query=${mapQuery}">
          ${t("openMap")}
        </a>

      </article>
    `;
  }

  // =====================================================
  // 6. MULTIPLE PARCEL RESULTS
  // =====================================================

  function renderMultipleParcels(ids, parcels = readParcels()) {
    const result = $("#publicTrackingResult");

    if (!result) return;

    result.classList.add("visible");
    result.dataset.parcelId = "";

    result.innerHTML = ids.map(id => {
      const parcel = findParcelByTrackingId(id, parcels);

      if (!parcel) {
        return `
          <div class="public-track-error mb-2">
            <i class="bi bi-exclamation-circle-fill"></i>

            <div>
              <strong>${escapeHTML(id)}: ${t("notFoundTitle")}</strong>
              <p>${t("notFoundText")}</p>
            </div>
          </div>
        `;
      }

      const trackingId = getTrackingId(parcel);
      const status = parcel.status || "Pending";

      return `
        <article class="public-result-card mb-2">

          <div class="public-result-head">
            <div>
              <span class="public-result-kicker">
                ${t("trackingNumber")}
              </span>

              <h3>${escapeHTML(trackingId)}</h3>
            </div>

            <span class="public-status-pill ${statusClass(status)}">
              ${statusLabel(status)}
            </span>
          </div>

          <div class="public-result-meta">

            <div>
              <small>${t("currentStatus")}</small>
              <strong>${statusLabel(status)}</strong>
            </div>

            <div>
              <small>${t("expected")}</small>
              <strong>${escapeHTML(parcel.date || "—")}</strong>
            </div>

            <div>
              <small>${t("destination")}</small>
              <strong>${escapeHTML(parcel.address || parcel.destination || "—")}</strong>
            </div>

            <div>
              <small>${t("recipient")}</small>
              <strong>${escapeHTML(parcel.recipient || parcel.customerName || "—")}</strong>
            </div>

          </div>

          <div class="public-progress-title">
            ${t("progress")}
          </div>

          ${renderHistory(parcel)}

        </article>
      `;
    }).join("");
  }

  // =====================================================
  // 7. RENDER TRACKING RESULTS
  // =====================================================

  function renderTrackingResults(ids) {
    const parcels = readParcels();

    if (ids.length === 1) {
      renderParcel(ids[0], parcels);
    } else if (ids.length > 1) {
      renderMultipleParcels(ids, parcels);
    }
  }

  // =====================================================
  // 8. TRACKING FORM
  // =====================================================

  const trackingForm = $("#publicTrackingForm");

  if (!trackingForm) {
    console.error(
      "ParcelPro tracking: #publicTrackingForm was not found. Check index.html."
    );

  } else {
    trackingForm.addEventListener("submit", event => {
      event.preventDefault();

      const field = $("#publicTrackingInput");
      const result = $("#publicTrackingResult");

      if (!field || !result) {
        console.error(
          "ParcelPro tracking input/result element is missing."
        );
        return;
      }

      const ids = field.value
        .split(/[\s,;]+/)
        .map(value => value.trim())
        .filter(Boolean);

      if (!ids.length) {
        field.setCustomValidity(t("invalid"));
        field.reportValidity();
        return;
      }

      field.setCustomValidity("");

      if (ids.length > 5) {
        lastTrackedIds = [];

        result.classList.add("visible");
        result.dataset.parcelId = "";

        result.innerHTML = `
          <div class="public-track-error">
            <i class="bi bi-exclamation-circle-fill"></i>

            <div>
              <strong>${t("maxFive")}</strong>
              <p>${t("separateIds")}</p>
            </div>
          </div>
        `;

        return;
      }

      // Store the submitted IDs so the result can refresh
      // when Admin changes parcel information.
      lastTrackedIds = ids.map(id => id.toUpperCase());

      renderTrackingResults(lastTrackedIds);
    });
  }

  // =====================================================
  // 9. AUTO REFRESH FROM ADMIN DATA
  // =====================================================

  function refreshTrackingResults() {
    if (!lastTrackedIds.length) return;

    renderTrackingResults(lastTrackedIds);
  }

  // Cross-tab updates:
  // When Admin saves parcel data in another tab,
  // localStorage fires the storage event here.
  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE_KEY ||
      event.key === null
    ) {
      refreshTrackingResults();
    }

    if (event.key === LANGUAGE_KEY && event.newValue) {
      if (translations[event.newValue]) {
        language = event.newValue;
        applyLanguage();
      }
    }
  });

  // Same-tab updates:
  // Supports other ParcelPro scripts dispatching this event.
  window.addEventListener("parcelpro:dataUpdated", event => {
    if (
      !event.detail?.key ||
      event.detail.key === STORAGE_KEY
    ) {
      refreshTrackingResults();
    }
  });

  // =====================================================
  // 10. BACK TO PUBLIC HOMEPAGE
  // =====================================================

  $("#backToPublicHome")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // =====================================================
  // 11. MOBILE RESPONSIVE NAVIGATION
  // =====================================================

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );

      const icon = menuToggle.querySelector("i");

      if (icon) {
        icon.classList.toggle("bi-list", !isOpen);
        icon.classList.toggle("bi-x-lg", isOpen);
      }
    });

    // Close menu after clicking navigation links.
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");

        const icon = menuToggle.querySelector("i");

        if (icon) {
          icon.classList.remove("bi-x-lg");
          icon.classList.add("bi-list");
        }
      });
    });

    // Close menu when Escape is pressed.
    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        navLinks.classList.contains("open")
      ) {
        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");

        const icon = menuToggle.querySelector("i");

        if (icon) {
          icon.classList.remove("bi-x-lg");
          icon.classList.add("bi-list");
        }
      }
    });

  } else {
    console.warn(
      "ParcelPro mobile menu: #menuToggle or #navLinks was not found."
    );
  }

  // =====================================================
  // 12. LANGUAGE SELECTOR EVENTS
  // =====================================================

  $("#languageSelect")?.addEventListener(
    "change",
    changeLanguage
  );

  $("#adminLanguageSelect")?.addEventListener(
    "change",
    changeLanguage
  );

  // =====================================================
  // 13. INITIALISE
  // =====================================================

  applyLanguage();

  console.info(
    "ParcelPro public.js loaded successfully.",
    {
      trackingForm: Boolean(trackingForm),
      parcelRecords: readParcels().length,
      language
    }
  );

})();
