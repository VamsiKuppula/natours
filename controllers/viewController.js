const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get tours data from collection
  const tours = await Tour.find();

  // 2. Build template
  // 3. Render the template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get tour data from collection
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    next(
      new AppError(`The is no tour with the name: ${req.params.slug}.`, 404)
    );
  }

  // 2. Build template
  // 3. Render the template using tour data from step 1
  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

exports.getLoginForm = (req, res, next) => {
  // 1. Build template
  // 2. Render the template
  res.status(200).render('login', {
    title: 'Log In'
  });
};

exports.getCurrentUser = (req, res, next) => {
  res.status(200).render('account', {
    title: 'My Account'
  });
};

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'My Account',
    user: updatedUser
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // 1. Find all the bookings of the current user
  const bookings = await Booking.find({ user: req.user.id });

  // 2. Find all the tours corresponding to the bookings
  const tourIds = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Bookings',
    tours
  });
});
