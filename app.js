if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret: "mysupersecret",
  },
  touchAfter: 24*3600,
});

store.on("error", ()=>{
  console.log("Error iN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, i am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //A middlewasre that initializes passport
app.use(passport.session()); //Used to help identify is the same user is navigating through different pages or not
passport.use(new LocalStrategy(User.authenticate()));
//This passport method is used to authenticate every user that arrives

passport.serializeUser(User.serializeUser()); //Serialize = storing user related info in session
passport.deserializeUser(User.deserializeUser()); //Deserialize = removing user related info in session

app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//DEMONSTRATION OF DUMMY ENTRY
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); //register() is a static method of passport which is used to store the user and it automatically checks if the username is unique or not, "helloworld" is password for the user ID
//   res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title : "New villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Goa",
//         country : "India"
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Testing successful");
//   });

app.use((req, res, next) => {
  console.log("Request Path:", req.path);
  next(new ExpressError(404, "Page Not Found!"));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  console.log(err)
})

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});