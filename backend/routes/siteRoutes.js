const express = require("express");

const {
    createSite,
    getOwnerSites
} = require("../controllers/siteController");

const router = express.Router();


// Create a new site
router.post(
    "/",
    createSite
);


// Get sites belonging to an owner
router.get(
    "/owner/:ownerId",
    getOwnerSites
);


module.exports = router;