
/* =========================================================
   PARCELPRO - PUBLIC.JS
   Customer Tracking + Language Selector + Mobile Navigation

   FEATURES:
   - Read shared parcelpro_parcels from localStorage
   - Search by Tracking Number, Tracking No or legacy ID
   - Support tracking up to 5 parcels
   - Support all 9 Admin statuses
   - Display six-stage customer tracking progress
   - Display tracking history from Admin
   - Display delivery proof photo
   - Display Google Maps destination
   - Language selector: English, Malay and Chinese
   - Mobile burger menu
   - Re-render tracking when Admin updates parcel data

   IMPORTANT:
   - Does not modify Admin parcel records.
   - Does not change Admin parcel statuses.
========================================================= */

(() => {
  "use strict";

  // =====================================================
  // 1. BASIC HELPERS
  // =====================================================

  const $ = (selector) => document.querySelector(selector);

  const STORAGE_KEY = "parcelpro_parcels";
  const LANGUAGE_KEY = "parcelpro_language";

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character]));

  function safeStorageRead(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("ParcelPro: localStorage read failed.", error);
      return null;
    }
  }

  function safeStorageWrite(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("ParcelPro: localStorage write failed.", error);
      return false;
    }
  }

  // =====================================================
  // 2. SAMPLE DATA
  // =====================================================
  // Only initialise sample data when storage is empty.
  // Existing Admin records will never be overwritten.

  function initialiseSampleParcels() {
    if (safeStorageRead(STORAGE_KEY) !== null) return;

    const sampleParcels = [
      {
        id: "PP1001",
        trackingNumber: "PP1001",
        recipient: "Aisyah Rahman",
        phone: "012-345 6789",
        address: "Shah Alam, Selangor",
        type: "Small package",
        date: "2026-11-15",
        status: "In Transit",
        courier: "Daniel Lee",
        created: "2026-11-10"
      },
      {
        id: "PP1002",
        trackingNumber: "PP1002",
        recipient: "Daniel Tan",
        phone: "013-222 4567",
        address: "Petaling Jaya, Selangor",
        type: "Document",
        date: "2026-11-13",
        status: "Delivered",
        courier: "Farid Ahmad",
        created: "2026-11-09"
      },
      {
        id: "PP1003",
        trackingNumber: "PP1003",
        recipient: "Nur Izzati",
        phone: "017-888 1234",
        address: "Bangi, Selangor",
        type: "Medium package",
        date: "2026-11-16",
        status: "Pending",
        courier: "Not assigned",
        created: "2026-11-12"
      },
      {
        id: "PP1004",
        trackingNumber: "PP1004",
        recipient: "Muhammad Amir",
        phone: "016-555 9087",
        address: "Cyberjaya, Selangor",
        type: "Large package",
        date: "2026-11-14",
        status: "In Transit",
        courier: "Siti Zulaikha",
        created: "2026-11-10"
      },
      {
        id: "PP1005",
        trackingNumber: "PP1005",
        recipient: "Lim Wei Jian",
        phone: "011-333 8765",
        address: "Kuala Lumpur",
        type: "Small package",
        date: "2026-11-12",
        status: "Delivered",
        courier: "Daniel Lee",
        created: "2026-11-08"
      },
      {
        id: "PP1006",
        trackingNumber: "PP1006",
        recipient: "Siti Hajar",
        phone: "019-777 2345",
        address: "Putrajaya",
        type: "Document",
        date: "2026-11-17",
        status: "Pending",
        courier: "Not assigned",
        created: "2026-11-12"
      },
      {
        id: "PP1007",
        trackingNumber: "PP1007",
        recipient: "Adam Hakim",
        phone: "014-999 4561",
        address: "Klang, Selangor",
        type: "Medium package",
        date: "2026-11-13",
        status: "Delivered",
        courier: "Farid Ahmad",
        created: "2026-11-07"
      },
      {
        id: "PP1008",
        trackingNumber: "PP1008",
        recipient: "Chong Mei Ling",
        phone: "012-777 6543",
        address: "Subang Jaya, Selangor",
        type: "Small package",
        date: "2026-11-18",
        status: "In Transit",
        courier: "Siti Zulaikha",
        created: "2026-11-11"
      }
    ];

    safeStorageWrite(STORAGE_KEY, JSON.stringify(sampleParcels));
  }

  initialiseSampleParcels();

  // =====================================================
  // 3. LANGUAGE TRANSLATIONS
  // =====================================================

  const translations = {
    en: {
      navHome: "HOME",
      navTrack: "TRACK PARCEL",
      navServices: "SERVICES",
      navAbout: "ABOUT US",
      adminLogin: "ADMIN LOGIN",

      heroEyebrow: "SMARTER DELIVERY, SIMPLER LIFE",
      heroTitleOne: "Your parcel.",
      heroTitleTwo: "Our priority.",
      heroSubtitle: "A smoother delivery experience starts here. Track your shipment anytime, anywhere.",
      heroCta: "TRACK YOUR PARCEL",
      secureTracking: "Easy & secure tracking",
      realTime: "Status updates",
      fastReliable: "Fast. Reliable. Convenient.",

      trackHeading: "Where is your parcel?",
      trackDescription: "Enter your ParcelPro tracking number below.",
      trackingPlaceholder: "ENTER YOUR PARCELPRO TRACKING ID",
      trackButton: "TRACK",
      trackingNote: "No customer login is required. Just enter your Tracking ID.",

      whyEyebrow: "WHY PARCELPRO",
      featuresTitle: "Delivery made simple",
      featuresSubtitle: "Everything you need for a more convenient parcel experience.",

      featureOneTitle: "Track with ease",
      featureOneText: "Check your parcel progress anytime using your unique Tracking ID.",
      featureTwoTitle: "Stay updated",
      featureTwoText: "See the latest delivery status and expected arrival information.",
      featureThreeTitle: "Reliable handling",
      featureThreeText: "Your shipment details are organised throughout its delivery journey.",

      bannerEyebrow: "PARCEL DELIVERY MANAGEMENT",
      bannerTitle: "Delivering Smarter, Tracking Easier.",
      bannerText: "ParcelPro keeps your delivery journey simple and clear.",
      rights: "All rights reserved.",
      footerTagline: "Delivering Smarter, Tracking Easier.",
      backHome: "Back to homepage",

      notFoundTitle: "Tracking ID not found",
      notFoundText: "Please check your Tracking ID and try again.",
      resultTitle: "Shipment tracking details",
      currentStatus: "CURRENT STATUS",
      expected: "EXPECTED DELIVERY",
      destination: "DESTINATION",
      recipient: "RECIPIENT",
      courier: "COURIER",
      progress: "DELIVERY PROGRESS",

      pending: "Pending",
      processing: "Processing",
      pickedUp: "Picked Up",
      shipped: "Shipped",
      transit: "In Transit",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      failed: "Failed",
      cancelled: "Cancelled",

      historyTitle: "TRACKING HISTORY",
      noHistory: "No tracking history available yet.",
      unknownDate: "Status updated by ParcelPro",
      deliveryProof: "Delivery proof photo",
      openMap: "Open location in Google Maps",

      invalid: "Please enter a Tracking ID.",
      maxTracking: "Please enter no more than 5 tracking numbers.",
      multipleHint: "Separate each tracking number with a comma or a space.",

      adminDashboard: "Dashboard",
      adminParcelManagement: "Parcel Management",
      adminParcelTracking: "Parcel Tracking",
      adminCustomers: "Customers",
      adminDeliveryManagement: "Delivery Management",
      adminProfile: "My Profile",
      adminLogout: "Log out",
      adminWorkspace: "WORKSPACE",
      adminPreferences: "PREFERENCES"
    },

    ms: {
      navHome: "LAMAN UTAMA",
      navTrack: "JEJAK PARCEL",
      navServices: "PERKHIDMATAN",
      navAbout: "TENTANG KAMI",
      adminLogin: "LOG MASUK ADMIN",

      heroEyebrow: "PENGHANTARAN LEBIH BIJAK, HIDUP LEBIH MUDAH",
      heroTitleOne: "Parcel anda.",
      heroTitleTwo: "Keutamaan kami.",
      heroSubtitle: "Nikmati pengalaman penghantaran yang lebih mudah. Jejak kiriman anda bila-bila masa dan di mana sahaja.",
      heroCta: "JEJAK PARCEL ANDA",
      secureTracking: "Penjejakan mudah dan selamat",
      realTime: "Kemaskini status",
      fastReliable: "Pantas. Dipercayai. Mudah.",

      trackHeading: "Di manakah parcel anda?",
      trackDescription: "Masukkan nombor penjejakan ParcelPro anda di bawah.",
      trackingPlaceholder: "MASUKKAN ID PENJEJAKAN PARCELPRO",
      trackButton: "JEJAK",
      trackingNote: "Pelanggan tidak perlu log masuk. Hanya masukkan ID Penjejakan anda.",

      whyEyebrow: "MENGAPA PARCELPRO",
      featuresTitle: "Penghantaran lebih mudah",
      featuresSubtitle: "Semua yang anda perlukan untuk pengalaman penghantaran yang lebih mudah.",

      featureOneTitle: "Jejak dengan mudah",
      featureOneText: "Semak perkembangan parcel anda pada bila-bila masa menggunakan ID Penjejakan.",
      featureTwoTitle: "Sentiasa dikemaskini",
      featureTwoText: "Lihat status penghantaran terkini dan maklumat jangkaan ketibaan.",
      featureThreeTitle: "Pengendalian dipercayai",
      featureThreeText: "Maklumat kiriman anda disusun sepanjang proses penghantaran.",

      bannerEyebrow: "SISTEM PENGURUSAN PENGHANTARAN PARCEL",
      bannerTitle: "Penghantaran Lebih Bijak, Penjejakan Lebih Mudah.",
      bannerText: "ParcelPro menjadikan perjalanan penghantaran anda lebih mudah dan jelas.",
      rights: "Hak cipta terpelihara.",
      footerTagline: "Penghantaran Lebih Bijak, Penjejakan Lebih Mudah.",
      backHome: "Kembali ke laman utama",

      notFoundTitle: "ID Penjejakan tidak ditemui",
      notFoundText: "Sila semak ID Penjejakan anda dan cuba sekali lagi.",
      resultTitle: "Maklumat penjejakan kiriman",
      currentStatus: "STATUS TERKINI",
      expected: "JANGKAAN PENGHANTARAN",
      destination: "DESTINASI",
      recipient: "PENERIMA",
      courier: "KURIER",
      progress: "PROSES PENGHANTARAN",

      pending: "Menunggu",
      processing: "Sedang diproses",
      pickedUp: "Telah diambil",
      shipped: "Telah dihantar",
      transit: "Dalam transit",
      outForDelivery: "Dalam proses penghantaran",
      delivered: "Telah dihantar",
      failed: "Gagal dihantar",
      cancelled: "Dibatalkan",

      historyTitle: "SEJARAH PENJEJAKAN",
      noHistory: "Tiada sejarah penjejakan buat masa ini.",
      unknownDate: "Status dikemaskini oleh ParcelPro",
      deliveryProof: "Gambar bukti penghantaran",
      openMap: "Buka lokasi di Google Maps",

      invalid: "Sila masukkan ID Penjejakan.",
      maxTracking: "Sila masukkan maksimum 5 nombor penjejakan sahaja.",
      multipleHint: "Asingkan setiap nombor penjejakan menggunakan koma atau ruang.",

      adminDashboard: "Papan Pemuka",
      adminParcelManagement: "Pengurusan Parcel",
      adminParcelTracking: "Penjejakan Parcel",
      adminCustomers: "Pelanggan",
      adminDeliveryManagement: "Pengurusan Penghantaran",
      adminProfile: "Profil Saya",
      adminLogout: "Log Keluar",
      adminWorkspace: "RUANG KERJA",
      adminPreferences: "PREFERENSI"
    },

    zh: {
      navHome: "首页",
      navTrack: "查询包裹",
      navServices: "服务",
      navAbout: "关于我们",
      adminLogin: "管理员登录",

      heroEyebrow: "更智能的配送，更轻松的生活",
      heroTitleOne: "您的包裹。",
      heroTitleTwo: "我们的优先事项。",
      heroSubtitle: "从这里开始享受更轻松的配送体验。随时随地查询您的包裹。",
      heroCta: "查询您的包裹",
      secureTracking: "简单安全的查询",
      realTime: "状态更新",
      fastReliable: "快速。可靠。便捷。",

      trackHeading: "您的包裹在哪里？",
      trackDescription: "请在下方输入您的 ParcelPro 查询号码。",
      trackingPlaceholder: "输入 PARCELPRO 查询号码",
      trackButton: "查询",
      trackingNote: "客户无需登录，只需输入您的查询号码。",

      whyEyebrow: "为什么选择 PARCELPRO",
      featuresTitle: "让配送更简单",
      featuresSubtitle: "为您提供更方便的包裹配送体验。",

      featureOneTitle: "轻松查询",
      featureOneText: "使用专属查询号码，随时查看包裹进度。",
      featureTwoTitle: "及时更新",
      featureTwoText: "查看最新配送状态和预计送达信息。",
      featureThreeTitle: "可靠处理",
      featureThreeText: "在整个配送过程中妥善整理您的包裹信息。",

      bannerEyebrow: "包裹配送管理系统",
      bannerTitle: "智能配送，轻松查询。",
      bannerText: "ParcelPro 让您的配送过程简单明了。",
      rights: "版权所有。",
      footerTagline: "智能配送，轻松查询。",
      backHome: "返回首页",

      notFoundTitle: "找不到查询号码",
      notFoundText: "请检查您的查询号码并重试。",
      resultTitle: "包裹查询详情",
      currentStatus: "当前状态",
      expected: "预计送达",
      destination: "目的地",
      recipient: "收件人",
      courier: "快递员",
      progress: "配送进度",

      pending: "等待处理",
      processing: "处理中",
      pickedUp: "已取件",
      shipped: "已发货",
      transit: "运输中",
      outForDelivery: "派送中",
      delivered: "已送达",
      failed: "配送失败",
      cancelled: "已取消",

      historyTitle: "查询记录",
      noHistory: "暂无包裹查询记录。",
      unknownDate: "ParcelPro 已更新状态",
      deliveryProof: "送达证明照片",
      openMap: "在 Google 地图中查看",

      invalid: "请输入查询号码。",
      maxTracking: "最多只能输入 5 个查询号码。",
      multipleHint: "请使用逗号或空格分隔每个查询号码。",

      adminDashboard: "控制面板",
      adminParcelManagement: "包裹管理",
      adminParcelTracking: "包裹查询",
      adminCustomers: "客户",
      adminDeliveryManagement: "配送管理",
      adminProfile: "我的资料",
      adminLogout: "退出登录",
      adminWorkspace: "工作区",
      adminPreferences: "偏好设置"
    }
  };

  let language = safeStorageRead(LANGUAGE_KEY) || "en";

  if (!translations[language]) {
    language = "en";
  }

  const t = (key) =>
    translations[language]?.[key] ??
    translations.en[key] ??
    key;

  // =====================================================
  // 4. READ PARCEL DATA
  // =====================================================

  function readParcels() {
    try {
      const raw = safeStorageRead(STORAGE_KEY);

      if (!raw) return [];

      const parcels = JSON.parse(raw);

      return Array.isArray(parcels) ? parcels : [];
    } catch (error) {
      console.error("ParcelPro: parcel data could not be read.", error);
      return [];
    }
  }

  // =====================================================
  // 5. TRACKING NUMBER LOOKUP
  // =====================================================

  function getTrackingNumber(parcel) {
    return String(
      parcel.trackingNumber ||
      parcel.trackingNo ||
      parcel.id ||
      ""
    ).trim();
  }

  function findParcel(trackingNumber) {
    const searchValue = String(trackingNumber || "")
      .trim()
      .toUpperCase();

    if (!searchValue) return null;

    const parcels = readParcels();

    return parcels.find(parcel => {
      const tracking = getTrackingNumber(parcel).toUpperCase();

      const oldTracking = String(
        parcel.trackingNo || ""
      ).trim().toUpperCase();

      const internalId = String(
        parcel.id || ""
      ).trim().toUpperCase();

      return (
        tracking === searchValue ||
        oldTracking === searchValue ||
        internalId === searchValue
      );
    }) || null;
  }

  // =====================================================
  // 6. STATUS NORMALISATION
  // =====================================================
  // This function only prepares the status for display.
  // It DOES NOT save or modify the Admin parcel status.

  function normaliseStatus(status) {
    const value = String(status || "Pending")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

    const statusMap = {
      "pending": "Pending",
      "processing": "Processing",
      "picked up": "Picked Up",
      "shipped": "Shipped",
      "in transit": "In Transit",
      "out of delivery": "Out for Delivery",
      "out for delivery": "Out for Delivery",
      "delivered": "Delivered",
      "failed": "Failed",
      "cancelled": "Cancelled",
      "canceled": "Cancelled"
    };

    return statusMap[value] || String(status || "Pending").trim();
  }

  function getStatusTranslation(status) {
    const normalised = normaliseStatus(status);

    const keys = {
      "Pending": "pending",
      "Processing": "processing",
      "Picked Up": "pickedUp",
      "Shipped": "shipped",
      "In Transit": "transit",
      "Out for Delivery": "outForDelivery",
      "Delivered": "delivered",
      "Failed": "failed",
      "Cancelled": "cancelled"
    };

    return t(keys[normalised] || "pending");
  }

  function getStatusClass(status) {
    const normalised = normaliseStatus(status);

    if (normalised === "Delivered") return "is-delivered";

    if (
      normalised === "Failed" ||
      normalised === "Cancelled"
    ) {
      return "is-exception";
    }

    if (
      normalised === "In Transit" ||
      normalised === "Shipped" ||
      normalised === "Out for Delivery"
    ) {
      return "is-transit";
    }

    return "is-pending";
  }

  // =====================================================
  // 7. SIX-STAGE CUSTOMER PROGRESS
  // =====================================================

  const progressStages = [
    {
      status: "Pending",
      key: "pending",
      icon: "bi-hourglass-split"
    },
    {
      status: "Processing",
      key: "processing",
      icon: "bi-gear"
    },
    {
      status: "Picked Up",
      key: "pickedUp",
      icon: "bi-box-seam"
    },
    {
      status: "In Transit",
      key: "transit",
      icon: "bi-truck"
    },
    {
      status: "Out for Delivery",
      key: "outForDelivery",
      icon: "bi-geo-alt"
    },
    {
      status: "Delivered",
      key: "delivered",
      icon: "bi-check-circle"
    }
  ];

  function getProgressIndex(status) {
    const normalised = normaliseStatus(status);

    const indexMap = {
      "Pending": 0,
      "Processing": 1,
      "Picked Up": 2,
      "Shipped": 3,
      "In Transit": 3,
      "Out for Delivery": 4,
      "Delivered": 5
    };

    return indexMap[normalised] ?? -1;
  }

  function renderProgress(status) {
    const normalised = normaliseStatus(status);
    const currentIndex = getProgressIndex(normalised);

    const isException =
      normalised === "Failed" ||
      normalised === "Cancelled";

    const stepsHTML = progressStages.map((stage, index) => {
      const isComplete = !isException && index < currentIndex;
      const isCurrent = !isException && index === currentIndex;

      const classes = [
        "pp-status-step",
        isComplete ? "is-complete" : "",
        isCurrent ? "is-current" : ""
      ].filter(Boolean).join(" ");

      return `
        <div class="${classes}">
          <span class="pp-status-step-icon">
            <i class="bi ${stage.icon}"></i>
          </span>

          <span class="pp-status-step-label">
            ${t(stage.key)}
          </span>
        </div>
      `;
    }).join("");

    let messageHTML = "";

    if (isException) {
      messageHTML = `
        <div class="pp-status-progress-message is-exception">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>${getStatusTranslation(normalised)}</span>
        </div>
      `;
    }

    return `
      <section class="pp-status-progress">

        <h4 class="pp-status-progress-title">
          <i class="bi bi-truck"></i>
          ${t("progress")}
        </h4>

        ${messageHTML}

        <div class="pp-status-steps">
          ${stepsHTML}
        </div>

      </section>
    `;
  }

  // =====================================================
  // 8. TRACKING HISTORY
  // =====================================================

  function getParcelHistory(parcel) {
    if (Array.isArray(parcel.history) && parcel.history.length) {
      return parcel.history;
    }

    if (
      Array.isArray(parcel.trackingHistory) &&
      parcel.trackingHistory.length
    ) {
      return parcel.trackingHistory;
    }

    return [];
  }

  function formatHistoryDate(value) {
    if (!value) return t("unknownDate");

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
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

  function renderHistory(parcel) {
    const history = getParcelHistory(parcel);

    if (!history.length) {
      return `
        <section class="public-history">
          <h4>
            <i class="bi bi-clock-history"></i>
            ${t("historyTitle")}
          </h4>

          <p>${t("noHistory")}</p>
        </section>
      `;
    }

    const historyHTML = history.map(item => {
      const status = normaliseStatus(item.status || "Pending");

      const description =
        item.description ||
        getStatusTranslation(status);

      const date = formatHistoryDate(
        item.date || item.created || item.updated
      );

      return `
        <div class="public-history-item">

          <span class="public-history-icon">
            <i class="bi bi-check-circle-fill"></i>
          </span>

          <div class="public-history-content">
            <strong>${escapeHTML(getStatusTranslation(status))}</strong>

            <p>${escapeHTML(description)}</p>

            <small>${escapeHTML(date)}</small>
          </div>

        </div>
      `;
    }).join("");

    return `
      <section class="public-history">

        <h4>
          <i class="bi bi-clock-history"></i>
          ${t("historyTitle")}
        </h4>

        <div class="public-history-list">
          ${historyHTML}
        </div>

      </section>
    `;
  }

  // =====================================================
  // 9. DELIVERY PROOF PHOTO
  // =====================================================

  function renderProofPhoto(parcel) {
    if (!parcel.proofPhoto) return "";

    return `
      <div class="public-proof-photo mt-3">
        <strong>${t("deliveryProof")}</strong>

        <div>
          <img
            class="proof-photo"
            src="${escapeHTML(parcel.proofPhoto)}"
            alt="${escapeHTML(t("deliveryProof"))}"
            loading="lazy"
          >
        </div>
      </div>
    `;
  }

  // =====================================================
  // 10. GOOGLE MAPS
  // =====================================================

  function renderMap(parcel) {
    const address = String(parcel.address || "").trim();

    if (!address) return "";

    const encodedAddress = encodeURIComponent(address);

    return `
      <div class="public-map-wrap">

        <iframe
          class="public-map"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=${encodedAddress}&output=embed"
          title="Parcel destination map">
        </iframe>

        <a
          class="small d-inline-block mt-2"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.google.com/maps/search/?api=1&query=${encodedAddress}">
          <i class="bi bi-geo-alt"></i>
          ${t("openMap")}
        </a>

      </div>
    `;
  }

  // =====================================================
  // 11. PARCEL RESULT CARD
  // =====================================================

  function renderParcelCard(parcel) {
    const trackingNumber = getTrackingNumber(parcel);
    const status = normaliseStatus(parcel.status);

    return `
      <article class="public-result-card">

        <div class="public-result-head">

          <div>
            <span class="public-result-kicker">
              ${t("resultTitle")}
            </span>

            <h3>${escapeHTML(trackingNumber)}</h3>
          </div>

          <span class="public-status-pill ${getStatusClass(status)}">
            ${escapeHTML(getStatusTranslation(status))}
          </span>

        </div>

        <div class="public-result-meta">

          <div>
            <small>${t("currentStatus")}</small>
            <strong>${escapeHTML(getStatusTranslation(status))}</strong>
          </div>

          <div>
            <small>${t("expected")}</small>
            <strong>${escapeHTML(parcel.date || "—")}</strong>
          </div>

          <div>
            <small>${t("destination")}</small>
            <strong>${escapeHTML(parcel.address || "—")}</strong>
          </div>

          <div>
            <small>${t("recipient")}</small>
            <strong>${escapeHTML(parcel.recipient || parcel.customerName || "—")}</strong>
          </div>

          <div>
            <small>${t("courier")}</small>
            <strong>${escapeHTML(parcel.courier || "—")}</strong>
          </div>

        </div>

        ${renderProgress(status)}

        ${renderHistory(parcel)}

        ${renderProofPhoto(parcel)}

        ${renderMap(parcel)}

      </article>
    `;
  }

  // =====================================================
  // 12. TRACKING ERROR
  // =====================================================

  function renderTrackingError(message, description) {
    return `
      <div class="public-track-error">

        <i class="bi bi-exclamation-circle-fill"></i>

        <div>
          <strong>${escapeHTML(message)}</strong>
          <p>${escapeHTML(description)}</p>
        </div>

      </div>
    `;
  }

  // =====================================================
  // 13. SINGLE PARCEL TRACKING
  // =====================================================

  function renderParcel(trackingNumber) {
    const result = $("#publicTrackingResult");

    if (!result) return;

    const parcel = findParcel(trackingNumber);

    result.classList.add("visible");
    result.dataset.parcelIds = "";

    if (!parcel) {
      result.dataset.parcelId = "";

      result.innerHTML = renderTrackingError(
        t("notFoundTitle"),
        t("notFoundText")
      );

      return;
    }

    result.dataset.parcelId = getTrackingNumber(parcel);

    result.innerHTML = renderParcelCard(parcel);
  }

  // =====================================================
  // 14. MULTIPLE PARCEL TRACKING
  // =====================================================

  function renderMultipleParcels(trackingNumbers) {
    const result = $("#publicTrackingResult");

    if (!result) return;

    result.classList.add("visible");
    result.dataset.parcelId = "";
    result.dataset.parcelIds = JSON.stringify(trackingNumbers);

    const cards = trackingNumbers.map(trackingNumber => {
      const parcel = findParcel(trackingNumber);

      if (!parcel) {
        return renderTrackingError(
          `${trackingNumber}: ${t("notFoundTitle")}`,
          t("notFoundText")
        );
      }

      return renderParcelCard(parcel);
    }).join("");

    result.innerHTML = cards;
  }

  // =====================================================
  // 15. TRACKING FORM
  // =====================================================

  const trackingForm = $("#publicTrackingForm");

  if (trackingForm) {
    trackingForm.addEventListener("submit", event => {
      event.preventDefault();

      const field = $("#publicTrackingInput");
      const result = $("#publicTrackingResult");

      if (!field || !result) {
        console.error("ParcelPro: tracking input or result element missing.");
        return;
      }

      const trackingNumbers = field.value
        .split(/[\s,;]+/)
        .map(value => value.trim())
        .filter(Boolean);

      if (!trackingNumbers.length) {
        field.setCustomValidity(t("invalid"));
        field.reportValidity();
        return;
      }

      field.setCustomValidity("");

      if (trackingNumbers.length > 5) {
        result.classList.add("visible");
        result.dataset.parcelId = "";
        result.dataset.parcelIds = "";

        result.innerHTML = renderTrackingError(
          t("maxTracking"),
          t("multipleHint")
        );

        return;
      }

      if (trackingNumbers.length === 1) {
        renderParcel(trackingNumbers[0]);
      } else {
        renderMultipleParcels(trackingNumbers);
      }
    });
  } else {
    console.error(
      "ParcelPro: #publicTrackingForm was not found. Check index.html."
    );
  }

  // =====================================================
  // 16. LANGUAGE SELECTOR
  // =====================================================

  function applyLanguage() {
    document.documentElement.lang =
      language === "ms" ? "ms" :
      language === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.dataset.i18n;

      if (translations[language]?.[key] !== undefined) {
        element.textContent = t(key);
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    const languageSelect = $("#languageSelect");

    if (languageSelect) {
      languageSelect.value = language;
    }

    const adminLanguageSelect = $("#adminLanguageSelect");

    if (adminLanguageSelect) {
      adminLanguageSelect.value = language;
    }

    const result = $("#publicTrackingResult");

    if (result?.dataset.parcelIds) {
      try {
        const ids = JSON.parse(result.dataset.parcelIds);
        renderMultipleParcels(ids);
      } catch (error) {
        console.error("ParcelPro: unable to refresh multiple tracking results.", error);
      }
    } else if (result?.dataset.parcelId) {
      renderParcel(result.dataset.parcelId);
    }
  }

  function changeLanguage(event) {
    const selectedLanguage = event.target.value;

    if (!translations[selectedLanguage]) return;

    language = selectedLanguage;

    safeStorageWrite(LANGUAGE_KEY, language);

    applyLanguage();
  }

  $("#languageSelect")?.addEventListener("change", changeLanguage);
  $("#adminLanguageSelect")?.addEventListener("change", changeLanguage);

  // =====================================================
  // 17. MOBILE BURGER MENU
  // =====================================================

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  function closeMobileMenu() {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");

    const icon = menuToggle.querySelector("i");

    if (icon) {
      icon.classList.remove("bi-x-lg");
      icon.classList.add("bi-list");
    }
  }

  if (menuToggle && navLinks) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", event => {
      event.preventDefault();

      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));

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

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    // Close menu when user clicks outside the navigation/header.
    document.addEventListener("click", event => {
      const clickedInsideMenu = navLinks.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        closeMobileMenu();
      }
    });

    // Close menu when switching to desktop width.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMobileMenu();
      }
    });

  } else {
    console.warn(
      "ParcelPro: #menuToggle or #navLinks was not found."
    );
  }

  // =====================================================
  // 18. BACK TO PUBLIC HOMEPAGE
  // =====================================================

  $("#backToPublicHome")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // =====================================================
  // 19. LIVE UPDATE FROM ADMIN
  // =====================================================
  // Admin uses parcelpro:dataUpdated after saving changes.
  // This only refreshes the public display.
  // It does not modify parcel records.

  function refreshCurrentTracking() {
    const result = $("#publicTrackingResult");

    if (!result) return;

    if (result.dataset.parcelIds) {
      try {
        const ids = JSON.parse(result.dataset.parcelIds);
        renderMultipleParcels(ids);
      } catch (error) {
        console.error("ParcelPro: tracking refresh failed.", error);
      }

      return;
    }

    if (result.dataset.parcelId) {
      renderParcel(result.dataset.parcelId);
    }
  }

  window.addEventListener("parcelpro:dataUpdated", refreshCurrentTracking);

  document.addEventListener("parcelpro:dataUpdated", refreshCurrentTracking);

  // Refresh when parcel data changes in another browser tab.
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
      refreshCurrentTracking();
    }
  });

  // =====================================================
  // 20. INITIALISE
  // =====================================================

  applyLanguage();

  console.info("ParcelPro public.js loaded successfully.");

  console.info("Tracking form:", Boolean(trackingForm));
  console.info("Mobile menu:", Boolean(menuToggle && navLinks));

})();
