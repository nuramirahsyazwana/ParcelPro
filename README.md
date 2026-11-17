
# ParcelPro: Parcel Delivery Management System

## Project Overview

ParcelPro is a parcel delivery management website designed to provide users with an easy and convenient way to access parcel delivery services. The system includes a public website, customer portal and admin management system.

## Main Features

### 1. Public Website
- Homepage with ParcelPro information and navigation.
- Parcel tracking interface.
- International shipping information.
- Frequently Asked Questions (FAQ).
- Customer feedback submission.
- Customer feedback display, search and rating filter.
- Terms of Use and Privacy Policy pages.

### 2. Customer Portal
- Customer login and registration interface.
- Customer dashboard.
- Parcel-related information.
- Shipping fee estimation.
- Customer profile management.

### 3. Admin Management System
- Admin login and dashboard.
- Parcel management.
- Parcel tracking management.
- Customer management.
- Delivery management.
- Admin profile management.
- Dashboard data visualisation.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3.3
- Bootstrap Icons
- Chart.js
- Browser Local Storage

## Project Structure

```text
ParcelPro/
│
├── index.html
├── user.html
├── international.html
├── faq.html
├── customer_feedback.html
├── terms.html
├── privacy.html
│
├── admin/
│   ├── admin.html
│   ├── admin_parcels.html
│   ├── admin_tracking.html
│   ├── admin_customers.html
│   ├── admin_deliveries.html
│   └── admin_profile.html
│
├── css/
│   ├── style.css
│   └── public-refresh.css
│
├── js/
│   ├── admin.js
│   ├── admin_common.js
│   ├── admin_customers.js
│   ├── admin_deliveries.js
│   ├── admin_parcels.js
│   ├── admin_profile.js
│   ├── admin_tracking.js
│   ├── customer_feedback.js
│   ├── customer_feedback_submit.js
│   ├── homepage.js
│   ├── international.js
│   ├── my_profile.js
│   ├── public.js
│   ├── shipping.js
│   └── user.js
│
└── assets/
    ├── favicon.svg
    └── images/
```

## How to Run the Project

1. Download or clone the ParcelPro repository.
2. Open the project folder using Visual Studio Code.
3. Install the Live Server extension.
4. Right-click on `index.html`.
5. Select **Open with Live Server**.
6. The ParcelPro website will open in your browser.

## GitHub Pages Deployment

ParcelPro can be published using GitHub Pages.

1. Upload all project files to a GitHub repository.
2. Open the repository settings.
3. Select **Pages**.
4. Under Build and Deployment, select **Deploy from a branch**.
5. Choose the `main` branch.
6. Select `/ (root)` as the folder.
7. Click **Save**.
8. Wait for GitHub Pages to publish the website.

The website can then be accessed using the GitHub Pages URL.

## Data Storage

ParcelPro uses browser Local Storage to store certain information and user interactions.

Please note:
- Local Storage data is saved in the user's browser.
- Data is not automatically shared between different devices.
- Clearing browser data may remove stored information.
- A backend database is required for centralised data management.

## Project Information

**Project Name:** ParcelPro  
**Project Type:** Parcel Delivery Management Website  
**Main File:** index.html  
**Deployment Platform:** GitHub Pages