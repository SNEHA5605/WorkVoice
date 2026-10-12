/* ========================================
   WORKVOICE AI - REGISTRATION
======================================== */

const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Get form values
        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("password").value;

        const role =
            document.getElementById("role").value;


        // Clear previous message
        registerMessage.textContent = "";

        registerMessage.style.color = "#dc2626";


        // Basic validation
        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {

            registerMessage.textContent =
                "Please fill in all fields.";

            return;
        }


        try {

            // Send registration request
            const response = await fetch(
                "http://localhost:3000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        phone: phone,

                        password: password,

                        role: role

                    })
                }
            );


            // Read backend response
            const data =
                await response.json();


            // Registration failed
            if (!response.ok) {

                registerMessage.textContent =
                    data.message ||
                    "Registration failed.";

                return;
            }


            // Registration successful
            registerMessage.style.color =
                "#15803d";

            registerMessage.textContent =
                "Registration successful! Opening your dashboard...";


            /*
             * Store the registered user.
             *
             * This means the user is considered
             * logged in immediately after registration.
             */

            localStorage.setItem(
                "workvoiceUser",
                JSON.stringify(data.user)
            );


            /*
             * Redirect according to role
             */

            setTimeout(function () {

                if (data.user.role === "worker") {

                    window.location.href =
                        "worker-dashboard.html";

                }

                else if (data.user.role === "owner") {

                    window.location.href =
                        "owner-dashboard.html";

                }

                else {

                    registerMessage.style.color =
                        "#dc2626";

                    registerMessage.textContent =
                        "Unknown user role.";

                }

            }, 800);


        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerMessage.textContent =
                "Unable to connect to the server. Please make sure the backend is running.";

        }

    }
);