const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validatelisting}=require("../middleware.js");

const listingController=require("../controllers/listings.js");

const multer  = require('multer')
const {storage}=require("../cloudConfig.js");

const upload = multer({ storage });
// Index Route
router.get("/",wrapAsync(listingController.index));

// New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

// Show Route
router.get("/:id",wrapAsync(listingController.showListing));

// Create Route
router.post("/",isLoggedIn,upload.single('listings[image]'),validatelisting,wrapAsync(listingController.createListing));

//edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

// update route
router.put("/:id",isLoggedIn,isOwner,upload.single('listings[image]'),validatelisting,wrapAsync(listingController.updateListing));

// Delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));


module.exports=router;