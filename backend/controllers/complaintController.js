const pool = require("../config/db");
const { classifyComplaint } = require("../services/aiService");


// ========================================
// CREATE COMPLAINT
// ========================================

const createComplaint = async (req, res) => {

    try {

        const {
            workerId,
            siteId,
            category,
            description,
            priority
        } = req.body;


        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

       if (
    !workerId ||
    !siteId ||
    !description
)
{

            return res.status(400).json({

                message:
                    "Worker ID, site ID and description are required."

            });

        }


        // ----------------------------------------
        // CHECK WORKER
        // ----------------------------------------

        const [workers] =
            await pool.query(

                `SELECT
                    id,
                    name
                 FROM users
                 WHERE id = ?
                 AND role = 'worker'`,

                [workerId]

            );


        if (workers.length === 0) {

            return res.status(404).json({

                message:
                    "Worker not found."

            });

        }


        // ----------------------------------------
        // CHECK SITE
        // ----------------------------------------

        const [sites] =
            await pool.query(

                `SELECT
                    id,
                    site_name,
                    owner_id
                 FROM sites
                 WHERE id = ?`,

                [siteId]

            );


        if (sites.length === 0) {

            return res.status(404).json({

                message:
                    "Worksite not found."

            });

        }


        // ----------------------------------------
        // CHECK WORKER ASSIGNMENT
        // ----------------------------------------

        const [assignments] =
            await pool.query(

                `SELECT
                    id
                 FROM site_workers
                 WHERE site_id = ?
                 AND worker_id = ?`,

                [
                    siteId,
                    workerId
                ]

            );


        if (assignments.length === 0) {

            return res.status(403).json({

                message:
                    "Worker is not assigned to this worksite."

            });

        }


       // ----------------------------------------
// AI CLASSIFICATION
// ----------------------------------------

const aiResult =
    await classifyComplaint(description);

let finalCategory = category;
let finalPriority = priority;

if (aiResult) {

    finalCategory =
        aiResult.category;

    finalPriority =
        aiResult.priority;

    console.log(
        "AI prediction:",
        aiResult
    );

}

        // ----------------------------------------
        // CREATE COMPLAINT
        // ----------------------------------------

        const [result] =
            await pool.query(

                `INSERT INTO complaints
                (
                    worker_id,
                    site_id,
                    category,
                    description,
                    priority,
                    status
                )
                VALUES (?, ?, ?, ?, ?, 'SUBMITTED')`,

                [
                      workerId,
                      siteId,
                      finalCategory,
                      description,
                      finalPriority
                ]

            );


        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        res.status(201).json({

            message:
                "Complaint submitted successfully.",

            complaint: {

                id:
                    result.insertId,

                worker_id:
                    workerId,

                site_id:
                    siteId,

                category:
                    finalCategory,

                description:
                    description,

                priority:
                    finalPriority,

                status:
                    "SUBMITTED"

            }

        });

    }
    catch (error) {

        console.error(
            "Create complaint error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to create complaint.",

            error:
                error.message

        });

    }

};


// ========================================
// GET WORKER COMPLAINTS
// ========================================

const getWorkerComplaints = async (req, res) => {

    try {

        const {
            workerId
        } = req.params;


        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (!workerId) {

            return res.status(400).json({

                message:
                    "Worker ID is required."

            });

        }


        // ----------------------------------------
        // GET COMPLAINTS
        // ----------------------------------------

        const [complaints] =
            await pool.query(

                `SELECT
                    c.id,
                    c.worker_id,
                    c.site_id,
                    c.category,
                    c.description,
                    c.priority,
                    c.status,
                    c.created_at,
                    c.resolved_at,
                    c.overdue_at,
                    c.escalated_at,

                    s.site_name,
                    s.location,

                    latest_update.status
                        AS update_status,

                    latest_update.comment
                        AS owner_response,

                    latest_update.updated_at
                        AS response_date

                 FROM complaints c

                 INNER JOIN sites s
                    ON c.site_id = s.id

                 LEFT JOIN complaint_updates latest_update
                    ON latest_update.id = (

                        SELECT
                            cu.id

                        FROM complaint_updates cu

                        WHERE
                            cu.complaint_id = c.id

                        ORDER BY
                            cu.updated_at DESC,
                            cu.id DESC

                        LIMIT 1

                    )

                 WHERE c.worker_id = ?

                 ORDER BY
                    c.created_at DESC`,

                [workerId]

            );


        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        res.status(200).json({

            complaints:
                complaints

        });

    }
    catch (error) {

        console.error(
            "Get worker complaints error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch complaints.",

            error:
                error.message

        });

    }

};


// ========================================
// GET OWNER COMPLAINTS
// ========================================

const getOwnerComplaints = async (req, res) => {

    try {

        const {
            ownerId
        } = req.params;


        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (!ownerId) {

            return res.status(400).json({

                message:
                    "Owner ID is required."

            });

        }


        // ----------------------------------------
        // GET OWNER COMPLAINTS
        // ----------------------------------------

        const [complaints] =
            await pool.query(

                `SELECT
                    c.id,
                    c.worker_id,
                    c.site_id,
                    c.category,
                    c.description,
                    c.priority,
                    c.status,
                    c.created_at,
                    c.resolved_at,
                    c.overdue_at,
                    c.escalated_at,

                    u.name
                        AS worker_name,

                    u.email
                        AS worker_email,

                    u.phone
                        AS worker_phone,

                    s.site_name,
                    s.location,
                    s.project_type

                 FROM complaints c

                 INNER JOIN users u
                    ON c.worker_id = u.id

                 INNER JOIN sites s
                    ON c.site_id = s.id

                 WHERE s.owner_id = ?

                 ORDER BY
                    c.created_at DESC`,

                [ownerId]

            );


        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        res.status(200).json({

            complaints:
                complaints

        });

    }
    catch (error) {

        console.error(
            "Get owner complaints error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch owner complaints.",

            error:
                error.message

        });

    }

};


// ========================================
// UPDATE COMPLAINT STATUS
// ========================================

const updateComplaintStatus = async (req, res) => {

    try {

        const {
            complaintId
        } = req.params;


        const {
            ownerId,
            status,
            comment
        } = req.body;


        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !complaintId ||
            !ownerId ||
            !status
        ) {

            return res.status(400).json({

                message:
                    "Complaint ID, owner ID and status are required."

            });

        }


        // ----------------------------------------
        // ALLOWED OWNER STATUSES
        // ----------------------------------------

        const allowedStatuses = [

            "ASSIGNED",
            "IN_PROGRESS",
            "RESOLVED"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid complaint status."

            });

        }


        // ----------------------------------------
        // CHECK COMPLAINT OWNERSHIP
        // ----------------------------------------

        const [complaints] =
            await pool.query(

                `SELECT
                    c.id,
                    c.site_id,
                    c.status

                 FROM complaints c

                 INNER JOIN sites s
                    ON c.site_id = s.id

                 WHERE c.id = ?
                 AND s.owner_id = ?`,

                [
                    complaintId,
                    ownerId
                ]

            );


        if (complaints.length === 0) {

            return res.status(403).json({

                message:
                    "You are not authorized to update this complaint."

            });

        }


        // ----------------------------------------
        // RESOLVED TIME
        // ----------------------------------------

        let resolvedAt = null;


        if (
            status === "RESOLVED"
        ) {

            resolvedAt =
                new Date();

        }


        // ----------------------------------------
        // UPDATE COMPLAINT
        // ----------------------------------------

        await pool.query(

            `UPDATE complaints
             SET
                status = ?,
                resolved_at = ?
             WHERE id = ?`,

            [
                status,
                resolvedAt,
                complaintId
            ]

        );


        // ----------------------------------------
        // STORE UPDATE HISTORY
        // ----------------------------------------

        await pool.query(

            `INSERT INTO complaint_updates
            (
                complaint_id,
                updated_by,
                status,
                comment
            )
            VALUES (?, ?, ?, ?)`,

            [
                complaintId,
                ownerId,
                status,
                comment || null
            ]

        );


        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        res.status(200).json({

            message:
                "Complaint updated successfully.",

            complaint: {

                id:
                    Number(
                        complaintId
                    ),

                status:
                    status,

                comment:
                    comment || null,

                resolved_at:
                    resolvedAt

            }

        });

    }
    catch (error) {

        console.error(
            "Update complaint status error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to update complaint.",

            error:
                error.message

        });

    }

};


// ========================================
// CHECK AND MARK OVERDUE COMPLAINTS
// ========================================

const markOverdueComplaints = async () => {

    try {

        /*
         * A complaint becomes OVERDUE when:
         *
         * 1. It is SUBMITTED, ASSIGNED or IN_PROGRESS
         * 2. It is older than 24 hours
         * 3. It has not been resolved
         */

        const [result] =
            await pool.query(

                `UPDATE complaints

                 SET
                    status = 'OVERDUE',
                    overdue_at = CURRENT_TIMESTAMP

                 WHERE
                    status IN (
                        'SUBMITTED',
                        'ASSIGNED',
                        'IN_PROGRESS'
                    )

                    AND created_at <= DATE_SUB(
                        CURRENT_TIMESTAMP,
                        INTERVAL 24 HOUR
                    )`

            );


        // ----------------------------------------
        // LOG RESULT
        // ----------------------------------------

        if (
            result.affectedRows > 0
        ) {

            console.log(

                `${result.affectedRows} complaint(s) marked as OVERDUE.`

            );

        }

    }
    catch (error) {

        console.error(

            "Overdue complaint check error:",

            error

        );

    }

};


// ========================================
// ESCALATE COMPLAINT
// ========================================

const escalateComplaint = async (req, res) => {
    try {

        const { complaintId } =
            req.params;

        const {
            workerId,
            comment
        } = req.body;


        if (!complaintId || !workerId) {

            return res.status(400).json({
                message:
                    "Complaint ID and worker ID are required."
            });

        }


        const [complaints] =
            await pool.query(
                `SELECT
                    c.id,
                    c.worker_id,
                    c.status
                 FROM complaints c
                 WHERE c.id = ?
                 AND c.worker_id = ?`,
                [
                    complaintId,
                    workerId
                ]
            );


        if (complaints.length === 0) {

            return res.status(404).json({
                message:
                    "Complaint not found or you are not authorized to escalate it."
            });

        }


        const complaint =
            complaints[0];


        if (
            complaint.status !==
            "OVERDUE"
        ) {

            return res.status(400).json({
                message:
                    "Only overdue complaints can be escalated."
            });

        }


        await pool.query(
            `UPDATE complaints
             SET
                status = 'ESCALATED',
                escalated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [complaintId]
        );


        await pool.query(
            `INSERT INTO complaint_updates
            (
                complaint_id,
                updated_by,
                status,
                comment
            )
            VALUES (?, ?, 'ESCALATED', ?)`,
            [
                complaintId,
                workerId,
                comment ||
                "Complaint escalated by worker."
            ]
        );


        res.status(200).json({

            message:
                "Complaint escalated successfully.",

            complaint: {

                id:
                    Number(complaintId),

                status:
                    "ESCALATED",

                escalated_at:
                    new Date()

            }

        });

    }
    catch (error) {

        console.error(
            "Escalate complaint error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to escalate complaint.",

            error:
                error.message

        });

    }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {

    createComplaint,

    getWorkerComplaints,

    getOwnerComplaints,

    updateComplaintStatus,

    markOverdueComplaints,

    escalateComplaint

};