
window.fetchPaginatedProducts = async function(page) {
    try {
        const response = await apiFetch(`/api/catalog/products/?page=${page}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        
        // Data structure based on DRF PageNumberPagination
        const products = data.results || data;
        const totalCount = data.count || products.length;

        // Fetch cart items to correctly display inline quantity UI elements
        let cartItems = [];
        if (localStorage.getItem('access')) {
            const cartRes = await apiFetch('/api/cart/');
            if (cartRes.ok) {
                cartItems = await cartRes.json();
            }
        }

        // Render targets
        const cardShops = document.querySelectorAll('.card_shop');
        if (cardShops.length > 0) {
            // Render all products into the primary static grid container
            renderProducts(products, cardShops[0], cartItems);

            // Hide the duplicate dummy container grid blocks that were part of template static visuals
            for (let i = 1; i < cardShops.length; i++) {
                cardShops[i].style.display = 'none';
            }
        }

        updatePagination(page, totalCount);
    } catch (e) {
        console.error('Failed fetching paginated products:', e);
    }
}

function updatePagination(currentPage, totalCount) {
    const perPage = 8; // If API natively pages by 8 (typical backend config based on problem domain logic)
    const totalPages = Math.ceil(totalCount / perPage) || 1;

    const paginationContainer = document.querySelector('.box-korish ul');
    if (!paginationContainer) return;

    const isFirst = (currentPage === 1);
    const isLast = (currentPage === totalPages || totalPages === 0);

    let html = `
        <li>
            <button onclick="changePage(1)" ${isFirst ? 'disabled' : ''}>
                <i class="bxr bx-chevrons-left"></i>
            </button>
        </li>
        <li>
            <button onclick="changePage(${isFirst ? 1 : currentPage - 1})" ${isFirst ? 'disabled' : ''}>
                <i class="bxr bx-chevron-left"></i>
            </button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        const activeStyle = i === currentPage ? 'color: #ff6633; font-weight: bold;' : '';
        html += `
            <li>
                <button onclick="changePage(${i})" style="${activeStyle}">
                    <p>${i}</p>
                </button>
            </li>
        `;
    }

    html += `
        <li>
            <button onclick="changePage(${isLast ? totalPages : currentPage + 1})" ${isLast ? 'disabled' : ''}>
                <i class="bxr bx-chevron-right"></i>
            </button>
        </li>
        <li>
            <button onclick="changePage(${totalPages})" ${isLast ? 'disabled' : ''}>
                <i class="bxr bx-chevrons-right"></i>
            </button>
        </li>
    `;

    paginationContainer.innerHTML = html;
}

window.changePage = function(page) {
    localStorage.setItem('productPage', page);
    fetchPaginatedProducts(page);
    
    // Auto scroll to top of list gracefully
    window.scrollTo({ top: 300, behavior: 'smooth' });
};
