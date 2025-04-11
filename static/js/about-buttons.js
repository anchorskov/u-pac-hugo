document.addEventListener('DOMContentLoaded', () => {
    const donateBtn = document.querySelector('.support-donate');
    const volunteerBtn = document.querySelector('.support-volunteer');
  
    if (donateBtn) {
      donateBtn.addEventListener('click', () => {
        window.location.href = 'https://gofund.me/7868febf';
      });
    }
  
    if (volunteerBtn) {
      volunteerBtn.addEventListener('click', () => {
        window.location.href = '/volunteer/';
      });
    }
  });
  