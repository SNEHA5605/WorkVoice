// ========================================
// WORKVOICE AI - OWNER DASHBOARD
// ========================================


// ========================================
// API BASE URL
// ========================================

const API_BASE_URL = "http://localhost:3000";


// ========================================
// GET LOGGED-IN OWNER
// ========================================

let owner = null;

try {

    owner = JSON.parse(
        localStorage.getItem("workvoiceUser")
    );

} catch (error) {

    console.error(
        "Invalid stored user:",
        error
    );

    localStorage.removeItem(
        "workvoiceUser"
    );

}


// ========================================
// AUTH CHECK
// ========================================

if (!owner || owner.role !== "owner") {

    window.location.replace(
        "login.html"
    );

} else {

    initializeOwnerDashboard();

}


// ========================================
// INITIALIZE OWNER DASHBOARD
// ========================================

function initializeOwnerDashboard() {

    const ownerName =
        document.getElementById("ownerName");

    if (ownerName) {
        ownerName.textContent = owner.name;
    }


    const welcomeName =
        document.getElementById("welcomeName");

    if (welcomeName) {
        welcomeName.textContent = owner.name;
    }


    setupNavigation();

    setupLogout();

    setupCreateSite();


    showSection("overview");


    // Load all dashboard data

    loadOwnerSites();

    loadWorkers();

    loadAssignedWorkers();

    updateWorkerCount();

    loadOwnerComplaints();

}


// ========================================
// SIDEBAR NAVIGATION
// ========================================

function setupNavigation() {

    const sidebarItems =
        document.querySelectorAll(
            ".sidebar-item"
        );


    sidebarItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                const sectionId =
                    item.dataset.section;

                showSection(sectionId);


                if (sectionId === "sites") {

                    loadOwnerSites();

                }


                if (sectionId === "workers") {

                    loadWorkers();

                    loadAssignedWorkers();

                    updateWorkerCount();

                }


                if (sectionId === "complaints") {

                    loadOwnerComplaints();

                }

            }
        );

    });


    // ========================================
    // QUICK ACTION BUTTONS
    // ========================================

    const actionButtons =
        document.querySelectorAll(
            "[data-section-target]"
        );


    actionButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const sectionId =
                    button.dataset.sectionTarget;

                showSection(sectionId);


                if (sectionId === "sites") {

                    loadOwnerSites();

                }


                if (sectionId === "workers") {

                    loadWorkers();

                    loadAssignedWorkers();

                    updateWorkerCount();

                }


                if (sectionId === "complaints") {

                    loadOwnerComplaints();

                }

            }
        );

    });

}


// ========================================
// SHOW SELECTED SECTION
// ========================================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    const sidebarItems =
        document.querySelectorAll(
            ".sidebar-item"
        );


    sections.forEach(function (section) {

        section.classList.remove("active");

    });


    sidebarItems.forEach(function (item) {

        item.classList.remove("active");

    });


    const selectedSection =
        document.getElementById(sectionId);


    if (selectedSection) {

        selectedSection.classList.add("active");

    }


    const activeSidebarItem =
        document.querySelector(
            `.sidebar-item[data-section="${sectionId}"]`
        );


    if (activeSidebarItem) {

        activeSidebarItem.classList.add("active");

    }

}


// ========================================
// LOGOUT
// ========================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutBtn");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "workvoiceUser"
            );

            window.location.replace(
                "login.html"
            );

        }
    );

}


// ========================================
// CREATE WORKSITE
// ========================================

function setupCreateSite() {

    const createSiteForm =
        document.getElementById(
            "createSiteForm"
        );


    if (!createSiteForm) {
        return;
    }


    const message =
        document.getElementById(
            "siteMessage"
        );


    const submitButton =
        createSiteForm.querySelector(
            'button[type="submit"]'
        );


    createSiteForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const siteName =
                document.getElementById(
                    "siteName"
                ).value.trim();


            const location =
                document.getElementById(
                    "location"
                ).value.trim();


            const projectType =
                document.getElementById(
                    "projectType"
                ).value;


            if (message) {

                message.textContent = "";

                message.style.color =
                    "#dc2626";

            }


            if (
                !siteName ||
                !location ||
                !projectType
            ) {

                if (message) {

                    message.textContent =
                        "Please fill in all fields.";

                }

                return;

            }


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Creating Worksite...";

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/sites`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    ownerId:
                                        owner.id,

                                    siteName:
                                        siteName,

                                    location:
                                        location,

                                    projectType:
                                        projectType

                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    if (message) {

                        message.style.color =
                            "#dc2626";

                        message.textContent =
                            data.message ||
                            "Failed to create worksite.";

                    }

                    return;

                }


                if (message) {

                    message.style.color =
                        "#15803d";

                    message.textContent =
                        "Worksite created successfully!";

                }


                createSiteForm.reset();


                await loadOwnerSites();


            } catch (error) {

                console.error(
                    "Create site error:",
                    error
                );


                if (message) {

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        error.message ||
                        "Unable to connect to the server.";

                }

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Create Worksite";

                }

            }

        }
    );

}


// ========================================
// LOAD OWNER SITES
// ========================================

async function loadOwnerSites() {

    if (!owner) {
        return;
    }


    const sitesContainer =
        document.getElementById(
            "sitesContainer"
        );


    const totalSitesElement =
        document.getElementById(
            "totalSites"
        );


    if (!sitesContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/sites/owner/${owner.id}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            sitesContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load worksites
                    </h3>

                    <p>
                        ${
                            data.message ||
                            "Something went wrong."
                        }
                    </p>

                </div>
            `;

            return;

        }


        const sites =
            data.sites || [];


        if (totalSitesElement) {

            totalSitesElement.textContent =
                sites.length;

        }


        sitesContainer.innerHTML = "";


        if (sites.length === 0) {

            sitesContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ◉
                    </div>

                    <h3>
                        No sites yet
                    </h3>

                    <p>
                        Create your first worksite
                        to get started.
                    </p>

                </div>
            `;

            return;

        }


        sites.forEach(function (site) {

            const siteCard =
                document.createElement("div");


            siteCard.className =
                "site-card";


            const siteHeading =
                document.createElement("h3");


            siteHeading.textContent =
                site.site_name;


            const locationText =
                document.createElement("p");


            locationText.textContent =
                `📍 ${
                    site.location ||
                    "Not specified"
                }`;


            const typeBadge =
                document.createElement("span");


            typeBadge.className =
                "site-type";


            typeBadge.textContent =
                site.project_type ||
                "Other";


            siteCard.appendChild(
                siteHeading
            );

            siteCard.appendChild(
                locationText
            );

            siteCard.appendChild(
                typeBadge
            );


            sitesContainer.appendChild(
                siteCard
            );

        });

    } catch (error) {

        console.error(
            "Load sites error:",
            error
        );


        sitesContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Server connection failed
                </h3>

                <p>
                    Make sure your backend
                    is running.
                </p>

            </div>
        `;

    }

}


// ========================================
// LOAD ALL REGISTERED WORKERS
// ========================================

async function loadWorkers() {

    const workersContainer =
        document.getElementById(
            "workersContainer"
        );


    if (!workersContainer) {
        return;
    }


    try {

        const workersResponse =
            await fetch(
                `${API_BASE_URL}/api/workers`
            );


        const workersData =
            await workersResponse.json();


        if (!workersResponse.ok) {

            workersContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load workers
                    </h3>

                    <p>
                        ${
                            workersData.message ||
                            "Something went wrong."
                        }
                    </p>

                </div>
            `;

            return;

        }


        const workers =
            workersData.workers || [];


        if (workers.length === 0) {

            workersContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        👥
                    </div>

                    <h3>
                        No workers registered
                    </h3>

                    <p>
                        Workers who register on
                        WorkVoice AI will appear here.
                    </p>

                </div>
            `;

            return;

        }


        const sitesResponse =
            await fetch(
                `${API_BASE_URL}/api/sites/owner/${owner.id}`
            );


        const sitesData =
            await sitesResponse.json();


        const sites =
            sitesData.sites || [];


        workersContainer.innerHTML = "";


        workers.forEach(function (worker) {

            const card =
                document.createElement("div");


            card.className =
                "worker-card";


            const heading =
                document.createElement("h3");


            heading.textContent =
                worker.name;


            const info =
                document.createElement("div");


            info.className =
                "worker-info";


            const email =
                document.createElement("p");


            email.textContent =
                `Email: ${worker.email}`;


            const phone =
                document.createElement("p");


            phone.textContent =
                `Phone: ${
                    worker.phone ||
                    "Not provided"
                }`;


            info.appendChild(email);

            info.appendChild(phone);


            // Assignment form

            const form =
                document.createElement("div");


            form.className =
                "assign-form";


            const label =
                document.createElement("label");


            label.textContent =
                "Assign to Site";


            const select =
                document.createElement("select");


            const defaultOption =
                document.createElement("option");


            defaultOption.value = "";

            defaultOption.textContent =
                "Select a site";


            select.appendChild(
                defaultOption
            );


            sites.forEach(function (site) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    site.id;


                option.textContent =
                    site.site_name;


                select.appendChild(
                    option
                );

            });


            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "assign-btn";

            button.textContent =
                "Assign Worker";


            const message =
                document.createElement("div");


            message.className =
                "assign-message";


            button.addEventListener(
                "click",
                async function () {

                    const siteId =
                        select.value;


                    if (!siteId) {

                        message.style.color =
                            "#dc2626";

                        message.textContent =
                            "Please select a site.";

                        return;

                    }


                    button.disabled = true;

                    button.textContent =
                        "Assigning...";


                    try {

                        const response =
                            await fetch(
                                `${API_BASE_URL}/api/workers/assign`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({

                                            ownerId:
                                                owner.id,

                                            siteId:
                                                Number(
                                                    siteId
                                                ),

                                            workerId:
                                                worker.id

                                        })
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            message.style.color =
                                "#dc2626";

                            message.textContent =
                                data.message ||
                                "Assignment failed.";

                            return;

                        }


                        message.style.color =
                            "#15803d";

                        message.textContent =
                            "Worker assigned successfully!";


                        select.value = "";


                        await loadAssignedWorkers();

                        await updateWorkerCount();


                    } catch (error) {

                        console.error(
                            "Assignment error:",
                            error
                        );


                        message.style.color =
                            "#dc2626";

                        message.textContent =
                            error.message ||
                            "Unable to connect to server.";

                    } finally {

                        button.disabled = false;

                        button.textContent =
                            "Assign Worker";

                    }

                }
            );


            form.appendChild(label);

            form.appendChild(select);

            form.appendChild(button);

            form.appendChild(message);


            card.appendChild(heading);

            card.appendChild(info);

            card.appendChild(form);


            workersContainer.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(
            "Load workers error:",
            error
        );


        workersContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Server connection failed
                </h3>

                <p>
                    Make sure your backend
                    is running.
                </p>

            </div>
        `;

    }

}


// ========================================
// LOAD ASSIGNED WORKERS
// ========================================

async function loadAssignedWorkers() {

    const container =
        document.getElementById(
            "assignedWorkersContainer"
        );


    if (!container || !owner) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/workers/assigned/${owner.id}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load assignments
                    </h3>

                    <p>
                        ${
                            data.message ||
                            "Something went wrong."
                        }
                    </p>

                </div>
            `;

            return;

        }


        const workers =
            data.workers || [];


        if (workers.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No workers assigned yet
                    </h3>

                    <p>
                        Assign a worker to one of
                        your worksites above.
                    </p>

                </div>
            `;

            return;

        }


        container.innerHTML = "";


        workers.forEach(function (worker) {

            const row =
                document.createElement("div");


            row.className =
                "assigned-worker-row";


            const info =
                document.createElement("div");


            info.className =
                "assigned-worker-info";


            const heading =
                document.createElement("h3");


            heading.textContent =
                worker.worker_name;


            const email =
                document.createElement("p");


            email.textContent =
                worker.email;


            const phone =
                document.createElement("p");


            phone.textContent =
                worker.phone ||
                "Phone not provided";


            info.appendChild(heading);

            info.appendChild(email);

            info.appendChild(phone);


            const site =
                document.createElement("span");


            site.className =
                "assigned-site";


            site.textContent =
                worker.site_name;


            row.appendChild(info);

            row.appendChild(site);


            container.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Load assigned workers error:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Server connection failed
                </h3>

                <p>
                    Make sure your backend
                    is running.
                </p>

            </div>
        `;

    }

}


// ========================================
// UPDATE WORKER COUNT
// ========================================

async function updateWorkerCount() {

    const countElement =
        document.getElementById(
            "totalWorkers"
        );


    if (!countElement || !owner) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/workers/assigned/${owner.id}`
            );


        const data =
            await response.json();


        if (response.ok) {

            const workers =
                data.workers || [];


            countElement.textContent =
                workers.length;

        }

    } catch (error) {

        console.error(
            "Worker count error:",
            error
        );

    }

}


// ========================================
// LOAD OWNER COMPLAINTS
// ========================================

async function loadOwnerComplaints() {

    const complaintsContainer =
        document.getElementById(
            "complaintsContainer"
        );


    if (!complaintsContainer || !owner) {
        return;
    }


    complaintsContainer.innerHTML = `
        <div class="empty-state">

            <h3>
                Loading complaints...
            </h3>

            <p>
                Please wait.
            </p>

        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/owner/${owner.id}`
            );


        const data =
            await response.json();


        console.log(
            "Owner complaints response:",
            data
        );


        if (!response.ok) {

            complaintsContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load complaints
                    </h3>

                    <p>
                        ${
                            data.message ||
                            "Something went wrong."
                        }
                    </p>

                </div>
            `;

            return;

        }


        const complaints =
            data.complaints || [];


        updateComplaintStats(
            complaints
        );


        if (complaints.length === 0) {

            complaintsContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        No complaints yet
                    </h3>

                    <p>
                        Worker complaints will appear
                        here once a worker submits one.
                    </p>

                </div>
            `;

            return;

        }


        complaintsContainer.innerHTML = "";


        complaints.forEach(function (complaint) {

            const card =
                createComplaintCard(
                    complaint
                );


            complaintsContainer.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(
            "Load owner complaints error:",
            error
        );


        complaintsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Server connection failed
                </h3>

                <p>
                    ${
                        error.message ||
                        "Make sure your backend is running."
                    }
                </p>

            </div>
        `;

    }

}


// ========================================
// UPDATE COMPLAINT STATISTICS
// ========================================

// ========================================
// UPDATE COMPLAINT STATISTICS
// ========================================

function updateComplaintStats(complaints) {

    const totalElement =
        document.getElementById(
            "totalComplaints"
        );

    const openElement =
        document.getElementById(
            "complaintsOpenCount"
        );

    const resolvedElement =
        document.getElementById(
            "resolvedComplaints"
        );

    const escalatedElement =
        document.getElementById(
            "complaintsEscalatedCount"
        );


    const total =
        complaints.length;


    const open =
        complaints.filter(function (complaint) {

            return (
                complaint.status !== "RESOLVED" &&
                complaint.status !== "ESCALATED"
            );

        }).length;


    const resolved =
        complaints.filter(function (complaint) {

            return complaint.status === "RESOLVED";

        }).length;


    const escalated =
        complaints.filter(function (complaint) {

            return complaint.status === "ESCALATED";

        }).length;


    if (totalElement) {
        totalElement.textContent = total;
    }


    if (openElement) {
        openElement.textContent = open;
    }


    if (resolvedElement) {
        resolvedElement.textContent = resolved;
    }


    if (escalatedElement) {
        escalatedElement.textContent = escalated;
    }


    // ========================================
    // UPDATE OVERVIEW STATISTICS
    // ========================================

    const overviewOpen =
        document.getElementById(
            "openComplaints"
        );

    const overviewEscalated =
        document.getElementById(
            "escalatedComplaints"
        );


    if (overviewOpen) {
        overviewOpen.textContent = open;
    }


    if (overviewEscalated) {
        overviewEscalated.textContent =
            escalated;
    }

}


// ========================================
// CREATE COMPLAINT CARD
// ========================================

function createComplaintCard(
    complaint
) {

    const card =
        document.createElement("div");


    card.className =
        "complaint-card";


    // Header

    const header =
        document.createElement("div");


    header.className =
        "complaint-card-header";


    const title =
        document.createElement("h3");


    title.textContent =
        `Complaint #${complaint.id}`;


    const status =
        document.createElement("span");


    status.className =
        `complaint-status ${
            getComplaintStatusClass(
                complaint.status
            )
        }`;


    status.textContent =
        complaint.status;


    header.appendChild(title);

    header.appendChild(status);


    // Worker

    const worker =
        document.createElement("p");


    worker.innerHTML =
        `<strong>Worker:</strong> ${
            escapeHTML(
                complaint.worker_name
            )
        }`;


    // Phone

    const phone =
        document.createElement("p");


    phone.innerHTML =
        `<strong>Phone:</strong> ${
            escapeHTML(
                complaint.worker_phone ||
                "Not provided"
            )
        }`;


    // Site

    const site =
        document.createElement("p");


    site.innerHTML =
        `<strong>Worksite:</strong> ${
            escapeHTML(
                complaint.site_name
            )
        }`;


    // Location

    const location =
        document.createElement("p");


    location.innerHTML =
        `<strong>Location:</strong> ${
            escapeHTML(
                complaint.location ||
                "Not specified"
            )
        }`;


    // Category

    const category =
        document.createElement("p");


    category.innerHTML =
        `<strong>Category:</strong> ${
            escapeHTML(
                complaint.category
            )
        }`;


    // Priority

    const priority =
        document.createElement("span");


    priority.className =
        `complaint-priority ${
            getComplaintPriorityClass(
                complaint.priority
            )
        }`;


    priority.textContent =
        complaint.priority;


    const priorityWrapper =
        document.createElement("p");


    priorityWrapper.innerHTML =
        "<strong>Priority:</strong> ";


    priorityWrapper.appendChild(
        priority
    );


    // Description

    const description =
        document.createElement("p");


    description.className =
        "complaint-description";


    description.innerHTML =
        `<strong>Description:</strong><br>
        ${
            escapeHTML(
                complaint.description
            )
        }`;


    // Date

    const date =
        document.createElement("p");


    date.className =
        "complaint-date";


    date.textContent =
        `Submitted: ${
            formatComplaintDate(
                complaint.created_at
            )
        }`;


    // Actions

    const actions =
        document.createElement("div");


    actions.className =
        "complaint-actions";


    if (
        complaint.status !== "RESOLVED"
    ) {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "complaint-update-btn";


        button.textContent =
            "Update Complaint";


        button.addEventListener(
            "click",
            function () {

                openComplaintUpdate(
                    complaint
                );

            }
        );


        actions.appendChild(button);

    }


    // Assemble

    card.appendChild(header);

    card.appendChild(worker);

    card.appendChild(phone);

    card.appendChild(site);

    card.appendChild(location);

    card.appendChild(category);

    card.appendChild(priorityWrapper);

    card.appendChild(description);

    card.appendChild(date);

    card.appendChild(actions);


    return card;

}


// ========================================
// OPEN COMPLAINT UPDATE
// ========================================

function openComplaintUpdate(
    complaint
) {

    const status =
        prompt(
            `Update status for Complaint #${complaint.id}\n\n` +
            `Current status: ${complaint.status}\n\n` +
            `Enter:\n` +
            `ASSIGNED\n` +
            `IN_PROGRESS\n` +
            `RESOLVED`
        );


    if (!status) {
        return;
    }


    const normalizedStatus =
        status
            .trim()
            .toUpperCase();


    const allowedStatuses = [
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED"
    ];


    if (
        !allowedStatuses.includes(
            normalizedStatus
        )
    ) {

        alert(
            "Invalid status.\n\n" +
            "Use ASSIGNED, IN_PROGRESS or RESOLVED."
        );

        return;

    }


    const comment =
        prompt(
            "Add a response/comment for the worker:"
        );


    updateComplaintStatus(
        complaint.id,
        normalizedStatus,
        comment || ""
    );

}


// ========================================
// UPDATE COMPLAINT STATUS
// ========================================

async function updateComplaintStatus(
    complaintId,
    status,
    comment
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/${complaintId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            ownerId:
                                owner.id,

                            status:
                                status,

                            comment:
                                comment

                        })
                }
            );


        const data =
            await response.json();


        console.log(
            "Update complaint response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update complaint."
            );

            return;

        }


        alert(
            "Complaint updated successfully!"
        );


        await loadOwnerComplaints();

    } catch (error) {

        console.error(
            "Update complaint error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to the server."
        );

    }

}


// ========================================
// STATUS CLASS
// ========================================

function getComplaintStatusClass(
    status
) {

    switch (status) {

        case "SUBMITTED":
            return "status-submitted";

        case "ASSIGNED":
            return "status-assigned";

        case "IN_PROGRESS":
            return "status-progress";

        case "RESOLVED":
            return "status-resolved";

        case "ESCALATED":
            return "status-escalated";

        default:
            return "";

    }

}


// ========================================
// PRIORITY CLASS
// ========================================

function getComplaintPriorityClass(
    priority
) {

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


// ========================================
// FORMAT DATE
// ========================================

function formatComplaintDate(
    dateString
) {

    if (!dateString) {
        return "Unknown date";
    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

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