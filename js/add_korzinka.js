document.addEventListener('DOMContentLoaded', () => {
    const childProductContainer = document.querySelector('.child-product');
    const counterHeader = document.querySelector('.counter_heder');
    const sumProduct = document.querySelector('.sum-product p');
    const itagSuma = document.querySelector('.itag-suma h1');
    const vdeliBtn = document.querySelector('.vdeli');
    const deleteBtn = document.querySelector('.dalete');
    const elementProduct1Price = document.querySelector('.element-product1 p:last-child');
    const elementProduct2Discount = document.querySelector('.element-product2 p:last-child');

    const BASE_URL = 'http://localhost:8000';
    const accessToken = localStorage.getItem('access');

    if (!childProductContainer) return;

    const headers = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Local State
    let currentCartItems = [];
    let priceMode = localStorage.getItem('priceMode') || 'with-card';
    let isCardUser = false;
    let cardToggle = null;
    let toggleOptions = [];

    async function fetchProfile() {
        if (!accessToken) return null;
        try {
            const res = await fetch(`${BASE_URL}/api/auth/profile/`, { headers });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function fetchProduct(productId) {
        try {
            const res = await fetch(`${BASE_URL}/api/catalog/products/${productId}/`, { headers });
            if (!res.ok) throw new Error('Product not found');
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function fetchCart() {
        if (!accessToken) {
            window.location.href = 'login.html';
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/cart/`, { headers });
            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            const cartItems = await res.json();
            
            const enrichedItems = [];
            for (const item of cartItems) {
                const product = await fetchProduct(item.product);
                if (product) {
                    enrichedItems.push({
                        ...item,
                        productDetails: product
                    });
                }
            }
            currentCartItems = enrichedItems;
            renderCart();
        } catch (e) {
            console.error(e);
        }
    }

    function getCheckedItems() {
        const saved = localStorage.getItem('cart_checked_items');
        return saved ? JSON.parse(saved) : {};
    }

    function setCheckedItem(id, isChecked) {
        const checkedItems = getCheckedItems();
        checkedItems[id] = isChecked;
        localStorage.setItem('cart_checked_items', JSON.stringify(checkedItems));
        updateVdeliState();
    }

    function updateVdeliState() {
        if (!vdeliBtn) return;
        const checkboxes = document.querySelectorAll('.child .ui-checkbox');
        if (checkboxes.length === 0) return;
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const icon = vdeliBtn.querySelector('i');
        const text = vdeliBtn.querySelector('p');
        if (allChecked) {
            icon.className = 'bxr bx-minus';
            text.textContent = 'Снять всё';
        } else {
            icon.className = 'bxr bx-plus';
            text.textContent = 'Выделить всё';
        }
    }

    function updateSummary() {
        const checkboxes = document.querySelectorAll('.child .ui-checkbox:checked');
        const checkedIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        
        let totalPriceNoDiscount = 0;
        let totalDiscount = 0;

        const totalUniqueItems = currentCartItems.length;

        currentCartItems.forEach(item => {
            if (checkedIds.includes(item.id)) {
                const p = item.productDetails;
                let regularP = parseFloat(p.regular_price || 0);
                let cardP = parseFloat(p.card_price || regularP);
                let basePrice = (isCardUser && priceMode === 'with-card') ? cardP : regularP;
                let discountPercent = parseFloat(p.discount_percent || 0);
                let discountedPrice = basePrice * (1 - discountPercent / 100);

                totalPriceNoDiscount += basePrice * item.quantity;
                totalDiscount += (basePrice - discountedPrice) * item.quantity;
            }
        });

        const finalTotal = totalPriceNoDiscount - totalDiscount;

        if (counterHeader) counterHeader.textContent = totalUniqueItems;
        if (sumProduct) sumProduct.textContent = `${totalUniqueItems}`;
        
        const grossPriceLabelEl = document.querySelector('.element-product1 p:first-child');
        let totalCheckedUnits = 0;
        currentCartItems.forEach(item => {
            if (checkedIds.includes(item.id)) totalCheckedUnits += item.quantity;
        });
        if (grossPriceLabelEl) grossPriceLabelEl.textContent = `${totalCheckedUnits} товара`;
        
        if (itagSuma) itagSuma.textContent = `${finalTotal.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
        if (elementProduct1Price) elementProduct1Price.textContent = `${totalPriceNoDiscount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
        if (elementProduct2Discount) elementProduct2Discount.textContent = `-${totalDiscount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;

        checkOrderAvailability();
    }

    async function changeQuantityLocally(itemId, delta) {
        const item = currentCartItems.find(i => i.id === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty < 1) {
            try {
                await fetch(`${BASE_URL}/api/cart/${itemId}/`, { method: 'DELETE', headers });
                currentCartItems = currentCartItems.filter(i => i.id !== itemId);
                renderCart();
            } catch (e) {}
            return;
        }

        item.quantity = newQty;
        const row = document.querySelector(`.child .ui-checkbox[data-id="${itemId}"]`)?.closest('.child');
        if (row) {
            row.querySelector('.countFn p').textContent = item.quantity;
            const p = item.productDetails;
            let regularP = parseFloat(p.regular_price || 0);
            let cardP = parseFloat(p.card_price || regularP);
            let baseP = (isCardUser && priceMode === 'with-card') ? cardP : regularP;
            let discountPercent = parseFloat(p.discount_percent || 0);
            let finalUnitPrice = baseP * (1 - discountPercent / 100);
            row.querySelector('.suma h1').textContent = `${(finalUnitPrice * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
            const oldPriceEl = row.querySelector('.suma h5');
            if (oldPriceEl && discountPercent > 0) {
                oldPriceEl.textContent = `${(baseP * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
            }
        }
        updateSummary();
        const endpoint = delta > 0 ? 'increase' : 'decrease';
        fetch(`${BASE_URL}/api/cart/${itemId}/${endpoint}/`, { method: 'POST', headers });
    }

    async function renderCart() {
        childProductContainer.innerHTML = '';
        const savedChecked = getCheckedItems();
        currentCartItems.forEach(item => {
            const product = item.productDetails;
            const isChecked = savedChecked[item.id] !== undefined ? savedChecked[item.id] : true;
            let regularP = parseFloat(product.regular_price || 0);
            let cardP = parseFloat(product.card_price || regularP);
            let baseP = (isCardUser && priceMode === 'with-card') ? cardP : regularP;
            let discountPercent = parseFloat(product.discount_percent || 0);
            let finalUnitPrice = baseP * (1 - discountPercent / 100);
            let productTitle = product.title || "";
            if (productTitle.length > 37) productTitle = productTitle.substring(0, 37) + '...';
            const childDiv = document.createElement('div');
            childDiv.className = 'child';
            childDiv.innerHTML = `
                <div class="wrapper_info_korzinka">
                    <span class="img-icon">
                        <input type="checkbox" class="ui-checkbox" ${isChecked ? 'checked' : ''} data-id="${item.id}" data-product-id="${item.product}" />
                        <img src="${product.image || '../images/img_page/sir.jpg'}" alt="${product.title}" />
                    </span>
                    <span class="text-child">
                        <h1><a href="#!" style="text-decoration: none; color: inherit;">${productTitle}</a></h1>
                        <div class="element_2" style="margin-top: 10px;">
                            <div class="price-container">
                                <div class="price-item">
                                    <span class="main-price-text">${cardP.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽ <span class="unit-text">за шт.</span></span>
                                    <span class="price-subtext">С картой</span>
                                </div>
                                <div class="price-item">
                                    <span class="old-price-text">${regularP.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</span>
                                    <span class="price-subtext">Обычная</span>
                                </div>
                                ${discountPercent > 0 ? `<div class="discount-badge" style="background: #FF6633; padding: 5px 10px; font-size: 18px;">-${Math.round(discountPercent)}%</div>` : ''}
                            </div>
                        </div>
                    </span>
                </div>
                <div class="wrapper_suma">
                    <span class="countFn">
                        <button class="minus_add"><i class="bxr bx-minus"></i></button>
                        <p>${item.quantity}</p>
                        <button class="plus_add"><i class="bxr bx-plus"></i></button>
                    </span>
                    <span class="suma" style="text-align: right; width: 150px;">
                        <h1 style="font-size: 26px; margin: 0;">${(finalUnitPrice * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</h1>
                        ${discountPercent > 0 ? `<h5 style="font-size: 18px; text-decoration: line-through; color: #BFBFBF; margin: 0; font-weight: 500;">${(baseP * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</h5>` : ''}
                    </span>
                </div>
            `;
            childDiv.querySelector('.ui-checkbox').addEventListener('change', (e) => {
                setCheckedItem(item.id, e.target.checked);
                updateSummary();
            });
            childDiv.querySelector('.minus_add').addEventListener('click', () => changeQuantityLocally(item.id, -1));
            childDiv.querySelector('.plus_add').addEventListener('click', () => changeQuantityLocally(item.id, 1));
            childProductContainer.appendChild(childDiv);
        });
        updateSummary();
        updateVdeliState();
        toggleWalletUI();
    }

    async function checkOrderAvailability() {
        const checkboxes = document.querySelectorAll('.child .ui-checkbox:checked');
        const itemIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        const orderBtn = document.querySelector('.order-delet');
        const errorEl = document.querySelector('.error-order');
        if (itemIds.length === 0) {
            if (orderBtn) { orderBtn.style.backgroundColor = '#fcd5ba'; orderBtn.style.color = '#ff6633'; orderBtn.disabled = true; }
            if (errorEl) { errorEl.textContent = 'Выберите товары для оформления'; errorEl.style.display = 'flex'; }
            return;
        }
        try {
            const paymentMethod = (isCardUser && priceMode === 'with-card') ? 'card_price' : 'regular_price';
            const res = await apiFetch('/api/orders/check/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemIds, payment_method: paymentMethod })
            });
            const data = await res.json();
            if (data.ok === true) {
                if (orderBtn) { orderBtn.style.backgroundColor = '#FF6633'; orderBtn.style.color = '#FFFFFF'; orderBtn.disabled = false; }
                if (errorEl) errorEl.style.display = 'none';
            } else if (data.total_price) {
                if (orderBtn) { orderBtn.style.backgroundColor = '#fcd5ba'; orderBtn.style.color = '#ff6633'; orderBtn.disabled = true; }
                if (errorEl) { errorEl.textContent = data.total_price; errorEl.style.display = 'flex'; }
            }
        } catch (e) {}
    }

    function toggleWalletUI() {
        const headInfo = document.querySelector('.head-info');
        const senaMain = document.querySelector('.sena-main');
        const bonus = document.querySelector('.bonus');
        if (priceMode === 'regular') {
            if (headInfo) headInfo.style.display = 'none';
            if (senaMain) senaMain.style.display = 'none';
            if (bonus) bonus.style.display = 'none';
        } else {
            if (headInfo) headInfo.style.display = 'flex';
            if (senaMain) senaMain.style.display = 'flex';
            if (bonus) bonus.style.display = 'flex';
        }
    }

    async function initPage() {
        const profile = await fetchProfile();
        isCardUser = profile && profile.is_card === true;
        const cashbackBalance = profile && profile.cashback !== undefined ? profile.cashback : 0;

        if (isCardUser) {
            const headProduct = document.querySelector('.head-product');
            const infoProduct = document.querySelector('.info-product');
            const itagSumaContainer = document.querySelector('.itag-suma');
            const haedItag = document.querySelector('.haed-itag');

            if (headProduct) {
                cardToggle = document.createElement('div');
                cardToggle.className = 'card-status-toggle';
                cardToggle.setAttribute('data-active', priceMode);
                cardToggle.innerHTML = `
                    <div class="toggle-bg"></div>
                    <div class="toggle-option" data-type="with-card">С картой</div>
                    <div class="toggle-option" data-type="regular">Обычная</div>
                `;
                headProduct.appendChild(cardToggle);

                toggleOptions = cardToggle.querySelectorAll('.toggle-option');
                toggleOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        priceMode = option.dataset.type;
                        cardToggle.setAttribute('data-active', priceMode);
                        localStorage.setItem('priceMode', priceMode);
                        fetchCart();
                    });
                });
            }

            if (infoProduct) {
                const headInfo = document.createElement('div');
                headInfo.className = 'head-info';
                headInfo.innerHTML = `
                    <div class="toggle-switch">
                        <input class="toggle-input" id="toggle" type="checkbox" />
                        <label class="toggle-label" for="toggle"></label>
                    </div>
                    <p class="head-sena">Списать ${cashbackBalance} ₽</p>
                `;
                infoProduct.prepend(headInfo);

                const senaMain = document.createElement('div');
                senaMain.className = 'sena-main';
                senaMain.innerHTML = `<p class="sena-p">На карте накоплено ${cashbackBalance} ₽</p>`;
                infoProduct.insertBefore(senaMain, infoProduct.querySelector('.product-info'));
            }

            if (itagSumaContainer && haedItag) {
                const bonus = document.createElement('div');
                bonus.className = 'bonus';
                bonus.innerHTML = `
                    <span class="svg-bonus">
                        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.6883 0.666611H1.31196C0.843143 0.666611 0.460308 1.05823 0.503301 1.52051C0.994639 7.0113 6.17826 11.3333 12.5001 11.3333C18.822 11.3333 24.0056 7.01332 24.497 1.52051C24.5379 1.05823 24.1571 0.666611 23.6883 0.666611Z" fill="#70C05B" />
                        </svg>
                    </span>
                    <p>Вы получаете <span class="bonus-weight">100 бонусов</span></p>
                `;
                itagSumaContainer.insertBefore(bonus, itagSumaContainer.querySelector('.error-order'));
            }
        } else {
            priceMode = 'regular';
            localStorage.setItem('priceMode', 'regular');
        }

        fetchCart();
    }

    const orderBtn = document.querySelector('.order-delet');
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            // Prevent re-rendering if already in checkout mode
            if (orderBtn.textContent === 'Оплатить na sayte') return;

            const errorEl = document.querySelector('.error-order');
            if (errorEl && errorEl.style.display !== 'none') return;
            
            // Capture checked IDs BEFORE replacing content
            const finalCheckboxes = document.querySelectorAll('.child .ui-checkbox:checked');
            const finalItemIds = Array.from(finalCheckboxes).map(cb => parseInt(cb.dataset.id));

            const headProduct = document.querySelector('.head-product');
            const productMain = document.querySelector('.product');
            if (headProduct) headProduct.style.display = 'none';
            if (productMain) productMain.classList.add('checkout-active');
            
            childProductContainer.innerHTML = `
                <div class="checkout-form">
                    <div class="checkout-section">
                        <h2>Данные получателя</h2>
                        <div class="form-grid">
                            <div class="form-group" style="grid-column: span 2"><label>ФИО (Полное имя)</label><input type="text" id="order_full_name" placeholder="Иван Иванов"></div>
                            <div class="form-group"><label>Телефон</label><input type="text" id="order_phone" placeholder="+79128886677"></div>
                            <div class="form-group" style="grid-column: span 3"><label>Адрес (Улица)</label><input type="text" id="order_street" placeholder="Pushkina"></div>
                            <div class="form-group"><label>Дом</label><input type="text" id="order_house" placeholder="11"></div>
                            <div class="form-group"><label>Квартира</label><input type="text" id="order_apartment" placeholder="12"></div>
                            <div class="form-group" style="grid-column: span 1"><label>Дополнительно (Комментарий)</label><input type="text" id="order_comment" placeholder="Ваш комментарий"></div>
                        </div>
                    </div>
                </div>
            `;

            // Sidebar Orange Button logic: Second click sends the API request
            orderBtn.textContent = 'Оплатить na sayte';
            orderBtn.onclick = async () => {
                let logEl = document.querySelector('#order_response_log');
                if (!logEl) {
                    logEl = document.createElement('div');
                    logEl.id = 'order_response_log';
                    logEl.style.cssText = 'margin-top: 15px; padding: 10px; border-radius: 4px; font-size: 14px; white-space: pre-wrap;';
                    orderBtn.parentNode.insertBefore(logEl, orderBtn.nextSibling);
                }
                logEl.style.display = 'block';
                logEl.textContent = 'Отправka заказа...';
                logEl.style.backgroundColor = '#f5f5f5';
                logEl.style.color = '#333';

                const payload = {
                    full_name: document.querySelector('#order_full_name')?.value?.trim() || '',
                    phone: document.querySelector('#order_phone')?.value?.trim() || '',
                    address: document.querySelector('#order_street')?.value?.trim() || '',
                    house: document.querySelector('#order_house')?.value?.trim() || '',
                    apartment: document.querySelector('#order_apartment')?.value?.trim() || '',
                    comment: document.querySelector('#order_comment')?.value?.trim() || 'No comment',
                    input_items: finalItemIds,
                    payment_method: (isCardUser && priceMode === 'with-card') ? 'card_price' : 'regular_price'
                };

                if (!payload.full_name || !payload.phone || !payload.address) {
                    logEl.textContent = 'Пожалуйста, заполните ФИО, телефон и адрес.';
                    logEl.style.backgroundColor = '#fff3e0'; logEl.style.color = '#e65100';
                    return;
                }

                try {
                    const res = await apiFetch('/api/orders/', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(payload) 
                    });
                    const data = await res.json();
                    if (res.ok) {
                        const filteredData = { 
                            full_name: data.full_name, phone: data.phone, address: data.address, 
                            house: data.house, apartment: data.apartment, comment: data.comment, 
                            payment_method: data.payment_method 
                        };
                        logEl.textContent = 'Заказ успешно оформлен!\n' + JSON.stringify(filteredData, null, 2);
                        logEl.style.backgroundColor = '#e8f5e9'; logEl.style.color = '#2e7d32';
                    } else {
                        logEl.textContent = 'Ошибка (Backend):\n' + JSON.stringify(data, null, 2);
                        logEl.style.backgroundColor = '#ffebee'; logEl.style.color = '#c62828';
                    }
                } catch (e) {
                    logEl.textContent = 'Error: ' + e.message;
                    logEl.style.backgroundColor = '#ffebee'; logEl.style.color = '#c62828';
                }
            };
        });
    }

    if (vdeliBtn) {
        vdeliBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.child .ui-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            const newState = !allChecked;
            
            checkboxes.forEach(cb => {
                cb.checked = newState;
                setCheckedItem(parseInt(cb.dataset.id), newState);
            });
            updateSummary();
            updateVdeliState();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.child .ui-checkbox:checked');
            const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
            
            if (idsToDelete.length === 0) {
                alert('Выберите товары для удаления');
                return;
            }

            if (!confirm(`Удалить выбранные товары (${idsToDelete.length})?`)) return;

            try {
                // Delete one by one or via bulk if API supports it (here one by one)
                for (const id of idsToDelete) {
                    await fetch(`${BASE_URL}/api/cart/${id}/`, { method: 'DELETE', headers });
                }
                // Update local state
                currentCartItems = currentCartItems.filter(item => !idsToDelete.includes(item.id));
                // Remove from local storage checked list
                const checkedItems = getCheckedItems();
                idsToDelete.forEach(id => delete checkedItems[id]);
                localStorage.setItem('cart_checked_items', JSON.stringify(checkedItems));
                
                renderCart();
            } catch (e) {
                console.error('Error deleting items:', e);
                alert('Произошла ошибка при удалении');
            }
        });
    }

    initPage();
});