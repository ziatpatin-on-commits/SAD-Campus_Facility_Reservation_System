/* =====================================================
   CAMPUS FACILITY RESERVATION AND MONITORING SYSTEM
   JAVASCRIPT
   ===================================================== */


/* =====================================================
   LOGIN ACCOUNTS
   ===================================================== */

const accounts = [
    {
        username: "student",
        password: "student123",
        name: "Juan Dela Cruz",
        role: "Student",
        userType: "Student"
    },
    {
        username: "admin",
        password: "admin123",
        name: "System Administrator",
        role: "Administrator",
        userType: "Staff"
    },
    {
        username: "security",
        password: "security123",
        name: "Security Officer",
        role: "Security",
        userType: "Staff"
    }
];


/* =====================================================
   FACILITIES
   ===================================================== */

const facilities = [
    {
        id: 1,
        name: "Classroom A",
        capacity: 40,
        approvalRequired: true
    },
    {
        id: 2,
        name: "Classroom B",
        capacity: 40,
        approvalRequired: true
    },
    {
        id: 3,
        name: "Computer Laboratory",
        capacity: 35,
        approvalRequired: true
    },
    {
        id: 4,
        name: "Conference Room",
        capacity: 30,
        approvalRequired: false
    },
    {
        id: 5,
        name: "Multimedia Room",
        capacity: 50,
        approvalRequired: true
    },
    {
        id: 6,
        name: "University Gymnasium",
        capacity: 500,
        approvalRequired: true
    }
];


/* =====================================================
   DEFAULT RESERVATIONS
   ===================================================== */

const defaultReservations = [
    {
        id: "RES-001",
        username: "student",
        requester: "Juan Dela Cruz",
        userType: "Student",
        facility: "Conference Room",
        date: "2026-09-25",
        start: "14:00",
        end: "16:00",
        participants: 20,
        purpose: "Student organization meeting",
        details: "",
        status: "Approved",
        securityApproval: "Not Required",
        createdAt: new Date().toISOString()
    },

    {
        id: "RES-002",
        username: "student",
        requester: "Maria Santos",
        userType: "Student",
        facility: "Multimedia Room",
        date: "2026-09-26",
        start: "10:00",
        end: "12:00",
        participants: 35,
        purpose: "Academic presentation",
        details: "",
        status: "Pending",
        securityApproval: "Not Required",
        createdAt: new Date().toISOString()
    },

    {
        id: "RES-003",
        username: "student",
        requester: "Pedro Reyes",
        userType: "Student",
        facility: "Classroom A",
        date: "2026-09-27",
        start: "13:00",
        end: "15:00",
        participants: 30,
        purpose: "Student activity",
        details: "",
        status: "Pending",
        securityApproval: "Not Required",
        createdAt: new Date().toISOString()
    }
];


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

const RESERVATION_KEY = "campusReservations";
const SESSION_KEY = "campusLoggedInUser";


function getReservations() {

    const stored =
        localStorage.getItem(RESERVATION_KEY);

    if (!stored) {

        localStorage.setItem(
            RESERVATION_KEY,
            JSON.stringify(defaultReservations)
        );

        return [...defaultReservations];
    }

    try {
        return JSON.parse(stored);
    } catch (error) {

        localStorage.setItem(
            RESERVATION_KEY,
            JSON.stringify(defaultReservations)
        );

        return [...defaultReservations];
    }
}


function saveReservations(reservations) {

    localStorage.setItem(
        RESERVATION_KEY,
        JSON.stringify(reservations)
    );
}


/* =====================================================
   CURRENT USER
   ===================================================== */

let currentUser = null;


function loadCurrentUser() {

    const savedUser =
        localStorage.getItem(SESSION_KEY);

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}


/* =====================================================
   LOGIN
   ===================================================== */

function login(username, password) {

    const account = accounts.find(function(user) {

        return (
            user.username === username &&
            user.password === password
        );

    });

    if (!account) {
        return false;
    }

    currentUser = {
        username: account.username,
        name: account.name,
        role: account.role,
        userType: account.userType
    };

    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(currentUser)
    );

    return true;
}


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    currentUser = null;

    localStorage.removeItem(SESSION_KEY);

    document
        .getElementById("systemPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    document.getElementById("loginForm").reset();

    document.getElementById("loginError").style.display =
        "none";

    document.getElementById("loginUsername").focus();
}


/* =====================================================
   UPDATE USER DISPLAY
   ===================================================== */

function updateUserDisplay() {

    document.getElementById("currentUserName").textContent =
        currentUser.name;

    document.getElementById("currentUserRole").textContent =
        currentUser.role;
}


/* =====================================================
   ROLE-BASED ACCESS
   ===================================================== */

function applyRoleAccess() {

    const adminButtons =
        document.querySelectorAll(".admin-only");

    const securityButtons =
        document.querySelectorAll(".security-only");


    adminButtons.forEach(function(button) {

        if (currentUser.role === "Administrator") {
            button.classList.remove("hidden");
        } else {
            button.classList.add("hidden");
        }

    });


    securityButtons.forEach(function(button) {

        if (
            currentUser.role === "Security" ||
            currentUser.role === "Administrator"
        ) {
            button.classList.remove("hidden");
        } else {
            button.classList.add("hidden");
        }

    });


    /*
       Hide Administration and Security pages
       from unauthorized users.
    */

    document.getElementById("administrationPage")
        .classList.remove("active-page");

    document.getElementById("securityPage")
        .classList.remove("active-page");
}


/* =====================================================
   SHOW SYSTEM
   ===================================================== */

function showSystem() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("systemPage")
        .classList.remove("hidden");

    updateUserDisplay();

    applyRoleAccess();

    loadFacilities();

    loadFacilityCards();

    updateDashboard();

    loadMyReservations();

    loadAdminReservations();

    loadSecurityReservations();

    generateReports();
}


/* =====================================================
   DATE FORMAT
   ===================================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =====================================================
   STATUS BADGE
   ===================================================== */

function statusBadge(status) {

    let className = "status-pending";

    if (status === "Approved") {
        className = "status-approved";
    }

    if (status === "Rejected") {
        className = "status-rejected";
    }

    if (status === "Cancelled") {
        className = "status-cancelled";
    }

    return `
        <span class="status-badge ${className}">
            ${status}
        </span>
    `;
}


/* =====================================================
   TIME OVERLAP
   ===================================================== */

function timesOverlap(
    start1,
    end1,
    start2,
    end2
) {

    return (
        start1 < end2 &&
        start2 < end1
    );
}


/* =====================================================
   CHECK CONFLICT
   ===================================================== */

function hasConflict(
    facility,
    date,
    start,
    end,
    ignoreId = null
) {

    const reservations = getReservations();

    return reservations.some(function(reservation) {

        if (reservation.id === ignoreId) {
            return false;
        }

        if (reservation.facility !== facility) {
            return false;
        }

        if (reservation.date !== date) {
            return false;
        }

        if (
            reservation.status === "Rejected" ||
            reservation.status === "Cancelled"
        ) {
            return false;
        }

        return timesOverlap(
            start,
            end,
            reservation.start,
            reservation.end
        );

    });
}


/* =====================================================
   LOAD FACILITY SELECT OPTIONS
   ===================================================== */

function loadFacilities() {

    const availabilitySelect =
        document.getElementById(
            "availabilityFacility"
        );

    const reservationSelect =
        document.getElementById(
            "reservationFacility"
        );


    availabilitySelect.innerHTML =
        '<option value="">Select facility</option>';

    reservationSelect.innerHTML =
        '<option value="">Select facility</option>';


    facilities.forEach(function(facility) {

        const option1 =
            document.createElement("option");

        option1.value = facility.name;

        option1.textContent =
            `${facility.name} - Capacity ${facility.capacity}`;

        availabilitySelect.appendChild(option1);


        const option2 =
            document.createElement("option");

        option2.value = facility.name;

        option2.textContent =
            `${facility.name} - Capacity ${facility.capacity}`;

        reservationSelect.appendChild(option2);

    });
}


/* =====================================================
   FACILITY CARDS
   ===================================================== */

function loadFacilityCards() {

    const container =
        document.getElementById("facilityCards");

    container.innerHTML = "";

    facilities.forEach(function(facility) {

        const card =
            document.createElement("div");

        card.className = "facility-card";

        card.innerHTML = `
            <h3>🏢 ${facility.name}</h3>

            <p class="facility-capacity">
                Maximum Capacity:
                ${facility.capacity} persons
            </p>

            <p>
                ${
                    facility.approvalRequired
                    ? "Administrative Approval Required"
                    : "Standard Auto-Approval Available"
                }
            </p>
        `;

        container.appendChild(card);

    });
}


/* =====================================================
   CHECK AVAILABILITY
   ===================================================== */

function checkAvailability() {

    const facility =
        document.getElementById(
            "availabilityFacility"
        ).value;

    const date =
        document.getElementById(
            "availabilityDate"
        ).value;

    const start =
        document.getElementById(
            "availabilityStart"
        ).value;

    const end =
        document.getElementById(
            "availabilityEnd"
        ).value;

    const result =
        document.getElementById(
            "availabilityResult"
        );


    if (!facility || !date || !start || !end) {

        result.innerHTML = `
            <div class="error-message">
                Please complete all availability fields.
            </div>
        `;

        return;
    }


    if (start >= end) {

        result.innerHTML = `
            <div class="error-message">
                End time must be later than start time.
            </div>
        `;

        return;
    }


    const conflict =
        hasConflict(
            facility,
            date,
            start,
            end
        );


    if (conflict) {

        result.innerHTML = `
            <div class="error-message">
                ❌ The selected facility is NOT AVAILABLE
                for the selected date and time.
            </div>
        `;

    } else {

        result.innerHTML = `
            <div class="success-message">
                ✅ The selected facility is AVAILABLE
                for the selected date and time.
            </div>
        `;
    }
}


/* =====================================================
   RESERVATION SUBMISSION
   ===================================================== */

function submitReservation(event) {

    event.preventDefault();


    const requester =
        document.getElementById(
            "requesterName"
        ).value.trim();

    const userType =
        document.getElementById(
            "userType"
        ).value;

    const facilityName =
        document.getElementById(
            "reservationFacility"
        ).value;

    const date =
        document.getElementById(
            "reservationDate"
        ).value;

    const start =
        document.getElementById(
            "reservationStart"
        ).value;

    const end =
        document.getElementById(
            "reservationEnd"
        ).value;

    const participants =
        Number(
            document.getElementById(
                "participants"
            ).value
        );

    const purpose =
        document.getElementById(
            "purpose"
        ).value.trim();

    const details =
        document.getElementById(
            "additionalDetails"
        ).value.trim();

    const message =
        document.getElementById(
            "reservationMessage"
        );


    const facility =
        facilities.find(function(item) {
            return item.name === facilityName;
        });


    if (!facility) {

        message.innerHTML = `
            <div class="error-message">
                Please select a valid facility.
            </div>
        `;

        return;
    }


    if (start >= end) {

        message.innerHTML = `
            <div class="error-message">
                End time must be later than start time.
            </div>
        `;

        return;
    }


    if (participants <= 0) {

        message.innerHTML = `
            <div class="error-message">
                Number of participants must be greater than zero.
            </div>
        `;

        return;
    }


    if (participants > facility.capacity) {

        message.innerHTML = `
            <div class="error-message">
                The number of participants exceeds the
                capacity of ${facility.name}.
                Maximum capacity: ${facility.capacity}.
            </div>
        `;

        return;
    }


    if (
        hasConflict(
            facilityName,
            date,
            start,
            end
        )
    ) {

        message.innerHTML = `
            <div class="error-message">
                ❌ Reservation conflict detected.
                The facility is already reserved
                during this schedule.
            </div>
        `;

        return;
    }


    /*
       SECURITY APPROVAL
       More than 100 participants.
    */

    let securityApproval =
        participants > 100
        ? "Pending"
        : "Not Required";


    /*
       AUTO APPROVAL
       Only if facility doesn't require approval
       AND participants <= 100.
    */

    let status = "Pending";

    if (
        !facility.approvalRequired &&
        participants <= 100
    ) {
        status = "Approved";
    }


    const reservations =
        getReservations();


    const reservation = {

        id: generateReservationId(),

        username: currentUser.username,

        requester: requester,

        userType: userType,

        facility: facilityName,

        date: date,

        start: start,

        end: end,

        participants: participants,

        purpose: purpose,

        details: details,

        status: status,

        securityApproval: securityApproval,

        createdAt: new Date().toISOString()
    };


    reservations.push(reservation);

    saveReservations(reservations);


    message.innerHTML = `
        <div class="success-message">
            ✅ Reservation submitted successfully.
            <br>
            Reservation ID:
            <strong>${reservation.id}</strong>
            <br>
            Status:
            <strong>${reservation.status}</strong>
        </div>
    `;


    document.getElementById(
        "reservationForm"
    ).reset();


    document.getElementById(
        "requesterName"
    ).value = currentUser.name;


    document.getElementById(
        "userType"
    ).value = currentUser.userType;


    updateDashboard();

    loadMyReservations();

    loadAdminReservations();

    loadSecurityReservations();

    generateReports();

}


/* =====================================================
   GENERATE RESERVATION ID
   ===================================================== */

function generateReservationId() {

    const reservations =
        getReservations();

    let number = reservations.length + 1;

    let id =
        `RES-${String(number).padStart(3, "0")}`;


    while (
        reservations.some(
            reservation => reservation.id === id
        )
    ) {

        number++;

        id =
            `RES-${String(number).padStart(3, "0")}`;
    }


    return id;
}


/* =====================================================
   LOAD MY RESERVATIONS
   ===================================================== */

function loadMyReservations() {

    const table =
        document.getElementById(
            "myReservationsTable"
        );

    const reservations =
        getReservations();


    const myReservations =
        reservations.filter(function(reservation) {

            return (
                reservation.username ===
                currentUser.username
            );

        });


    table.innerHTML = "";


    if (myReservations.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No reservations found.
                </td>
            </tr>
        `;

        return;
    }


    myReservations.forEach(function(reservation) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${reservation.id}</td>

            <td>${reservation.facility}</td>

            <td>${formatDate(reservation.date)}</td>

            <td>
                ${reservation.start} -
                ${reservation.end}
            </td>

            <td>${reservation.participants}</td>

            <td>${reservation.purpose}</td>

            <td>
                ${statusBadge(reservation.status)}
            </td>

            <td>
                ${
                    reservation.status !== "Cancelled" &&
                    reservation.status !== "Rejected"
                    ? `
                        <button
                            class="danger-btn"
                            onclick="cancelReservation('${reservation.id}')"
                        >
                            Cancel
                        </button>
                    `
                    : "-"
                }
            </td>
        `;

        table.appendChild(row);

    });
}


/* =====================================================
   CANCEL RESERVATION
   ===================================================== */

function cancelReservation(id) {

    const reservations =
        getReservations();


    const reservation =
        reservations.find(
            item => item.id === id
        );


    if (!reservation) {
        return;
    }


    const confirmation =
        confirm(
            `Cancel reservation ${id}?`
        );


    if (!confirmation) {
        return;
    }


    reservation.status = "Cancelled";


    saveReservations(reservations);


    loadMyReservations();

    loadAdminReservations();

    loadSecurityReservations();

    updateDashboard();

    generateReports();

}


/* =====================================================
   ADMINISTRATION TABLE
   ===================================================== */

function loadAdminReservations() {

    const table =
        document.getElementById(
            "adminReservationsTable"
        );


    if (currentUser.role !== "Administrator") {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    Administrator access required.
                </td>
            </tr>
        `;

        return;
    }


    const reservations =
        getReservations();


    table.innerHTML = "";


    if (reservations.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    No reservation requests.
                </td>
            </tr>
        `;

        return;
    }


    reservations.forEach(function(reservation) {

        const row =
            document.createElement("tr");


        let actionButtons = "-";


        if (
            reservation.status === "Pending"
        ) {

            const securityOK =
                reservation.participants <= 100 ||
                reservation.securityApproval === "Approved";


            actionButtons = `

                <button
                    class="success-btn"
                    onclick="approveReservation('${reservation.id}')"
                    ${securityOK ? "" : "disabled"}
                    title="${
                        securityOK
                        ? "Approve reservation"
                        : "Security approval required"
                    }"
                >
                    Approve
                </button>

                <button
                    class="danger-btn"
                    onclick="rejectReservation('${reservation.id}')"
                >
                    Reject
                </button>
            `;
        }


        row.innerHTML = `

            <td>${reservation.id}</td>

            <td>${reservation.requester}</td>

            <td>${reservation.facility}</td>

            <td>${formatDate(reservation.date)}</td>

            <td>
                ${reservation.start} -
                ${reservation.end}
            </td>

            <td>${reservation.participants}</td>

            <td>
                ${reservation.securityApproval}
            </td>

            <td>
                ${statusBadge(reservation.status)}
            </td>

            <td>
                ${actionButtons}
            </td>
        `;


        table.appendChild(row);

    });
}


/* =====================================================
   ADMIN APPROVE
   ===================================================== */

function approveReservation(id) {

    if (
        currentUser.role !== "Administrator"
    ) {
        alert(
            "Administrator access required."
        );

        return;
    }


    const reservations =
        getReservations();


    const reservation =
        reservations.find(
            item => item.id === id
        );


    if (!reservation) {
        return;
    }


    if (
        reservation.participants > 100 &&
        reservation.securityApproval !== "Approved"
    ) {

        alert(
            "Security approval is required before this reservation can be approved."
        );

        return;
    }


    reservation.status = "Approved";


    saveReservations(reservations);


    loadAdminReservations();

    loadMyReservations();

    updateDashboard();

    generateReports();

    alert(
        `Reservation ${id} approved.`
    );
}


/* =====================================================
   ADMIN REJECT
   ===================================================== */

function rejectReservation(id) {

    if (
        currentUser.role !== "Administrator"
    ) {

        alert(
            "Administrator access required."
        );

        return;
    }


    const reservations =
        getReservations();


    const reservation =
        reservations.find(
            item => item.id === id
        );


    if (!reservation) {
        return;
    }


    reservation.status = "Rejected";


    saveReservations(reservations);


    loadAdminReservations();

    loadMyReservations();

    updateDashboard();

    generateReports();

    alert(
        `Reservation ${id} rejected.`
    );
}


/* =====================================================
   SECURITY TABLE
   ===================================================== */

function loadSecurityReservations() {

    const table =
        document.getElementById(
            "securityReservationsTable"
        );


    if (
        currentUser.role !== "Security" &&
        currentUser.role !== "Administrator"
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Security access required.
                </td>
            </tr>
        `;

        return;
    }


    const reservations =
        getReservations();


    const afterHours =
        reservations.filter(function(reservation) {

            return (
                reservation.status === "Approved" &&
                reservation.start >= "18:00"
            );

        });


    table.innerHTML = "";


    if (afterHours.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No approved after-hours reservations.
                </td>
            </tr>
        `;

        return;
    }


    afterHours.forEach(function(reservation) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${reservation.id}</td>

            <td>${reservation.requester}</td>

            <td>${reservation.facility}</td>

            <td>${formatDate(reservation.date)}</td>

            <td>
                ${reservation.start} -
                ${reservation.end}
            </td>

            <td>${reservation.participants}</td>

            <td>
                ${
                    currentUser.role === "Security"
                    ? `
                        <button
                            class="success-btn"
                            onclick="securityApprove('${reservation.id}')"
                        >
                            Approve
                        </button>
                    `
                    : reservation.securityApproval
                }
            </td>
        `;


        table.appendChild(row);

    });
}


/* =====================================================
   SECURITY APPROVAL
   ===================================================== */

function securityApprove(id) {

    if (
        currentUser.role !== "Security" &&
        currentUser.role !== "Administrator"
    ) {

        alert(
            "Security access required."
        );

        return;
    }


    const reservations =
        getReservations();


    const reservation =
        reservations.find(
            item => item.id === id
        );


    if (!reservation) {
        return;
    }


    reservation.securityApproval =
        "Approved";


    saveReservations(reservations);


    loadSecurityReservations();

    loadAdminReservations();


    alert(
        `Security approval recorded for ${id}.`
    );
}


/* =====================================================
   DASHBOARD
   ===================================================== */

function updateDashboard() {

    const reservations =
        getReservations();


    document.getElementById(
        "totalFacilities"
    ).textContent =
        facilities.length;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    let availableCount = 0;


    facilities.forEach(function(facility) {

        const occupied =
            reservations.some(function(reservation) {

                return (
                    reservation.facility === facility.name &&
                    reservation.date === today &&
                    reservation.status === "Approved"
                );

            });


        if (!occupied) {
            availableCount++;
        }

    });


    document.getElementById(
        "availableToday"
    ).textContent =
        availableCount;


    const pending =
        reservations.filter(
            reservation =>
                reservation.status === "Pending"
        ).length;


    document.getElementById(
        "pendingRequests"
    ).textContent =
        pending;


    const mine =
        reservations.filter(
            reservation =>
                reservation.username ===
                currentUser.username
        ).length;


    document.getElementById(
        "myReservationCount"
    ).textContent =
        mine;


    loadRecentReservations();
}


/* =====================================================
   RECENT RESERVATIONS
   ===================================================== */

function loadRecentReservations() {

    const table =
        document.getElementById(
            "recentReservationsTable"
        );


    const reservations =
        getReservations()
            .slice()
            .reverse()
            .slice(0, 5);


    table.innerHTML = "";


    reservations.forEach(function(reservation) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${reservation.id}</td>

            <td>${reservation.requester}</td>

            <td>${reservation.facility}</td>

            <td>${formatDate(reservation.date)}</td>

            <td>
                ${reservation.start} -
                ${reservation.end}
            </td>

            <td>${reservation.participants}</td>

            <td>
                ${statusBadge(reservation.status)}
            </td>
        `;


        table.appendChild(row);

    });
}


/* =====================================================
   REPORTS
   ===================================================== */

function generateReports() {

    const container =
        document.getElementById(
            "reportContent"
        );


    const reservations =
        getReservations();


    let html = "";


    facilities.forEach(function(facility) {

        const count =
            reservations.filter(
                reservation =>
                    reservation.facility ===
                    facility.name &&
                    reservation.status === "Approved"
            ).length;


        const percentage =
            reservations.length > 0
            ? Math.min(
                100,
                Math.round(
                    (count / reservations.length) * 100
                )
            )
            : 0;


        html += `

            <div class="report-item">

                <div class="report-header">

                    <strong>
                        ${facility.name}
                    </strong>

                    <span>
                        ${count} approved reservation(s)
                    </span>

                </div>

                <div class="progress-container">

                    <div
                        class="progress-bar"
                        style="width: ${percentage}%"
                    ></div>

                </div>

            </div>
        `;
    });


    container.innerHTML = html;
}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );


    buttons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const pageId =
                    button.dataset.page;


                /*
                   ROLE PROTECTION
                */

                if (
                    pageId === "administrationPage" &&
                    currentUser.role !== "Administrator"
                ) {

                    alert(
                        "Administrator access required."
                    );

                    return;
                }


                if (
                    pageId === "securityPage" &&
                    currentUser.role !== "Security" &&
                    currentUser.role !== "Administrator"
                ) {

                    alert(
                        "Security access required."
                    );

                    return;
                }


                document
                    .querySelectorAll(".page")
                    .forEach(function(page) {

                        page.classList.remove(
                            "active-page"
                        );

                    });


                document
                    .querySelectorAll(".nav-btn")
                    .forEach(function(navButton) {

                        navButton.classList.remove(
                            "active"
                        );

                    });


                document
                    .getElementById(pageId)
                    .classList.add(
                        "active-page"
                    );


                button.classList.add("active");


                /*
                   Refresh page data
                */

                if (pageId === "dashboardPage") {
                    updateDashboard();
                }

                if (pageId === "myReservationsPage") {
                    loadMyReservations();
                }

                if (pageId === "administrationPage") {
                    loadAdminReservations();
                }

                if (pageId === "securityPage") {
                    loadSecurityReservations();
                }

                if (pageId === "reportsPage") {
                    generateReports();
                }

            }
        );

    });
}


/* =====================================================
   LOGIN EVENT
   ===================================================== */

function setupLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "loginUsername"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const error =
                document.getElementById(
                    "loginError"
                );


            const successful =
                login(
                    username,
                    password
                );


            if (!successful) {

                error.textContent =
                    "Invalid username or password.";

                error.style.display =
                    "block";

                return;
            }


            error.style.display =
                "none";


            showSystem();

        }
    );


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            function() {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmed) {
                    logout();
                }

            }
        );
}


/* =====================================================
   FORM EVENTS
   ===================================================== */

function setupForms() {

    document
        .getElementById(
            "checkAvailabilityBtn"
        )
        .addEventListener(
            "click",
            checkAvailability
        );


    document
        .getElementById(
            "reservationForm"
        )
        .addEventListener(
            "submit",
            submitReservation
        );


    /*
       Automatically restore logged-in user's
       information in reservation form.
    */

    document
        .getElementById(
            "requesterName"
        )
        .addEventListener(
            "focus",
            function() {

                if (
                    currentUser &&
                    !this.value
                ) {
                    this.value =
                        currentUser.name;
                }

            }
        );
}


/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupLogin();

        setupNavigation();

        setupForms();


        currentUser =
            loadCurrentUser();


        if (currentUser) {

            showSystem();

        } else {

            document
                .getElementById(
                    "loginPage"
                )
                .classList.remove("hidden");

            document
                .getElementById(
                    "systemPage"
                )
                .classList.add("hidden");

            document
                .getElementById(
                    "loginUsername"
                )
                .focus();
        }

    }
);


/* =====================================================
   OPTIONAL RESET FUNCTION
   ===================================================== */

/*
   To completely reset the system:

   1. Press F12
   2. Open Console
   3. Run:

   localStorage.clear();
   location.reload();

*/