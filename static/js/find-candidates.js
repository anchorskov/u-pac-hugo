document.addEventListener("DOMContentLoaded", () => {
    const apiBase = (location.hostname === "localhost" && location.port === "1313")
      ? "http://localhost:8787/api"
      : "/api";
  
    async function fetchCandidates(url) {
      const results = document.getElementById("candidateResults");
      results.innerHTML = "<p>Loading candidate data...</p>";
  
      try {
        const response = await fetch(url);
        const data = await response.json();
  
        // Robust multi-district check explicitly for boolean true
        if (data.multi_district === true) {
          results.innerHTML = "";
          showCustomModal(data.message, data.zip);
          return;
        }
  
        if (data.message) {
          results.innerHTML = `<p>${data.message}</p>`;
          return;
        }
  
        const candidates = Array.isArray(data)
          ? data
          : (data.candidates || []);
  
        renderCandidates(candidates);
  
      } catch (error) {
        console.error("Fetch Error:", error);
        results.innerHTML = "<p>Error loading candidate data. Please try again.</p>";
      }
    }
  
    function renderCandidates(candidates) {
      const results = document.getElementById("candidateResults");
      results.innerHTML = "";
  
      if (!Array.isArray(candidates) || candidates.length === 0) {
        results.innerHTML = "<p>No candidates found for this location.</p>";
        return;
      }
  
      candidates.forEach(candidate => {
        const name = candidate.name?.official_full || "Name not available";
        const positionType = candidate.terms?.slice(-1)[0]?.type;
        const position = positionType === "sen"
          ? "Senator"
          : positionType === "rep"
            ? "Representative"
            : "Candidate";
  
        results.innerHTML += `
          <div class="candidate-item">
            <h3>${position} ${name}</h3>
          </div>
        `;
      });
    }
  
    document.getElementById("candidateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const zip = document.getElementById("zipcodeInput").value.trim();
      if (!zip) {
        alert("Please enter a ZIP code.");
        return;
      }
      fetchCandidates(`${apiBase}/find-candidates?zip=${encodeURIComponent(zip)}`);
    });
  
    document.getElementById("geolocateBtn").addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchCandidates(`${apiBase}/find-candidates?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        },
        () => {
          alert("Error obtaining geolocation. Please try again.");
        }
      );
    });
  
    document.getElementById('addressForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const street = document.getElementById('streetInput').value.trim();
      const city = document.getElementById('cityInput').value.trim();
      const state = document.getElementById('stateInput').value.trim();
      const zip = document.getElementById('zipAddressInput').value.trim();
  
      if (!street || !city || !state || !zip) {
        alert("Please fill in all address fields.");
        return;
      }
  
      fetchCandidates(`${apiBase}/find-candidates-by-address?street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zip=${encodeURIComponent(zip)}`);
    });
  });
  