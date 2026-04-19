// BASE_URL, apiFetch — api.js dan keladi (index.html da oldin yuklanadi)

window.userFavorites = window.userFavorites || [];

/**
 * Common product card logic shared across pages.
 */

async function fetchFavorites() {
    try {
        let page = 1;
        let allFavs = [];
        while (true) {
            const res = await apiFetch(`/api/catalog/favorites/?page=${page}`);
            if (!res.ok) break;
            const data = await res.json();
            const results = Array.isArray(data) ? data : (data.results || []);
            allFavs = allFavs.concat(results);
            const hasNext = !Array.isArray(data) && data.next;
            if (!hasNext) break;
            page++;
        }
        window.userFavorites = allFavs;
        console.log('User favorites loaded', window.userFavorites);
    } catch (err) {
        console.error('Failed to fetch favorites', err);
    }
}

// ─── Star SVG path data ──────────────────────────────────────────────────────
const STAR_PATHS = [
    "M7.10326 1.81698C7.47008 1.07374 8.52992 1.07374 8.89674 1.81699L10.1185 4.29249C10.2641 4.58763 10.5457 4.7922 10.8714 4.83953L13.6033 5.2365C14.4235 5.35568 14.751 6.36365 14.1575 6.94219L12.1807 8.8691C11.945 9.09884 11.8375 9.42984 11.8931 9.75423L12.3598 12.4751C12.4999 13.292 11.6424 13.9149 10.9088 13.5293L8.46534 12.2446C8.17402 12.0915 7.82598 12.0915 7.53466 12.2446L5.09119 13.5293C4.35756 13.9149 3.50013 13.292 3.64024 12.4751L4.1069 9.75423C4.16254 9.42984 4.05499 9.09884 3.81931 8.8691L1.8425 6.94219C1.24898 6.36365 1.57649 5.35568 2.39671 5.2365L5.12859 4.83953C5.4543 4.7922 5.73587 4.58763 5.88153 4.29249L7.10326 1.81698Z",
    "M27.1033 1.81698C27.4701 1.07374 28.5299 1.07374 28.8967 1.81699L30.1185 4.29249C30.2641 4.58763 30.5457 4.7922 30.8714 4.83953L33.6033 5.2365C34.4235 5.35568 34.751 6.36365 34.1575 6.94219L32.1807 8.8691C31.945 9.09884 31.8375 9.42984 31.8931 9.75423L32.3598 12.4751C32.4999 13.292 31.6424 13.9149 30.9088 13.5293L28.4653 12.2446C28.174 12.0915 27.826 12.0915 27.5347 12.2446L25.0912 13.5293C24.3576 13.9149 23.5001 13.292 23.6402 12.4751L24.1069 9.75423C24.1625 9.42984 24.055 9.09884 23.8193 8.8691L21.8425 6.94219C21.249 6.36365 21.5765 5.35568 22.3967 5.2365L25.1286 4.83953C25.4543 4.7922 25.7359 4.58763 25.8815 4.29249L27.1033 1.81698Z",
    "M47.1033 1.81698C47.4701 1.07374 48.5299 1.07374 48.8967 1.81699L50.1185 4.29249C50.2641 4.58763 50.5457 4.7922 50.8714 4.83953L53.6033 5.2365C54.4235 5.35568 54.751 6.36365 54.1575 6.94219L52.1807 8.8691C51.945 9.09884 51.8375 9.42984 51.8931 9.75423L52.3598 12.4751C52.4999 13.292 51.6424 13.9149 50.9088 13.5293L48.4653 12.2446C48.174 12.0915 47.826 12.0915 47.5347 12.2446L45.0912 13.5293C44.3576 13.9149 43.5001 13.292 43.6402 12.4751L44.1069 9.75423C44.1625 9.42984 44.055 9.09884 43.8193 8.8691L41.8425 6.94219C41.249 6.36365 41.5765 5.35568 42.3967 5.2365L45.1286 4.83953C45.4543 4.7922 45.7359 4.58763 45.8815 4.29249L47.1033 1.81698Z",
    "M67.1033 1.81698C67.4701 1.07374 68.5299 1.07374 68.8967 1.81699L70.1185 4.29249C70.2641 4.58763 70.5457 4.7922 70.8714 4.83953L73.6033 5.2365C74.4235 5.35568 74.751 6.36365 74.1575 6.94219L72.1807 8.8691C71.945 9.09884 71.8375 9.42984 71.8931 9.75423L72.3598 12.4751C72.4999 13.292 71.6424 13.9149 70.9088 13.5293L68.4653 12.2446C68.174 12.0915 67.826 12.0915 67.5347 12.2446L65.0912 13.5293C64.3576 13.9149 63.5001 13.292 63.6402 12.4751L64.1069 9.75423C64.1625 9.42984 64.055 9.09884 63.8193 8.8691L61.8425 6.94219C61.249 6.36365 61.5765 5.35568 62.3967 5.2365L65.1286 4.83953C65.4543 4.7922 65.7359 4.58763 65.8815 4.29249L67.1033 1.81698Z",
    "M87.1033 1.81698C87.4701 1.07374 88.5299 1.07374 88.8967 1.81699L90.1185 4.29249C90.2641 4.58763 90.5457 4.7922 90.8714 4.83953L93.6033 5.2365C94.4235 5.35568 94.751 6.36365 94.1575 6.94219L92.1807 8.8691C91.945 9.09884 91.8375 9.42984 91.8931 9.75423L92.3598 12.4751C92.4999 13.292 91.6424 13.9149 90.9088 13.5293L88.4653 12.2446C88.174 12.0915 87.826 12.0915 87.5347 12.2446L85.0912 13.5293C84.3576 13.9149 83.5001 13.292 83.6402 12.4751L84.1069 9.75423C84.1625 9.42984 84.055 9.09884 83.8193 8.8691L81.8425 6.94219C81.249 6.36365 81.5765 5.35568 82.3967 5.2365L85.1286 4.83953C85.4543 4.7922 85.7359 4.58763 85.8815 4.29249L87.1033 1.81698Z"
];

function buildStarSvg(rating) {
    const filled = Math.round(Math.max(0, Math.min(5, rating || 3)));
    const paths = STAR_PATHS.map((d, i) =>
        `<path d="${d}" fill="${i < filled ? '#FF6633' : '#BFBFBF'}"/>`
    ).join('');
    return `<svg width="256" height="16" viewBox="0 0 256 16" fill="none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

// ─── Render Products ─────────────────────────────────────────────────────────
function renderProducts(products, container, cartItems = []) {
    if (!products || products.length === 0) return;
    container.innerHTML = '';

    products.forEach(product => {
        const regularPrice  = parseFloat(product.regular_price)  || 0;
        const cardPrice     = product.card_price ? parseFloat(product.card_price) : null;
        const discountPct   = product.discount_percent ? Math.round(parseFloat(product.discount_percent)) : null;

        const percentBadge = discountPct
            ? `<div class="foiz">-${discountPct}%</div>`
            : '';

        let priceHTML;
        if (cardPrice !== null) {
            priceHTML = `
                <div class="narx">
                  <p>${cardPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}₽</p>
                  <p>${regularPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}₽</p>
                </div>
                <div class="malumot">
                  <p>С картой</p>
                  <p>Обычная</p>
                </div>`;
        } else {
            priceHTML = `
                <div class="narx narx-2">
                  <p>${regularPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}₽</p>
                </div>`;
        }

        const starSvg = buildStarSvg(product.rating);
        const isFavItem = window.userFavorites.find(f => f.product === product.id);
        const favClass = isFavItem ? 'active' : '';

        const cartItem = cartItems.find(item => item.product === product.id);
        let cartButtonHTML;

        if (cartItem) {
            cartButtonHTML = `
                <div class="quantity-control" data-cart-id="${cartItem.id}" data-product-id="${product.id}">
                    <button class="qty-btn minus" onclick="decreaseCartItem(${cartItem.id}, event)">
                        <i class="bxr bx-minus"></i>
                    </button>
                    <span class="qty-value">${cartItem.quantity}</span>
                    <button class="qty-btn plus" onclick="increaseCartItem(${cartItem.id}, event)">
                        <i class="bxr bx-plus"></i>
                    </button>
                </div>`;
        } else {
            cartButtonHTML = `<button onclick="addToCart(${product.id}, event)">В корзину</button>`;
        }

        const card = document.createElement('div');
        card.className = 'shoping';
        card.innerHTML = `
              <div class="img_product">
                <img src="${product.image || './images/img_product/shirinlik.png'}" class="shirinlik" alt="${product.title}" />
                ${percentBadge}
                <div class="arxiv ${favClass}" onclick="toggleFavorite(${product.id}, event)">
                  <i class="bxr bx-heart"></i>
                </div>
              </div>
              <div class="info_product">
                ${priceHTML}
                <div class="city">${product.title}</div>
                <div class="rating">${starSvg}</div>
                ${cartButtonHTML}
              </div>
        `;
        container.appendChild(card);
    });
}

// ─── Toggle Favorite ─────────────────────────────────────────────────────────
async function toggleFavorite(productId, event) {
    if (event) event.stopPropagation();
    const targetEl = event ? (event.currentTarget instanceof Element ? event.currentTarget : event.target.closest('.arxiv')) : null;

    if (!localStorage.getItem('access')) {
        window.location.href = window.location.pathname.includes('/page/') ? './login.html' : './page/login.html';
        return;
    }

    const favItemIndex = window.userFavorites.findIndex(f => f.product === productId);
    const isFav = favItemIndex !== -1;
    
    try {
        if (isFav) {
            const favId = window.userFavorites[favItemIndex].id;
            const res = await apiFetch(`/api/catalog/favorites/${favId}/`, { method: 'DELETE' });
            if (res.ok) {
                window.userFavorites.splice(favItemIndex, 1);
                if (targetEl) targetEl.classList.remove('active');
                window.dispatchEvent(new CustomEvent('favoritesUpdated'));
            }
        } else {
            const res = await apiFetch('/api/catalog/favorites/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: productId })
            });
            if (res.ok) {
                const data = await res.json();
                window.userFavorites.push(data);
                if (targetEl) targetEl.classList.add('active');
                window.dispatchEvent(new CustomEvent('favoritesUpdated'));
            }
        }
    } catch (e) {
        console.error('Failed to toggle favorite', e);
    }
}

// ─── Cart Logic ──────────────────────────────────────────────────────────────
async function addToCart(productId, event) {
    if (event) event.stopPropagation();
    const btn = event ? (event.currentTarget || event.target) : null;
    const infoProduct = btn ? btn.closest('.info_product') : null;
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    try {
        const res = await apiFetch('/api/cart/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product: productId })
        });
        if (res.ok) {
            const cartItem = await res.json();
            if (infoProduct && btn) {
                btn.outerHTML = `
                    <div class="quantity-control" data-cart-id="${cartItem.id}" data-product-id="${productId}">
                        <button class="qty-btn minus" onclick="decreaseCartItem(${cartItem.id}, event)">
                            <i class="bxr bx-minus"></i>
                        </button>
                        <span class="qty-value">${cartItem.quantity || 1}</span>
                        <button class="qty-btn plus" onclick="increaseCartItem(${cartItem.id}, event)">
                            <i class="bxr bx-plus"></i>
                        </button>
                    </div>`;
            }
            if (typeof updateCartCounter === 'function') updateCartCounter();
        } else {
            if (btn) { btn.disabled = false; btn.textContent = 'В корзину'; }
        }
    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'В корзину'; }
        console.error(e);
    }
}

async function decreaseCartItem(cartItemId, event) {
    if (event) event.stopPropagation();
    const btn = event ? (event.currentTarget || event.target) : null;
    const qc  = btn ? btn.closest('.quantity-control') : null;
    const qtyEl = qc ? qc.querySelector('.qty-value') : null;

    try {
        const res = await apiFetch(`/api/cart/${cartItemId}/decrease/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            const data = await res.json().catch(() => null);
            const newQty = data ? (data.quantity ?? 0) : (qtyEl ? parseInt(qtyEl.textContent) - 1 : 0);
            if (newQty <= 0) {
                const productId = qc ? qc.dataset.productId : null;
                if (qc && productId) {
                    qc.outerHTML = `<button onclick="addToCart(${productId}, event)">В корзину</button>`;
                }
            } else {
                if (qtyEl) qtyEl.textContent = newQty;
            }
            if (typeof updateCartCounter === 'function') updateCartCounter();
        }
    } catch (e) {
        console.error(e);
    }
}

async function increaseCartItem(cartItemId, event) {
    if (event) event.stopPropagation();
    const btn   = event ? (event.currentTarget || event.target) : null;
    const qc    = btn ? btn.closest('.quantity-control') : null;
    const qtyEl = qc ? qc.querySelector('.qty-value') : null;

    try {
        const res = await apiFetch(`/api/cart/${cartItemId}/increase/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            const data = await res.json().catch(() => null);
            const newQty = data ? (data.quantity ?? (qtyEl ? parseInt(qtyEl.textContent) + 1 : 1))
                                : (qtyEl ? parseInt(qtyEl.textContent) + 1 : 1);
            if (qtyEl) qtyEl.textContent = newQty;
            if (typeof updateCartCounter === 'function') updateCartCounter();
        }
    } catch (e) {
        console.error(e);
    }
}

// Global exposure
window.renderProducts = renderProducts;
window.toggleFavorite = toggleFavorite;
window.addToCart = addToCart;
window.decreaseCartItem = decreaseCartItem;
window.increaseCartItem = increaseCartItem;
window.fetchFavorites = fetchFavorites;
