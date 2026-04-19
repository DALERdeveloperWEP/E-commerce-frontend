/**
 * users.js — Admin users management page
 * Access: admin role only
 */

let allUsers   = [];
let allSellers = [];
let activeTab  = 'users';

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    initTabs();
    initSearch();
    initModal();
});

// ─── Guard ────────────────────────────────────────────────────────────────────
async function checkAdminAccess() {
    const token = localStorage.getItem('access');
    if (!token) {
        window.location.href = './login.html';
        return;
    }

    try {
        const res = await apiFetch('/api/auth/profile/');
        if (!res.ok) throw new Error('Unauthorized');
        const user = await res.json();

        if (user.role !== 'admin') {
            window.location.href = '/';
            return;
        }

        loadUsersData();
    } catch {
        window.location.href = './login.html';
    }
}

// ─── Load data ────────────────────────────────────────────────────────────────
async function loadUsersData() {
    try {
        const res = await apiFetch('/api/auth/admin/users/');
        if (!res.ok) throw new Error();
        const data = await res.json();

        allUsers   = data.users   || [];
        allSellers = data.seller  || [];

        document.getElementById('usersCount').textContent   = allUsers.length;
        document.getElementById('sellersCount').textContent = allSellers.length;

        renderUsers(allUsers);
        renderSellers(allSellers);

    } catch {
        showToast('Ошибка загрузки данных', 'error');
        showEmpty('users');
        showEmpty('sellers');
    }
}

// ─── Render users ─────────────────────────────────────────────────────────────
function renderUsers(users) {
    const loading = document.getElementById('usersLoading');
    const table   = document.getElementById('usersTable');
    const tbody   = document.getElementById('usersTbody');
    const empty   = document.getElementById('usersEmpty');

    loading?.classList.add('hidden');

    if (!users.length) {
        showEmpty('users');
        return;
    }

    empty?.classList.add('hidden');
    table?.classList.remove('hidden');

    tbody.innerHTML = users.map((u, i) => `
        <tr data-type="user" data-index="${i}">
            <td>
                <div class="user-cell">
                    ${avatarHTML(u)}
                    <span class="user-name">${fullName(u)}</span>
                </div>
            </td>
            <td><span class="phone-text${!u.phone ? ' none' : ''}">${u.phone || 'Не указан'}</span></td>
            <td>${genderHTML(u.gender)}</td>
            <td>${cardHTML(u.is_card)}</td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
            const u = allUsers[+row.dataset.index];
            openModal(u, 'user');
        });
    });
}

function renderSellers(sellers) {
    const loading = document.getElementById('sellersLoading');
    const table   = document.getElementById('sellersTable');
    const tbody   = document.getElementById('sellersTbody');
    const empty   = document.getElementById('sellersEmpty');

    loading?.classList.add('hidden');

    if (!sellers.length) {
        showEmpty('sellers');
        return;
    }

    empty?.classList.add('hidden');
    table?.classList.remove('hidden');

    tbody.innerHTML = sellers.map((s, i) => `
        <tr data-type="seller" data-index="${i}">
            <td>
                <div class="user-cell">
                    ${avatarHTML(s)}
                    <span class="user-name">${fullName(s)}</span>
                </div>
            </td>
            <td><span class="phone-text${!s.phone ? ' none' : ''}">${s.phone || 'Не указан'}</span></td>
            <td>${genderHTML(s.gender)}</td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
            const s = allSellers[+row.dataset.index];
            openModal(s, 'seller');
        });
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fullName(u) {
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Без имени';
}

function avatarHTML(u) {
    if (u.logo) return `<img src="${u.logo}" alt="" class="user-avatar" />`;
    const init = (u.first_name || '?')[0].toUpperCase();
    return `<div class="user-avatar-init">${init}</div>`;
}

function avatarModalHTML(u) {
    if (u.logo) return `<img src="${u.logo}" alt="" class="modal-avatar" />`;
    const init = (u.first_name || '?')[0].toUpperCase();
    return `<div class="modal-avatar modal-avatar-init">${init}</div>`;
}

function genderHTML(gender) {
    if (!gender) return `<span style="color:var(--c-border);font-size:13px">—</span>`;
    const map = { male: '♂ Мужской', female: '♀ Женский' };
    return `<span class="gender-badge">${map[gender] || gender}</span>`;
}

function cardHTML(isCard) {
    if (isCard === undefined || isCard === null)
        return `<span style="color:var(--c-border);font-size:13px">—</span>`;
    return isCard
        ? `<span class="card-badge card-yes"><i class="bx bx-check"></i> Активна</span>`
        : `<span class="card-badge card-no">Нет</span>`;
}

function showEmpty(type) {
    document.getElementById(`${type}Loading`)?.classList.add('hidden');
    document.getElementById(`${type}Empty`)?.classList.remove('hidden');
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.users-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${activeTab}`)?.classList.add('active');
            applySearch();
        });
    });
}

// ─── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
    document.getElementById('searchInput')?.addEventListener('input', applySearch);
}

function applySearch() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

    if (activeTab === 'users') {
        const filtered = q
            ? allUsers.filter(u => `${fullName(u)} ${u.phone || ''}`.toLowerCase().includes(q))
            : allUsers;
        renderUsers(filtered);
    } else {
        const filtered = q
            ? allSellers.filter(s => `${fullName(s)} ${s.phone || ''}`.toLowerCase().includes(q))
            : allSellers;
        renderSellers(filtered);
    }
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function initModal() {
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('userModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(user, type) {
    const modal = document.getElementById('userModal');
    const content = document.getElementById('modalContent');

    const fields = [
        { label: 'Телефон', value: user.phone || 'Не указан' },
        { label: 'Пол', value: user.gender ? (user.gender === 'male' ? 'Мужской' : 'Женский') : 'Не указан' },
    ];

    if (type === 'user') {
        fields.push({
            label: 'Карта лояльности',
            value: user.is_card === true ? 'Активна ✓' : user.is_card === false ? 'Нет карты' : '—'
        });
    }

    content.innerHTML = `
        <div class="modal-user-header">
            ${avatarModalHTML(user)}
            <div class="modal-user-info">
                <h2>${fullName(user)}</h2>
                <span>${type === 'seller' ? 'Продавец' : 'Пользователь'}</span>
            </div>
        </div>
        <div class="modal-fields">
            ${fields.map(f => `
                <div class="modal-field">
                    <span class="modal-field-label">${f.label}</span>
                    <span class="modal-field-value">${f.value}</span>
                </div>
            `).join('')}
        </div>
    `;

    modal?.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('userModal')?.classList.add('hidden');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: 'bx-check-circle', error: 'bx-error-circle', info: 'bx-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="bx ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}