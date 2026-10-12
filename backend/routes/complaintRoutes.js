const express = require("express");

const {
    createComplaint,
    getWorkerComplaints,
    getOwnerComplaints,
    updateComplaintStatus,
    escalateComplaint
} = require("../controllers/complaintController");

const router = express.Router();


// ========================================
// CREATE COMPLAINT
// ========================================

router.post(
    "/",
    createComplaint
);


// ========================================
// GET WORKER COMPLAINTS
// ========================================

router.get(
    "/worker/:workerId",
    getWorkerComplaints
);


// ========================================
// GET OWNER COMPLAINTS
// ========================================

router.get(
    "/owner/:ownerId",
    getOwnerComplaints
);


// ========================================
// UPDATE COMPLAINT STATUS
// ========================================

router.put(
    "/:complaintId/status",
    updateComplaintStatus
);


// ========================================
// ESCALATE COMPLAINT
// ========================================

router.put(
    "/:complaintId/escalate",
    escalateComplaint
);


module.exports = router;