// ✅ find-candidates.js (Enhanced with Geolocation City Context & Stability)
document.addEventListener("DOMContentLoaded", () => {
  const apiBase = (location.hostname === "localhost" && location.port === "1313")
    ? "http://localhost:8787/api"
    : "/api";

  // 🌐 Reverse Geocode
  async function fetchCityFromCoords(lat, lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village || data.address?.state || "your location";
    } catch (e) {
      console.warn("⚠️ Reverse geocode failed:", e);
      return "your location";
    }
  }

  // 🔄 Clear results
  function resetCandidateDisplay() {
    document.getElementById("candidateHeader").innerHTML = "";
    document.getElementById("candidateResults").innerHTML = "";
    
    const addressFormEl = document.getElementById("addressFormContainer");
    if (addressFormEl && !addressFormEl.classList.contains("hidden")) {
      addressFormEl.classList.add("hidden");
    }
  }
  

  // 🎂 Calculate age
  function calculateAge(birthdateStr) {
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  // 🔁 Handle multiple districts
  function handleMultiDistrict(data) {
    resetCandidateDisplay();
  
    const geoLabel = data.device_location_button || "Use My Device Location";
    const addressLabel = data.enter_address_button || "Enter My Address";
  
    // Explicitly show the address form now
  
    showCustomModal(data.message, geoLabel, addressLabel);
  }
  

  // 📡 Main fetch
  async function fetchCandidates(url, originCity = null) {
    resetCandidateDisplay();
    const results = document.getElementById("candidateResults");
    const headerEl = document.getElementById("candidateHeader");

    results.innerHTML = "<p>Loading candidate data...</p>";

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("📦 API response:", data);

      if (data.multi_district === true) {
        handleMultiDistrict(data);
        return;
      }

      if (data.message) {
        results.innerHTML = `<p>${data.message}</p>`;
        return;
      }

      // 🧭 Show location if available
      if (originCity) {
        const locationP = document.createElement("p");
        locationP.className = "detected-location";
        locationP.innerHTML = `📍 Based on your current location: <strong>${originCity}</strong>`;
        headerEl.appendChild(locationP);
      }

      renderCandidates(data);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      results.innerHTML = "<p>Error loading candidate data. Please try again.</p>";
    }
  }

  // 🧱 Render candidates
  function renderCandidates(data) {
    const results = document.getElementById("candidateResults");
    const headerEl = document.getElementById("candidateHeader");

    let cdLabel = data.header?.cd;
    if (/0(th)? congressional district|at[-\s]?large/i.test(cdLabel?.trim())) {
      cdLabel = "At-large Congressional District";
    }

    const title = document.createElement("h2");
    title.textContent = `${data.header?.state} – ${cdLabel}`;
    headerEl.appendChild(title);

    if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
      results.innerHTML = "<p>No candidates found.</p>";
      return;
    }

    const rolesPresent = data.candidates.map(c => c.terms?.at(-1)?.type);
    const hasRep = rolesPresent.includes("rep");
    const numSenators = rolesPresent.filter(r => r === "sen").length;

    data.candidates.forEach(candidate => {
      const card = renderCandidateCard(candidate);
      results.appendChild(card);
    });

    if (!hasRep) {
      const repVacant = document.createElement("div");
      repVacant.className = "candidate-item";
      repVacant.innerHTML = `<h3>Representative</h3><p><em>Seat currently vacant.</em></p>`;
      results.appendChild(repVacant);
    }

    if (numSenators < 2) {
      const missing = 2 - numSenators;
      for (let i = 0; i < missing; i++) {
        const senVacant = document.createElement("div");
        senVacant.className = "candidate-item";
        senVacant.innerHTML = `<h3>Senator</h3><p><em>Seat currently vacant.</em></p>`;
        results.appendChild(senVacant);
      }
    }
  }

  // 🧩 Render single card
  function renderCandidateCard(candidate) {
    const latestTerm = candidate.terms?.[candidate.terms.length - 1];
    const role = latestTerm?.type === "sen" ? "Senator" : latestTerm?.type === "rep" ? "Representative" : "Public Servant";
    const div = document.createElement("div");
    div.className = "candidate-item";
  
    const fullName = candidate.name?.official_full || "Unnamed Candidate";
    const birthday = candidate.bio?.birthday;
    const age = birthday ? calculateAge(birthday) : null;
    const website = latestTerm?.url || null;
    const address = latestTerm?.address || null;
  
    div.innerHTML = `
      <h3>${role} ${fullName}</h3>
      ${age ? `<p>Age: ${age}</p>` : ""}
      ${address ? `<p><strong>Office:</strong> ${address}</p>` : ""}
      ${website ? `<p><a href="${website}" target="_blank" rel="noopener">Official Website</a></p>` : ""}
    `;
  
    return div;
  }
  

  // 🔍 ZIP Form
  document.getElementById("candidateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const zip = document.getElementById("zipcodeInput").value.trim();
    if (!zip) return alert("Please enter a ZIP code.");
    fetchCandidates(`${apiBase}/find-candidates?zip=${encodeURIComponent(zip)}`);
  });

  // 🔠 ZIP Autocomplete
  const zipcodeInput = document.getElementById("zipcodeInput");
  const dataList = document.getElementById("zipSuggestions");

  zipcodeInput.addEventListener("input", async () => {
    const query = zipcodeInput.value.trim();
    if (query.length < 2) return dataList.innerHTML = "";
    try {
      const response = await fetch(`${apiBase}/zip-autocomplete?query=${encodeURIComponent(query)}`);
      const suggestions = await response.json();
      dataList.innerHTML = "";
      suggestions.forEach(zip => {
        const option = document.createElement("option");
        option.value = zip;
        dataList.appendChild(option);
      });
    } catch (error) {
      console.error("Autocomplete error:", error);
      dataList.innerHTML = "";
    }
  });

  // Always clear ZIP input when focused
  zipcodeInput.addEventListener("focus", () => {
    zipcodeInput.value = "";
    resetCandidateDisplay();
  });

  // 📍 Geolocation logic
  const geolocateBtn = document.getElementById("geolocateBtn");
  geolocateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const results = document.getElementById("candidateResults");
    results.innerHTML = `<p>📡 Attempting to detect your location…</p>`;

    const geoTimeout = setTimeout(() => {
      results.innerHTML = "<p>⚠️ Location request timed out. Please try again or use address input.</p>";
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(geoTimeout);
        const { latitude: lat, longitude: lon } = pos.coords;

        results.innerHTML = `<p>🔍 Reverse geocoding your position…</p>`;
        const city = await fetchCityFromCoords(lat, lon);

        const proceed = confirm(`📍 We detected you're near ${city}. View candidates for this location?`);
        if (proceed) {
          fetchCandidates(`${apiBase}/find-candidates?lat=${lat}&lon=${lon}`, city);
        } else {
          results.innerHTML = "";
        }
      },
      (err) => {
        clearTimeout(geoTimeout);
        results.innerHTML = "<p>❌ Could not retrieve location. Please try again or use address input.</p>";
        console.warn("Geolocation error:", err);
      },
      { timeout: 10000 }
    );
  });

  // 📬 Full address form
  document.getElementById("addressForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const street = document.getElementById("streetInput").value.trim();
    const city = document.getElementById("cityInput").value.trim();
    const state = document.getElementById("stateInput").value.trim();
    const zip = document.getElementById("zipAddressInput").value.trim();
    if (!street || !city || !state || !zip) return alert("Fill in all address fields.");

    fetchCandidates(`${apiBase}/find-candidates-by-address?street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zip=${encodeURIComponent(zip)}`);
  });

  // 🍔 Hamburger toggle logic
  function toggleMenu() {
    const menu = document.getElementById("main-menu");
    if (menu) {
      menu.classList.toggle("visible");
      menu.classList.toggle("hidden");
    }
  }

  // 🔗 Attach the hamburger button click
  const menuToggleBtn = document.getElementById("menuToggle");
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", toggleMenu);
  }
});
