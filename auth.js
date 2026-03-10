const API = "https://blueroute-api-production-e23a.up.railway.app";

async function verifyAdminSession(){

const token = sessionStorage.getItem("br_token");

if(!token){
window.location.href="login.html";
return;
}

try{

const response = await fetch(API + "/api/admin/session-check",{
headers:{
Authorization: "Bearer " + token
}
});

if(!response.ok){
sessionStorage.removeItem("br_token");
window.location.href="login.html";
}

}catch(err){

sessionStorage.removeItem("br_token");
window.location.href="login.html";

}

}

window.addEventListener("load", function(){

const protectedPages = [
"admin-console.html",
"create-shipment.html",
"shipment.html"
];

const current = window.location.pathname.split("/").pop();

if(protectedPages.includes(current)){
verifyAdminSession();
}

});

function logout(){

sessionStorage.removeItem("br_token");
window.location.href="login.html";

}