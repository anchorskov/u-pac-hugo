document.addEventListener('DOMContentLoaded', () => {
  const donateBtn = document.getElementById('donateBtn');
  if (donateBtn) {
    console.log('🎯 Donate button found and active');
    donateBtn.addEventListener('click', () => {
      window.open('https://gofund.me/7868febf', '_blank');
    });
  } else {
    console.warn('🚫 Donate button not found in DOM');
  }
});
