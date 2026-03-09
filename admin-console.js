/* =================================
CREATE SHIPMENT
================================= */

const createForm = document.getElementById("createShipmentForm");

if (createForm) {

createForm.addEventListener("submit", async function (e) {

e.preventDefault();

const senderName = document.getElementById("senderName").value;
const senderAddress = document.getElementById("senderAddress").value;
const senderPhone = document.getElementById("senderPhone").value;
const senderEmail = document.getElementById("senderEmail").value;

const receiverName = document.getElementById("receiverName").value;
const receiverAddress = document.getElementById("receiverAddress").value;
const receiverPhone = document.getElementById("receiverPhone").value;
const receiverEmail = document.getElementById("receiverEmail").value;

const origin = document.getElementById("origin").value;
const destination = document.getElementById("destination").value;

const shipmentName = document.getElementById("shipmentName").value;
const weight = document.getElementById("weight").value;
const itemsSent = document.getElementById("itemsSent").value;
const boxCount = document.getElementById("boxCount").value;

const sentDate = document.getElementById("sentDate").value;
const estimatedDelivery = document.getElementById("estimatedDelivery").value;

const remarks = document.getElementById("remarks").value;

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
senderAddress,
senderPhone,
senderEmail,
receiverName,
receiverAddress,
receiverPhone,
receiverEmail,
origin,
destination,
shipmentName,
weight,
itemsSent,
boxCount,
sentDate,
estimatedDelivery,
remarks
})
});

const data = await response.json();

if (data.success) {
alert("Shipment created. Tracking: " + data.trackingNumber);
loadShipments();
loadDashboard();
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

if(!tableBody) return;

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

window.open("admin-console.html?tracking="+s.tracking,"_blank");

};

tableBody.appendChild(row);

});

} catch (err) {

console.error("Failed loading shipments", err);

}

}


/* =================================
LOAD DASHBOARD
================================= */

async function loadDashboard(){

const token = sessionStorage.getItem("br_token");

try{

const response = await fetch(API + "/api/admin/shipments",{
headers:{Authorization: token}
});

const data = await response.json();

/* ===== STATS ===== */

let total = data.length;
let transit = 0;
let delivered = 0;

data.forEach(s=>{

const status = s.status.toLowerCase();

if(status.includes("transit")) transit++;

if(status.includes("delivered")) delivered++;

});

const statTotal = document.getElementById("statTotal");
const statTransit = document.getElementById("statTransit");
const statDelivered = document.getElementById("statDelivered");

if(statTotal) statTotal.innerText = total;
if(statTransit) statTransit.innerText = transit;
if(statDelivered) statDelivered.innerText = delivered;


/* ===== RECENT TABLE ===== */

const dashboardTable = document.getElementById("dashboardTable");

if(!dashboardTable) return;

dashboardTable.innerHTML="";

data.slice(0,5).forEach(s=>{

const row = document.createElement("tr");

row.innerHTML=`
<td>${s.tracking}</td>
<td>${s.origin}</td>
<td>${s.destination}</td>
<td>${s.status}</td>
`;

row.onclick=function(){

document.getElementById("updateTracking").value=s.tracking;

showSection("update");

};

dashboardTable.appendChild(row);

});

}catch(err){

console.error("Dashboard load failed",err);

}

}


/* =================================
UPDATE SHIPMENT
================================= */

async function updateShipment() {

const token = sessionStorage.getItem("br_token");

const trackingNumber = document.getElementById("updateTracking").value;
const status = document.getElementById("statusSelect").value;
const remarks = document.getElementById("updateRemarks").value;

const response = await fetch(API + "/api/admin/update-shipment", {

method: "POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({
trackingNumber,
status,
remarks
})

});

const data = await response.json();

if(data.success){
alert("Shipment updated");
loadShipments();
loadDashboard();
}else{
alert("Update failed");
}

}


/* =================================
PAGE LOAD
================================= */

window.onload=function(){

loadShipments();
loadDashboard();

/* AUTO FILL TRACKING FROM URL */

const params=new URLSearchParams(window.location.search);
const tracking=params.get("tracking");

if(tracking){

const field=document.getElementById("updateTracking");

if(field){
field.value=tracking;
showSection("update");
}

}

};