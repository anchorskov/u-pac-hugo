// ✅ modal.js
function showCustomModal(
  message,
  useGeoLabel = "Use My Device Location",
  useAddressLabel = "Enter My Address"
) {
  const modalHtml = `
    <div id="customDialogBackdrop">
      <div id="customDialog">
        <p>${message}</p>
        <div class="modal-buttons">
          <button id="useGeoBtn">${useGeoLabel}</button>
          <button id="enterAddressBtn">${useAddressLabel}</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Reset the display when modal is dismissed
  const backdrop = document.getElementById("customDialogBackdrop");

  document.getElementById("useGeoBtn").onclick = () => {
    backdrop.remove();
    document.getElementById("geolocateBtn")?.click();
  };

  document.getElementById("enterAddressBtn").onclick = () => {
    backdrop.remove();
    document.getElementById("addressFormContainer")?.classList.remove("hidden");
    document.getElementById("streetInput")?.focus();
  };
}
