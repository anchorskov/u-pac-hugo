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

      // Check for multi-district scenario
      if (data.multi_district === true) {
        results.innerHTML = "";
        showCustomModal(data.message, data.zip);
        return;
      }

      if (data.message) {
        results.innerHTML = `<p>${data.message}</p>`;
        return;
      }

      const candidates = Array.isArray(data) ? data : (data.candidates || []);
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

  // ZIP Autocomplete Setup
  const zipcodeInput = document.getElementById("zipcodeInput");
  const dataList = document.getElementById("zipSuggestions");
  const candidateForm = document.getElementById("candidateForm");

  // When the user focuses on the ZIP input, reset the entire form
  // and ensure the address entry section is hidden.
  zipcodeInput.addEventListener("focus", () => {
    candidateForm.reset();
    dataList.innerHTML = "";
    document.getElementById("candidateResults").innerHTML = "";
    // Hide the address form for multi-district entry by re-adding the 'hidden' class.
    document.getElementById("addressFormContainer").classList.add("hidden");
  });

  zipcodeInput.addEventListener("input", async () => {
    const query = zipcodeInput.value.trim();

    if (query.length < 2) {
      dataList.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(`${apiBase}/zip-autocomplete?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch zip suggestions");

      const suggestions = await response.json();
      dataList.innerHTML = ""; // Clear old suggestions

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

  const geolocateBtn = document.getElementById("geolocateBtn");

  // Dynamically update tooltip based on device type
  if (navigator.userAgentData?.mobile || /Mobi|Android/i.test(navigator.userAgent)) {
    geolocateBtn.title = "Most accurate for mobile users. Returning results for your current location setting.";
  } else {
    geolocateBtn.title = "Most accurate for mobile users. On desktops, results may reflect your internet location instead of your home address.";
  }

  // Geolocation click event with reverse geocoding & confirmation
  geolocateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to fetch location data");
            }
            return response.json();
          })
          .then(data => {
            const address = data.address;
            const city = address.city || address.town || address.village || "your area";
            const state = address.state || "";
            const confirmMessage = `Your device has set your current location near ${city}, ${state}. Continue?`;
            if (confirm(confirmMessage)) {
              fetchCandidates(`${apiBase}/find-candidates?lat=${lat}&lon=${lon}`);
            } else {
              alert("Please enter your ZIP code or full address for more accurate results.");
            }
          })
          .catch(error => {
            console.error("Error fetching location details:", error);
            alert("Unable to determine location details. Please enter your ZIP code.");
          });
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
