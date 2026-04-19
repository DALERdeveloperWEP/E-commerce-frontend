/**
 * profile.js — Profile page logic
 */

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    initTabs();
    initPasswordToggles();
    initPasswordForm();
});

// ─── Load profile ─────────────────────────────────────────────────────────────
async function loadProfile() {
    const loading = document.getElementById('profileLoading');
    try {
        const res = await apiFetch('/api/auth/profile/');
        if (!res.ok) {
            window.location.href = './login.html';
            return;
        }
        const user = await res.json();
        fillProfile(user);
    } catch (err) {
        showToast('Ошибка загрузки профиля', 'error');
    } finally {
        loading?.classList.add('hidden');
    }
}

function fillProfile(user) {
    // Sidebar card
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';

    const badge = document.getElementById('profileRoleBadge');
    if (badge) {
        badge.textContent = user.role || 'user';
        badge.className = `profile-role-badge role-${user.role || 'user'}`;
    }

    // Avatar
    if (user.logo) {
        const img = document.getElementById('profileAvatar');
        img.src = user.logo;
        img.classList.remove('hidden');
    } else {
        const init = document.getElementById('profileInitials');
        init.textContent = (user.first_name || '?')[0].toUpperCase();
        init.classList.remove('hidden');
    }

    // Form fields
    setValue('firstName', user.first_name);
    setValue('lastName', user.last_name);
    setValue('emailField', user.email);
    setValue('phoneField', user.phone);

    const genderField = document.getElementById('genderField');
    if (genderField && user.gender) genderField.value = user.gender;

    // Card badge
    const cardBadge = document.getElementById('cardBadge');
    if (cardBadge) {
        if (user.is_card) {
            cardBadge.textContent = 'Активна ✓';
            cardBadge.classList.add('active');
        } else if (user.is_card === false) {
            cardBadge.textContent = 'Нет карты';
        } else {
            cardBadge.textContent = 'Недоступно';
        }
    }

    // Cashback
    if (user.cashback != null) {
        document.getElementById('cashbackCard')?.classList.remove('hidden');
        const amt = document.getElementById('cashbackAmount');
        if (amt) amt.textContent = `${parseFloat(user.cashback).toLocaleString('ru-RU')} ₽`;
    }

    // Store for reset
    window._profileData = user;

    // Edit button
    initEditMode(user);
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

// ─── Edit mode ────────────────────────────────────────────────────────────────
function initEditMode(user) {
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formActions = document.getElementById('formActions');
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input, select');

    editBtn?.addEventListener('click', () => {
        inputs.forEach(i => i.removeAttribute('disabled'));
        formActions?.classList.remove('hidden');
        editBtn.style.display = 'none';
    });

    cancelBtn?.addEventListener('click', () => {
        fillProfile(window._profileData);
        formActions?.classList.add('hidden');
        editBtn.style.display = '';
        inputs.forEach(i => i.setAttribute('disabled', ''));
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            first_name: form.first_name.value.trim(),
            last_name:  form.last_name.value.trim(),
            phone:      form.phone.value.trim(),
            gender:     form.gender.value,
        };
        try {
            const res = await apiFetch('/api/auth/profile/', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            window._profileData = { ...window._profileData, ...updated };
            fillProfile(window._profileData);
            formActions?.classList.add('hidden');
            editBtn.style.display = '';
            inputs.forEach(i => i.setAttribute('disabled', ''));
            showToast('Профиль обновлён', 'success');
        } catch {
            showToast('Ошибка сохранения', 'error');
        }
    });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function initTabs() {
    document.querySelectorAll('.pnav-item[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;

            document.querySelectorAll('.pnav-item').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(`tab-${tabId}`)?.classList.add('active');
        });
    });
}

// ─── Password form ────────────────────────────────────────────────────────────
function initPasswordForm() {
    document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const current = document.getElementById('currentPass').value;
        const newPass  = document.getElementById('newPass').value;
        const confirm  = document.getElementById('confirmPass').value;

        if (newPass !== confirm) {
            showToast('Пароли не совпадают', 'error');
            return;
        }
        if (newPass.length < 6) {
            showToast('Пароль должен быть не короче 6 символов', 'error');
            return;
        }

        try {
            const res = await apiFetch('/api/auth/change-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: current, new_password: newPass }),
            });
            if (!res.ok) throw new Error();
            showToast('Пароль успешно изменён', 'success');
            e.target.reset();
        } catch {
            showToast('Ошибка смены пароля', 'error');
        }
    });
}

// ─── Password toggles ─────────────────────────────────────────────────────────
function initPasswordToggles() {
    document.querySelectorAll('.eye-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.querySelector('i').className = `bx ${isHidden ? 'bx-show' : 'bx-hide'}`;
        });
    });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: 'bx-check-circle', error: 'bx-error-circle', info: 'bx-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="bx ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}