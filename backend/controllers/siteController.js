const pool = require("../config/db");

// ========================================
// CREATE SITE
// ========================================

const createSite = async (req, res) => {
    try {

        const {
            ownerId,
            siteName,
            location,
            projectType
        } = req.body;


        // Validate input
        if (
            !ownerId ||
            !siteName ||
            !location ||
            !projectType
        ) {
            return res.status(400).json({
                message:
                    "Owner ID, site name, location and project type are required."
            });
        }


        // Check that the owner exists
        const [owners] = await pool.query(
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


        // Insert site
        const [result] = await pool.query(
            `INSERT INTO sites
            (owner_id, site_name, location, project_type)
            VALUES (?, ?, ?, ?)`,
            [
                ownerId,
                siteName,
                location,
                projectType
            ]
        );


        res.status(201).json({
            message:
                "Worksite created successfully.",

            site: {
                id: result.insertId,
                owner_id: ownerId,
                site_name: siteName,
                location: location,
                project_type: projectType
            }
        });

    }
    catch (error) {

        console.error(
            "Create site error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create worksite.",
            error:
                error.message
        });
    }
};


// ========================================
// GET OWNER'S SITES
// ========================================

const getOwnerSites = async (req, res) => {

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


        const [sites] = await pool.query(
            `SELECT
                id,
                site_name,
                location,
                project_type,
                created_at
             FROM sites
             WHERE owner_id = ?
             ORDER BY created_at DESC`,
            [ownerId]
        );


        res.status(200).json({
            sites: sites
        });

    }
    catch (error) {

        console.error(
            "Get owner sites error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch sites.",
            error:
                error.message
        });
    }
};


module.exports = {
    createSite,
    getOwnerSites
};