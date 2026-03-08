const API_BASE = "https://blueroute-api-production-e23a.up.railway.app";


/* =========================
   CREATE SHIPMENT
========================= */

const form = document.getElementById("createShipmentForm");

if (form) {
form.addEventListener("submit", async function (e) {

e.preventDefault();

const tracking = document.getElementById("tracking").value;
const origin = document.getElementById("origin").value;
const destination = document.getElementById("destination").value;

try {

const response = await fetch(`${API_BASE}/create-shipment`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
tracking,
origin,
destination
})
});

const data = await response.json();

alert(data.message || "Shipment created");

loadShipments();

} catch (err) {
alert("Error creating shipment");
console.error(err);
}

});
}


/* =========================
   LOAD SHIPMENTS
========================= */

async function loadShipments() {

try {

const response = await fetch(`${API_BASE}/shipments`);
const shipments = await response.json();

const table = document.getElementById("shipmentTable");

if (!table) return;

table.innerHTML = "";

shipments.forEach((s) => {

const row = document.createElement("tr");

row.innerHTML = `
<td>${s.tracking}</td>
<td>${s.origin}</td>
<td>${s.destination}</td>
<td>${s.status}</td>
`;

table.appendChild(row);

});

} catch (err) {
console.error("Error loading shipments", err);
}

}


/* =========================
   UPDATE SHIPMENT STATUS
========================= */

async function updateShipment() {

const tracking = document.getElementById("updateTracking").value;
const status = document.getElementById("statusSelect").value;

if (!tracking) {
alert("Enter a tracking number");
return;
}

try {

const response = await fetch(`${API_BASE}/update-status`, {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
tracking,
status
})

});

const data = await response.json();

alert(data.message || "Status updated");

loadShipments();

} catch (err) {

alert("Error updating shipment");
console.error(err);

}

}


/* =========================
   INITIAL PAGE LOAD
========================= */

window.addEventListener("load", function () {

loadShipments();

});