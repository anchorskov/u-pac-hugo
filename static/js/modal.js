function showCustomModal(message, zip) {
    const modalHtml = `
      <div id="customDialogBackdrop">
        <div id="customDialog">
          <p style="margin-bottom: 20px;">${message}</p>
          <div style="display: flex; justify-content: space-between;">
            <button id="useGeoBtn">Use Device Location</button>
            <button id="enterAddressBtn">Enter Address</button>
          </div>
        </div>
      </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  
    document.getElementById('useGeoBtn').onclick = () => {
      document.getElementById('customDialogBackdrop').remove();
      document.getElementById('geolocateBtn').click();
    };
  
    document.getElementById('enterAddressBtn').onclick = () => {
      document.getElementById('customDialogBackdrop').remove();
      document.getElementById('addressFormContainer').classList.remove('hidden');
      document.getElementById('zipAddressInput').value = zip || '';
      document.getElementById('streetInput').focus();
    };
  }
  