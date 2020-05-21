const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router
  .route('/')
  .get(
    bookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview
  );
router
  .route('/tour/:slug')
  .get(authController.isLoggedIn, viewController.getTour);
router
  .route('/login')
  .get(authController.isLoggedIn, viewController.getLoginForm);

router.route('/me').get(authController.protect, viewController.getCurrentUser);
router
  .route('/my-bookings')
  .get(authController.protect, viewController.getMyBookings);

router
  .route('/submit-user-data')
  .post(authController.protect, viewController.updateCurrentUser);

module.exports = router;
