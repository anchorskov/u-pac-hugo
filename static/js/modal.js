function showCustomModal(message, zip) {
    const modalHtml = `
      <div id="customDialogBackdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
        <div id="customDialog" style="background: white; padding: 20px; border-radius: 5px; max-width: 90%; text-align: center;">
          <p style="margin-bottom: 20px;">${message}</p>
          <div style="display: flex; justify-content: space-around;">
            <button id="useGeoBtn" style="padding: 10px 20px; margin: 0 10px;">Continue</button>
            <button id="enterAddressBtn" style="padding: 10px 20px; margin: 0 10px;">Enter Address Manually</button>
          </div>
        </div>
      </div>`;
      
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('useGeoBtn').onclick = () => {
      document.getElementById('customDialogBackdrop').remove();
      // Trigger the geolocation button's click to continue with the device location.
      document.getElementById('geolocateBtn').click();
    };
    
    document.getElementById('enterAddressBtn').onclick = () => {
      document.getElementById('customDialogBackdrop').remove();
      // Reveal the address form for manual input.
      document.getElementById('addressFormContainer').classList.remove('hidden');
      document.getElementById('zipAddressInput').value = zip || '';
      document.getElementById('streetInput').focus();
    };
  }
  