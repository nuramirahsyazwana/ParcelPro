
"use strict";

// ========================================
// PARCELPRO - INTERNATIONAL SHIPPING
// International Enquiry Form
// ========================================

document.addEventListener("DOMContentLoaded", function () {

  // Get form elements
  const form = document.getElementById("internationalForm");
  const message = document.getElementById("internationalMessage");

  // Check whether elements exist
  if (!form || !message) {
    return;
  }

  // Handle form submission
  form.addEventListener("submit", function (event) {

    event.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Display confirmation message
    message.style.display = "block";

    message.textContent =
      "Your enquiry has been recorded in this demo. Please contact ParcelPro to confirm availability and final shipping charges.";

    // Reset form
    form.reset();

    // Scroll to confirmation message
    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  });

});
