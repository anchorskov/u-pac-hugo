console.log("DEBUG: lookup.html is loaded");

document.addEventListener("DOMContentLoaded", function () {
  const lookupForm = document.getElementById('lookupForm');
  const zipInput = document.getElementById('zipInput');
  const resultDiv = document.getElementById('result');

  const upacData = window.UPAC_DATA;
  const hudZipData = window.HUD_ZIP_DATA;

  lookupForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const zip = zipInput.value.trim();
    if (!zip) {
      resultDiv.innerHTML = `<p>Please enter a ZIP code.</p>`;
      return;
    }

    console.log("DEBUG: Submitted ZIP:", zip);
    resultDiv.innerHTML = `<p>Looking up candidate for ZIP code: <strong>${zip}</strong></p>`;

    const hudRecord = hudZipData[zip];
    if (!hudRecord) {
      resultDiv.innerHTML += `<p>No data found for this ZIP code.</p>`;
      return;
    }

    const stateAbbr = hudRecord.state_abbreviation;
    const districtId = hudRecord.district_id;
    const compositeKey = `${stateAbbr}-${districtId}`;
    const candidate = upacData[compositeKey];

    if (!candidate) {
      resultDiv.innerHTML += `<p>Candidate data not available for composite key: ${compositeKey}</p>`;
      return;
    }

    resultDiv.innerHTML = `
      <h2>Candidate Details:</h2>
      <ul>
        <li><strong>Name:</strong> ${candidate.name}</li>
        <li><strong>Party:</strong> ${candidate.party}</li>
        <li><strong>Website:</strong> <a href="${candidate.website}" target="_blank">${candidate.website}</a></li>
      </ul>
    `;
  });
});