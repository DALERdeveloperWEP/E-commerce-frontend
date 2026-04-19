// ─── Избраное.js ─────────────────────────────────────────────────────────────
// Requires: api.js (apiFetch) loaded before this script.



// ── Mock / offline fallback products ─────────────────────────────────────────
const MOCK_PRODUCTS = [
    { id: 1001, _favId: 1, title: "Молоко ПРОСТОКВАШИНО пастеризованное цельное отборное...", regular_price: "69.99", card_price: "49.99", discount_percent: "28", rating: 3, image: "../images/img_page/sut.png" },
    { id: 1002, _favId: 2, title: "Молоко сгущенное РОГАЧЕВ Егорка, цельное с сахаром...", regular_price: "140.50", card_price: "69.99", discount_percent: "50", rating: 2, image: "../images/img_page/sir.jpg" },
    { id: 1003, _favId: 3, title: "Йогурт фруктовый FRUTTIS", regular_price: "77.99", card_price: null, discount_percent: null, rating: 4, image: "../images/img_page/yogurt.jpg" },
    { id: 1004, _favId: 4, title: "Масло сливочное ПРОСТОКВАШИНО 82.5%", regular_price: "192.99", card_price: null, discount_percent: null, rating: 2, image: "../images/img_page/yog.jpg" },
    { id: 1005, _favId: 5, title: "Йогурт мевали FRUTTIS", regular_price: "29.99", card_price: null, discount_percent: null, rating: 3, image: "../images/img_page/yogurt-mevali.jpg" },
    { id: 1006, _favId: 6, title: "Сыр твердый ПАРМЕЗАН", regular_price: "299.50", card_price: "249.99", discount_percent: "17", rating: 5, image: "../images/img_page/sir.jpg" },
    { id: 1007, _favId: 7, title: "Кефир ПРОСТОКВАШИНО 2.5%", regular_price: "59.99", card_price: null, discount_percent: null, rating: 3, image: "../images/img_page/sut.png" },
];

// ── State ─────────────────────────────────────────────────────────────────────
let allFavProducts  = [];
let favoriteItems   = [];
let filteredProducts= [];
let displayedCount  = 0;
const PAGE_SIZE     = 6;

let priceMin  = 0;
let priceMax  = 1000;
let filterMin = 0;
let filterMax = 1000;

let currentPage = 1;
let totalPages  = 1;
let isOffline   = false;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadFavorites();
    initRangeSlider();
    initOchistit();
    initPokazat();
});

// React instantly to unfavorite actions
window.addEventListener('favoritesUpdated', () => {
    if (window.userFavorites && allFavProducts.length > 0) {
        const currentFavProductIds = window.userFavorites.map(f => f.product);
        allFavProducts = allFavProducts.filter(p => currentFavProductIds.includes(p.id));
        setupSliderBounds();
        applyFilterAndRender(true);
    }
});
// ── Fetch favorites ───────────────────────────────────────────────────────────
async function loadFavorites() {
    // Try backend first
    if (localStorage.getItem('access') && typeof apiFetch !== 'undefined') {
        try {
            let page      = 1;
            let allFavs   = [];
            let success   = false;

            while (true) {
                const res = await apiFetch(`/api/catalog/favorites/?page=${page}`);
                if (!res.ok) break;
                success = true;
                const data   = await res.json();
                const results = Array.isArray(data) ? data : (data.results || []);
                allFavs = allFavs.concat(results);
                if (!(!Array.isArray(data) && data.next)) break;
                page++;
            }

            favoriteItems = allFavs;
            if (typeof window.userFavorites !== 'undefined') {
                window.userFavorites.length = 0;
                window.userFavorites.push(...allFavs);
            }

            if (success && favoriteItems.length > 0) {
                // Fetch each product's details
                const prods = await Promise.all(
                    favoriteItems.map(async fav => {
                        try {
                            const r = await apiFetch(`/api/catalog/products/${fav.product}/`);
                            if (!r.ok) return null;
                            const p = await r.json();
                            p._favId = fav.id;
                            return p;
                        } catch { return null; }
                    })
                );
                allFavProducts = prods.filter(Boolean);
                isOffline = false;

                if (allFavProducts.length > 0) {
                    setupSliderBounds();
                    applyFilterAndRender(true);
                    return;
                }
            }

            // Backend worked but no favorites
            if (success && favoriteItems.length === 0) {
                renderEmpty('Список избранного пуст');
                return;
            }
        } catch (e) {
            console.warn('Backend unavailable, using mock data', e);
        }
    }

    // ── Offline / no token fallback ───────────────────────────────────────────
    isOffline = true;
    allFavProducts = MOCK_PRODUCTS;
    if (typeof window.userFavorites !== 'undefined') {
        window.userFavorites.length = 0;
        window.userFavorites.push(...MOCK_PRODUCTS.map(p => ({ product: p.id, id: p._favId })));
    }
    setupSliderBounds();
    applyFilterAndRender(true);
}

// ── Set slider min/max from product prices ────────────────────────────────────
function setupSliderBounds() {
    const prices = allFavProducts.map(p => parseFloat(p.regular_price) || 0).filter(n => !isNaN(n));
    if (prices.length === 0) { priceMin = 0; priceMax = 1000; }
    else {
        priceMin = Math.floor(Math.min(...prices));
        priceMax = Math.ceil(Math.max(...prices));
        // Ensure visible range even if only 1 product
        if (priceMin === priceMax) { priceMin = Math.max(0, priceMin - 10); priceMax += 10; }
    }

    filterMin = priceMin;
    filterMax = priceMax;

    const iMin = document.getElementById('rangeMin');
    const iMax = document.getElementById('rangeMax');
    if (iMin) { iMin.min = priceMin; iMin.max = priceMax; iMin.value = priceMin; }
    if (iMax) { iMax.min = priceMin; iMax.max = priceMax; iMax.value = priceMax; }

    updatePriceDisplay();
    updateSliderTrack();
}

// ── Filter + render ───────────────────────────────────────────────────────────
function applyFilterAndRender(reset = false) {
    filteredProducts = allFavProducts.filter(p => {
        const price = parseFloat(p.regular_price) || 0;
        return price >= filterMin && price <= filterMax;
    });

    totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

    if (reset) {
        displayedCount = 0;
        currentPage    = 1;
        const grid = document.querySelector('.fav-card-grid');
        if (grid) grid.innerHTML = '';
    }

    renderPage(currentPage);
    buildPagination();
    updatePokazatBtn();
}

// ── Render one page ───────────────────────────────────────────────────────────
async function renderPage(page, append = false) {
    const grid  = document.querySelector('.fav-card-grid');
    if (!grid) return;

    const start = (page - 1) * PAGE_SIZE;
    const slice = filteredProducts.slice(start, start + PAGE_SIZE);

    if (!append) {
        grid.innerHTML = '';
        displayedCount = 0;
    }

    if (slice.length === 0 && !append) {
        grid.innerHTML = '<div class="fav-empty"><p>Нет товаров в выбранном диапазоне цен</p></div>';
        return;
    }

    let cartItems = [];
    if (localStorage.getItem('access')) {
        try {
            const cartRes = await window.apiFetch('/api/cart/');
            if (cartRes.ok) cartItems = await cartRes.json();
        } catch(e) {}
    }

    const tempDiv = document.createElement('div');
    if (typeof renderProducts === 'function') {
        renderProducts(slice, tempDiv, cartItems);
    }

    while(tempDiv.firstChild) {
        grid.appendChild(tempDiv.firstChild);
        displayedCount++;
    }
}


// ── Pagination ────────────────────────────────────────────────────────────────
function buildPagination() {
    const ul = document.querySelector('.fav-pagination');
    if (!ul) return;
    ul.innerHTML = '';
    if (totalPages <= 1) { ul.style.display = 'none'; return; }
    ul.style.display = 'flex';

    const isFirst = (currentPage === 1);
    const isLast = (currentPage === totalPages || totalPages === 0);

    const make = (html, page, isDisabled) => {
        const li  = document.createElement('li');
        const btn = document.createElement('button');
        btn.innerHTML = html;
        if (isDisabled) btn.disabled = true;
        if (page === currentPage && typeof page === 'number' && !isDisabled) {
            btn.classList.add('active-page');
        }
        btn.addEventListener('click', () => {
            if (isDisabled) return;
            currentPage = page;
            renderPage(currentPage, false);
            buildPagination();
            updatePokazatBtn();
            document.querySelector('.fav-card-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(btn);
        return li;
    };

    // First + Prev
    ul.appendChild(make('<i class="bxr bx-chevrons-left"></i>', 1, isFirst));
    ul.appendChild(make('<i class="bxr bx-chevron-left"></i>',  Math.max(1, currentPage - 1), isFirst));

    // Page numbers
    const startP = Math.max(1, currentPage - 3);
    const endP   = Math.min(totalPages, startP + 7);
    for (let p = startP; p <= endP; p++) {
        ul.appendChild(make(`<p>${p}</p>`, p, false));
    }

    // Next + Last
    ul.appendChild(make('<i class="bxr bx-chevron-right"></i>',  Math.min(totalPages, currentPage + 1), isLast));
    ul.appendChild(make('<i class="bxr bx-chevrons-right"></i>', totalPages, isLast));
}


// ── Показать ещё ──────────────────────────────────────────────────────────────
function initPokazat() {
    const btn = document.querySelector('.btn_pokazat');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const nextStart = displayedCount;
        const slice     = filteredProducts.slice(nextStart, nextStart + PAGE_SIZE);
        const grid      = document.querySelector('.fav-card-grid');
        if (!grid || slice.length === 0) return;
        
        let cartItems = [];
        if (localStorage.getItem('access')) {
            try {
                const cartRes = await apiFetch('/api/cart/');
                if (cartRes.ok) cartItems = await cartRes.json();
            } catch(e){}
        }
        
        const tempDiv = document.createElement('div');
        if (typeof renderProducts === 'function') {
            renderProducts(slice, tempDiv, cartItems);
        }

        while(tempDiv.firstChild) {
            grid.appendChild(tempDiv.firstChild);
            displayedCount++;
        }
        
        buildPagination();
        updatePokazatBtn();
        slice[0] && grid.children[displayedCount - slice.length]
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

function updatePokazatBtn() {
    const btn = document.querySelector('.btn_pokazat');
    if (btn) btn.style.display = displayedCount < filteredProducts.length ? 'flex' : 'none';
}

// ── Dual range slider ─────────────────────────────────────────────────────────
function initRangeSlider() {
    const iMin = document.getElementById('rangeMin');
    const iMax = document.getElementById('rangeMax');
    if (!iMin || !iMax) return;

    iMin.addEventListener('input', () => {
        if (parseFloat(iMin.value) > parseFloat(iMax.value)) iMin.value = iMax.value;
        filterMin = parseFloat(iMin.value);
        updatePriceDisplay();
        updateSliderTrack();
        applyFilterAndRender(true);
    });

    iMax.addEventListener('input', () => {
        if (parseFloat(iMax.value) < parseFloat(iMin.value)) iMax.value = iMin.value;
        filterMax = parseFloat(iMax.value);
        updatePriceDisplay();
        updateSliderTrack();
        applyFilterAndRender(true);
    });
}

function updatePriceDisplay() {
    const dMin = document.getElementById('priceDisplayMin');
    const dMax = document.getElementById('priceDisplayMax');
    if (dMin) dMin.textContent = Math.round(filterMin);
    if (dMax) dMax.textContent = Math.round(filterMax);
}

// Fills the green track between the two thumbs
function updateSliderTrack() {
    const iMin = document.getElementById('rangeMin');
    const iMax = document.getElementById('rangeMax');
    const wrap = document.querySelector('.dual-range-wrap');
    if (!iMin || !iMax || !wrap) return;

    const min   = parseFloat(iMin.min);
    const max   = parseFloat(iMin.max);
    const range = max - min || 1;
    const left  = ((parseFloat(iMin.value) - min) / range) * 100;
    const right = ((parseFloat(iMax.value) - min) / range) * 100;

    wrap.style.background = `linear-gradient(
      to right,
      #d0f0c0 ${left}%,
      #70c05b ${left}%,
      #70c05b ${right}%,
      #d0f0c0 ${right}%
    )`;
}

// ── Очистить ──────────────────────────────────────────────────────────────────
function initOchistit() {
    const btn = document.querySelector('.btn_ochistit');
    if (!btn) return;
    btn.addEventListener('click', () => {
        filterMin = priceMin; filterMax = priceMax;
        const iMin = document.getElementById('rangeMin');
        const iMax = document.getElementById('rangeMax');
        if (iMin) iMin.value = priceMin;
        if (iMax) iMax.value = priceMax;
        updatePriceDisplay();
        updateSliderTrack();
        applyFilterAndRender(true);
    });
}

// ── Empty state ───────────────────────────────────────────────────────────────
function renderEmpty(msg) {
    const grid = document.querySelector('.fav-card-grid');
    if (grid) grid.innerHTML = `<div class="fav-empty"><p>${msg}</p></div>`;
    const ul = document.querySelector('.fav-pagination');
    if (ul) { ul.innerHTML = ''; ul.style.display = 'none'; }
    const btn = document.querySelector('.btn_pokazat');
    if (btn) btn.style.display = 'none';
}
