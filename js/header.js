/**
 * Header related logic: Profile dropdown, Cart counter, etc.
 */

document.addEventListener("DOMContentLoaded", () => {
    initProfileDropdown();
    initCatalogMenuToggle();
    if (localStorage.getItem('access')) {
        updateCartCounter();
    }
});

// ─── Profile / Seller Dropdown ────────────────────────────────────────────────
function initProfileDropdown() {
    const btn = document.getElementById('profileDropdownBtn');
    const dropdown = document.getElementById('sellerDropdown');
    if (!btn || !dropdown) return;

    dropdown.style.display = 'none';

    btn.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (dropdown.style.display === 'block') {
            closeDropdown(dropdown, btn);
            return;
        }

        const token = localStorage.getItem('access');
        if (!token) {
            const isInPage = window.location.pathname.includes('/page/');
            window.location.href = isInPage ? './login.html' : './page/login.html';
            return;
        }

        try {
            const res = await apiFetch('/api/auth/profile/');
            if (!res.ok) throw new Error('Unauthorized');
            const user = await res.json();

            renderDropdownMenu(dropdown, user);
            openDropdown(dropdown, btn);
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            closeDropdown(dropdown, btn);
        }
    });
}

function renderDropdownMenu(dropdown, user) {
    const isInPage = window.location.pathname.includes('/page/');
    const base = isInPage ? '.' : './page';

    const avatar = user.logo
        ? `<img src="${user.logo}" alt="" class="dd-avatar" />`
        : `<div class="dd-avatar dd-avatar-initials">${(user.first_name || '?')[0].toUpperCase()}</div>`;

    const roleBadge = `<span class="dd-role-badge dd-role-${user.role}">${user.role}</span>`;

    // Items visible to all logged-in users
    const items = [
        {
            href: `${base}/profile.html`,
            icon: 'bx-user-circle',
            label: 'Профиль',
            always: true,
        },
        {
            href: `${base}/orders.html`,
            icon: 'bx-box-alt',
            label: 'Заказы',
            always: true,
        },
        // Sellers & Admins
        {
            href: isInPage ? '../admin-page/admin-home.html' : './admin-page/admin-home.html',
            icon: 'bx-store',
            label: 'Mahsulotlar',
            condition: user.is_seller || user.role === 'admin',
        },
        // Admin only
        {
            href: `${base}/users.html`,
            icon: 'bx-group',
            label: 'Users',
            condition: user.role === 'admin',
        },
    ];

    const itemsHTML = items
        .filter(i => i.always || i.condition)
        .map(i => `
            <a href="${i.href}" class="dd-item">
                <i class="bxr ${i.icon} dd-item-icon"></i>
                <span>${i.label}</span>
            </a>
        `).join('');

    dropdown.innerHTML = `
        <div class="dd-header">
            ${avatar}
            <div class="dd-user-info">
                <span class="dd-user-name">${user.first_name || ''} ${user.last_name || ''}</span>
                <span class="dd-user-email">${user.email}</span>
            </div>
            ${roleBadge}
        </div>
        <div class="dd-divider"></div>
        <nav class="dd-nav">
            ${itemsHTML}
        </nav>
        <div class="dd-divider"></div>
        <button class="dd-item dd-logout" id="logoutBtn">
            <i class="bxr bx-log-out dd-item-icon dd-logout-icon"></i>
            <span>Выйти</span>
        </button>
    `;

    dropdown.querySelector('#logoutBtn')?.addEventListener('click', handleLogout);
}

function openDropdown(dropdown, btn) {
    dropdown.style.display = 'block';
    btn.querySelector('i').style.transform = 'rotate(180deg)';
    btn.querySelector('i').style.transition = 'transform 0.25s ease';
}

function closeDropdown(dropdown, btn) {
    dropdown.style.display = 'none';
    if (btn.querySelector('i')) {
        btn.querySelector('i').style.transform = 'rotate(0deg)';
    }
}

async function handleLogout() {
    try {
        await apiFetch('/api/auth/logout/', { method: 'POST' });
    } catch (_) {}
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/';
}

// ─── Catalog Menu Toggle ──────────────────────────────────────────────────────
function initCatalogMenuToggle() {
    const menyuBtn = document.querySelector('.menyu_card');
    const itemWrapper = document.querySelector('.item-wrapper');

    if (!menyuBtn || !itemWrapper) return;

    menyuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        itemWrapper.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!menyuBtn.contains(e.target) && !itemWrapper.contains(e.target)) {
            itemWrapper.classList.remove('active');
        }
    });
}

// ─── Update Cart Counter ─────────────────────────────────────────────────────
async function updateCartCounter() {
    try {
        const res = await apiFetch('/api/cart/');
        if (res.ok) {
            const items = await res.json();
            const totalQuantity = items.length;
            document.querySelectorAll('.counter_heder').forEach(counter => {
                counter.textContent = totalQuantity;
            });
        }
    } catch (e) {
        console.error('Failed to update cart counter:', e);
    }
}

window.updateCartCounter = updateCartCounter;