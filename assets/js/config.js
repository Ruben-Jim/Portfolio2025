// Firebase Configuration
// Replace with your actual Firebase API key
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaklIEadgb9ZckNGOyr6SDiaZvbOYZqBY",
  authDomain: "portfolio-2578e.firebaseapp.com",
  projectId: "portfolio-2578e",
  storageBucket: "portfolio-2578e.firebasestorage.app",
  messagingSenderId: "980239353589",
  appId: "1:980239353589:web:f61de65bd802c9db5267bc"
};

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: "service_portfolio", // You'll need to create this in EmailJS
  templateId: "portfolio_template", // You'll need to create this in EmailJS
  publicKey: "G0WAMInPaotIyePKR" // You'll get this from EmailJS
};

// Make it available globally
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.EMAILJS_CONFIG = EMAILJS_CONFIG;
