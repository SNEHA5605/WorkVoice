const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");


// ========================================
// ROUTES
// ========================================

const authRoutes =
    require("./routes/authRoutes");

const siteRoutes =
    require("./routes/siteRoutes");

const workerRoutes =
    require("./routes/workerRoutes");

const complaintRoutes =
    require("./routes/complaintRoutes");


// ========================================
// CONTROLLER
// ========================================

const {
    markOverdueComplaints
} = require(
    "./controllers/complaintController"
);


// ========================================
// CREATE EXPRESS APP
// ========================================

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(
    express.json()
);


// ========================================
// HOME ROUTE
// ========================================

app.get(
    "/",
    (req, res) => {

        res.json({

            message:
                "WorkVoice AI Backend is running"

        });

    }
);


// ========================================
// DATABASE TEST
// ========================================

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    "SELECT 1 AS result"
                );


            res.status(200).json({

                message:
                    "MySQL connected successfully",

                data:
                    rows

            });

        }
        catch (error) {

            console.error(
                "Database error:",
                error
            );


            res.status(500).json({

                message:
                    "Database connection failed"

            });

        }

    }
);


// ========================================
// AUTH ROUTES
// ========================================

app.use(
    "/api/auth",
    authRoutes
);


// ========================================
// SITE ROUTES
// ========================================

app.use(
    "/api/sites",
    siteRoutes
);


// ========================================
// WORKER ROUTES
// ========================================

app.use(
    "/api/workers",
    workerRoutes
);


// ========================================
// COMPLAINT ROUTES
// ========================================

app.use(
    "/api/complaints",
    complaintRoutes
);


// ========================================
// 404 HANDLER
// ========================================

app.use(
    (req, res) => {

        res.status(404).json({

            message:
                "API endpoint not found"

        });

    }
);


// ========================================
// ERROR HANDLER
// ========================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "Server error:",
            err
        );


        res.status(500).json({

            message:
                "Internal server error"

        });

    }
);


// ========================================
// START SERVER
// ========================================

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    async () => {

        console.log(
            `WorkVoice AI running at http://localhost:${PORT}`
        );


        // ========================================
        // INITIAL OVERDUE CHECK
        // ========================================

        console.log(
            "Running initial overdue complaint check..."
        );


        await markOverdueComplaints();


        // ========================================
        // AUTOMATIC OVERDUE CHECK
        // ========================================

        /*
         * Run every 1 hour.
         *
         * 60 minutes
         * × 60 seconds
         * × 1000 milliseconds
         */

        const ONE_HOUR =
            60 * 60 * 1000;


        setInterval(
            async () => {

                console.log(
                    "Running scheduled overdue complaint check..."
                );


                await markOverdueComplaints();

            },
            ONE_HOUR
        );

    }
);