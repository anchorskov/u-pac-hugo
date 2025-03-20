document.getElementById('candidateForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const zip = document.getElementById('zipcodeInput').value.trim();
  if (!zip) {
    alert('Please enter a ZIP code.');
    return;
  }

  // Automatically detect local vs. production
  const hostname = window.location.hostname;
  const isLocal = (hostname === "localhost" || hostname === "127.0.0.1");
  const endpoint = isLocal 
    ? "http://localhost:8787/api/find-candidates?zip=" 
    : "https://sibi-d1-worker.anchorskov.workers.dev/api/find-candidates?zip=";

  try {
    console.log("Fetching from:", endpoint + encodeURIComponent(zip));
    const response = await fetch(endpoint + encodeURIComponent(zip));
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const data = await response.json();
    let html = '';

    if (data.error) {
      html = `<p>Error: ${data.error}</p>`;
    } else if (data.message) {
      html = `<p>${data.message}</p>`;
    } else if (data.length === 0) {
      html = `<p>No candidates found for ZIP ${zip}</p>`;
    } else {
      // Build an HTML representation for each candidate, showing all properties
      // except for 'id' and 'party'
      html = '<div>';
      data.forEach(candidate => {
        html += '<div class="candidate">';
        html += '<ul>';
        // Loop through each property of the candidate object
        for (let key in candidate) {
          if (candidate.hasOwnProperty(key)) {
            if (key === 'id' || key === 'party') continue; // Skip these keys
            html += `<li><strong>${key}:</strong> ${candidate[key]}</li>`;
          }
        }
        html += '</ul>';
        html += '</div>';
      });
      html += '</div>';
    }

    document.getElementById('candidateResults').innerHTML = html;
    
  } catch (error) {
    console.error('Fetch error:', error);
    document.getElementById('candidateResults').innerHTML = '<p>Error retrieving candidates.</p>';
  }
});
