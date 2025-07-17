const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js"); // import your Listing model
const wrapAsync = require("../utils/wrapAsync.js"); // import wrapAsync function
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
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

  //New Route
router.get("/new", isLoggedIn, listingController.renderNewForn);



router
  .route("/:id")
  .get( wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;