document.addEventListener("DOMContentLoaded", () => {
    // Default to page 1, or use last visited page from localStorage
    if (document.querySelector('.box-korish')) {
        let currentPage = parseInt(localStorage.getItem('productPage')) || 1;
        if (typeof fetchPaginatedProducts === 'function') {
            fetchPaginatedProducts(currentPage);
        }
    }
});
