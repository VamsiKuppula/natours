const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minlength: [4, 'Min length of review is 4'],
      required: [true, 'Review cannot be empty!']
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot be greater than 5.0'],
      set: val => Math.round(val * 10) / 10 // --> 4.6666666 , 46.666666, 47, 4.7
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query Middleware

reviewSchema.pre(/^find/, function(next) {
  /* this.populate({
    path: 'user',
    select: 'name photo'
  }).populate({
    path: 'tour',
    select: 'name'
  });
  */
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: { tourId },
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};

// Document middleware
reviewSchema.post('save', function() {
  // cannot use Review.
  this.constructor.calcAverageRating(this.tour);
});

// Querymiddleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  const review = await this.findOne();
  this.r = review;
  next();
});

reviewSchema.post(/^findOneAnd/, function() {
  this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
