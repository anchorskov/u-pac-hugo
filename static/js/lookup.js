document.getElementById('lookupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const zip = document.getElementById('zipInput').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Loading...';
  
    fetch(`/api/lookup?zip=${zip}`)
      .then(response => response.json())
      .then(data => {
        // Process data and update the UI accordingly
        resultDiv.innerHTML = `<h2>Candidate Details:</h2>
                               <p>Name: ${data.name}</p>
                               <p>Party: ${data.party}</p>
                               <p>Website: <a href="${data.website}" target="_blank">${data.website}</a></p>`;
      })
      .catch(error => {
        console.error('Error:', error);
        resultDiv.innerHTML = 'An error occurred. Please try again.';
      });
  });
  