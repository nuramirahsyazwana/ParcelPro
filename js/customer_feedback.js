
/* =========================================================
   PARCELPRO - CUSTOMER FEEDBACK
   Display Customer Reviews
   Search + Rating Filter + Summary
   Storage: localStorage
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

  const $ = id => document.getElementById(id);

  const totalFeedback = $("totalFeedback");
  const averageRating = $("averageRating");
  const averageStars = $("averageStars");

  const feedbackSearch = $("feedbackSearch");
  const feedbackFilter = $("feedbackFilter");
  const feedbackCount = $("feedbackCount");
  const feedbackList = $("feedbackList");

  if (!feedbackList) {
    console.error("Customer feedback list element not found.");
    return;
  }

  // =======================================================
  // 3. RATING CONVERSION
  // =======================================================

  function getRatingValue(rating) {
    const value = String(rating || "").trim().toLowerCase();

    const ratings = {
      excellent: 5,
      good: 4,
      average: 3,
      poor: 2
    };

    if (ratings[value]) return ratings[value];

    const number = Number(rating);

    if (Number.isFinite(number) && number >= 1 && number <= 5) {
      return number;
    }

    return 0;
  }

  function getRatingLabel(rating) {
    const value = String(rating || "").trim().toLowerCase();

    const labels = {
      excellent: "Excellent",
      good: "Good",
      average: "Average",
      poor: "Poor"
    };

    if (labels[value]) return labels[value];

    const number = getRatingValue(rating);

    const numericLabels = {
      5: "Excellent",
      4: "Good",
      3: "Average",
      2: "Poor",
      1: "Poor"
    };

    return numericLabels[number] || "Not Rated";
  }

  function createStars(rating) {
    const number = getRatingValue(rating);

    return "★".repeat(number) + "☆".repeat(5 - number);
  }

  // =======================================================
  // 4. SECURITY - ESCAPE HTML
  // =======================================================

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[char];
    });
  }

  // =======================================================
  // 5. LOAD FEEDBACK FROM LOCAL STORAGE
  // =======================================================

  function getFeedbackData() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);

      if (!Array.isArray(parsedData)) return [];

      return parsedData.filter(item =>
        item &&
        typeof item === "object" &&
        item.name &&
        item.message
      );

    } catch (error) {
      console.error("Unable to load customer feedback:", error);
      return [];
    }
  }

  // =======================================================
  // 6. FORMAT DATE
  // =======================================================

  function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-MY", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // =======================================================
  // 7. UPDATE FEEDBACK SUMMARY
  // =======================================================

  function updateSummary(feedback) {
    const total = feedback.length;

    if (totalFeedback) {
      totalFeedback.textContent = total;
    }

    const ratedFeedback = feedback.filter(item =>
      getRatingValue(item.rating) > 0
    );

    if (ratedFeedback.length === 0) {
      if (averageRating) {
        averageRating.textContent = "0.0";
      }

      if (averageStars) {
        averageStars.textContent = "☆☆☆☆☆";
      }

      return;
    }

    const totalRating = ratedFeedback.reduce((sum, item) => {
      return sum + getRatingValue(item.rating);
    }, 0);

    const average = totalRating / ratedFeedback.length;

    if (averageRating) {
      averageRating.textContent = average.toFixed(1);
    }

    if (averageStars) {
      const roundedAverage = Math.round(average);

      averageStars.textContent =
        "★".repeat(roundedAverage) +
        "☆".repeat(5 - roundedAverage);
    }
  }

  // =======================================================
  // 8. DISPLAY EMPTY STATE
  // =======================================================

  function showEmptyState(title, message) {
    feedbackList.innerHTML = `
      <div class="empty-review">
        <i class="bi bi-chat-square-text"></i>

        <h5>${escapeHTML(title)}</h5>

        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  // =======================================================
  // 9. DISPLAY FEEDBACK CARDS
  // =======================================================

  function renderFeedbackCards(feedback) {
    if (feedback.length === 0) {
      showEmptyState(
        "No Customer Feedback Yet",
        "Customer feedback will appear here after submission."
      );

      return;
    }

    feedbackList.innerHTML = feedback.map(item => {
      const name = escapeHTML(item.name);
      const message = escapeHTML(item.message);

      const ratingLabel = escapeHTML(
        getRatingLabel(item.rating)
      );

      const stars = createStars(item.rating);

      const date = escapeHTML(
        formatDate(item.date)
      );

      const initial = escapeHTML(
        String(item.name).trim().charAt(0).toUpperCase() || "C"
      );

      return `
        <article class="review-card">

          <div class="review-top">

            <div class="review-avatar">
              ${initial}
            </div>

            <div class="review-customer">

              <div class="review-name">
                ${name}
              </div>

              <div class="review-date">
                <i class="bi bi-calendar3"></i>
                ${date}
              </div>

            </div>

            <span class="review-rating">
              ${ratingLabel}
            </span>

          </div>

          <div class="review-stars">
            ${stars}
          </div>

          <p class="review-message">
            ${message}
          </p>

          <div class="review-bottom">
            <i class="bi bi-heart-fill"></i>
            Shared a ParcelPro experience
          </div>

        </article>
      `;

    }).join("");
  }

  // =======================================================
  // 10. SEARCH AND RATING FILTER
  // =======================================================

  function filterFeedback() {
    const allFeedback = getFeedbackData();

    const searchText = (
      feedbackSearch?.value || ""
    ).trim().toLowerCase();

    const selectedRating = (
      feedbackFilter?.value || "all"
    ).toLowerCase();

    const filteredFeedback = allFeedback.filter(item => {

      const name = String(item.name || "").toLowerCase();

      const message = String(item.message || "").toLowerCase();

      const rating = getRatingLabel(item.rating).toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        message.includes(searchText);

      const matchesRating =
        selectedRating === "all" ||
        rating === selectedRating;

      return matchesSearch && matchesRating;
    });

    if (feedbackCount) {
      feedbackCount.textContent =
        `Showing ${filteredFeedback.length} of ${allFeedback.length} reviews`;
    }

    renderFeedbackCards(filteredFeedback);
  }

  // =======================================================
  // 11. LOAD ALL FEEDBACK
  // =======================================================

  function loadFeedback() {
    const feedback = getFeedbackData();

    updateSummary(feedback);

    filterFeedback();
  }

  // =======================================================
  // 12. EVENT LISTENERS
  // =======================================================

  if (feedbackSearch) {
    feedbackSearch.addEventListener("input", filterFeedback);
  }

  if (feedbackFilter) {
    feedbackFilter.addEventListener("change", filterFeedback);
  }

  // Refresh when localStorage changes in another browser tab
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
      loadFeedback();
    }
  });

  // =======================================================
  // 13. INITIALIZE
  // =======================================================

  loadFeedback();

})();
