const pool = require("../config/db");
const bcrypt = require("bcrypt");


// ========================================
// REGISTER USER
// ========================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            role
        } = req.body;


        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                message:
                    "Name, email, phone, password and role are required"
            });

        }


        // --------------------------------
        // ALLOWED ROLES
        // --------------------------------

        // Authority accounts should not
        // be created through public signup.

        if (
            role !== "worker" &&
            role !== "owner"
        ) {

            return res.status(400).json({
                message:
                    "Role must be worker or owner"
            });

        }


        // --------------------------------
        // CHECK EXISTING EMAIL
        // --------------------------------

        const [existingUsers] =
            await pool.query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                message:
                    "Email already registered"
            });

        }


        // --------------------------------
        // CHECK EXISTING PHONE
        // --------------------------------

        const [existingPhone] =
            await pool.query(
                "SELECT id FROM users WHERE phone = ?",
                [phone]
            );


        if (existingPhone.length > 0) {

            return res.status(409).json({
                message:
                    "Contact number already registered"
            });

        }


        // --------------------------------
        // HASH PASSWORD
        // --------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // --------------------------------
        // INSERT USER
        // --------------------------------

        const [result] =
            await pool.query(
                `INSERT INTO users
                (name, email, phone, password, role)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    name,
                    email,
                    phone,
                    hashedPassword,
                    role
                ]
            );


        // --------------------------------
        // SUCCESS RESPONSE
        // --------------------------------

        res.status(201).json({

            message:
                "Registration successful",

            user: {

                id: result.insertId,

                name: name,

                email: email,

                phone: phone,

                role: role

            }

        });

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            message:
                "Registration failed",

            error:
                error.message

        });

    }

};



// ========================================
// LOGIN USER
// ========================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        // --------------------------------
        // FIND USER
        // --------------------------------

        const [users] =
            await pool.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );


        if (users.length === 0) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const user = users[0];


        // --------------------------------
        // CHECK PASSWORD
        // --------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        // --------------------------------
        // LOGIN SUCCESS
        // --------------------------------

        res.status(200).json({

            message:
                "Login successful",

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role

            }

        });

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            message:
                "Login failed",

            error:
                error.message

        });

    }

};



// ========================================
// EXPORT
// ========================================

module.exports = {
    registerUser,
    loginUser
};