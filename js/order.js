/**
 * order.js - Handle order list and details from API
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

let allOrders = [];

function fixImageUrl(url) {
    if (!url) return 'https://via.placeholder.com/150?text=No+Image';
    if (url.startsWith('http')) return url;
    const base = typeof BASE_URL !== 'undefined' ? BASE_URL : 'http://localhost:8000';
    return base + (url.startsWith('/') ? '' : '/') + url;
}

async function fetchOrders() {
    const ordersList = document.getElementById('orders-list');
    
    try {
        const res = await apiFetch('/api/orders/');
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        allOrders = await res.json();
        
        // Success: Clear static mock data and render real data
        ordersList.innerHTML = '';
        
        // Find active status
        const activeTab = document.querySelector('.tab-btn.active');
        const status = activeTab ? activeTab.id.replace('tab-', '') : 'all';
        
        const filtered = status === 'all' ? allOrders : allOrders.filter(o => o.status === status);
        renderOrders(filtered);
        updateTabCounts(allOrders);
    } catch (err) {
        console.error('API Fetch failed, using local static data:', err);
    }
}

function updateTabCounts(orders) {
    const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    
    Object.keys(counts).forEach(status => {
        const tab = document.getElementById(`tab-${status}`);
        if (tab) {
            let badge = tab.querySelector('span');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = "ml-1 text-xs bg-ink-100 text-ink-500 rounded-full px-2 py-0.5";
                tab.appendChild(badge);
            }
            badge.textContent = counts[status];
        }
    });
}

function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    const emptyState = document.getElementById('empty-state');
    
    if (orders.length === 0) {
        ordersList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    ordersList.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    ordersList.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

function createOrderCard(order) {
    const statusData = getStatusData(order.status);
    const itemCount = order.items.length;
    const thumbnails = order.items.slice(0, 2).map(item => `
        <img src="${fixImageUrl(item.product.image)}" class="w-14 h-14 rounded-xl border-2 border-white object-cover shadow-sm" alt="${item.product.title}">
    `).join('');
    const extraCount = itemCount > 2 ? `<div class="w-14 h-14 rounded-xl border-2 border-white bg-ink-100 flex items-center justify-center text-xs font-bold text-ink-500 shadow-sm">+${itemCount - 2}</div>` : '';

    const progressWidth = order.status === 'pending' ? '25%' : (order.status === 'confirmed' ? '60%' : (order.status === 'delivered' ? '100%' : '0%'));
    const progressText = order.status === 'pending' ? 'Tasdiqlash kutilmoqda' : (order.status === 'confirmed' ? 'Yetkazib berilmoqda' : (order.status === 'delivered' ? 'Muvaffaqiyatli yetkazildi' : 'Bekor qilingan'));
    const progressColor = order.status === 'delivered' ? 'text-green-600' : (order.status === 'confirmed' ? 'text-blue-600' : 'text-brand-600');
    const progressFill = order.status === 'delivered' ? 'background: linear-gradient(90deg,#22c55e,#16a34a)' : '';

    return `
      <div class="order-card bg-white rounded-2xl shadow-card overflow-hidden ${order.status === 'cancelled' ? 'opacity-75' : ''}" data-status="${order.status}">
        <div class="p-5 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex -space-x-3 flex-shrink-0">
              ${thumbnails}
              ${extraCount}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-display font-700 text-ink-900 text-base">#ORD-${String(order.id).padStart(5, '0')}</span>
                <span class="${statusData.class} text-xs font-semibold px-2.5 py-0.5 rounded-full">${statusData.icon} ${statusData.label}</span>
              </div>
              <p class="text-sm text-ink-500 mb-2">${itemCount} mahsulot</p>
              <div class="text-xs text-ink-500 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${order.address}, ${order.house}-uy, ${order.apartment}-xonadon
              </div>
            </div>
            <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0">
              <div class="text-right">
                <div class="font-display font-700 text-lg ${order.status === 'cancelled' ? 'text-ink-400 line-through' : 'text-ink-900'}">${order.total_price.toLocaleString()} so'm</div>
                <div class="text-xs text-ink-500">${order.status === 'cancelled' ? 'Bekor qilingan' : 'Jami narx'}</div>
              </div>
              <button onclick="viewOrderDetails(${order.id})" class="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                Batafsil →
              </button>
            </div>
          </div>
          ${order.status !== 'cancelled' ? `
          <div class="mt-4">
            <div class="progress-bar"><div class="progress-fill" style="width:${progressWidth}; ${progressFill}"></div></div>
            <div class="flex justify-between text-[11px] text-ink-400 mt-1.5">
              <span class="font-semibold ${progressColor}">${progressText}</span>
              <span>${progressWidth}</span>
            </div>
          </div>
          ` : `
          <div class="text-xs text-red-400 flex items-center gap-1 mt-3">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${order.comment || 'Bekor qilindi'}
          </div>
          `}
        </div>
      </div>
    `;
}

function getStatusData(status) {
    switch (status) {
        case 'pending':   return { class: 'badge-pending',   icon: '⏳', label: 'Kutilmoqda' };
        case 'confirmed': return { class: 'badge-confirmed', icon: '✅', label: 'Tasdiqlangan' };
        case 'delivered': return { class: 'badge-delivered', icon: '🎉', label: 'Yetkazilgan' };
        case 'cancelled': return { class: 'badge-cancelled', icon: '✗', label: 'Bekor qilingan' };
        default:          return { class: '', icon: '', label: status };
    }
}

function filterOrders(status) {
    if (allOrders.length === 0) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const activeTab = document.getElementById('tab-' + status);
        if (activeTab) activeTab.classList.add('active');
        const cards = document.querySelectorAll('#orders-list .order-card');
        let visible = 0;
        cards.forEach(card => {
            if (status === 'all' || card.dataset.status === status) {
                card.style.display = '';
                visible++;
            } else {
                card.style.display = 'none';
            }
        });
        const emptyState = document.getElementById('empty-state');
        const ordersList = document.getElementById('orders-list');
        if (emptyState) emptyState.classList.toggle('hidden', visible > 0);
        if (ordersList) ordersList.classList.toggle('hidden', visible === 0);
        return;
    }
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const activeTab = document.getElementById('tab-' + status);
    if (activeTab) activeTab.classList.add('active');
    const filtered = status === 'all' ? allOrders : allOrders.filter(o => o.status === status);
    renderOrders(filtered);
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    const modal = document.getElementById('modal-pending');
    if (!modal) return;
    renderModalContent(order, modal);
    openModal('modal-pending');
}

function renderModalContent(order, modal) {
    const statusData = getStatusData(order.status);
    const titleEl = modal.querySelector('h2');
    if (titleEl) titleEl.textContent = `#ORD-${String(order.id).padStart(5, '0')}`;
    const badge = modal.querySelector('.badge-pending, .badge-confirmed, .badge-delivered, .badge-cancelled');
    if (badge) {
        badge.className = `${statusData.class} text-xs font-semibold px-2.5 py-0.5 rounded-full`;
        badge.textContent = `${statusData.icon} ${statusData.label}`;
    }
    const itemsCountLabel = modal.querySelector('h3.font-display.font-600.text-sm.text-ink-700.mb-3.uppercase.tracking-wide');
    if (itemsCountLabel) itemsCountLabel.textContent = `Mahsulotlar (${order.items.length} ta)`;
    const itemsContainer = modal.querySelector('.space-y-3');
    if (itemsContainer) {
        itemsContainer.innerHTML = order.items.map(item => `
            <div class="flex items-center gap-3 bg-ink-50 rounded-xl p-3">
              <img src="${fixImageUrl(item.product.image)}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-ink-900 truncate">${item.product.title}</div>
                <div class="text-xs text-ink-500 mt-0.5">${item.quantity} dona × ${item.price.toLocaleString()} so'm</div>
              </div>
              <div class="text-sm font-700 text-ink-900 flex-shrink-0">${(item.quantity * item.price).toLocaleString()} so'm</div>
            </div>
        `).join('');
    }
    const deliverySection = Array.from(modal.querySelectorAll('h3')).find(h => h.textContent.includes('Yetkazib berish'));
    if (deliverySection) {
        const infoDiv = deliverySection.nextElementSibling;
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                  <div class="flex gap-3"><span class="text-ink-400 w-28 flex-shrink-0">To'liq ism</span><span class="font-medium text-ink-900">${order.full_name}</span></div>
                  <button onclick="updateOrderField(${order.id}, 'full_name', '${order.full_name}')" class="text-brand-500 hover:text-brand-600 text-xs font-semibold">Tahrirlash</button>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex gap-3"><span class="text-ink-400 w-28 flex-shrink-0">Telefon</span><span class="font-medium text-ink-900">${order.phone}</span></div>
                  <button onclick="updateOrderField(${order.id}, 'phone', '${order.phone}')" class="text-brand-500 hover:text-brand-600 text-xs font-semibold">Tahrirlash</button>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex gap-3"><span class="text-ink-400 w-28 flex-shrink-0">Manzil</span><span class="font-medium text-ink-900">${order.address}</span></div>
                  <button onclick="updateOrderField(${order.id}, 'address', '${order.address}')" class="text-brand-500 hover:text-brand-600 text-xs font-semibold">Tahrirlash</button>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex gap-3"><span class="text-ink-400 w-28 flex-shrink-0">Uy / xonadon</span><span class="font-medium text-ink-900">${order.house}-uy, ${order.apartment}-xonadon</span></div>
                  <button onclick="updateOrderField(${order.id}, 'house_apt', '${order.house},${order.apartment}')" class="text-brand-500 hover:text-brand-600 text-xs font-semibold">Tahrirlash</button>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex gap-3"><span class="text-ink-400 w-28 flex-shrink-0">Izoh</span><span class="font-medium text-ink-900 italic">${order.comment || '—'}</span></div>
                  <button onclick="updateOrderField(${order.id}, 'comment', '${order.comment || ''}')" class="text-brand-500 hover:text-brand-600 text-xs font-semibold">Tahrirlash</button>
                </div>
            `;
        }
    }
    const timelineContainer = modal.querySelector('.relative .space-y-5');
    if (timelineContainer) {
        const isPending = order.status === 'pending';
        const isConfirmed = order.status === 'confirmed';
        const isDelivered = order.status === 'delivered';
        const isCancelled = order.status === 'cancelled';
        timelineContainer.innerHTML = `
            <div class="timeline-step done flex items-start gap-4">
                <div class="step-dot w-9 h-9 rounded-full border-2 bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                <div class="pt-1.5"><div class="step-label text-sm font-600 text-green-700">Buyurtma qabul qilindi</div></div>
            </div>
            ${isCancelled ? `
            <div class="timeline-step flex items-start gap-4">
                <div class="step-dot w-9 h-9 rounded-full border-2 bg-red-500 border-red-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></div>
                <div class="pt-1.5"><div class="step-label text-sm font-600 text-red-700">Bekor qilindi</div></div>
            </div>
            ` : `
            <div class="timeline-step ${isPending ? 'active' : 'done'} flex items-start gap-4">
                <div class="step-dot w-9 h-9 rounded-full border-2 ${isPending ? 'bg-brand-500 border-brand-500 animate-pulse' : 'bg-green-500 border-green-500'} flex items-center justify-center flex-shrink-0 z-10 shadow-sm">${isPending ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' : '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'}</div>
                <div class="pt-1.5"><div class="step-label text-sm ${isPending ? 'font-600' : 'font-600 text-green-700'}">Tasdiqlanish kutilmoqda</div></div>
            </div>
            <div class="timeline-step ${isConfirmed ? 'active' : (isDelivered ? 'done' : 'idle')} flex items-start gap-4">
                <div class="step-dot w-9 h-9 rounded-full border-2 ${isConfirmed ? 'bg-brand-500 border-brand-500 animate-pulse' : (isDelivered ? 'bg-green-500 border-green-500' : 'bg-white border-ink-200')} flex items-center justify-center flex-shrink-0 z-10 shadow-sm">${isDelivered ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' : (isConfirmed ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' : '<svg class="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L18 8"/></svg>')}</div>
                <div class="pt-1.5"><div class="step-label text-sm ${isConfirmed ? 'font-600' : (isDelivered ? 'font-600 text-green-700' : 'text-ink-400')}">Yetkazib berish</div></div>
            </div>
            <div class="timeline-step ${isDelivered ? 'done' : 'idle'} flex items-start gap-4">
                <div class="step-dot w-9 h-9 rounded-full border-2 ${isDelivered ? 'bg-green-500 border-green-500' : 'bg-white border-ink-200'} flex items-center justify-center flex-shrink-0 z-10 shadow-sm">${isDelivered ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' : '<svg class="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'}</div>
                <div class="pt-1.5"><div class="step-label text-sm ${isDelivered ? 'font-600 text-green-700' : 'text-ink-400'}">Qabul qilindi</div></div>
            </div>
            `}
        `;
    }
    const totalDisplay = modal.querySelector('.font-800.text-2xl');
    if (totalDisplay) {
        totalDisplay.textContent = `${order.total_price.toLocaleString()} so'm`;
        totalDisplay.className = `font-display font-800 text-2xl mt-0.5 ${order.status === 'delivered' ? 'text-green-700' : (order.status === 'confirmed' ? 'text-blue-700' : (order.status === 'cancelled' ? 'text-ink-400 line-through' : 'text-brand-600'))}`;
    }
    const footer = modal.querySelector('.px-6.py-4.border-t');
    if (footer) {
        if (order.status === 'pending') {
            footer.innerHTML = `<button onclick="cancelOrder(${order.id})" class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold py-2.5 rounded-xl transition-colors">Buyurtmani bekor qilish</button>`;
        } else {
            footer.innerHTML = `<button onclick="closeModal()" class="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Yopish</button>`;
        }
    }
}

function showConfirm(title, desc, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-desc').textContent = desc;
    const btn = document.getElementById('confirm-btn');
    btn.onclick = () => { onConfirm(); closeConfirm(); };
    openModal('modal-confirm');
}
function closeConfirm() { 
    const el = document.getElementById('modal-confirm');
    if (el) el.classList.add('hidden');
    // We don't hide the overlay because the main modal is still underneath
}

function showEditModal(title, field, currentValue, onSave) {
    document.getElementById('edit-modal-title').textContent = title;
    const container = document.getElementById('edit-form-container');
    
    if (field === 'house_apt') {
        const parts = currentValue.split(',');
        container.innerHTML = `
            <div><label class="text-xs text-ink-500 mb-1 block">Uy raqami</label><input type="text" id="edit-house" value="${parts[0]}" class="w-full border border-ink-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"></div>
            <div><label class="text-xs text-ink-500 mb-1 block">Xonadon</label><input type="text" id="edit-apt" value="${parts[1]}" class="w-full border border-ink-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"></div>
        `;
    } else {
        container.innerHTML = `
            <div><label class="text-xs text-ink-500 mb-1 block">${title}</label><input type="text" id="edit-input" value="${currentValue}" class="w-full border border-ink-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"></div>
        `;
    }

    document.getElementById('save-edit-btn').onclick = () => {
        let val;
        if (field === 'house_apt') {
            val = { house: document.getElementById('edit-house').value, apartment: document.getElementById('edit-apt').value };
        } else {
            val = document.getElementById('edit-input').value;
        }
        onSave(val);
        closeEditModal();
    };
    openModal('modal-edit');
}
function closeEditModal() { 
    const el = document.getElementById('modal-edit');
    if (el) el.classList.add('hidden');
}

async function cancelOrder(orderId) {
    showConfirm('Ishonchingiz komilmi?', 'Ushbu buyurtmani bekor qilmoqchimisiz?', async () => {
        try {
            const res = await apiFetch(`/api/orders/${orderId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (!res.ok) throw new Error('Failed');
            await fetchOrders();
            filterOrders('cancelled'); // Switch to cancelled tab
            closeModal();
        } catch (err) { alert('Xatolik!'); }
    });
}

async function updateOrderField(orderId, field, currentValue) {
    const labels = { full_name: 'To\'liq ism', phone: 'Telefon', address: 'Manzil', comment: 'Izoh', house_apt: 'Uy va xonadon' };
    
    showEditModal(labels[field], field, currentValue, async (val) => {
        let payload = field === 'house_apt' ? val : { [field]: val };
        try {
            const res = await apiFetch(`/api/orders/${orderId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed');
            await fetchOrders();
            const updated = allOrders.find(o => o.id === orderId);
            if (updated) renderModalContent(updated, document.getElementById('modal-pending'));
        } catch (err) { alert('Xatolik!'); }
    });
}

function setStar(n) {
    document.querySelectorAll('.star').forEach(s => {
        const i = parseInt(s.dataset.i);
        s.textContent = i <= n ? '★' : '☆';
        s.style.color = i <= n ? '#f97316' : '#ccc';
    });
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.querySelectorAll('[id^="modal-"]').forEach(m => {
        if (m.id !== 'modal-overlay') m.classList.add('hidden');
    });
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
