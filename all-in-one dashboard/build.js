// JavaScript to toggle the visibility of the subscription status div
        document.getElementById('premiumToggle').addEventListener('click', function() {
            const subscriptionStatus = document.getElementById('subscription-status');
            if (subscriptionStatus.style.display === 'none' || subscriptionStatus.style.display === '') {
                subscriptionStatus.style.display = 'flex'; // Show the div
            } else {
                subscriptionStatus.style.display = 'none'; // Hide the div
            }
        });
        
        function handleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const isMobile = window.innerWidth <= 768;
  const existingCarousel = document.querySelector('.sidebar-carousel');

  if (isMobile && !existingCarousel) {
    // Wrap sidebar content in .sidebar-carousel
    const carousel = document.createElement('div');
    carousel.classList.add('sidebar-carousel');

    while (sidebar.firstChild) {
      carousel.appendChild(sidebar.firstChild);
    }

    sidebar.appendChild(carousel);
  } else if (!isMobile && existingCarousel) {
    // Remove .sidebar-carousel and restore original structure
    while (existingCarousel.firstChild) {
      sidebar.appendChild(existingCarousel.firstChild);
    }
    sidebar.removeChild(existingCarousel);
  }
}

// Run on load and on window resize
window.addEventListener('DOMContentLoaded', handleSidebar);
window.addEventListener('resize', handleSidebar);

      
