// ===== CONFIGURATION =====
const AUTH_CONFIG = {
username: "admin",
password: "BlueRoute@2026"
};

/* ===== UPGRADE ADDED ===== */
const ADMIN_SECRET = "27383832990019283872";

function login() {

const user = document.getElementById("username").value;
const pass = document.getElementById("password").value;
const remember = document.getElementById("rememberMe")?.checked;

if (user === AUTH_CONFIG.username && pass === AUTH_CONFIG.password) {

sessionStorage.setItem("brx_auth", "true");

if (remember) {
  const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem("brx_auth_persist", "true");
  localStorage.setItem("brx_auth_expiry", expiry);
}

window.location.href = "shipments.html";

} else {
document.getElementById("error").innerText = "Invalid credentials";
}
}

function protectPage() {

const sessionAuth = sessionStorage.getItem("brx_auth");

const persistentAuth = localStorage.getItem("brx_auth_persist");
const expiry = localStorage.getItem("brx_auth_expiry");

if (persistentAuth === "true" && expiry) {
if (new Date().getTime() < parseInt(expiry)) {
sessionStorage.setItem("brx_auth", "true");
return;
} else {
localStorage.removeItem("brx_auth_persist");
localStorage.removeItem("brx_auth_expiry");
}
}

if (sessionAuth !== "true") {
window.location.href = "login.html";
}
}

function logout() {
sessionStorage.removeItem("brx_auth");
localStorage.removeItem("brx_auth_persist");
localStorage.removeItem("brx_auth_expiry");
window.location.href = "login.html";
}

async function verifyAdminSession(){

try{

const token = sessionStorage.getItem("brx_admin_token");

const response = await fetch(
"https://blueroute-api-production-e23a.up.railway.app/api/admin/session-check",
{
method:"GET",
headers:{
"Content-Type":"application/json",
"authorization": token,
/* ===== UPGRADE ADDED ===== */
"Authorization": ADMIN_SECRET
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

function storeAdminToken(token){
try{
sessionStorage.setItem("brx_admin_token", token);
}catch(e){
console.warn("Token storage failed");
}
}

function getAdminToken(){
return sessionStorage.getItem("brx_admin_token");
}

const ORIGINAL_FETCH = window.fetch;

window.fetch = function(url, options = {}){

options.headers = options.headers || {};

if(!options.headers["authorization"]){
const token = sessionStorage.getItem("brx_admin_token");
if(token){
options.headers["authorization"] = token;
}
}

/* ===== UPGRADE ADDED ===== */
if(!options.headers["Authorization"]){
options.headers["Authorization"] = ADMIN_SECRET;
}

return ORIGINAL_FETCH(url, options);

};

(function(){

const originalSecureLogin = window.secureLogin;

if(typeof originalSecureLogin === "function"){

window.secureLogin = async function(){

try{

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

const response = await fetch(
"https://blueroute-api-production-e23a.up.railway.app/api/admin/login",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username:username,
password:password
})
}
);

const data = await response.json();

if(data && data.token){
storeAdminToken(data.token);
}

}catch(e){
console.warn("Token capture failed");
}

return originalSecureLogin();

}

}

})();

(function(){

const originalVerify = verifyAdminSession;

verifyAdminSession = async function(){

try{

const token = sessionStorage.getItem("brx_admin_token");

const response = await fetch(
"https://blueroute-api-production-e23a.up.railway.app/api/admin/session-check",
{
method:"GET",
headers:{
"Content-Type":"application/json",
"authorization": token,
/* ===== UPGRADE ADDED ===== */
"Authorization": ADMIN_SECRET
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

};

})();

(function(){

const originalLogin = window.login;

window.login = function(){

const token = sessionStorage.getItem("brx_admin_token");

if(token){
sessionStorage.setItem("brx_auth","true");
window.location.href="shipments.html";
return;
}

return originalLogin();

};

})();