
/* =========================================================
   PARCELPRO - MY_PROFILE.JS
   Admin Profile Management
   Profile Update + Password Change
   Storage: localStorage
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. STORAGE KEYS
  // =======================================================

  const STORAGE = {
    users: "parcelpro_users",
    session: "parcelpro_session"
  };

  // =======================================================
  // 2. ELEMENT HELPER
  // =======================================================

  const $ = id => document.getElementById(id);

  const profileForm = $("profileForm");
  const passwordForm = $("passwordForm");

  // =======================================================
  // 3. STORAGE HELPER
  // =======================================================

  function readStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error("Storage read error:", error);
      return fallback;
    }
  }

  function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  // =======================================================
  // 4. CURRENT ADMIN
  // =======================================================

  let currentSession = readStorage(STORAGE.session);
  let currentUser = null;

  function getCurrentUser() {
    const users = readStorage(STORAGE.users, []);

    if (!Array.isArray(users) || !currentSession) {
      return null;
    }

    return users.find(user =>
      (
        currentSession.id &&
        String(user.id) === String(currentSession.id)
      ) ||
      (
        normalizeEmail(user.email) ===
        normalizeEmail(currentSession.email)
      )
    ) || null;
  }

  // =======================================================
  // 5. NOTIFICATION
  // =======================================================

  function showMessage(message, type = "success") {
    const toast = $("appToast");
    const toastMessage = $("toastMessage");

    if (window.ParcelProAdmin &&
        typeof window.ParcelProAdmin.toast === "function") {
      window.ParcelProAdmin.toast(message, type);
      return;
    }

    if (!toast || !toastMessage) {
      alert(message);
      return;
    }

    toastMessage.textContent = message;
    toast.className = "app-toast show " + type;

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // =======================================================
  // 6. UPDATE PROFILE DISPLAY
  // =======================================================

  function updateProfileDisplay(user) {
    if (!user) return;

    const name = user.name || "Administrator";
    const email = user.email || "";
    const role = user.role || "admin";

    if ($("profileDisplayName")) {
      $("profileDisplayName").textContent = name;
    }

    if ($("profileDisplayEmail")) {
      $("profileDisplayEmail").textContent = email;
    }

    if ($("profileDisplayRole")) {
      $("profileDisplayRole").textContent =
        role.charAt(0).toUpperCase() + role.slice(1);
    }

    if ($("profileName")) {
      $("profileName").value = name;
    }

    if ($("profileEmail")) {
      $("profileEmail").value = email;
    }

    if ($("profileRole")) {
      $("profileRole").value =
        role.charAt(0).toUpperCase() + role.slice(1);
    }

    const avatar = $("profileAvatar");

    if (avatar) {
      avatar.textContent = name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }

    // Update shared admin header
    if (window.ParcelProAdmin &&
        typeof window.ParcelProAdmin.updateUserUI === "function") {
      window.ParcelProAdmin.updateUserUI();
    } else {
      if ($("adminName")) {
        $("adminName").textContent = name;
      }

      if ($("adminEmail")) {
        $("adminEmail").textContent = email;
      }

      if ($("adminAvatar")) {
        $("adminAvatar").textContent =
          name.charAt(0).toUpperCase();
      }
    }
  }

  // =======================================================
  // 7. SAVE PROFILE
  // =======================================================

  function handleProfileUpdate(event) {
    event.preventDefault();

    const name = $("profileName").value.trim();
    const email = normalizeEmail($("profileEmail").value);

    if (!name || !email) {
      showMessage("Please complete all required fields.", "error");
      return;
    }

    const users = readStorage(STORAGE.users, []);

    if (!Array.isArray(users)) {
      showMessage("Unable to load administrator accounts.", "error");
      return;
    }

    const duplicateEmail = users.find(user =>
      normalizeEmail(user.email) === email &&
      String(user.id) !== String(currentUser.id)
    );

    if (duplicateEmail) {
      showMessage("This email address is already registered.", "error");
      return;
    }

    const userIndex = users.findIndex(user =>
      currentUser.id
        ? String(user.id) === String(currentUser.id)
        : normalizeEmail(user.email) ===
          normalizeEmail(currentUser.email)
    );

    if (userIndex === -1) {
      showMessage("Administrator account not found.", "error");
      return;
    }

    // Preserve existing user properties
    users[userIndex] = {
      ...users[userIndex],
      name,
      email
    };

    saveStorage(STORAGE.users, users);

    // Update login session
    currentSession = {
      ...currentSession,
      id: users[userIndex].id,
      name,
      email,
      photo: users[userIndex].photo || ""
    };

    saveStorage(STORAGE.session, currentSession);

    currentUser = users[userIndex];

    updateProfileDisplay(currentUser);

    window.dispatchEvent(new Event("dataUpdated"));

    showMessage("Profile updated successfully!", "success");
  }

  // =======================================================
  // 8. CHANGE PASSWORD
  // =======================================================

  function handlePasswordUpdate(event) {
    event.preventDefault();

    const currentPassword = $("currentPassword").value;
    const newPassword = $("newPassword").value;
    const confirmPassword = $("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage("Please complete all password fields.", "error");
      return;
    }

    if (currentPassword !== currentUser.password) {
      showMessage("Your current password is incorrect.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("New password must contain at least 6 characters.", "error");
      return;
    }

    if (newPassword === currentPassword) {
      showMessage("Please choose a different password.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match.", "error");
      return;
    }

    const users = readStorage(STORAGE.users, []);

    const userIndex = users.findIndex(user =>
      currentUser.id
        ? String(user.id) === String(currentUser.id)
        : normalizeEmail(user.email) ===
          normalizeEmail(currentUser.email)
    );

    if (userIndex === -1) {
      showMessage("Administrator account not found.", "error");
      return;
    }

    // Update password while preserving other properties
    users[userIndex] = {
      ...users[userIndex],
      password: newPassword
    };

    saveStorage(STORAGE.users, users);

    currentUser = users[userIndex];

    passwordForm.reset();

    showMessage("Password changed successfully!", "success");
  }

  // =======================================================
  // 9. RESET PROFILE FORM
  // =======================================================

  if ($("resetProfileButton")) {
    $("resetProfileButton").addEventListener("click", () => {
      setTimeout(() => {
        updateProfileDisplay(currentUser);
      }, 0);
    });
  }

  // =======================================================
  // 10. SIDEBAR TOGGLE
  // =======================================================

  function setupSidebar() {
    const toggle = $("sidebarToggle");
    const sidebar = $("adminSidebar");
    const shell = $("appShell");

    if (!toggle) return;

    toggle.addEventListener("click", () => {
      if (shell) {
        shell.classList.toggle("sidebar-collapsed");
      }

      if (sidebar) {
        sidebar.classList.toggle("active");
      }
    });
  }

  // =======================================================
  // 11. INITIALIZE PAGE
  // =======================================================

  function init() {

    // Check admin session
    if (window.ParcelProAdmin &&
        typeof window.ParcelProAdmin.requireAdmin === "function") {

      if (!window.ParcelProAdmin.requireAdmin()) {
        return;
      }
    }

    currentSession = readStorage(STORAGE.session);
    currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      alert("Please login using an administrator account.");
      window.location.href = "admin.html";
      return;
    }

    // Display profile
    updateProfileDisplay(currentUser);

    // Profile form
    if (profileForm) {
      profileForm.addEventListener("submit", handleProfileUpdate);
    }

    // Password form
    if (passwordForm) {
      passwordForm.addEventListener("submit", handlePasswordUpdate);
    }

    // Sidebar
    setupSidebar();

    console.log("ParcelPro My Profile initialized successfully.");
  }

  // =======================================================
  // 12. START
  // =======================================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
