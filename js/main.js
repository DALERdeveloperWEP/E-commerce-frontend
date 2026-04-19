// BASE_URL, apiFetch, authHeader — api.js dan keladi (index.html da oldin yuklanadi)


document.addEventListener("DOMContentLoaded", async () => {
    if (localStorage.getItem('access')) {
        await fetchFavorites();
    }
    fetchProducts();
    fetchCategories();
});
async function fetchProducts() {
    try {
        const isProductPage = window.location.pathname.includes('product.html');
        if (isProductPage) return; // Prevent index logic from running on product page

        const response = await apiFetch('/api/catalog/products/');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        const products = data.results || data;

        // Fetch cart items to know which products are already in cart
        let cartItems = [];
        if (localStorage.getItem('access')) {
            const cartRes = await apiFetch('/api/cart/');
            if (cartRes.ok) {
                cartItems = await cartRes.json();
            }
        }

        // Filter products with discount_percent for Акции section
        const discountedProducts = products.filter(p => p.discount_percent && parseFloat(p.discount_percent) > 0);

        const cardShops = document.querySelectorAll('.card_shop');
        if (cardShops.length > 0) {
            // Populate the first block (Акции) - only products with discount
            renderProducts(discountedProducts.slice(0, 4), cardShops[0], cartItems);
        }
        if (cardShops.length > 1) {
            // Populate the second block (Новинки) - first products from the list
            renderProducts(products.slice(0, 4), cardShops[1], cartItems);
        }
        if (cardShops.length > 2) {
            // Populate the third block (Покупали раньше) - max 4 products
            renderProducts(products.slice(0, 4), cardShops[2], cartItems);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function fetchCategories() {
    // Optionally fetch categories if there is a category container
    try {
        const response = await apiFetch('/api/catalog/categories/');
        if (!response.ok) throw new Error('Network error');
        const categories = await response.json();
        console.log("Categories loaded:", categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}




function refreshActiveProducts() {
    const isProductPage = window.location.pathname.includes('product.html');
    if (isProductPage && typeof fetchPaginatedProducts === 'function') {
        let currentPage = parseInt(localStorage.getItem('productPage')) || 1;
        fetchPaginatedProducts(currentPage);
    } else {
        fetchProducts();
    }
}
