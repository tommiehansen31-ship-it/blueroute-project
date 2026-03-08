// ============================
// AUTH CONFIG
// ============================

const API_BASE = "https://blueroute-api-production-e23a.up.railway.app";

// ============================
// SESSION CHECK
// ============================

async function verifyAdminSession(){

try{

const token = sessionStorage.getItem("br_token");

if(!token){
window.location.href="login.html";
return;
}

const response = await fetch(API_BASE + "/api/admin/session-check",{
method:"GET",
headers:{
"authorization": token
}
});

if(!response.ok){
sessionStorage.removeItem("br_token");
window.location.href="login.html";
}

}catch(error){

console.warn("Session verification failed");
window.location.href="login.html";

}

}

// ============================
// PAGE PROTECTION
// ============================

if(typeof window !== "undefined"){

window.addEventListener("load", function(){

const isAdminPage =
window.location.pathname.includes("admin") ||
window.location.pathname.includes("shipment");

if(isAdminPage){
verifyAdminSession();
}

});

}

// ============================
// LOGOUT
// ============================

function logout(){

sessionStorage.removeItem("br_token");
window.location.href="login.html";

}