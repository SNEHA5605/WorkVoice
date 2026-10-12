const pool = require("../config/db");


// ========================================
// GET ALL WORKERS
// ========================================

const getAllWorkers = async (req, res) => {

    try {

        const [workers] = await pool.query(
            `SELECT
                id,
                name,
                email,
                phone,
                created_at
             FROM users
             WHERE role = 'worker'
             ORDER BY name ASC`
        );


        res.status(200).json({
            workers: workers
        });

    }
    catch (error) {

        console.error(
            "Get workers error:",
            error
        );


        res.status(500).json({
            message:
                "Failed to fetch workers.",
            error:
                error.message
        });

    }

};


// ========================================
// ASSIGN WORKER TO SITE
// ========================================

const assignWorkerToSite = async (req, res) => {

    try {

        const {
            ownerId,
            siteId,
            workerId
        } = req.body;


        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (
            !ownerId ||
            !siteId ||
            !workerId
        ) {

            return res.status(400).json({
                message:
                    "Owner ID, site ID and worker ID are required."
            });

        }


        // --------------------------------
        // CHECK OWNER
        // --------------------------------

        const [owners] =
            await pool.query(

                `SELECT id
                 FROM users
                 WHERE id = ?
                 AND role = 'owner'`,

                [ownerId]

            );


        if (owners.length === 0) {

            return res.status(404).json({
                message:
                    "Owner not found."
            });

        }


        // --------------------------------
        // CHECK SITE BELONGS TO OWNER
        // --------------------------------

        const [sites] =
            await pool.query(

                `SELECT id
                 FROM sites
                 WHERE id = ?
                 AND owner_id = ?`,

                [
                    siteId,
                    ownerId
                ]

            );


        if (sites.length === 0) {

            return res.status(403).json({
                message:
                    "This site does not belong to the owner."
            });

        }


        // --------------------------------
        // CHECK WORKER
        // --------------------------------

        const [workers] =
            await pool.query(

                `SELECT id
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


        // --------------------------------
        // CHECK EXISTING ASSIGNMENT
        // --------------------------------

        const [existingAssignment] =
            await pool.query(

                `SELECT id
                 FROM site_workers
                 WHERE site_id = ?
                 AND worker_id = ?`,

                [
                    siteId,
                    workerId
                ]

            );


        if (existingAssignment.length > 0) {

            return res.status(409).json({
                message:
                    "Worker is already assigned to this site."
            });

        }


        // --------------------------------
        // CREATE ASSIGNMENT
        // --------------------------------

        const [result] =
            await pool.query(

                `INSERT INTO site_workers
                (site_id, worker_id)
                VALUES (?, ?)`,

                [
                    siteId,
                    workerId
                ]

            );


        // --------------------------------
        // SUCCESS
        // --------------------------------

        res.status(201).json({

            message:
                "Worker assigned successfully.",

            assignment: {

                id:
                    result.insertId,

                site_id:
                    siteId,

                worker_id:
                    workerId

            }

        });

    }
    catch (error) {

        console.error(
            "Assign worker error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to assign worker.",

            error:
                error.message

        });

    }

};


// ========================================
// GET WORKERS ASSIGNED TO OWNER'S SITES
// ========================================

const getAssignedWorkers = async (req, res) => {

    try {

        const {
            ownerId
        } = req.params;


        if (!ownerId) {

            return res.status(400).json({
                message:
                    "Owner ID is required."
            });

        }


        const [workers] =
            await pool.query(

                `SELECT
                    sw.id AS assignment_id,

                    u.id AS worker_id,

                    u.name AS worker_name,

                    u.email,

                    u.phone,

                    s.id AS site_id,

                    s.site_name,

                    sw.assigned_at

                 FROM site_workers sw

                 INNER JOIN users u
                    ON sw.worker_id = u.id

                 INNER JOIN sites s
                    ON sw.site_id = s.id

                 WHERE s.owner_id = ?

                 ORDER BY sw.assigned_at DESC`,

                [ownerId]

            );


        res.status(200).json({

            workers:
                workers

        });

    }
    catch (error) {

        console.error(
            "Get assigned workers error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch assigned workers.",

            error:
                error.message

        });

    }

};


// ========================================
// GET SITES ASSIGNED TO A WORKER
// ========================================

const getWorkerSites = async (req, res) => {

    try {

        const {
            workerId
        } = req.params;


        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (!workerId) {

            return res.status(400).json({

                message:
                    "Worker ID is required."

            });

        }


        // --------------------------------
        // GET WORKER'S SITES
        // --------------------------------

        const [workers] =
            await pool.query(

                `SELECT
                    sw.id AS assignment_id,

                    u.id AS worker_id,

                    u.name AS worker_name,

                    s.id AS site_id,

                    s.site_name,

                    s.location,

                    s.project_type,

                    sw.assigned_at

                 FROM site_workers sw

                 INNER JOIN users u
                    ON sw.worker_id = u.id

                 INNER JOIN sites s
                    ON sw.site_id = s.id

                 WHERE sw.worker_id = ?

                 ORDER BY sw.assigned_at DESC`,

                [workerId]

            );


        // --------------------------------
        // RESPONSE
        // --------------------------------

        res.status(200).json({

            workers:
                workers

        });

    }
    catch (error) {

        console.error(
            "Get worker sites error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch worker sites.",

            error:
                error.message

        });

    }

};


// ========================================
// EXPORT FUNCTIONS
// ========================================

module.exports = {

    getAllWorkers,

    assignWorkerToSite,

    getAssignedWorkers,

    getWorkerSites

};