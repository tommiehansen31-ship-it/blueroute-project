const API="https://blueroute-api-production-e23a.up.railway.app";

/* =================================
CREATE SHIPMENT
================================= */

const createForm = document.getElementById("createShipmentForm");

if (createForm) {

createForm.addEventListener("submit", async function (e) {

e.preventDefault();

const senderName = document.getElementById("senderName").value;
const senderEmail = document.getElementById("senderEmail").value;
const receiverName = document.getElementById("receiverName").value;
const receiverEmail = document.getElementById("receiverEmail").value;

const origin = document.getElementById("origin").value;
const destination = document.getElementById("destination").value;

const token = sessionStorage.getItem("br_token");

try {

const response = await fetch(API + "/api/admin/create-shipment", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: token
},
body: JSON.stringify({
senderName,
senderEmail,
receiverName,
receiverEmail,
origin,
destination
})
});

const data = await response.json();

if (data.success) {
alert("Shipment created. Tracking: " + data.trackingNumber);
loadShipments();
}

} catch (err) {
alert("Server error");
}

});

}

/* =================================
LOAD SHIPMENTS
================================= */

async function loadShipments() {

const token = sessionStorage.getItem("br_token");

try {

const response = await fetch(API + "/api/admin/shipments", {
headers:{Authorization: token}
});

const data = await response.json();

const tableBody = document.getElementById("shipmentTable");
tableBody.innerHTML = "";

data.forEach(function (s) {

const row = document.createElement("tr");

row.innerHTML = `
<td>${s.tracking}</td>
<td>${s.origin}</td>
<td>${s.destination}</td>
<td>${s.status}</td>
`;

row.onclick=function(){
document.getElementById("updateTracking").value=s.tracking;
showSection("update");
};

tableBody.appendChild(row);

});

} catch (err) {

console.error("Failed loading shipments", err);

}

}

/* =================================
UPDATE SHIPMENT
================================= */

async function updateShipment() {

const token = sessionStorage.getItem("br_token");

const trackingNumber = document.getElementById("updateTracking").value;
const status = document.getElementById("statusSelect").value;

const response = await fetch(API + "/api/admin/update-shipment", {

method: "POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({
trackingNumber,
status
})

});

const data = await response.json();

if(data.success){
alert("Shipment updated");
loadShipments();
}else{
alert("Update failed");
}

}

/* =================================
PAGE LOAD
================================= */

window.onload=function(){
loadShipments();
};