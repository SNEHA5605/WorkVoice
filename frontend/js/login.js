/* ========================================
   WORKVOICE AI - LOGIN
======================================== */

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", async function (event) {

    // Stop the page from refreshing
    event.preventDefault();


    // Get values from the form
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;


    // Clear previous message
    loginMessage.textContent = "";
    loginMessage.style.color = "#dc2626";


    // Basic validation
    if (!email || !password) {

        loginMessage.textContent =
            "Please enter email and password.";

        return;
    }


    try {

        // Send login request to Node.js backend
        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        // Convert backend response to JSON
        const data = await response.json();


        // Check whether login failed
        if (!response.ok) {

            loginMessage.textContent =
                data.message || "Login failed.";

            return;
        }


        // Login successful
        loginMessage.style.color = "#15803d";

        loginMessage.textContent =
            "Login successful! Redirecting...";


        /*
         * Store logged-in user information.
         *
         * We will use this later for:
         * - Worker dashboard
         * - Owner dashboard
         * - Authority dashboard
         */
        localStorage.setItem(
            "workvoiceUser",
            JSON.stringify(data.user)
        );


        // Redirect according to role
        setTimeout(function () {

            if (data.user.role === "worker") {

                window.location.href =
                    "worker-dashboard.html";

            }
            else if (data.user.role === "owner") {

                window.location.href =
                    "owner-dashboard.html";

            }
            else if (data.user.role === "authority") {

                window.location.href =
                    "authority-dashboard.html";

            }
            else {

                loginMessage.style.color = "#dc2626";

                loginMessage.textContent =
                    "Unknown user role.";

            }

        }, 800);


    }
    catch (error) {

        console.error(
            "Login error:",
            error
        );


        loginMessage.textContent =
            "Unable to connect to the server. Please make sure the backend is running.";

    }

});