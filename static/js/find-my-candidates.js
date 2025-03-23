// Debug: Log current hostname and port
console.log("Current hostname:", window.location.hostname);
console.log("Current port:", window.location.port);

// Listen for ZIP code form submission
document.getElementById('candidateForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const zip = document.getElementById('zipcodeInput').value.trim();
  if (!zip) {
    alert('Please enter a ZIP code.');
    return;
  }

  // Automatically detect local vs. production by checking hostname and port
  const hostname = window.location.hostname;
  const port = window.location.port;
  const isLocal = (hostname === "localhost" || hostname === "127.0.0.1");
  let endpoint;
  if (isLocal && port === "1313") {
    // When running on Hugo's local server (port 1313), force using Worker on port 8787.
    endpoint = "http://localhost:8787/api/find-candidates?zip=";
  } else if (isLocal) {
    endpoint = "http://localhost:8787/api/find-candidates?zip=";
  } else {
    endpoint = "https://sibi-d1-worker.anchorskov.workers.dev/api/find-candidates?zip=";
  }
  console.log("ZIP Endpoint chosen:", endpoint);

  try {
    console.log("Fetching from:", endpoint + encodeURIComponent(zip));
    const response = await fetch(endpoint + encodeURIComponent(zip));
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const data = await response.json();
    console.log("Raw candidate data (ZIP):", data);
    renderResults(data);
    
  } catch (error) {
    console.error('Fetch error:', error);
    // Hide header and incumbent on error
    const houseHeader = document.getElementById('houseHeader');
    const incumbentLine = document.getElementById('incumbentLine');
    if (houseHeader) houseHeader.classList.add('hidden');
    if (incumbentLine) incumbentLine.classList.add('hidden');
    document.getElementById('candidateResults').innerHTML = '<p>Error retrieving candidates.</p>';
  }
});

// Listen for Geolocation button click
document.getElementById('geolocateBtn').addEventListener('click', async function(event) {
  event.preventDefault();
  const geolocateBtn = document.getElementById('geolocateBtn');
  geolocateBtn.disabled = true;
  geolocateBtn.innerText = 'Locating...';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Automatically detect local vs. production by checking hostname and port
      const hostname = window.location.hostname;
      const port = window.location.port;
      const isLocal = (hostname === "localhost" || hostname === "127.0.0.1");
      let endpoint;
      if (isLocal && port === "1313") {
        endpoint = "http://localhost:8787/api/find-candidates?lat=";
      } else if (isLocal) {
        endpoint = "http://localhost:8787/api/find-candidates?lat=";
      } else {
        endpoint = "https://sibi-d1-worker.anchorskov.workers.dev/api/find-candidates?lat=";
      }
      console.log("Geolocation Endpoint chosen:", endpoint);
      
      // Construct endpoint URL with latitude and longitude
      const fullEndpoint = endpoint + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon);
      console.log("Full geolocation endpoint:", fullEndpoint);

      try {
        const response = await fetch(fullEndpoint);
        if (!response.ok) throw new Error(`Network error: ${response.status}`);

        const data = await response.json();
        console.log("Raw candidate data (Geolocation):", data);
        renderResults(data);

      } catch (error) {
        console.error('Fetch error:', error);
        const houseHeader = document.getElementById('houseHeader');
        const incumbentLine = document.getElementById('incumbentLine');
        if (houseHeader) houseHeader.classList.add('hidden');
        if (incumbentLine) incumbentLine.classList.add('hidden');
        document.getElementById('candidateResults').innerHTML = '<p>Error retrieving candidates.</p>';
      } finally {
        geolocateBtn.disabled = false;
        geolocateBtn.innerText = 'Use My Device Location';
      }
    }, function(error) {
      console.error('Geolocation error:', error);
      alert('Error obtaining your location. Please allow location access or try again.');
      geolocateBtn.disabled = false;
      geolocateBtn.innerText = 'Use My Device Location';
    });
  } else {
    alert('Geolocation is not supported by your browser.');
    geolocateBtn.disabled = false;
    geolocateBtn.innerText = 'Use My Device Location';
  }
});

// Helper function to convert nested objects/arrays into readable strings.
function renderValue(value) {
  console.log("renderValue received:", value);
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(item => renderValue(item)).join(", ");
    } else {
      // If the object has an 'official_full' property, return that.
      if (value.official_full) {
        return value.official_full;
      }
      return JSON.stringify(value);
    }
  }
  return value;
}

// Helper function to render candidate results into the page
function renderResults(data) {
  console.log("Rendering results with data:", data);
  let html = '';
  const houseHeader = document.getElementById('houseHeader');
  const incumbentLine = document.getElementById('incumbentLine');

  function hideHeaderAndIncumbent() {
    if (houseHeader) houseHeader.classList.add('hidden');
    if (incumbentLine) incumbentLine.classList.add('hidden');
  }

  if (data.error) {
    hideHeaderAndIncumbent();
    html = `<p>Error: ${data.error}</p>`;
  } else if (data.message) {
    hideHeaderAndIncumbent();
    html = `<p>${data.message}</p>`;
  } else if (data.length === 0) {
    hideHeaderAndIncumbent();
    html = `<p>No candidates found.</p>`;
  } else {
    // Show header and incumbent if valid data is returned
    if (houseHeader) houseHeader.classList.remove('hidden');
    if (incumbentLine) incumbentLine.classList.remove('hidden');

    html = '<div>';
    data.forEach(candidate => {
      html += '<div class="candidate">';
      html += '<ul>';
      for (let key in candidate) {
        if (candidate.hasOwnProperty(key)) {
          // Skip keys you don't wish to display (e.g., 'id' or 'party')
          if (key === 'id' || key === 'party') continue;
          html += `<li><strong>${key}:</strong> ${renderValue(candidate[key])}</li>`;
        }
      }
      html += '</ul>';
      html += '</div>';
    });
    html += '</div>';
  }

  document.getElementById('candidateResults').innerHTML = html;
}
