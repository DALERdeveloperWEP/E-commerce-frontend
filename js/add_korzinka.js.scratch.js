    async function renderCart(cartItems) {
        childProductContainer.innerHTML = '';
        const savedChecked = getCheckedItems();

        async function updateSummary() {
            let totalP = 0;
            let totalRegP = 0;
            let checkedRows = 0;
            const currentChecked = getCheckedItems();

            for (const item of cartItems) {
                const isChecked = currentChecked[item.id] !== undefined ? currentChecked[item.id] : true;
                if (isChecked) {
                    const product = await fetchProduct(item.product);
                    if (!product) continue;

                    let regularP = parseFloat(product.regular_price || 0);
                    let cardP = parseFloat(product.card_price || regularP);
                    let baseP = priceMode === 'with-card' ? cardP : regularP;
                    let currentPrice = baseP * 0.90;

                    checkedRows++;
                    totalRegP += baseP * item.quantity;
                    totalP += currentPrice * item.quantity;
                }
            }

            if (counterHeader) counterHeader.textContent = checkedRows;
            if (sumProduct) sumProduct.textContent = checkedRows;
            if (elementProduct1Text) elementProduct1Text.textContent = `${checkedRows} товара`;
            if (elementProduct1Price) elementProduct1Price.textContent = `${totalRegP.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;

            let disc = totalRegP - totalP;
            if (elementProduct2Node && elementProduct2Discount) {
                if (disc > 0) {
                    elementProduct2Discount.textContent = `-${disc.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
                    elementProduct2Node.style.display = 'flex';
                } else {
                    elementProduct2Node.style.display = 'none';
                }
            }
            if (itagSuma) itagSuma.textContent = `${totalP.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽`;
            
            checkOrderAvailability();
        }

        for (const item of cartItems) {
            const product = await fetchProduct(item.product);
            if (!product) continue;

            const isChecked = savedChecked[item.id] !== undefined ? savedChecked[item.id] : true;

            let regularP = parseFloat(product.regular_price || 0);
            let cardP = parseFloat(product.card_price || regularP);
            let baseP = priceMode === 'with-card' ? cardP : regularP;
            let currentPrice = baseP * 0.90;

            let productTitle = product.title || "Mahsulot nomi yo'q";
            if (productTitle.length > 37) {
                productTitle = productTitle.substring(0, 37) + '...';
            }

            const childDiv = document.createElement('div');
            childDiv.className = 'child';
            childDiv.innerHTML = `
                <div class="wrapper_info_korzinka">
                    <span class="img-icon">
                        <input type="checkbox" class="ui-checkbox" ${isChecked ? 'checked' : ''} data-id="${item.id}" data-product-id="${item.product}" />
                        <img src="${product.image ? product.image : '../images/img_page/sir.jpg'}" alt="${product.title || ''}" />
                    </span>
                    <span class="text-child">
                        <h1><a href="#!" style="text-decoration: none; color: inherit;">${productTitle}</a></h1>
                        <div class="element_2" style="margin-top: 10px;">
                            <div class="wrapper-info">
                                <nav>
                                    <span>${currentPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</span>
                                    <span style="text-decoration: line-through; margin-left: 10px; color: var(--grayColor);">${baseP.toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</span>
                                </nav>
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
                    <span class="suma">
                        <h1>${(currentPrice * item.quantity).toLocaleString('ru-RU', {minimumFractionDigits: 2})}₽</h1>
                    </span>
                </div>
            `;

            const checkbox = childDiv.querySelector('.ui-checkbox');
            checkbox.addEventListener('change', () => {
                setCheckedItem(item.id, checkbox.checked);
                updateSummary();
            });

            const minusBtn = childDiv.querySelector('.minus_add');
            const plusBtn = childDiv.querySelector('.plus_add');

            minusBtn.addEventListener('click', () => decreaseCartItem(item.id));
            plusBtn.addEventListener('click', () => increaseCartItem(item.id));

            childProductContainer.appendChild(childDiv);
        }

        await updateSummary();
        toggleWalletUI();
        updateVdeliState();
    }
