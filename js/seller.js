document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        const res = await apiFetch('/api/status/dashboard/seller/');
        if (!res.ok) {
            console.error('Failed to fetch dashboard data', res.status);
            return;
        }
        const data = await res.json();
        populateDashboard(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

function populateDashboard(data) {
    if (!data) return;

    // 1. Stats
    if (data.stats) {
        const stats = data.stats;
        
        // Revenue
        const revEl = document.getElementById('stat-revenue');
        if (revEl) revEl.textContent = formatCurrency(stats.today_balance || 0);
        
        const revChangeEl = document.getElementById('stat-revenue-change');
        if (revChangeEl) {
            revChangeEl.innerHTML = getChangeHtml(stats.today_growth_percent);
            updateChangeClass(revChangeEl, stats.today_growth_percent);
        }
        
        // New Orders
        const ordEl = document.getElementById('stat-new-orders');
        if (ordEl) ordEl.textContent = stats.new_orders || 0;
        
        const ordChangeEl = document.getElementById('stat-new-orders-change');
        if (ordChangeEl) {
            ordChangeEl.innerHTML = getChangeHtml(stats.today_orders_growth);
            updateChangeClass(ordChangeEl, stats.today_orders_growth);
        }
        
        // Total Products
        const prodEl = document.getElementById('stat-total-products');
        if (prodEl) prodEl.textContent = stats.total_products || 0;
        
        const lowStockEl = document.getElementById('stat-low-stock');
        if (lowStockEl) lowStockEl.innerHTML = `↓ ${stats.low_stock_count || 0} ta kam stok`;
        
        // Avg Rating
        const ratEl = document.getElementById('stat-avg-rating');
        if (ratEl) ratEl.textContent = (stats.average_rating || 0).toFixed(1);
        
        const ratChangeEl = document.getElementById('stat-rating-change');
        if (ratChangeEl) {
            ratChangeEl.innerHTML = getChangeHtml(stats.rating_growth);
            updateChangeClass(ratChangeEl, stats.rating_growth);
        }
    }

    // 2. Recent Orders
    if (data.recent_orders && Array.isArray(data.recent_orders)) {
        const tbody = document.getElementById('dashboard-recent-orders');
        if (tbody) {
            if (data.recent_orders.length > 0) {
                tbody.innerHTML = data.recent_orders.map(order => `
                    <tr>
                        <td>
                            <div class="order-id">#ORD-${order.id}</div>
                            <div class="order-meta">${formatDate(order.created_at)}</div>
                        </td>
                        <td>
                            <div class="order-product-name">${order.full_name || 'Noma\'lum mijoz'}</div>
                            <div class="order-meta">${order.phone || ''}</div>
                        </td>
                        <td style="font-weight:700;">${formatCurrency(order.total_price || 0)}</td>
                        <td><span class="badge ${suggestBadgeClassCustom(order.status)}">${suggestStatusLabelCustom(order.status)}</span></td>
                        <td><button class="btn btn-xs btn-primary" onclick="showOrderModal('${order.id}')">Ko'r</button></td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Buyurtmalar yo'q</td></tr>`;
            }
        }
    }

    // 3. Weekly Sales (Chart)
    if (data.weekly_sales && Array.isArray(data.weekly_sales)) {
        const chartBars = document.getElementById('dashboard-chart-bars');
        if (chartBars) {
            // Kam ma'lumot bo'lsa o'rtada joylashishi uchun
            chartBars.style.justifyContent = 'center';

            const maxSales = Math.max(...data.weekly_sales.map(s => s.total || 0), 1); // min 1 to avoid div by zero
            chartBars.innerHTML = data.weekly_sales.map((sale, index) => {
                const height = ((sale.total || 0) / maxSales) * 55; // 80px idishga sig'ishi uchun max 55px
                const isToday = index === data.weekly_sales.length - 1; // Assuming last is today
                return `
                    <div class="chart-day" style="max-width: 36px;">
                        <div class="chart-bar ${isToday ? 'today' : ''}" style="height:${Math.max(height, 5)}px;" title="${formatCurrency(sale.total)}"></div>
                        <div class="chart-day-lbl">${sale.day || ''}</div>
                    </div>
                `;
            }).join('');
        }
    }

    // 4. Tasks
    if (data.tasks && Array.isArray(data.tasks)) {
        const tasksContainer = document.getElementById('task-list');
        if (tasksContainer) {
            if (data.tasks.length === 0) {
                tasksContainer.innerHTML = `<div style="padding: 10px 0; color: var(--muted); font-size: 13px; text-align: center;">Vazifalar yo'q</div>`;
            } else {
                const priorityLabels = { high: 'Yuqori', mid: 'O\'rta', low: 'Past' };
                tasksContainer.innerHTML = data.tasks.map(t => {
                    const isDone = t.status === 'done' || t.status === 'completed';
                    return `
                        <div class="task-item">
                            <div class="task-checkbox ${isDone ? 'done' : ''}">
                                ${isDone ? '<svg viewBox="0 0 12 12" fill="white" width="8" height="8"><path d="M10 3L5 8.5 2 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' : ''}
                            </div>
                            <div style="flex:1;">
                                <div class="task-title-text ${isDone ? 'done' : ''}">${t.title || ''}</div>
                                <div class="task-due">${t.time || ''}</div>
                            </div>
                            <span class="task-priority ${t.priority}">${priorityLabels[t.priority] || t.priority}</span>
                        </div>
                    `;
                }).join('');
            }
        }
    }
}

// Formatters and helpers
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('uz-UZ');
}

function getChangeHtml(percent) {
    if (percent === undefined || percent === null) return `0% o'zgarish`;
    const num = parseFloat(percent);
    if (num > 0) return `↑ ${num}% o'sish`;
    if (num < 0) return `↓ ${Math.abs(num)}% pasayish`;
    return `0% o'zgarish`;
}

function updateChangeClass(element, percent) {
    element.classList.remove('up', 'down', 'neutral');
    const num = parseFloat(percent || 0);
    if (num > 0) element.classList.add('up');
    else if (num < 0) element.classList.add('down');
    else element.classList.add('neutral');
}

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function suggestStatusLabelCustom(status) {
    const map = { 
        pending: 'Kutilmoqda', 
        approved: 'Tasdiqlandi', 
        confirmed: 'Tasdiqlandi', 
        rejected: 'Rad etildi', 
        cancelled: 'Bekor qilindi',
        delivered: 'Yetkazildi'
    };
    return (status && map[status.toLowerCase()]) || 'Noma\'lum';
}

function suggestBadgeClassCustom(status) {
    if (!status) return 'badge-pending';
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'confirmed') return 'badge-approved';
    if (s === 'rejected' || s === 'cancelled') return 'badge-cancelled';
    if (s === 'delivered') return 'badge-delivered';
    return 'badge-pending';
}

window.showOrderModal = async function(id) {
    const modalTitle = document.getElementById('order-modal-title');
    const modalBody = document.getElementById('order-modal-body');
    
    modalTitle.textContent = 'Buyurtma #ORD-' + id;
    if (typeof showModal === 'function') showModal('order-modal');
    
    // Loading state
    modalBody.innerHTML = `<div style="text-align:center; padding:40px;"><div class="spinner spinner-md" style="margin: 0 auto;"></div><div style="margin-top:10px; color:var(--muted); font-size:12px;">Yuklanmoqda...</div></div>`;
    
    try {
        const res = await apiFetch(`/api/orders/${id}/`);
        if (!res.ok) {
            modalBody.innerHTML = `<div style="padding: 20px; color: var(--red); text-align: center;">Xatolik yuz berdi (${res.status})</div>`;
            return;
        }
        const order = await res.json();
        
        // Build the address
        let addrArr = [];
        if (order.address) addrArr.push(order.address);
        if (order.house) addrArr.push(`${order.house}-uy`);
        if (order.apartment) addrArr.push(`${order.apartment}-xonadon`);
        const addressText = addrArr.length > 0 ? addrArr.join(', ') : "Ko'rsatilmagan";

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = order.items.map(item => `
                <div class="order-item-row">
                    <div class="order-item-img">
                        ${item.product && item.product.image ? `<img src="${item.product.image.startsWith('http') ? item.product.image : 'http://localhost:8000' + item.product.image}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">` : '📦'}
                    </div>
                    <div>
                        <div class="order-item-name">${item.product && item.product.title ? item.product.title : 'Mahsulot'}</div>
                        <div class="order-item-qty">x${item.quantity || 1} dona</div>
                    </div>
                    <div class="order-item-price">${formatCurrency(item.price || 0)}</div>
                </div>
            `).join('');
        } else {
            itemsHtml = `<div style="padding:10px; color:var(--muted); font-size:12px;">Mahsulotlar topilmadi</div>`;
        }

        modalBody.innerHTML = `
            <div class="alert ${order.status === 'pending' ? 'alert-warning' : (order.status === 'cancelled' ? 'alert-error' : 'alert-success')}" style="margin-bottom:16px;">
                <div class="alert-icon" style="width:28px;height:28px;">
                    <svg viewBox="0 0 20 20" fill="white" width="13" height="13"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"></path></svg>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${suggestStatusLabelCustom(order.status)}</div>
                    <div class="alert-desc">${formatDate(order.created_at || new Date().toISOString())} da qabul qilindi</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div>
                    <div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:3px;">MIJOZ</div>
                    <div style="font-size:13px;font-weight:600;">${order.full_name || "Noma'lum mijoz"}</div>
                    <div style="font-size:12px;color:var(--muted);">${order.phone || ''}</div>
                </div>
                <div>
                    <div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:3px;">MANZIL</div>
                    <div style="font-size:13px;font-weight:600;">${addressText}</div>
                </div>
            </div>
            ${order.comment ? `
            <div style="margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">IZOH</div>
                <div style="font-size:13px;background:var(--subtle);padding:10px;border-radius:8px;">${order.comment}</div>
            </div>
            ` : ''}
            <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">MAHSULOTLAR</div>
            <div class="order-items-list">
                ${itemsHtml}
            </div>
            <div style="margin-top:14px;padding-top:14px;border-top:1px solid #F5F5F5;display:flex;justify-content:space-between;align-items:center;">
                <div style="font-size:13px;font-weight:600;color:var(--muted);">Jami summa:</div>
                <div style="font-size:18px;font-weight:800;color:var(--dark);">${formatCurrency(order.total_price || 0)}</div>
            </div>
            <div style="margin-top:14px;">
                <div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;">HOLAT O'ZGARTIRISH</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-sm btn-green" onclick="updateOrderStatus('${order.id}', 'confirmed')">✓ Tasdiqlash</button>
                    <button class="btn btn-sm" style="background:var(--blue);color:white;" onclick="updateOrderStatus('${order.id}', 'delivered')">📦 Yetkazildi</button>
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">✕ Bekor qilish</button>
                </div>
            </div>
        `;
    } catch (e) {
        console.error(e);
        modalBody.innerHTML = `<div style="padding: 20px; color: var(--red); text-align: center;">Tarmoq xatosi</div>`;
    }
};

window.updateOrderStatus = async function(id, status) {
    try {
        const res = await apiFetch(`/api/orders/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            if (typeof showToast === 'function') showToast('Holat yangilandi: ' + suggestStatusLabelCustom(status));
            if (typeof closeModal === 'function') closeModal('order-modal');
            fetchDashboardData(); // to refresh UI
        } else {
            if (typeof showToast === 'function') showToast('Xatolik yuz berdi!', 'error');
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast('Tarmoq xatosi', 'error');
    }
};
