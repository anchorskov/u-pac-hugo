document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("zipForm");
    const input = document.getElementById("zipInput");
  
    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const zip = input.value.trim();
        if (zip.length === 5 && !isNaN(zip)) {
          window.location.href = "/candidates/" + zip;
        } else {
          alert("Please enter a valid 5-digit ZIP code.");
        }
      });
    }
  });
  