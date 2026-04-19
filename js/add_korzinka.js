document.addEventListener('DOMContentLoaded', () => {
    const childProductContainer = document.querySelector('.child-product');
    const counterHeader = document.querySelector('.counter_heder');
    const sumProduct = document.querySelector('.sum-product p');
    const itagSuma = document.querySelector('.itag-suma h1');
    const vdeliBtn = document.querySelector('.vdeli');
    const deleteBtn = document.querySelector('.dalete');
    const elementProduct1Text = document.querySelector('.element-product1 p:first-child');
    const elementProduct1Price = document.querySelector('.element-product1 p:last-child');
    const elementProduct2Node = document.querySelector('.element-product2');
    const elementProduct2Discount = document.querySelector('.element-product2 p:last-child');

    const BASE_URL = 'http://localhost:8000';
    const accessToken = localStorage.getItem('access');

    // Agar savatcha elementi topilmasa, kodni to'xtatish
    if (!childProductContainer) return;

    const headers = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    async function fetchProfile() {
        if (!accessToken) return null;
        try {
            const res = await fetch(`${BASE_URL}/api/auth/profile/`, { headers });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function fetchProduct(productId) {
        try {
            const res = await fetch(`${BASE_URL}/api/catalog/products/${productId}/`, { headers });
            if (!res.ok) throw new Error('Product not found');
            return await res.json();
        } catch (e) {
            console.error(e);
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
                console.error("401 Unauthorized - redirecting to login");
                window.location.href = 'login.html';
                return;
            }
            if (!res.ok) throw new Error('Cart not found');
            const cartItems = await res.json();
            renderCart(cartItems);
        } catch (e) {
            console.error(e);
        }
    }

    let cardToggle = null;
    let toggleOptions = [];
    let priceMode = localStorage.getItem('priceMode') || 'with-card';

    async function initPage() {
        const profile = await fetchProfile();
        const isCardUser = profile && profile.is_card === true;
        const cashbackBalance = profile && profile.cashback !== undefined ? profile.cashback : 0;

        if (isCardUser) {
            const headProduct = document.querySelector('.head-product');
            const infoProduct = document.querySelector('.info-product');
            const itagSuma = document.querySelector('.itag-suma');
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

            if (itagSuma && haedItag) {
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
                itagSuma.insertBefore(bonus, itagSuma.querySelector('.error-order'));
            }
        } else {
            priceMode = 'regular';
            localStorage.setItem('priceMode', 'regular');
        }

        fetchCart();
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
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
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

    async function increaseCartItem(id) {
        try {
            const res = await fetch(`${BASE_URL}/api/cart/${id}/increase/`, {
                method: 'POST',
                headers
            });
            if (res.ok) {
                fetchCart();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function decreaseCartItem(id) {
        try {
            const res = await fetch(`${BASE_URL}/api/cart/${id}/decrease/`, {
                method: 'POST',
                headers
            });
            if (res.ok) {
                fetchCart();
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (vdeliBtn) {
        vdeliBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.child .ui-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
                setCheckedItem(cb.dataset.id, cb.checked);
            });
            updateVdeliState();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const checkedItems = document.querySelectorAll('.child input.ui-checkbox:checked');
            for (const checkbox of checkedItems) {
                const itemId = checkbox.dataset.id;
                if (itemId) {
                    try {
                        await fetch(`${BASE_URL}/api/cart/${itemId}/`, {
                            method: 'DELETE',
                            headers
                        });
                        // Remove from localStorage
                        const savedChecked = getCheckedItems();
                        delete savedChecked[itemId];
                        localStorage.setItem('cart_checked_items', JSON.stringify(savedChecked));
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            fetchCart();
        });
    }

    async function renderCart(cartItems) {
        childProductContainer.innerHTML = '';
        let totalItems = 0;
        let totalPrice = 0;
        let totalRegularPrice = 0;
        const savedChecked = getCheckedItems();

        for (const item of cartItems) {
            const product = await fetchProduct(item.product);
            if (!product) continue;

            totalItems += item.quantity;
            
            let regularP = parseFloat(product.regular_price || 0);
            let cardP = parseFloat(product.card_price || regularP);
            
            let baseP = priceMode === 'with-card' ? cardP : regularP;

            let itemDiscount = baseP * 0.10;
            let currentPrice = baseP - itemDiscount;

            totalRegularPrice += baseP * item.quantity;
            totalPrice += currentPrice * item.quantity;

            let productTitle = product.title || "Mahsulot nomi yo'q";
            if (productTitle.length > 37) {
                productTitle = productTitle.substring(0, 37) + '...';
            }

            const isChecked = savedChecked[item.id] !== undefined ? savedChecked[item.id] : true;

            const childDiv = document.createElement('div');
            childDiv.className = 'child';

            childDiv.innerHTML = `
                <div class="wrapper_info_korzinka">
                    <span class="img-icon">
                        <input type="checkbox" class="ui-checkbox" ${isChecked ? 'checked' : ''} data-id="${item.id}" />
                        <img src="${product.image ? product.image : '../images/img_page/sir.jpg'}" alt="${product.title || ''}" />
                    </span>

                    <span class="text-child">
                        <h1><a href="#!" style="text-decoration: none; color: inherit;" title="${product.title || ''}">${productTitle}</a></h1>
                        <div class="element_2" style="margin-top: 10px;">
                            <div class="wrapper-info">
                                <nav>
                                    <span>${currentPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</span>
                                    <span style="text-decoration: line-through; margin-left: 10px; color: var(--grayColor);">${baseP.toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</span>
                                    <span style="margin-left: 10px;">за шт.</span>
                                </nav>
                            </div>
                            <span class="aksiya" style="font-size: 14px; width: 45px; height: 25px; margin-left: 10px;">-10%</span>
                        </div>
                    </span>
                </div>
                <div class="wrapper_suma">
                    <span class="countFn">
                        <button class="minus_add"><i class="bxr bx-minus"></i></button>
                        <p>${item.quantity}</p>
                        <button class="plus_add"><i class="bxr bx-plus"></i></button>
                    </span>
                    <span class="suma">
                        <h1>${(currentPrice * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</h1>
                        <h5>${(baseP * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</h5>
                    </span>
                </div>
            `;

            const checkbox = childDiv.querySelector('.ui-checkbox');
            checkbox.addEventListener('change', () => {
                setCheckedItem(item.id, checkbox.checked);
            });

            const minusBtn = childDiv.querySelector('.minus_add');
            const plusBtn = childDiv.querySelector('.plus_add');

            minusBtn.addEventListener('click', () => {
                decreaseCartItem(item.id);
            });

            plusBtn.addEventListener('click', () => {
                increaseCartItem(item.id);
            });

            childProductContainer.appendChild(childDiv);
        }

        if (counterHeader) counterHeader.textContent = cartItems.length;
        if (sumProduct) sumProduct.textContent = cartItems.length;

        if (elementProduct1Text) elementProduct1Text.textContent = `${cartItems.length} товара`;
        if (elementProduct1Price) elementProduct1Price.textContent = `${totalRegularPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;

        let discount = totalRegularPrice - totalPrice;
        if (elementProduct2Node && elementProduct2Discount) {
            if (discount > 0) {
                elementProduct2Discount.textContent = `-${discount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
                elementProduct2Node.style.display = 'flex';
            } else {
                elementProduct2Node.style.display = 'none';
            }
        }

        if (itagSuma) itagSuma.textContent = `${totalPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;

        toggleWalletUI();
        updateVdeliState();
    }

    initPage();
});