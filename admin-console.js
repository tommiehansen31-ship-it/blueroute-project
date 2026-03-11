window.API = window.API || "https://blueroute-api-production-e23a.up.railway.app";

let currentPage = 1;

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
Authorization: "Bearer " + token
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
loadShipments(currentPage);
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

async function loadShipments(page = 1) {

if(page < 1) page = 1;

currentPage = page;

const token = sessionStorage.getItem("br_token");

try {

const response = await fetch(API + "/api/admin/shipments?page=" + currentPage + "&limit=20", {
headers:{Authorization: "Bearer " + token}
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
<td>

<button onclick="downloadWaybill('${s.tracking}'); event.stopPropagation();">
Waybill
</button>

<button onclick="deleteShipment('${s.tracking}'); event.stopPropagation();" style="margin-left:6px;color:red;">
Delete
</button>

</td>
`;

row.onclick=function(){
window.open("shipment.html?tracking="+s.tracking,"_blank");
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

const response = await fetch(API + "/api/admin/shipments?page=1&limit=500",{
headers:{Authorization: "Bearer " + token}
});

const data = await response.json();

/* ===== BASIC STATS ===== */

let total = data.length;
let transit = 0;
let delivered = 0;

/* ===== NEW ANALYTICS ===== */

let today = 0;
let originCount = {};
let destinationCount = {};

const todayDate = new Date().toISOString().split("T")[0];

data.forEach(s=>{

const status = s.status.toLowerCase();

if(status.includes("transit")) transit++;
if(status.includes("delivered")) delivered++;

/* COUNT ORIGINS */

if(s.origin){
originCount[s.origin] = (originCount[s.origin] || 0) + 1;
}

/* COUNT DESTINATIONS */

if(s.destination){
destinationCount[s.destination] = (destinationCount[s.destination] || 0) + 1;
}

/* SHIPMENTS TODAY (based on tracking timestamp if available) */

if(s.tracking && s.tracking.startsWith("BR")){
const timestamp = parseInt(s.tracking.replace("BR","").substring(0,13));
if(!isNaN(timestamp)){
const shipDate = new Date(timestamp).toISOString().split("T")[0];
if(shipDate === todayDate) today++;
}
}

});

/* FIND TOP ORIGIN */

let topOrigin = "-";
let topOriginCount = 0;

for(const o in originCount){
if(originCount[o] > topOriginCount){
topOrigin = o;
topOriginCount = originCount[o];
}
}

/* FIND TOP DESTINATION */

let topDestination = "-";
let topDestinationCount = 0;

for(const d in destinationCount){
if(destinationCount[d] > topDestinationCount){
topDestination = d;
topDestinationCount = destinationCount[d];
}
}

/* UPDATE DASHBOARD */

const statTotal = document.getElementById("statTotal");
const statTransit = document.getElementById("statTransit");
const statDelivered = document.getElementById("statDelivered");
const statToday = document.getElementById("statToday");
const statOrigin = document.getElementById("statOrigin");
const statDestination = document.getElementById("statDestination");

if(statTotal) statTotal.innerText = total;
if(statTransit) statTransit.innerText = transit;
if(statDelivered) statDelivered.innerText = delivered;
if(statToday) statToday.innerText = today;
if(statOrigin) statOrigin.innerText = topOrigin;
if(statDestination) statDestination.innerText = topDestination;


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
<td>

<button onclick="downloadWaybill('${s.tracking}'); event.stopPropagation();">
Waybill
</button>

<button onclick="deleteShipment('${s.tracking}'); event.stopPropagation();" style="margin-left:6px;color:red;">
Delete
</button>

</td>
`;

row.onclick=function(){
window.open("shipment.html?tracking="+s.tracking,"_blank");
};

dashboardTable.appendChild(row);

});

}catch(err){

console.error("Dashboard load failed",err);

}

}


/* =================================
SEARCH SHIPMENTS
================================= */

function searchShipments(){

const input = document.getElementById("shipmentSearch");

if(!input) return;

const filter = input.value.toLowerCase();

const rows = document.querySelectorAll("#shipmentTable tr");

rows.forEach(row=>{

const text=row.innerText.toLowerCase();

row.style.display = text.includes(filter) ? "" : "none";

});

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
Authorization: "Bearer " + token
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
loadShipments(currentPage);
loadDashboard();
}else{
alert("Update failed");
}

}


/* =================================
PAGE LOAD
================================= */

window.onload=function(){

loadShipments(1);
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

function downloadWaybill(tracking){

const url = API + "/api/waybill/" + tracking;

window.open(url,"_blank");

}

async function deleteShipment(tracking){

if(!confirm("Delete shipment " + tracking + "?")){
return;
}

const token = sessionStorage.getItem("br_token");

try{

const res = await fetch(
API + "/api/admin/delete-shipment/" + tracking,
{
method:"DELETE",
headers:{
Authorization: "Bearer " + token
}
});

const data = await res.json();

if(data.success){

alert("Shipment deleted");

loadShipments(currentPage);
loadDashboard();

}else{

alert("Delete failed");

}

}catch(err){

alert("Server error");

}

}