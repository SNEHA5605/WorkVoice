/* ========================================
   WORKVOICE AI - WORKER DASHBOARD JS
======================================== */


/* ========================================
   API CONFIGURATION
======================================== */

const API_BASE_URL = "http://localhost:3000";


/* ========================================
   GET LOGGED-IN USER
======================================== */

const storedUser =
    localStorage.getItem("workvoiceUser");

if (!storedUser) {

    window.location.href = "login.html";

}


/* ========================================
   CONVERT STORED JSON INTO OBJECT
======================================== */

let user;

try {

    user = JSON.parse(storedUser);

}
catch (error) {

    console.error(
        "Invalid stored user:",
        error
    );

    localStorage.removeItem(
        "workvoiceUser"
    );

    window.location.href =
        "login.html";

}


/* ========================================
   CHECK USER ROLE
======================================== */

if (user && user.role !== "worker") {

    alert(
        "Access denied. Worker account required."
    );

    localStorage.removeItem(
        "workvoiceUser"
    );

    window.location.href =
        "login.html";

}


/* ========================================
   DISPLAY USER INFORMATION
======================================== */

const workerName =
    document.getElementById(
        "workerName"
    );

const welcomeWorkerName =
    document.getElementById(
        "welcomeWorkerName"
    );

if (workerName) {

    workerName.textContent =
        user.name;

}

if (welcomeWorkerName) {

    welcomeWorkerName.textContent =
        user.name;

}


/* ========================================
   SIDEBAR NAVIGATION
======================================== */

const menuItems =
    document.querySelectorAll(
        ".menu-item"
    );

const actionButtons =
    document.querySelectorAll(
        "[data-section]"
    );

const sections = {

    overview:
        document.getElementById(
            "overview"
        ),

    complaints:
        document.getElementById(
            "complaints"
        ),

    "raise-complaint":
        document.getElementById(
            "raise-complaint"
        ),

    leave:
        document.getElementById(
            "leave"
        ),

    medical:
        document.getElementById(
            "medical"
        ),

    help:
        document.getElementById(
            "help"
        )

};


/* ========================================
   SHOW SECTION
======================================== */

function showSection(sectionName) {

    Object.values(sections).forEach(
        section => {

            if (section) {

                section.classList.remove(
                    "active-section"
                );

            }

        }
    );


    if (sections[sectionName]) {

        sections[sectionName]
            .classList
            .add("active-section");

    }


    menuItems.forEach(item => {

        item.classList.remove(
            "active"
        );

        if (
            item.dataset.section ===
            sectionName
        ) {

            item.classList.add(
                "active"
            );

        }

    });

}


/* ========================================
   SIDEBAR MENU EVENTS
======================================== */

menuItems.forEach(item => {

    item.addEventListener(
        "click",
        function () {

            const section =
                this.dataset.section;

            showSection(section);

        }
    );

});


/* ========================================
   QUICK ACTION EVENTS
======================================== */

actionButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const section =
                this.dataset.section;

            if (sections[section]) {

                showSection(section);

            }

        }
    );

});


/* ========================================
   LOGOUT
======================================== */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "workvoiceUser"
            );

            window.location.href =
                "login.html";

        }
    );

}


/* ========================================
   COMPLAINT FORM
======================================== */

const complaintForm =
    document.getElementById(
        "complaintForm"
    );

const complaintMessage =
    document.getElementById(
        "complaintMessage"
    );

if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* --------------------------------
               GET FORM VALUES
            -------------------------------- */

            const category =
                document.getElementById(
                    "complaintCategory"
                ).value;

            const priority =
                document.getElementById(
                    "complaintPriority"
                ).value;

            const description =
                document.getElementById(
                    "complaintDescription"
                ).value.trim();


            /* --------------------------------
               CLEAR MESSAGE
            -------------------------------- */

            if (complaintMessage) {

                complaintMessage.textContent =
                    "";

                complaintMessage.style.color =
                    "#dc2626";

            }


            /* --------------------------------
               VALIDATION
            -------------------------------- */

            if (
                !category ||
                !priority ||
                !description
            ) {

                if (complaintMessage) {

                    complaintMessage.textContent =
                        "Please fill in all complaint details.";

                }

                return;

            }


            /* --------------------------------
               SHOW LOADING
            -------------------------------- */

            if (complaintMessage) {

                complaintMessage.style.color =
                    "#2563eb";

                complaintMessage.textContent =
                    "Checking your assigned worksite...";

            }


            try {

                /* --------------------------------
                   GET ASSIGNED SITE
                -------------------------------- */

                const siteId =
                    await getWorkerSiteId();


                console.log(
                    "Worker ID:",
                    user.id
                );

                console.log(
                    "Assigned Site ID:",
                    siteId
                );


                /* --------------------------------
                   SHOW SUBMITTING MESSAGE
                -------------------------------- */

                if (complaintMessage) {

                    complaintMessage.style.color =
                        "#2563eb";

                    complaintMessage.textContent =
                        "Submitting complaint...";

                }


                /* --------------------------------
                   SEND COMPLAINT TO BACKEND
                -------------------------------- */

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/complaints`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                workerId:
                                    user.id,

                                siteId:
                                    siteId,

                                category:
                                    category,

                                description:
                                    description,

                                priority:
                                    priority

                            })

                        }
                    );


                /* --------------------------------
                   READ SERVER RESPONSE
                -------------------------------- */

                let data = {};

                try {

                    data =
                        await response.json();

                }
                catch (jsonError) {

                    console.error(
                        "Invalid server response:",
                        jsonError
                    );

                    throw new Error(
                        `Server returned status ${response.status}`
                    );

                }


                console.log(
                    "Complaint API response:",
                    data
                );


                /* --------------------------------
                   HANDLE API ERROR
                -------------------------------- */

                if (!response.ok) {

                    if (complaintMessage) {

                        complaintMessage.style.color =
                            "#dc2626";

                        complaintMessage.textContent =
                            data.message ||
                            `Complaint submission failed. Status: ${response.status}`;

                    }

                    return;

                }


                /* --------------------------------
                   SUCCESS
                -------------------------------- */

                if (complaintMessage) {

                    complaintMessage.style.color =
                        "#15803d";

                    complaintMessage.textContent =
                        "Complaint submitted successfully!";

                }


                /* Clear form */

                complaintForm.reset();


                /* --------------------------------
                   REFRESH COMPLAINT DATA
                -------------------------------- */

                await loadWorkerComplaints();

                await updateComplaintStats();


                /* --------------------------------
                   GO TO MY COMPLAINTS
                -------------------------------- */

                setTimeout(
                    function () {

                        showSection(
                            "complaints"
                        );

                    },
                    1000
                );

            }
            catch (error) {

                console.error(
                    "Complaint submission error:",
                    error
                );


                /* --------------------------------
                   SHOW REAL ERROR
                -------------------------------- */

                if (complaintMessage) {

                    complaintMessage.style.color =
                        "#dc2626";

                    complaintMessage.textContent =
                        error.message ||
                        "Something went wrong while submitting the complaint.";

                }

            }

        }
    );

}


/* ========================================
   GET WORKER'S ASSIGNED SITE
======================================== */

async function getWorkerSiteId() {

    try {

        console.log(
            "Getting assigned site for worker:",
            user.id
        );


        const response =
            await fetch(
                `${API_BASE_URL}/api/workers/worker/${user.id}`
            );


        console.log(
            "Assigned site API status:",
            response.status
        );


        let data = {};

        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            throw new Error(
                `Unable to read server response. Status: ${response.status}`
            );

        }


        console.log(
            "Assigned site API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to fetch assigned worksite."
            );

        }


        /* --------------------------------
           CHECK ASSIGNMENT
        -------------------------------- */

        if (
            !data.workers ||
            data.workers.length === 0
        ) {

            throw new Error(
                "You are not assigned to any worksite yet."
            );

        }


        /* --------------------------------
           GET FIRST ASSIGNED SITE
        -------------------------------- */

        const siteId =
            data.workers[0].site_id;


        if (!siteId) {

            throw new Error(
                "Assigned worksite information is missing."
            );

        }


        return siteId;

    }
    catch (error) {

        console.error(
            "Get assigned site error:",
            error
        );

        throw error;

    }

}


/* ========================================
   LOAD WORKER COMPLAINTS
======================================== */

async function loadWorkerComplaints() {

    const complaintsList =
        document.getElementById(
            "complaintsList"
        );

    const recentComplaints =
        document.getElementById(
            "recentComplaints"
        );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/worker/${user.id}`
            );


        let data = {};

        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            console.error(
                "Unable to read complaints response:",
                jsonError
            );

            return;

        }


        if (!response.ok) {

            console.error(
                "Complaint API error:",
                data.message
            );

            return;

        }


        const complaints =
            data.complaints || [];


        /* --------------------------------
           FULL COMPLAINT LIST
        -------------------------------- */

        if (complaintsList) {

            if (
                complaints.length === 0
            ) {

                complaintsList.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            📋
                        </div>

                        <h3>
                            No complaints found
                        </h3>

                        <p>
                            Your submitted complaints
                            will appear here.
                        </p>

                    </div>

                `;

            }
            else {

                complaintsList.innerHTML =
                    complaints
                        .map(
                            complaint =>
                                createComplaintHTML(
                                    complaint
                                )
                        )
                        .join("");

            }

        }


        /* --------------------------------
           RECENT COMPLAINTS
        -------------------------------- */

        if (recentComplaints) {

            const recent =
                complaints.slice(
                    0,
                    3
                );


            if (
                recent.length === 0
            ) {

                recentComplaints.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            📋
                        </div>

                        <h3>
                            No complaints yet
                        </h3>

                        <p>
                            You haven't raised
                            any complaints.
                        </p>

                    </div>

                `;

            }
            else {

                recentComplaints.innerHTML =
                    recent
                        .map(
                            complaint =>
                                createComplaintHTML(
                                    complaint
                                )
                        )
                        .join("");

            }

        }

    }
    catch (error) {

        console.error(
            "Load complaints error:",
            error
        );

    }

}


/* ========================================
   CREATE COMPLAINT HTML
======================================== */

function createComplaintHTML(complaint) {

    const statusClass =
        getStatusClass(
            complaint.status
        );


    const priorityClass =
        getPriorityClass(
            complaint.priority
        );


    /* ========================================
       OWNER RESPONSE
    ======================================== */

    let ownerResponseHTML = "";


    if (complaint.owner_response) {

        ownerResponseHTML = `

            <div class="owner-response">

                <div class="owner-response-title">
                    Owner Response
                </div>

                <p>
                    ${escapeHTML(
                        complaint.owner_response
                    )}
                </p>

                ${
                    complaint.response_date
                        ? `

                            <small>
                                Responded:
                                ${formatComplaintDate(
                                    complaint.response_date
                                )}
                            </small>

                        `
                        : ""
                }

            </div>

        `;

    }
    else {

        ownerResponseHTML = `

            <div class="owner-response pending-response">

                <div class="owner-response-title">
                    Owner Response
                </div>

                <p>
                    No response from the owner yet.
                </p>

            </div>

        `;

    }


    /* ========================================
       ESCALATION BUTTON
    ======================================== */

    let escalationHTML = "";


    if (complaint.status === "OVERDUE") {

        escalationHTML = `

            <div class="complaint-action">

                <button
                    type="button"
                    class="escalate-button"
                    onclick="escalateComplaint(${complaint.id})">

                    Escalate Complaint

                </button>

            </div>

        `;

    }


    /* ========================================
       COMPLAINT CARD
    ======================================== */

    return `

        <div class="complaint-card">

            <div class="complaint-card-header">

                <div>

                    <h3>
                        Complaint #${complaint.id}
                    </h3>

                    <p class="complaint-site">
                        ${escapeHTML(
                            complaint.site_name
                        )}
                    </p>

                </div>


                <span
                    class="status-badge ${statusClass}">

                    ${escapeHTML(
                        complaint.status
                    )}

                </span>

            </div>


            <!-- Complaint Details -->

            <div class="complaint-details">

                <div class="complaint-detail">

                    <strong>
                        Category
                    </strong>

                    <span>
                        ${escapeHTML(
                            complaint.category
                        )}
                    </span>

                </div>


                <div class="complaint-detail">

                    <strong>
                        Priority
                    </strong>

                    <span
                        class="priority-badge ${priorityClass}">

                        ${escapeHTML(
                            complaint.priority
                        )}

                    </span>

                </div>


                <div class="complaint-detail">

                    <strong>
                        Location
                    </strong>

                    <span>
                        ${escapeHTML(
                            complaint.location ||
                            "Not specified"
                        )}
                    </span>

                </div>


                <div class="complaint-detail">

                    <strong>
                        Submitted
                    </strong>

                    <span>
                        ${formatComplaintDate(
                            complaint.created_at
                        )}
                    </span>

                </div>

            </div>


            <!-- Description -->

            <div class="complaint-description">

                <strong>
                    Description
                </strong>

                <p>
                    ${escapeHTML(
                        complaint.description
                    )}
                </p>

            </div>


            <!-- Owner Response -->

            ${ownerResponseHTML}


            <!-- Escalation Button -->

            ${escalationHTML}

        </div>

    `;

}


/* ========================================
   ESCALATE COMPLAINT
======================================== */

async function escalateComplaint(complaintId) {

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "workvoiceUser"
            )
        );


    if (!currentUser) {

        alert(
            "Please login again."
        );

        return;

    }


    const confirmed =
        confirm(
            "This complaint has been overdue. Do you want to escalate it for further review?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/${complaintId}/escalate`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        workerId:
                            currentUser.id,

                        comment:
                            "The complaint has remained unresolved and is being escalated for further review."

                    })

                }
            );


        let data = {};


        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            console.error(
                "Unable to read escalation response:",
                jsonError
            );

            alert(
                `Server returned status ${response.status}`
            );

            return;

        }


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to escalate complaint."
            );

            return;

        }


        alert(
            "Complaint escalated successfully."
        );


        /* Refresh complaints */

        await loadWorkerComplaints();


        /* Refresh statistics */

        await updateComplaintStats();

    }
    catch (error) {

        console.error(
            "Escalate complaint error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }

}


/* ========================================
   FORMAT COMPLAINT DATE
======================================== */

function formatComplaintDate(dateString) {

    if (!dateString) {

        return "Unknown date";

    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return "Unknown date";

    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* ========================================
   STATUS CLASS
======================================== */

function getStatusClass(status) {

    switch (status) {

        case "SUBMITTED":

            return "status-submitted";


        case "ASSIGNED":

            return "status-assigned";


        case "IN_PROGRESS":

            return "status-in-progress";


        case "RESOLVED":

            return "status-resolved";


        case "OVERDUE":

            return "status-overdue";


        case "ESCALATED":

            return "status-escalated";


        default:

            return "";

    }

}


/* ========================================
   PRIORITY CLASS
======================================== */

function getPriorityClass(priority) {

    switch (priority) {

        case "LOW":

            return "priority-low";


        case "MEDIUM":

            return "priority-medium";


        case "HIGH":

            return "priority-high";


        case "CRITICAL":

            return "priority-critical";


        default:

            return "";

    }

}


/* ========================================
   ESCAPE HTML
======================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ========================================
   UPDATE COMPLAINT STATISTICS
======================================== */

async function updateComplaintStats() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/worker/${user.id}`
            );


        let data = {};

        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            console.error(
                "Unable to read complaint statistics:",
                jsonError
            );

            return;

        }


        if (!response.ok) {

            return;

        }


        const complaints =
            data.complaints || [];


        /* --------------------------------
           COUNTS
        -------------------------------- */

        const total =
            complaints.length;


        /*
         * Open complaints:
         * Anything that is neither
         * RESOLVED nor ESCALATED.
         */

        const open =
            complaints.filter(
                complaint =>
                    complaint.status !==
                        "RESOLVED" &&
                    complaint.status !==
                        "ESCALATED"
            ).length;


        const resolved =
            complaints.filter(
                complaint =>
                    complaint.status ===
                    "RESOLVED"
            ).length;


        const escalated =
            complaints.filter(
                complaint =>
                    complaint.status ===
                    "ESCALATED"
            ).length;


        /* --------------------------------
           HTML ELEMENTS
        -------------------------------- */

        const totalElement =
            document.getElementById(
                "totalComplaints"
            );


        const openElement =
            document.getElementById(
                "openComplaints"
            );


        const resolvedElement =
            document.getElementById(
                "resolvedComplaints"
            );


        const escalatedElement =
            document.getElementById(
                "escalatedComplaints"
            );


        /* --------------------------------
           UPDATE VALUES
        -------------------------------- */

        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (openElement) {

            openElement.textContent =
                open;

        }


        if (resolvedElement) {

            resolvedElement.textContent =
                resolved;

        }


        if (escalatedElement) {

            escalatedElement.textContent =
                escalated;

        }

    }
    catch (error) {

        console.error(
            "Update complaint stats error:",
            error
        );

    }

}


/* ========================================
   INITIAL DASHBOARD
======================================== */

showSection(
    "overview"
);


/* ========================================
   LOAD EXISTING COMPLAINTS
======================================== */

loadWorkerComplaints();


/* ========================================
   LOAD COMPLAINT STATISTICS
======================================== */

updateComplaintStats();

// ========================================
// WORKVOICE AI ASSISTANT
// ========================================

const aiQuestionForm =
    document.getElementById("aiQuestionForm");

const aiQuestion =
    document.getElementById("aiQuestion");

const aiAskButton =
    document.getElementById("aiAskButton");

const aiChatBox =
    document.getElementById("aiChatBox");

const aiMessage =
    document.getElementById("aiMessage");


// ========================================
// ASK AI
// ========================================

if (aiQuestionForm) {

    aiQuestionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const question =
                aiQuestion.value.trim();

            if (!question) {
                return;
            }


            // --------------------------------
            // SHOW USER QUESTION
            // --------------------------------

            addUserAIMessage(question);


            // Clear input
            aiQuestion.value = "";


            // Disable button
            aiAskButton.disabled = true;

            aiAskButton.textContent =
                "Thinking...";

            aiMessage.textContent =
                "WorkVoice AI is finding the relevant information...";


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/rag/ask",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                question: question
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "AI request failed"
                    );

                }


                // --------------------------------
                // SHOW AI ANSWER
                // --------------------------------

                addAIMessage(
                    data.answer,
                    data.sources
                );


                aiMessage.textContent = "";


            }
            catch (error) {

                console.error(
                    "AI Assistant error:",
                    error
                );


                aiMessage.textContent =
                    "Unable to connect to WorkVoice AI. Please make sure the AI service is running.";

            }
            finally {

                aiAskButton.disabled =
                    false;

                aiAskButton.textContent =
                    "Ask AI";

            }

        }
    );

}


// ========================================
// ADD USER MESSAGE
// ========================================

function addUserAIMessage(
    question
) {

    const message =
        document.createElement("div");

    message.className =
        "user-message";


    message.innerHTML = `

        <div class="user-message-label">
            You
        </div>

        <p>
            ${escapeHTML(question)}
        </p>

    `;


    aiChatBox.appendChild(
        message
    );


    scrollAIChat();
}


// ========================================
// ADD AI MESSAGE
// ========================================

function addAIMessage(
    answer,
    sources
) {

    const message =
        document.createElement("div");

    message.className =
        "ai-message";


    let sourceHTML = "";


    if (
        sources &&
        sources.length > 0
    ) {

        sourceHTML = `

            <div class="ai-sources">

                <strong>
                    Sources:
                </strong>

                <ul>

                    ${sources.map(
                        source =>
                            `<li>${escapeHTML(source)}</li>`
                    ).join("")}

                </ul>

            </div>

        `;

    }


    message.innerHTML = `

        <div class="ai-message-label">
            WorkVoice AI
        </div>

        <p>
            ${escapeHTML(answer)}
        </p>

        ${sourceHTML}

    `;


    aiChatBox.appendChild(
        message
    );


    scrollAIChat();
}


// ========================================
// SCROLL CHAT TO BOTTOM
// ========================================

function scrollAIChat() {

    aiChatBox.scrollTop =
        aiChatBox.scrollHeight;

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(
    text
) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}