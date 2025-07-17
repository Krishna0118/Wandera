const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js"); // import your Listing model
const wrapAsync = require("../utils/wrapAsync.js"); // import wrapAsync function
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");



//index route
router.get("/",wrapAsync(listingController.index) );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForn );

//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

//Create Route
router.post(
  "/",
  isLoggedIn,
  (req, res, next) => {
    // Convert image string to object early
    const img = req.body.listing.image;
    req.body.listing.image = {
      url: img || undefined,
      filename: "listingimage"
    };
    next();
  },
  validateListing,
  wrapAsync(listingController.createListing)
);



//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//Update Route
router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
);

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;