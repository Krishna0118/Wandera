const Listing = require("../models/listing.js");


// module.exports.index = async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs", { allListings });
// };

module.exports.renderNewForn = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Does Not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}


module.exports.createListing=async (req, res) => {
  let url = req.file.path;
  let filename= req.file.filename;
  console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  }

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Does Not exist");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing , originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
     if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

    req.flash("success", " listing updated!");
    res.redirect(`/listings/${id}`);
  }

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}
 

module.exports.searchListings = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    req.flash("error", "Search query missing.");
    return res.redirect("/listings");
  }

  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { country: { $regex: query, $options: "i" } }
    ]
  });

  res.render("listings/search.ejs", { listings, query });
};

module.exports.index = async (req, res) => {
  const { category } = req.query;

  let allListings;
  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index", { allListings, category });
};
