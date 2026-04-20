/**
 * loading.js — Global Loading Spinner Logic
 */
(function() {
    // 1. Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'globalLoading';
    overlay.innerHTML = `
        <div style="position: relative;">
            <div class="spinner"></div>
            <div class="spinner-inner"></div>
        </div>
    `;

    // 2. Inject into body
    document.documentElement.appendChild(overlay);

    // 3. Auto-hide when page is ready
    window.addEventListener('load', () => {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 500); // Small delay for smooth transition
    });

    // Handle back/forward cache
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            overlay.classList.add('hidden');
        }
    });

    // Provide global functions to show/hide manually if needed
    window.showLoading = () => overlay.classList.remove('hidden');
    window.hideLoading = () => overlay.classList.add('hidden');
})();
