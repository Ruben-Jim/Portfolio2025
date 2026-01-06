---
name: Admin Message Center Implementation with Config
overview: Add a secure admin dashboard to the portfolio using Firebase Auth and Firestore to view, manage, and reply to contact form messages. Configuration will be managed in assets/js/config.js.
todos:
  - id: admin-html
    content: Add Firebase SDK and Admin HTML structure to index.html
    status: completed
  - id: admin-init
    content: Initialize Firebase and Auth in script.js
    status: completed
  - id: firestore-save
    content: Implement contact form saving to Firestore
    status: completed
  - id: admin-auth
    content: Build Admin Login/Logout functionality
    status: completed
  - id: admin-dashboard-logic
    content: Implement message fetching and real-time dashboard UI
    status: completed
  - id: admin-styles
    content: Add styling for Admin components in style.css
    status: completed
  - id: admin-reply
    content: Implement reply functionality via EmailJS and Firestore update
    status: completed
---

# Admin Message Center Implementation Plan

Implement a secure backend using Firebase to capture contact inquiries and provide an admin interface for replying.

## Prerequisites

- Firebase project with Authentication (Email/Password) and Firestore enabled
- EmailJS service configured with templates for notifications and replies
- Admin account created in Firebase Authentication

## Implementation Steps

### 1. Configuration & Firebase Initialization

- Use existing Firebase credentials in [`assets/js/config.js`](assets/js/config.js)
- Add Firebase SDK v9 (modular) scripts to [`index.html`](index.html)
- Initialize Firebase App, Auth, and Firestore in [`assets/js/script.js`](assets/js/script.js)

### 2. Admin UI Structure

- Create `<article data-page="admin" class="admin-page">` in [`index.html`](index.html):
- **Login View**: Email/password form with error display
- **Dashboard View**: Message list with status badges, reply buttons, and logout
- **Reply Modal**: Compose and send replies with EmailJS

### 3. Data Flow & Backend Logic

- **Contact Form**: Update submission logic to save to Firestore `messages` collection
- **Authentication**: Handle login/logout with Firebase Auth state changes
- **Dashboard**: Fetch and display messages sorted by timestamp (newest first)
- **Replying**: Send styled emails via EmailJS and update message status in Firestore

### 4. Styling & UX

- Add admin-specific styles to [`assets/css/style.css`](assets/css/style.css)
- Responsive design matching portfolio theme (dark with yellow accents)
- Loading states, error handling, and smooth transitions

### 5. Security & Testing

- Password-protected admin access
- Input validation and sanitization
- Test email sending and database operations
- Error handling for network issues

---

## Implementation Todos

- [ ] Add Firebase SDK and Admin HTML structure to index.html | id: admin-html
- [ ] Initialize Firebase and Auth in script.js | id: admin-init
- [ ] Implement contact form saving to Firestore | id: firestore-save
- [ ] Build Admin Login/Logout functionality | id: admin-auth
- [ ] Implement message fetching and real-time dashboard UI | id: admin-dashboard-logic
- [ ] Add styling for Admin components in style.css | id: admin-styles