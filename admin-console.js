const API_BASE = "https://blueroute-api-production-e23a.up.railway.app";
const ADMIN_SECRET = "27383832990019283872";


/* =================================
CREATE SHIPMENT
================================= */

const createForm = document.getElementById("createShipmentForm");

if(createForm){

createForm.addEventListener("submit", async function(e){

e.preventDefault();

const origin = document.getElementById("origin").value;
const destination = document.getElementById("destination").value;

/* ===== UPGRADE ADDED (READ ALL FIELDS) ===== */

const senderName = document.getElementById("senderName").value;
const senderEmail = document.getElementById("senderEmail").value;
const receiverName = document.getElementById("receiverName").value;
const receiverEmail = document.getElementById("receiverEmail").value;

/* ===== NEW FIELDS ADDED (ALIGN WITH admin.html) ===== */

const senderAddress = document.getElementById("senderAddress")?.value;
const senderPhone = document.getElementById("senderPhone")?.value;
const receiverAddress = document.getElementById("receiverAddress")?.value;
const receiverPhone = document.getElementById("receiverPhone")?.value;
const shipmentName = document.getElementById("shipmentName")?.value;
const weight = document.getElementById("weight")?.value;
const itemsSent = document.getElementById("itemsSent")?.value;
const boxCount = document.getElementById("boxCount")?.value;
const sentDate = document.getElementById("sentDate")?.value;
const estimatedDelivery = document.getElementById("estimatedDelivery")?.value;
const remarks = document.getElementById("remarks")?.value;

try{

const response = await fetch(API_BASE + "/api/admin/create-shipment",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":ADMIN_SECRET,
"authorization":ADMIN_SECRET
},

body:JSON.stringify({
senderName:senderName,
senderEmail:senderEmail,
receiverName:receiverName,
receiverEmail:receiverEmail,
origin:origin,
destination:destination,

/* ===== ADDED FIELDS ===== */

senderAddress:senderAddress,
senderPhone:senderPhone,
receiverAddress:receiverAddress,
receiverPhone:receiverPhone,
shipmentName:shipmentName,
weight:weight,
itemsSent:itemsSent,
boxCount:boxCount,
sentDate:sentDate,
estimatedDelivery:estimatedDelivery,
remarks:remarks
})

});

if(!response.ok){
console.error("API ERROR:", response.status);
alert("Server rejected request (" + response.status + ")");
return;
}

const data = await response.json();

if(data.success){
alert("Shipment created. Tracking number: " + data.trackingNumber);

/* ===== UPGRADE ADDED (DISPLAY RESULT) ===== */
const resultBox = document.getElementById("result");
if(resultBox){
resultBox.innerHTML =
"✅ Shipment Created<br>Tracking Number: <b>" + data.trackingNumber + "</b>";
}

}else{
alert("Error creating shipment");
}

loadShipments();

}catch(err){

alert("Error creating shipment");
console.error(err);

}

});

}



/* =================================
LOAD SHIPMENTS
================================= */

async function loadShipments(){

try{

const response = await fetch(API_BASE + "/api/admin/shipments",{

headers:{
"Authorization":ADMIN_SECRET,
"authorization":ADMIN_SECRET
}

});

if(!response.ok){
console.error("Shipment list error:", response.status);
return;
}

const shipments = await response.json();

const table = document.getElementById("shipmentTable");

if(!table) return;

table.innerHTML = "";

/* ===== UPGRADE ADDED (EMPTY TABLE MESSAGE) ===== */

if(!shipments || shipments.length === 0){
table.innerHTML = `
<tr>
<td colspan="4" style="text-align:center;color:#888;">
No shipments found
</td>
</tr>
`;
return;
}

shipments.forEach(function(shipment){

const row = document.createElement("tr");

row.innerHTML = `
<td>${shipment.tracking}</td>
<td>${shipment.origin}</td>
<td>${shipment.destination}</td>
<td>${shipment.status}</td>
`;

table.appendChild(row);

});

}catch(err){

console.error("Failed to load shipments",err);

}

}



/* =================================
UPDATE SHIPMENT
================================= */

async function updateShipment(){

const trackingNumber = document.getElementById("updateTracking").value;
const status = document.getElementById("statusSelect").value;

try{

const response = await fetch(API_BASE + "/api/admin/update-shipment",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":ADMIN_SECRET,
"authorization":ADMIN_SECRET
},

body:JSON.stringify({
trackingNumber:trackingNumber,
status:status,
location:"System Update",
remark:"Status updated from admin console"
})

});

if(!response.ok){
alert("Server rejected update (" + response.status + ")");
return;
}

const data = await response.json();

if(data.success){
alert("Shipment updated");
}else{
alert("Update failed");
}

loadShipments();

}catch(err){

alert("Update failed");
console.error(err);

}

}



/* =================================
PAGE LOAD
================================= */

window.onload = function(){

loadShipments();

};