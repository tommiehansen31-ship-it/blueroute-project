// ===== CONFIGURATION =====
const AUTH_CONFIG = {
username: "admin",
password: "BlueRoute@2026"
};

// ===== LOGIN FUNCTION =====
function login() {

const user = document.getElementById("username").value;
const pass = document.getElementById("password").value;
const remember = document.getElementById("rememberMe")?.checked;

if (user === AUTH_CONFIG.username && pass === AUTH_CONFIG.password) {

// Normal session login
sessionStorage.setItem("brx_auth", "true");

// If Remember Me is checked → persist login
if (remember) {
  const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
  localStorage.setItem("brx_auth_persist", "true");
  localStorage.setItem("brx_auth_expiry", expiry);
}

// 🔧 UPGRADE: redirect to shipment manager (main admin dashboard)
window.location.href = "shipments.html";

} else {
document.getElementById("error").innerText = "Invalid credentials";
}
}

// ===== PROTECTION FUNCTION =====
function protectPage() {

const sessionAuth = sessionStorage.getItem("brx_auth");

// Check persistent login
const persistentAuth = localStorage.getItem("brx_auth_persist");
const expiry = localStorage.getItem("brx_auth_expiry");

if (persistentAuth === "true" && expiry) {
if (new Date().getTime() < parseInt(expiry)) {
// Restore session automatically
sessionStorage.setItem("brx_auth", "true");
return;
} else {
// Expired → clean up
localStorage.removeItem("brx_auth_persist");
localStorage.removeItem("brx_auth_expiry");
}
}

if (sessionAuth !== "true") {
window.location.href = "login.html";
}
}

// ===== LOGOUT FUNCTION =====
function logout() {
sessionStorage.removeItem("brx_auth");
localStorage.removeItem("brx_auth_persist");
localStorage.removeItem("brx_auth_expiry");
window.location.href = "login.html";
}

/* =========================================================
   SECURITY UPGRADE — SERVER SESSION VERIFICATION
   (ADDED ONLY — ORIGINAL CODE ABOVE NOT MODIFIED)
   ========================================================= */

async function verifyAdminSession(){

try{

const response = await fetch(
"https://blueroute-api-production-aaef.up.railway.app/api/admin/session-check",
{
method:"GET",
headers:{
"Content-Type":"application/json"
}
}
);

if(!response.ok){
sessionStorage.removeItem("brx_auth");
window.location.href="login.html";
}

}catch(error){
console.warn("Session verification failed");
}

}

/* =========================================================
   AUTOMATIC VERIFICATION ON ADMIN PAGE LOAD
   ========================================================= */

if(typeof window !== "undefined"){
window.addEventListener("load", function(){

const isAdminPage =
window.location.pathname.includes("admin") ||
window.location.pathname.includes("shipment") ||
window.location.pathname.includes("update");

if(isAdminPage){
verifyAdminSession();
}

});
}