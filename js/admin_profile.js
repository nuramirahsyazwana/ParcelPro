
/* =========================================================
   PARCELPRO - ADMIN_PROFILE.JS
   Admin Profile Management
   View + Edit + Update Profile + Profile Photo
   Storage: localStorage
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. CHECK SHARED ADMIN
  // =======================================================

  const Admin = window.ParcelProAdmin;

  if (!Admin) {
    console.error(
      "ParcelProAdmin not found. Please load admin_common.js first."
    );
    return;
  }

  const STORAGE = Admin.STORAGE || {};

  const USERS_KEY = STORAGE.users || "parcelpro_users";
  const SESSION_KEY = STORAGE.session || "parcelpro_session";

  const $ = Admin.$ || (selector => document.querySelector(selector));

  // =======================================================
  // 2. DOM ELEMENTS
  // =======================================================

  function findElement(selectors) {
    for (const selector of selectors) {
      const element = $(selector);

      if (element) return element;
    }

    return null;
  }

  const elements = {
    form: findElement([
      "#profileForm",
      "#adminProfileForm"
    ]),

    name: findElement([
      "#profileName",
      "#profileFullName",
      "#adminProfileName",
      "#fullName"
    ]),

    email: findElement([
      "#profileEmail",
      "#adminProfileEmail"
    ]),

    phone: findElement([
      "#profilePhone",
      "#adminProfilePhone",
      "#phoneNumber"
    ]),

    role: findElement([
      "#profileRole",
      "#adminProfileRole"
    ]),

    photoInput: findElement([
      "#profilePhotoInput",
      "#profileImageInput",
      "#profilePhoto",
      'input[type="file"][name*="photo" i]',
      'input[type="file"][name*="image" i]',
      'input[type="file"][id*="photo" i]',
      'input[type="file"][id*="image" i]'
    ]),

    photoPreview: findElement([
      "#profilePreview",
      "#profileImagePreview",
      "#profilePhotoPreview",
      "#profileAvatar",
      "#profileImage",
      ".profile-avatar img"
    ]),

    saveButton: findElement([
      "#saveProfileBtn",
      "#updateProfileBtn",
      "#profileSaveBtn"
    ])
  };

  // =======================================================
  // 3. STORAGE FUNCTIONS
  // =======================================================

  function readStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);

      if (!value) return fallback;

      return JSON.parse(value);
    } catch (error) {
      console.error("Storage read error:", key, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage write error:", key, error);

      showToast(
        "Unable to save data. Storage may be full.",
        "error"
      );

      return false;
    }
  }

  function getUsers() {
    const users = readStorage(USERS_KEY, []);
    return Array.isArray(users) ? users : [];
  }

  // =======================================================
  // 4. CURRENT ADMIN
  // =======================================================

  function getSessionData() {
    return readStorage(SESSION_KEY, null);
  }

  function getCurrentAdmin() {
    // Try shared Admin functions first.
    if (typeof Admin.getCurrentUser === "function") {
      const user = Admin.getCurrentUser();

      if (user && typeof user === "object") {
        return user;
      }
    }

    if (typeof Admin.getCurrentAdmin === "function") {
      const user = Admin.getCurrentAdmin();

      if (user && typeof user === "object") {
        return user;
      }
    }

    if (
      Admin.currentUser &&
      typeof Admin.currentUser === "object"
    ) {
      return Admin.currentUser;
    }

    const session = getSessionData();

    if (!session || typeof session !== "object") {
      return null;
    }

    if (session.user && typeof session.user === "object") {
      return session.user;
    }

    if (
      session.currentUser &&
      typeof session.currentUser === "object"
    ) {
      return session.currentUser;
    }

    if (session.admin && typeof session.admin === "object") {
      return session.admin;
    }

    return session;
  }

  function getUserIdentifier(user) {
    if (!user) return "";

    return (
      user.id ||
      user.userId ||
      user.email ||
      user.username ||
      ""
    );
  }

  // =======================================================
  // 5. HELPER FUNCTIONS
  // =======================================================

  function escapeHTML(value) {
    if (typeof Admin.escapeHTML === "function") {
      return Admin.escapeHTML(value ?? "");
    }

    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function showToast(message, type = "success") {
    if (typeof Admin.toast === "function") {
      Admin.toast(message, type);
    } else {
      console.log(message);
    }
  }

  function getName(user) {
    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.adminName ||
      ""
    );
  }

  function getEmail(user) {
    return user.email || user.adminEmail || "";
  }

  function getPhone(user) {
    return (
      user.phone ||
      user.phoneNumber ||
      user.contactNumber ||
      ""
    );
  }

  function getPhoto(user) {
    return (
      user.profilePhoto ||
      user.avatar ||
      user.photo ||
      user.image ||
      ""
    );
  }

  // =======================================================
  // 6. UPDATE PROFILE DISPLAY
  // =======================================================

  function updateProfileDisplay(user) {
    if (!user) return;

    if (elements.name) {
      elements.name.value = getName(user);
    }

    if (elements.email) {
      elements.email.value = getEmail(user);
    }

    if (elements.phone) {
      elements.phone.value = getPhone(user);
    }

    if (elements.role) {
      elements.role.value =
        user.role ||
        user.accountType ||
        "Administrator";
    }

    const photo = getPhoto(user);

    updatePhotoPreview(photo);
    updateHeaderProfile(user);
  }

  // =======================================================
  // 7. UPDATE PROFILE PHOTO PREVIEW
  // =======================================================

  function updatePhotoPreview(photo) {
    if (!elements.photoPreview || !photo) return;

    const tagName = elements.photoPreview.tagName.toLowerCase();

    if (tagName === "img") {
      elements.photoPreview.src = photo;
      elements.photoPreview.style.display = "block";
      return;
    }

    elements.photoPreview.innerHTML = `
      <img
        src="${escapeHTML(photo)}"
        alt="Admin Profile"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:50%;
        ">
    `;
  }

  // =======================================================
  // 8. UPDATE ADMIN HEADER
  // =======================================================

  function updateHeaderProfile(user) {
    const name = getName(user);
    const photo = getPhoto(user);

    const nameElements = document.querySelectorAll(
      "[data-admin-name], #adminNameDisplay, .admin-name"
    );

    nameElements.forEach(element => {
      element.textContent = name;
    });

    const emailElements = document.querySelectorAll(
      "[data-admin-email], #adminEmailDisplay"
    );

    emailElements.forEach(element => {
      element.textContent = getEmail(user);
    });

    const avatarElements = document.querySelectorAll(
      "[data-admin-avatar], #adminAvatar, .admin-avatar img"
    );

    avatarElements.forEach(element => {
      if (photo && element.tagName.toLowerCase() === "img") {
        element.src = photo;
      }
    });
  }

  // =======================================================
  // 9. PREVIEW NEW PHOTO
  // =======================================================

  function previewPhoto() {
    if (!elements.photoInput) return;

    const file = elements.photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      elements.photoInput.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      updatePhotoPreview(event.target.result);
    };

    reader.onerror = () => {
      showToast("Unable to preview the selected image.", "error");
    };

    reader.readAsDataURL(file);
  }

  // =======================================================
  // 10. COMPRESS PROFILE PHOTO
  // =======================================================

  function compressPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }

      if (!file.type.startsWith("image/")) {
        reject(new Error("Invalid image file."));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          const maxSize = 600;

          let width = image.width;
          let height = image.height;

          if (width > height && width > maxSize) {
            height = Math.round(height * maxSize / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round(width * maxSize / height);
            height = maxSize;
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to process image."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);

          resolve(
            canvas.toDataURL("image/jpeg", 0.8)
          );
        };

        image.onerror = () => {
          reject(new Error("Unable to load image."));
        };

        image.src = reader.result;
      };

      reader.onerror = () => {
        reject(new Error("Unable to read image file."));
      };

      reader.readAsDataURL(file);
    });
  }

  // =======================================================
  // 11. VALIDATE PROFILE
  // =======================================================

  function validateProfile() {
    const name = elements.name
      ? elements.name.value.trim()
      : "";

    const email = elements.email
      ? elements.email.value.trim()
      : "";

    if (!name) {
      showToast("Please enter your name.", "error");
      elements.name?.focus();
      return false;
    }

    if (!email) {
      showToast("Please enter your email address.", "error");
      elements.email?.focus();
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showToast("Please enter a valid email address.", "error");
      elements.email?.focus();
      return false;
    }

    return true;
  }

  // =======================================================
  // 12. UPDATE USER RECORD
  // =======================================================

  function updateUserRecord(updatedUser, oldUser) {
    const users = getUsers();

    const oldId = getUserIdentifier(oldUser);
    const oldEmail = getEmail(oldUser).toLowerCase();

    const index = users.findIndex(user => {
      const sameId =
        oldId &&
        String(getUserIdentifier(user)) === String(oldId);

      const sameEmail =
        oldEmail &&
        getEmail(user).toLowerCase() === oldEmail;

      return sameId || sameEmail;
    });

    if (index === -1) {
      return true;
    }

    users[index] = {
      ...users[index],
      ...updatedUser
    };

    return writeStorage(USERS_KEY, users);
  }

  // =======================================================
  // 13. UPDATE LOGIN SESSION
  // =======================================================

  function updateSession(updatedUser) {
    const session = getSessionData();

    if (!session || typeof session !== "object") {
      return true;
    }

    let updatedSession;

    if (session.user && typeof session.user === "object") {
      updatedSession = {
        ...session,
        user: {
          ...session.user,
          ...updatedUser
        }
      };
    } else if (
      session.currentUser &&
      typeof session.currentUser === "object"
    ) {
      updatedSession = {
        ...session,
        currentUser: {
          ...session.currentUser,
          ...updatedUser
        }
      };
    } else if (
      session.admin &&
      typeof session.admin === "object"
    ) {
      updatedSession = {
        ...session,
        admin: {
          ...session.admin,
          ...updatedUser
        }
      };
    } else {
      updatedSession = {
        ...session,
        ...updatedUser
      };
    }

    return writeStorage(SESSION_KEY, updatedSession);
  }

  // =======================================================
  // 14. SAVE PROFILE
  // =======================================================

  async function saveProfile(event) {
    event.preventDefault();

    if (!validateProfile()) return;

    const currentUser = getCurrentAdmin();

    if (!currentUser) {
      showToast(
        "Unable to identify the current admin account. Please log in again.",
        "error"
      );
      return;
    }

    const newName = elements.name.value.trim();
    const newEmail = elements.email.value.trim().toLowerCase();
    const newPhone = elements.phone
      ? elements.phone.value.trim()
      : getPhone(currentUser);

    const users = getUsers();

    const oldEmail = getEmail(currentUser).toLowerCase();

    const duplicateEmail = users.some(user => {
      const userEmail = getEmail(user).toLowerCase();

      return (
        userEmail === newEmail &&
        userEmail !== oldEmail
      );
    });

    if (duplicateEmail) {
      showToast(
        "This email address is already used by another account.",
        "error"
      );
      return;
    }

    let newPhoto = getPhoto(currentUser);

    try {
      if (
        elements.photoInput &&
        elements.photoInput.files.length > 0
      ) {
        newPhoto = await compressPhoto(
          elements.photoInput.files[0]
        );
      }
    } catch (error) {
      console.error(error);
      showToast(
        "Unable to process the selected profile photo.",
        "error"
      );
      return;
    }

    const updatedUser = {
      ...currentUser,

      name: newName,
      fullName: newName,
      email: newEmail,

      phone: newPhone,
      phoneNumber: newPhone,

      profilePhoto: newPhoto,
      avatar: newPhoto,

      updatedAt: new Date().toISOString()
    };

    // Update registered user record.
    const userSaved = updateUserRecord(
      updatedUser,
      currentUser
    );

    if (!userSaved) return;

    // Update login session.
    const sessionSaved = updateSession(updatedUser);

    if (!sessionSaved) return;

    // Update common admin object when possible.
    if (Admin.currentUser && typeof Admin.currentUser === "object") {
      Object.assign(Admin.currentUser, updatedUser);
    }

    // Update visible profile and header.
    updateProfileDisplay(updatedUser);

    // Notify other admin modules.
    window.dispatchEvent(
      new CustomEvent("parcelpro:dataUpdated", {
        detail: { key: USERS_KEY }
      })
    );

    window.dispatchEvent(
      new CustomEvent("parcelpro:profileUpdated", {
        detail: { user: updatedUser }
      })
    );

    showToast("Admin profile updated successfully.");

    if (elements.photoInput) {
      elements.photoInput.value = "";
    }
  }

  // =======================================================
  // 15. EVENT LISTENERS
  // =======================================================

  function bindEvents() {

    if (elements.form) {
      elements.form.addEventListener(
        "submit",
        saveProfile
      );
    }

    if (elements.photoInput) {
      elements.photoInput.addEventListener(
        "change",
        previewPhoto
      );
    }

    // Listen for profile changes from other admin pages.
    window.addEventListener("parcelpro:profileUpdated", event => {
      if (event.detail?.user) {
        updateProfileDisplay(event.detail.user);
      }
    });
  }

  // =======================================================
  // 16. INITIALISE
  // =======================================================

  function initialise() {
    const currentUser = getCurrentAdmin();

    if (currentUser) {
      updateProfileDisplay(currentUser);
    } else {
      console.warn(
        "Current admin profile could not be loaded."
      );
    }

    bindEvents();

    console.log("ParcelPro Admin Profile loaded.");
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
