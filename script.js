
/* ==========================================
   LOST AND FOUND MANAGEMENT SYSTEM
   CRUD FUNCTIONALITY
========================================== */

// GET SAVED RECORDS SAFELY

function getSavedData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error loading saved records:", error);
        return [];
    }
}

let items = getSavedData("lostFoundItems");
let archivedItems = getSavedData("archivedItems");


// SAVE RECORDS

function saveItems() {
    try {
        localStorage.setItem("lostFoundItems", JSON.stringify(items));
        localStorage.setItem("archivedItems", JSON.stringify(archivedItems));
    } catch (error) {
        console.error("Error saving records:", error);
        alert("Unable to save records. Please check your browser storage.");
    }
}


// NAVIGATION

const navLinks = document.querySelectorAll(".nav-link");

const pageTitles = {
    dashboard: "Dashboard",
    records: "Item Records",
    add: "Add New Report",
    archive: "Archive"
};

function showPage(pageName) {

    const selectedPage = document.getElementById(pageName + "Page");

    if (!selectedPage || !pageTitles[pageName]) {
        return;
    }

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    // Show selected page
    selectedPage.classList.add("active-page");

    // Update navigation
    navLinks.forEach(link => {
        link.classList.remove("active");
    });

    const selectedLink = document.querySelector(
        `[data-page="${pageName}"]`
    );

    if (selectedLink) {
        selectedLink.classList.add("active");
    }

    // Update page title
    document.getElementById("pageTitle").textContent =
        pageTitles[pageName];

    refreshSystem();
}


// NAVIGATION CLICK EVENTS

navLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        showPage(this.dataset.page);

    });

});


// DASHBOARD STATISTICS

function updateDashboard() {

    document.getElementById("totalItems").textContent = items.length;

    document.getElementById("lostItems").textContent =
        items.filter(item => item.status === "Lost").length;

    document.getElementById("foundItems").textContent =
        items.filter(item => item.status === "Found").length;

    document.getElementById("claimedItems").textContent =
        items.filter(item => item.status === "Claimed").length;

}


// DISPLAY ITEM RECORDS

function displayRecords(searchText = "") {

    const tableBody = document.getElementById("itemTableBody");

    tableBody.innerHTML = "";

    const filteredItems = items.filter(item => {

        const itemName = String(item.itemName || "");

        return itemName.toLowerCase().includes(
            searchText.trim().toLowerCase()
        );

    });

    if (filteredItems.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No records found.
                </td>
            </tr>
        `;

        return;
    }

    filteredItems.forEach(item => {

        const row = document.createElement("tr");

        const values = [
            item.id,
            item.itemName,
            item.category,
            item.reportType,
            item.location,
            item.status
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value || "N/A";

            row.appendChild(cell);

        });

        // ACTION BUTTONS

        const actionCell = document.createElement("td");

        // EDIT BUTTON

        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "action-btn edit-btn";

        editButton.addEventListener("click", () => {
            editItem(item.id);
        });

        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "action-btn delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteItem(item.id);
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}


// DISPLAY RECENT RECORDS

function displayRecentRecords() {

    const container = document.getElementById("recentRecords");

    container.innerHTML = "";

    const recentItems = [...items].reverse().slice(0, 5);

    if (recentItems.length === 0) {

        container.textContent = "No item records available.";

        return;
    }

    recentItems.forEach(item => {

        const record = document.createElement("div");

        record.className = "record-row";

        const details = document.createElement("div");

        const name = document.createElement("h3");

        const description = document.createElement("p");

        name.textContent = item.itemName || "Unnamed Item";

        description.textContent =
            (item.category || "N/A") + " | " +
            (item.location || "N/A");

        details.appendChild(name);
        details.appendChild(description);

        const status = document.createElement("span");

        status.textContent = item.status || "Unknown";

        status.className =
            "status " + String(item.status || "").toLowerCase();

        record.appendChild(details);
        record.appendChild(status);

        container.appendChild(record);

    });

}


// CREATE AND UPDATE RECORDS

document.getElementById("itemForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const editId = document.getElementById("editItemId").value;

        // GET FORM DATA

        const itemData = {

            itemName: document.getElementById("itemName").value.trim(),

            category: document.getElementById("category").value,

            description: document.getElementById("description").value.trim(),

            location: document.getElementById("location").value.trim(),

            dateReported: document.getElementById("dateReported").value,

            reportType: document.getElementById("reportType").value,

            status: document.getElementById("status").value,

            reporterName: document.getElementById("reporterName").value.trim()

        };


        // UPDATE EXISTING RECORD

        if (editId) {

            const index = items.findIndex(item => item.id === editId);

            if (index !== -1) {

                items[index] = {
                    ...items[index],
                    ...itemData
                };

                alert("Record updated successfully!");

            } else {

                alert("Record not found.");

                return;

            }

        }


        // CREATE NEW RECORD

        else {

            const newItem = {

                id: "LF-" + Date.now(),

                ...itemData

            };

            items.push(newItem);

            alert("New item recorded successfully!");

        }


        // SAVE AND REFRESH

        saveItems();

        resetForm();

        showPage("records");

    }
);


// EDIT RECORD

function editItem(id) {

    const item = items.find(item => item.id === id);

    if (!item) {

        alert("Record not found.");

        return;

    }

    // LOAD EXISTING DATA INTO FORM

    document.getElementById("editItemId").value = item.id;

    document.getElementById("itemName").value = item.itemName || "";

    document.getElementById("category").value = item.category || "";

    document.getElementById("description").value = item.description || "";

    document.getElementById("location").value = item.location || "";

    document.getElementById("dateReported").value = item.dateReported || "";

    document.getElementById("reportType").value = item.reportType || "";

    document.getElementById("status").value = item.status || "";

    document.getElementById("reporterName").value = item.reporterName || "";

    document.getElementById("formTitle").textContent =
        "Edit Item Record";

    showPage("add");

}


// DELETE RECORD - MOVE TO ARCHIVE

function deleteItem(id) {

    const confirmDelete = confirm(
        "Are you sure you want to move this record to the archive?"
    );

    if (!confirmDelete) return;

    const item = items.find(item => item.id === id);

    if (!item) return;

    // Move item to archive
    archivedItems.push(item);

    // Remove item from active records
    items = items.filter(item => item.id !== id);

    saveItems();

    refreshSystem();

    alert("Record moved to archive!");

}


// DISPLAY ARCHIVED RECORDS

function displayArchive() {

    const container = document.getElementById("archiveRecords");

    container.innerHTML = "";

    if (archivedItems.length === 0) {

        container.textContent = "No archived records.";

        return;

    }

    archivedItems.forEach(item => {

        const record = document.createElement("div");

        record.className = "record-row";

        const details = document.createElement("div");

        const name = document.createElement("h3");

        const description = document.createElement("p");

        name.textContent = item.itemName || "Unnamed Item";

        description.textContent =
            (item.category || "N/A") + " | " +
            (item.location || "N/A");

        details.appendChild(name);
        details.appendChild(description);

        // RESTORE BUTTON

        const restoreButton = document.createElement("button");

        restoreButton.textContent = "Restore";

        restoreButton.className = "action-btn restore-btn";

        restoreButton.addEventListener("click", () => {
            restoreItem(item.id);
        });

        // PERMANENT DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete Permanently";

        deleteButton.className = "action-btn delete-btn";

        deleteButton.addEventListener("click", () => {
            permanentlyDelete(item.id);
        });

        record.appendChild(details);

        record.appendChild(restoreButton);

        record.appendChild(deleteButton);

        container.appendChild(record);

    });

}


// RESTORE ARCHIVED RECORD

function restoreItem(id) {

    const item = archivedItems.find(item => item.id === id);

    if (!item) return;

    items.push(item);

    archivedItems = archivedItems.filter(item => item.id !== id);

    saveItems();

    refreshSystem();

    alert("Record restored successfully!");

}


// PERMANENTLY DELETE RECORD

function permanentlyDelete(id) {

    const confirmDelete = confirm(
        "Are you sure you want to permanently delete this record?"
    );

    if (!confirmDelete) return;

    archivedItems = archivedItems.filter(item => item.id !== id);

    saveItems();

    refreshSystem();

    alert("Record permanently deleted!");

}


// RESET FORM

function resetForm() {

    document.getElementById("itemForm").reset();

    document.getElementById("editItemId").value = "";

    document.getElementById("formTitle").textContent =
        "Report a Lost or Found Item";

    // Set default date to today
    document.getElementById("dateReported").value =
        getTodayDate();

}


// GET TODAY'S LOCAL DATE

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ADD NEW REPORT BUTTON

document.getElementById("addNewButton").addEventListener(
    "click",
    function() {

        resetForm();

        showPage("add");

    }
);


// CANCEL BUTTON

document.getElementById("cancelButton").addEventListener(
    "click",
    function() {

        resetForm();

        showPage("records");

    }
);


// SEARCH RECORDS

document.getElementById("searchInput").addEventListener(
    "input",
    function() {

        displayRecords(this.value);

    }
);


// REFRESH SYSTEM

function refreshSystem() {

    updateDashboard();

    displayRecords(
        document.getElementById("searchInput").value
    );

    displayRecentRecords();

    displayArchive();

}


/* ==========================================
   FRONT PAGE TO DASHBOARD NAVIGATION
========================================== */

document.getElementById("goToDashboard").addEventListener("click", function() {

    // Hide the welcome page
    document.getElementById("landingPage").style.display = "none";

    // Show the main application
    document.getElementById("appContainer").classList.add("active-layout");

    // Open the dashboard
    showPage("dashboard");

});


// INITIALIZE SYSTEM

document.addEventListener("DOMContentLoaded", function() {

    resetForm();

    refreshSystem();

});
