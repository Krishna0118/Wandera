const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../models/review.js"); // import your Listing model
const wrapAsync = require("../utils/wrapAsync.js"); // import wrapAsync function
const reviewController = require("../controllers/reviews.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const Listing = require("../models/listing.js");



//Post Reviews route
router.post("/",isLoggedIn,  validateReview, wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewId", 
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
)

module.exports = router;
