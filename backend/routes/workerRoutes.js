const express = require("express");

const {
    getAllWorkers,
    assignWorkerToSite,
    getAssignedWorkers,
    getWorkerSites
} = require("../controllers/workerController");

const router = express.Router();


// ========================================
// GET ALL WORKERS
// ========================================

router.get(
    "/",
    getAllWorkers
);


// ========================================
// ASSIGN WORKER TO SITE
// ========================================

router.post(
    "/assign",
    assignWorkerToSite
);


// ========================================
// GET WORKERS ASSIGNED TO OWNER'S SITES
// ========================================

router.get(
    "/assigned/:ownerId",
    getAssignedWorkers
);


// ========================================
// GET SITES ASSIGNED TO A WORKER
// ========================================

router.get(
    "/worker/:workerId",
    getWorkerSites
);


module.exports = router;