
/* =========================================================
   PARCELPRO - CUSTOMER FEEDBACK SUBMISSION
   Homepage Feedback Form
   Save Customer Feedback to localStorage
   Compatible with customer_feedback.js
========================================================= */

(() => {
  "use strict";

  // =======================================================
  // 1. STORAGE
  // =======================================================

  const STORAGE_KEY = "parcelpro_feedback";

  // =======================================================
  // 2. ELEMENTS
  // =======================================================

  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackName = document.getElementById("feedbackName");
  const feedbackRating = document.getElementById("feedbackRating");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackSuccess = document.getElementById("feedbackSuccess");

  // Check whether feedback form exists
  if (!feedbackForm) {
    console.info(
      "ParcelPro: Feedback form not found. Submission skipped."
    );
    return;
  }

  // =======================================================
  // 3. LOAD EXISTING FEEDBACK
  // =======================================================

  function getFeedbackData() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);

      return Array.isArray(parsedData) ? parsedData : [];

    } catch (error) {
      console.error("Unable to load feedback:", error);
      return [];
    }
  }

  // =======================================================
  // 4. SAVE FEEDBACK
  // =======================================================

  function saveFeedback(feedback) {
    try {
      const allFeedback = getFeedbackData();

      // Add newest feedback at the beginning
      allFeedback.unshift(feedback);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(allFeedback)
      );

      return true;

    } catch (error) {
      console.error("Unable to save feedback:", error);
      return false;
    }
  }

  // =======================================================
  // 5. DISPLAY MESSAGE
  // =======================================================

  function showMessage(message, isSuccess) {
    if (!feedbackSuccess) return;

    feedbackSuccess.textContent = message;

    feedbackSuccess.style.color = isSuccess
      ? "#198754"
      : "#dc3545";
  }

  // =======================================================
  // 6. SUBMIT FEEDBACK
  // =======================================================

  feedbackForm.addEventListener("submit", event => {
    event.preventDefault();

    // Get customer input
    const name = feedbackName.value.trim();
    const rating = feedbackRating.value.trim();
    const message = feedbackMessage.value.trim();

    // Validate required fields
    if (!name || !rating || !message) {
      showMessage(
        "Please complete all feedback fields.",
        false
      );
      return;
    }

    // Create feedback object
    const newFeedback = {
      id: "FB" + Date.now(),
      name: name,
      rating: rating,
      message: message,
      date: new Date().toISOString()
    };

    // Save feedback to localStorage
    const saved = saveFeedback(newFeedback);

    if (!saved) {
      showMessage(
        "Unable to submit feedback. Please try again.",
        false
      );
      return;
    }

    // Reset form after successful submission
    feedbackForm.reset();

    // Display success message
    showMessage(
      "Thank you! Your feedback has been submitted successfully.",
      true
    );

    console.log(
      "ParcelPro feedback submitted:",
      newFeedback
    );

  });

})();
