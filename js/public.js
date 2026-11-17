/* ParcelPro public homepage: customer tracking + language selector */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);

  // Initialise sample tracking records on first visit, even before the admin page is opened.
  // The admin dashboard uses the same localStorage key and can update these records.
  if (!localStorage.getItem("parcelpro_parcels")) {
    const sampleParcels = [
      {id:"PP1001",recipient:"Aisyah Rahman",phone:"012-345 6789",address:"Shah Alam, Selangor",type:"Small package",date:"2026-11-15",status:"In Transit",courier:"Daniel Lee",created:"2026-11-10"},
      {id:"PP1002",recipient:"Daniel Tan",phone:"013-222 4567",address:"Petaling Jaya, Selangor",type:"Document",date:"2026-11-13",status:"Delivered",courier:"Farid Ahmad",created:"2026-11-09"},
      {id:"PP1003",recipient:"Nur Izzati",phone:"017-888 1234",address:"Bangi, Selangor",type:"Medium package",date:"2026-11-16",status:"Pending",courier:"Not assigned",created:"2026-11-12"},
      {id:"PP1004",recipient:"Muhammad Amir",phone:"016-555 9087",address:"Cyberjaya, Selangor",type:"Large package",date:"2026-11-14",status:"In Transit",courier:"Siti Zulaikha",created:"2026-11-10"},
      {id:"PP1005",recipient:"Lim Wei Jian",phone:"011-333 8765",address:"Kuala Lumpur",type:"Small package",date:"2026-11-12",status:"Delivered",courier:"Daniel Lee",created:"2026-11-08"},
      {id:"PP1006",recipient:"Siti Hajar",phone:"019-777 2345",address:"Putrajaya",type:"Document",date:"2026-11-17",status:"Pending",courier:"Not assigned",created:"2026-11-12"},
      {id:"PP1007",recipient:"Adam Hakim",phone:"014-999 4561",address:"Klang, Selangor",type:"Medium package",date:"2026-11-13",status:"Delivered",courier:"Farid Ahmad",created:"2026-11-07"},
      {id:"PP1008",recipient:"Chong Mei Ling",phone:"012-777 6543",address:"Subang Jaya, Selangor",type:"Small package",date:"2026-11-18",status:"In Transit",courier:"Siti Zulaikha",created:"2026-11-11"}
    ];
    localStorage.setItem("parcelpro_parcels", JSON.stringify(sampleParcels));
  }
  const translations = {
    en: {
      navHome:"HOME",navTrack:"TRACK PARCEL",navServices:"SERVICES",navAbout:"ABOUT US",adminLogin:"ADMIN LOGIN",
      heroEyebrow:"SMARTER DELIVERY, SIMPLER LIFE",heroTitleOne:"Your parcel.",heroTitleTwo:"Our priority.",
      heroSubtitle:"A smoother delivery experience starts here. Track your shipment anytime, anywhere.",
      heroCta:"TRACK YOUR PARCEL",secureTracking:"Easy & secure tracking",realTime:"Status updates",fastReliable:"Fast. Reliable. Convenient.",
      trackHeading:"Where is your parcel?",trackDescription:"Enter your ParcelPro tracking number below.",
      trackingPlaceholder:"ENTER YOUR PARCELPRO TRACKING ID",trackButton:"TRACK",
      trackingNote:"No customer login is required. Just enter your Tracking ID.",
      whyEyebrow:"WHY PARCELPRO",featuresTitle:"Delivery made simple",
      featuresSubtitle:"Everything you need for a more convenient parcel experience.",
      featureOneTitle:"Track with ease",featureOneText:"Check your parcel progress anytime using your unique Tracking ID.",
      featureTwoTitle:"Stay updated",featureTwoText:"See the latest delivery status and expected arrival information.",
      featureThreeTitle:"Reliable handling",featureThreeText:"Your shipment details are organised throughout its delivery journey.",
      bannerEyebrow:"PARCEL DELIVERY MANAGEMENT",bannerTitle:"Delivering Smarter, Tracking Easier.",
      bannerText:"ParcelPro keeps your delivery journey simple and clear.",rights:"All rights reserved.",
      footerTagline:"Delivering Smarter, Tracking Easier.",backHome:"Back to homepage",
      notFoundTitle:"Tracking ID not found",notFoundText:"Please check your Tracking ID and try again.",
      resultTitle:"Shipment tracking details",currentStatus:"CURRENT STATUS",expected:"EXPECTED DELIVERY",
      destination:"DESTINATION",progress:"DELIVERY PROGRESS",pending:"Pending",transit:"In Transit",delivered:"Delivered",
      received:"Parcel received",processing:"Processing",outForDelivery:"Out of Delivery",unknownDate:"Status updated by ParcelPro",
      invalid:"Please enter a Tracking ID.",
      adminDashboard:"Dashboard",adminParcelManagement:"Parcel Management",adminParcelTracking:"Parcel Tracking",adminCustomers:"Customers",adminDeliveryManagement:"Delivery Management",adminProfile:"My Profile",adminLogout:"Log out",adminWorkspace:"WORKSPACE",adminPreferences:"PREFERENCES"
    },
    ms: {
      navHome:"LAMAN UTAMA",navTrack:"JEJAK PARCEL",navServices:"PERKHIDMATAN",navAbout:"TENTANG KAMI",adminLogin:"LOG MASUK ADMIN",
      heroEyebrow:"PENGHANTARAN LEBIH BIJAK, HIDUP LEBIH MUDAH",heroTitleOne:"Parcel anda.",heroTitleTwo:"Keutamaan kami.",
      heroSubtitle:"Nikmati pengalaman penghantaran yang lebih mudah. Jejak kiriman anda bila-bila masa dan di mana sahaja.",
      heroCta:"JEJAK PARCEL ANDA",secureTracking:"Penjejakan mudah dan selamat",realTime:"Kemaskini status",fastReliable:"Pantas. Dipercayai. Mudah.",
      trackHeading:"Di manakah parcel anda?",trackDescription:"Masukkan nombor penjejakan ParcelPro anda di bawah.",
      trackingPlaceholder:"MASUKKAN ID PENJEJAKAN PARCELPRO",trackButton:"JEJAK",
      trackingNote:"Pelanggan tidak perlu log masuk. Hanya masukkan ID Penjejakan anda.",
      whyEyebrow:"MENGAPA PARCELPRO",featuresTitle:"Penghantaran lebih mudah",
      featuresSubtitle:"Semua yang anda perlukan untuk pengalaman penghantaran yang lebih mudah.",
      featureOneTitle:"Jejak dengan mudah",featureOneText:"Semak perkembangan parcel anda pada bila-bila masa menggunakan ID Penjejakan.",
      featureTwoTitle:"Sentiasa dikemaskini",featureTwoText:"Lihat status penghantaran terkini dan maklumat jangkaan ketibaan.",
      featureThreeTitle:"Pengendalian dipercayai",featureThreeText:"Maklumat kiriman anda disusun sepanjang proses penghantaran.",
      bannerEyebrow:"SISTEM PENGURUSAN PENGHANTARAN PARCEL",bannerTitle:"Penghantaran Lebih Bijak, Penjejakan Lebih Mudah.",
      bannerText:"ParcelPro menjadikan perjalanan penghantaran anda lebih mudah dan jelas.",rights:"Hak cipta terpelihara.",
      footerTagline:"Penghantaran Lebih Bijak, Penjejakan Lebih Mudah.",backHome:"Kembali ke laman utama",
      notFoundTitle:"ID Penjejakan tidak ditemui",notFoundText:"Sila semak ID Penjejakan anda dan cuba sekali lagi.",
      resultTitle:"Maklumat penjejakan kiriman",currentStatus:"STATUS TERKINI",expected:"JANGKAAN PENGHANTARAN",
      destination:"DESTINASI",progress:"PROSES PENGHANTARAN",pending:"Menunggu",transit:"Dalam penghantaran",delivered:"Telah dihantar",
      received:"Parcel diterima",processing:"Sedang diproses",outForDelivery:"Dalam proses penghantaran",unknownDate:"Status dikemaskini oleh ParcelPro",
      invalid:"Sila masukkan ID Penjejakan.",
      adminDashboard:"Papan Pemuka",adminParcelManagement:"Pengurusan Parcel",adminParcelTracking:"Penjejakan Parcel",adminCustomers:"Pelanggan",adminDeliveryManagement:"Pengurusan Penghantaran",adminProfile:"Profil Saya",adminLogout:"Log Keluar",adminWorkspace:"RUANG KERJA",adminPreferences:"PREFERENSI"
    },
    zh: {
      navHome:"首页",navTrack:"查询包裹",navServices:"服务",navAbout:"关于我们",adminLogin:"管理员登录",
      heroEyebrow:"更智能的配送，更轻松的生活",heroTitleOne:"您的包裹。",heroTitleTwo:"我们的优先事项。",
      heroSubtitle:"从这里开始享受更轻松的配送体验。随时随地查询您的包裹。",
      heroCta:"查询您的包裹",secureTracking:"简单安全的查询",realTime:"状态更新",fastReliable:"快速。可靠。便捷。",
      trackHeading:"您的包裹在哪里？",trackDescription:"请在下方输入您的 ParcelPro 查询号码。",
      trackingPlaceholder:"输入 PARCELPRO 查询号码",trackButton:"查询",
      trackingNote:"客户无需登录，只需输入您的查询号码。",
      whyEyebrow:"为什么选择 PARCELPRO",featuresTitle:"让配送更简单",
      featuresSubtitle:"为您提供更方便的包裹配送体验。",
      featureOneTitle:"轻松查询",featureOneText:"使用专属查询号码，随时查看包裹进度。",
      featureTwoTitle:"及时更新",featureTwoText:"查看最新配送状态和预计送达信息。",
      featureThreeTitle:"可靠处理",featureThreeText:"在整个配送过程中妥善整理您的包裹信息。",
      bannerEyebrow:"包裹配送管理系统",bannerTitle:"智能配送，轻松查询。",
      bannerText:"ParcelPro 让您的配送过程简单明了。",rights:"版权所有。",
      footerTagline:"智能配送，轻松查询。",backHome:"返回首页",
      notFoundTitle:"找不到查询号码",notFoundText:"请检查您的查询号码并重试。",
      resultTitle:"包裹查询详情",currentStatus:"当前状态",expected:"预计送达",
      destination:"目的地",progress:"配送进度",pending:"等待处理",transit:"运输中",delivered:"已送达",
      received:"已收到包裹",processing:"处理中",outForDelivery:"派送中",unknownDate:"ParcelPro 已更新状态",
      invalid:"请输入查询号码。",
      adminDashboard:"控制面板",adminParcelManagement:"包裹管理",adminParcelTracking:"包裹查询",adminCustomers:"客户",adminDeliveryManagement:"配送管理",adminProfile:"我的资料",adminLogout:"退出登录",adminWorkspace:"工作区",adminPreferences:"偏好设置"
    }
  };
  let language = localStorage.getItem("parcelpro_language") || "en";
  const t = (key) => translations[language]?.[key] || translations.en[key] || key;
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));


  // Read parcel data safely so malformed browser storage does not stop tracking.
  function readParcels() {
    try {
      const value = JSON.parse(localStorage.getItem("parcelpro_parcels") || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error("ParcelPro: parcel data could not be read from localStorage.", error);
      return [];
    }
  }

  function applyLanguage() {
    document.documentElement.lang = language === "ms" ? "ms" : language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (t(key)) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    const select = $("#languageSelect");
    if (select) select.value = language;
    const adminSelect = $("#adminLanguageSelect");
    if (adminSelect) adminSelect.value = language;
    const result = $("#publicTrackingResult");
    if (result?.dataset.parcelId) renderParcel(result.dataset.parcelId);
  }

  function statusLabel(status) {
    if (status === "Delivered") return t("delivered");
    if (status === "In Transit") return t("transit");
    if (status === "Out of Delivery") return t("outForDelivery");
    return t("pending");
  }

  function renderParcel(id) {
    const result = $("#publicTrackingResult");
    const parcels = readParcels();
    const parcel = parcels.find(item => String(item.id).toUpperCase() === id.toUpperCase());
    result.classList.add("visible");
    if (!parcel) {
      result.dataset.parcelId = "";
      result.innerHTML = `<div class="public-track-error"><i class="bi bi-exclamation-circle-fill"></i><div><strong>${t("notFoundTitle")}</strong><p>${t("notFoundText")}</p></div></div>`;
      return;
    }
    result.dataset.parcelId = parcel.id;
    const stages = ["Pending", "In Transit", "Out of Delivery","Delivered"];
    const current = stages.indexOf(parcel.status);
    const stageNames = [t("pending"),t("transit"),t("outForDelivery"),t("delivered")];
    const timeline = stages.map((stage,index) => {
      const done = index <= current;
      return `<div class="public-timeline-step ${done ? "done" : ""} ${index===current ? "current" : ""}">
        <span class="public-timeline-icon"><i class="bi ${index===0?"bi-box-seam":index===1?"bi-truck":index===2?"bi-geo-alt":"bi-check-lg"}"></i></span>
        <strong>${stageNames[index]}</strong><small>${done ? t("unknownDate") : "—"}</small>
      </div>`;
    }).join("");
    result.innerHTML = `<article class="public-result-card">
      <div class="public-result-head"><div><span class="public-result-kicker">${t("resultTitle")}</span><h3>${escapeHTML(parcel.id)}</h3></div><span class="public-status-pill ${parcel.status==="Delivered"?"is-delivered":(parcel.status==="In Transit"||parcel.status==="Out of Delivery")?"is-transit":"is-pending"}">${statusLabel(parcel.status)}</span></div>
      <div class="public-result-meta">
        <div><small>${t("currentStatus")}</small><strong>${statusLabel(parcel.status)}</strong></div>
        <div><small>${t("expected")}</small><strong>${escapeHTML(parcel.date || "—")}</strong></div>
        <div><small>${t("destination")}</small><strong>${escapeHTML(parcel.address || "—")}</strong></div>
      </div>
      <div class="public-progress-title">${t("progress")}</div><div class="public-timeline">${timeline}</div>
      ${parcel.proofPhoto?`<div class="mt-3"><strong>Delivery proof photo</strong><br><img class="proof-photo" src="${parcel.proofPhoto}" alt="Delivery proof photo"></div>`:""}
      <iframe class="public-map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(parcel.address||"Malaysia")}&output=embed" title="Parcel destination map"></iframe>
      <a class="small d-inline-block mt-2" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parcel.address||"Malaysia")}">Open location in Google Maps</a>
    </article>`;
  }

  const trackingForm = $("#publicTrackingForm");
  if (!trackingForm) {
    console.error("ParcelPro tracking: #publicTrackingForm was not found. Check index.html.");
  } else {
    trackingForm.addEventListener("submit", event => {
    event.preventDefault();
    const field = $("#publicTrackingInput");
    const result = $("#publicTrackingResult");
    if (!field || !result) { console.error("ParcelPro tracking input/result element is missing."); return; }
    const ids = field.value.split(/[\s,;]+/).map(value => value.trim()).filter(Boolean);
    if (!ids.length) { field.setCustomValidity(t("invalid")); field.reportValidity(); return; }
    field.setCustomValidity("");
    if (ids.length > 5) {
      result.classList.add("visible");
      result.innerHTML = `<div class="public-track-error"><i class="bi bi-exclamation-circle-fill"></i><div><strong>Please enter no more than 5 tracking numbers.</strong><p>Separate each tracking number with a comma or a space.</p></div></div>`;
      return;
    }
    if (ids.length === 1) { renderParcel(ids[0].toUpperCase()); return; }
    result.classList.add("visible");
    result.dataset.parcelId = "";
    const parcels = readParcels();
    result.innerHTML = ids.map(id => {
      const safeId = escapeHTML(id.toUpperCase());
      const parcel = parcels.find(item => String(item.id).toUpperCase() === id.toUpperCase());
      if (!parcel) return `<div class="public-track-error mb-2"><i class="bi bi-exclamation-circle-fill"></i><div><strong>${safeId}: ${t("notFoundTitle")}</strong><p>${t("notFoundText")}</p></div></div>`;
      const status = escapeHTML(statusLabel(parcel.status));
      return `<article class="public-result-card mb-2"><div class="public-result-head"><div><span class="public-result-kicker">TRACKING NUMBER</span><h3>${safeId}</h3></div><span class="public-status-pill ${parcel.status==="Delivered"?"is-delivered":(parcel.status==="In Transit"||parcel.status==="Out of Delivery")?"is-transit":"is-pending"}">${status}</span></div><div class="public-result-meta"><div><small>EXPECTED DELIVERY</small><strong>${escapeHTML(parcel.date || "—")}</strong></div><div><small>DESTINATION</small><strong>${escapeHTML(parcel.address || "—")}</strong></div><div><small>RECIPIENT</small><strong>${escapeHTML(parcel.recipient || "—")}</strong></div></div></article>`;
    }).join("");
    });
  }
  console.info("ParcelPro public.js loaded. Tracking form:", Boolean(trackingForm));
  // Admin login is a separate page (admin.html); the homepage link navigates there.
  $("#backToPublicHome")?.addEventListener("click", () => { window.location.href = "index.html"; });
  $("#publicMenuToggle")?.addEventListener("click", () => $("#publicNav").classList.toggle("open"));
  $("#publicNav")?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => $("#publicNav").classList.remove("open")));
  function changeLanguage(event) {
    language = event.target.value;
    localStorage.setItem("parcelpro_language", language);
    applyLanguage();
  }
  $("#languageSelect")?.addEventListener("change", changeLanguage);
  $("#adminLanguageSelect")?.addEventListener("change", changeLanguage);
  applyLanguage();
})();