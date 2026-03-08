const API = "https://blueroute-api-production-e23a.up.railway.app";

async function verifyAdminSession(){

const token = sessionStorage.getItem("br_token");

if(!token){
window.location.href="login.html";
return;
}

try{

const response = await fetch(API + "/api/admin/session-check",{
method:"GET",
headers:{
authorization: token
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

const protectedPage =
window.location.pathname.includes("admin") ||
window.location.pathname.includes("shipment");

if(protectedPage){
verifyAdminSession();
}

});

function logout(){

sessionStorage.removeItem("br_token");
window.location.href="login.html";

}