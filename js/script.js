// =====================================================
// BLUEROUTE EXPRESS DELIVERY — LEVEL 8 TRACKING SYSTEM
// Adds Professional Shipment Timeline + ScanHistory
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

const API_URL = "https://blueroute-api-production-e23a.up.railway.app/api/track";


/* =========================================================
   🔧 API DOMAIN CORRECTION (UPGRADE ADDED)
   ========================================================= */

function correctApiDomain(url){

if(url.includes("aaef.up.railway.app")){
return url.replace("aaef.up.railway.app","e23a.up.railway.app");
}

if(url.includes("3ce5.up.railway.app")){
return url.replace("3ce5.up.railway.app","e23a.up.railway.app");
}

return url;

}


/* =========================================================
   🔄 SAFE FETCH (RAILWAY COLD START PROTECTION)
   ========================================================= */

async function safeFetch(url){

try{

const res = await fetch(url);
return res;

}catch(err){

console.warn("Retrying request after delay...");

await new Promise(r=>setTimeout(r,1200));

return fetch(url);

}

}


  const btn = document.getElementById("track-btn");
  const inputField = document.getElementById("tracking-number");
  const result = document.getElementById("tracking-result");


  // ==========================================
  // STATUS → TIMELINE POSITION MAP
  // ==========================================
  function getStep(status){
    status = status.toLowerCase();

    if(status.includes("shipment created")) return 1;
    if(status.includes("picked up")) return 1;

    if(status.includes("transit")) return 2;
    if(status.includes("customs")) return 2;

    if(status.includes("arrived")) return 3;

    if(status.includes("out for delivery")) return 4;
    if(status.includes("delivery")) return 4;
    if(status.includes("delivered")) return 4;

    return 1;
  }


  async function runTracking(){

    const input = inputField.value.trim();

    if(!input){
      result.innerHTML = `<div class="status error">Please enter a Tracking ID.</div>`;
      return;
    }

    result.innerHTML = `
      <div class="tracking-loading">
        <div class="spinner"></div>
        <p>Retrieving shipment data...</p>
      </div>
    `;

    try{

      const res = await safeFetch(`${correctApiDomain(API_URL)}/${input}`);

      /* ===== SAFE JSON PARSER (UPGRADE ADDED) ===== */

      let data;

      try{
        data = await res.json();
      }catch(parseError){
        result.innerHTML = `<div class="status error">Tracking service error.</div>`;
        return;
      }

      if(data.error || data.found === false){
        result.innerHTML = `<div class="status error">Tracking number not found.</div>`;
        return;
      }

      const shipment = data.shipment;
      const scans = data.scan_history;

      const step = getStep(shipment.status);

      // ==============================
      // SCAN HISTORY ADDITION
      // ==============================
      let scanHTML = "";

if (scans && scans.length) {

  const scanContainer = document.createElement("div");

  scans.forEach(scan => {

    const item = document.createElement("div");
    item.className = "scan-item";

    const span = document.createElement("span");
    span.textContent = scan.location + " — " + scan.remark;

    item.appendChild(span);
    scanContainer.appendChild(item);

  });

  scanHTML = scanContainer.innerHTML;

}

      result.innerHTML = `
        <div class="tracking-card">
          <h3>Shipment Status: ${shipment.status}</h3>

          <div class="timeline">
            <div class="line"></div>

            <div class="step ${step>=1?"active":""}">
              <span>Booked</span>
            </div>

            <div class="step ${step>=2?"active":""}">
              <span>In Transit</span>
            </div>

            <div class="step ${step>=3?"active":""}">
              <span>Arrived</span>
            </div>

            <div class="step ${step>=4?"active":""}">
              <span>Delivered</span>
            </div>
          </div>

          <div class="tracking-grid">
            <div><strong>Tracking ID</strong><span>${shipment.tracking_number}</span></div>
            <div><strong>Origin</strong><span>${shipment.origin}</span></div>
            <div><strong>Destination</strong><span>${shipment.destination}</span></div>
            <div><strong>Status</strong><span>${shipment.status}</span></div>
            <div><strong>Last Update</strong><span>${shipment.last_updated}</span></div>
          </div>

          ${scanHTML ? `
          <h4 style="margin-top:40px;">Shipment History</h4>
          <div class="scan-history">
            ${scanHTML}
          </div>
          ` : ""}

        </div>
      `;

    }catch(err){
      result.innerHTML = `<div class="status error">Server connection failed.</div>`;
    }
  }

  if(btn) btn.addEventListener("click", runTracking);

  if(inputField){
    inputField.addEventListener("keypress", function(e){
      if(e.key==="Enter") runTracking();
    });
  }


  // ==========================================
  // COUNTER ANIMATION (UNCHANGED)
  // ==========================================
  const counters = document.querySelectorAll(".counter");

  const startCounting = (counter)=>{
    const target = +counter.dataset.target;
    let count = 0;
    const speed = target/120;

    const update=()=>{
      count+=speed;
      if(count<target){
        counter.innerText=Math.ceil(count);
        requestAnimationFrame(update);
      }else{
        counter.innerText=target;
      }
    };
    update();
  };

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        startCounting(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.6});

  counters.forEach(c=>observer.observe(c));


  // ==========================================
  // RESTORED SCROLL REVEAL
  // ==========================================
  const revealItems = document.querySelectorAll(".card, .gallery img");

  function revealOnScroll(){
    const windowHeight = window.innerHeight;

    revealItems.forEach(item=>{
      const itemTop = item.getBoundingClientRect().top;

      if(itemTop < windowHeight - 80){
        item.classList.add("show");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

});


// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
window.addEventListener("scroll",function(){
  const scrollTop=document.documentElement.scrollTop;
  const scrollHeight=document.documentElement.scrollHeight-document.documentElement.clientHeight;
  const percent=(scrollTop/scrollHeight)*100;

  const bar=document.getElementById("progress-bar");
  if(bar) bar.style.width=percent+"%";
});


// ==========================================
// QUOTE FORM SUBMISSION
// ==========================================

document.addEventListener("DOMContentLoaded", function(){

  const quoteForm = document.getElementById("quote-form");
  if(!quoteForm) return;

  const responseBox = document.getElementById("quote-response");

  quoteForm.addEventListener("submit", async function(e){
    e.preventDefault();

    const formData = new FormData(quoteForm);
    const data = Object.fromEntries(formData.entries());

    responseBox.innerHTML = "Submitting request...";

    try{

      await fetch("https://script.google.com/macros/s/AKfycbxGOhP0eRsnxnD54bokrxeUo7K451n9xg4y2JB-uN4vfdwm89BquAzOjWzHxu2C2Olx/exec",{
        method:"POST",
        body:JSON.stringify(data)
      });

      responseBox.innerHTML = "✅ Quote request sent.";
      quoteForm.reset();

    }catch(err){
      responseBox.innerHTML = "❌ Submission failed.";
    }
  });

});