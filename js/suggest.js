o// ═══════════════════════════════════════════════════════════════════════
//  suggest.js  —  Seller: Kategoriya Taklif (SellerCategories schema)
//
//  Endpoints:
//    GET  /api/seller/category/requests/         → SellerCategories[]
//    POST /api/seller/category/requests/         → SellerCategories  (multipart/form-data)
//
//  Schema (request):  { name, image (file), comment }
//  Schema (response): { id, name, image, slug, status, comment }
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const SUGGEST_API = '/api/seller/category/requests/';

  // ── State ────────────────────────────────────────────────────────────
  let _suggests = [];
  let _loaded   = false;

  // ── Hook: nav-suggest click triggers load ─────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const navBtn = document.getElementById('nav-suggest');
    if (navBtn) {
      navBtn.addEventListener('click', () => {
        // Update the topbar add button label & action
        const addBtn = document.getElementById('addBtn');
        if (addBtn) {
          addBtn.innerHTML = '<i class="bxr bx-bulb"></i> Yangi Taklif';
          addBtn.onclick = openSuggestModal;
        }
        if (!_loaded) loadSuggests();
      });
    }
  });

  // ── Load suggests ────────────────────────────────────────────────────
  async function loadSuggests() {
    const container = document.getElementById('suggestContainer');
    if (!container) return;

    container.innerHTML = `<div class="loading-grid">
      <div class="skeleton" style="height:90px"></div>
      <div class="skeleton" style="height:90px"></div>
      <div class="skeleton" style="height:90px"></div>
    </div>`;

    try {
      const res = await apiFetch(SUGGEST_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _suggests = await res.json();
      _loaded = true;
      renderSuggests(_suggests);
      updateStats();
    } catch (err) {
      container.innerHTML = `<div class="empty-state">
        <i class="bxr bx-error-circle"></i>
        <p>Ma'lumotlarni yuklashda xatolik: ${err.message}</p>
      </div>`;
    }
  }

  // ── Render list ───────────────────────────────────────────────────────
  function renderSuggests(list) {
    const container = document.getElementById('suggestContainer');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<div class="empty-state">
        <i class="bxr bx-category-alt"></i>
        <p>Hali hech qanday taklif yo'q. Birinchi taklifingizni yuboring!</p>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="suggest-list">${list.map(cardHTML).join('')}</div>`;
  }

  function cardHTML(s) {
    const statusClass = getStatusClass(s.status);
    const statusLabel = getStatusLabel(s.status);
    return `
    <div class="suggest-card">
      <img class="suggest-img" src="${s.image || ''}" alt="${s.name}"
           onerror="this.style.background='#eee'">
      <div class="suggest-body">
        <div class="suggest-name">${s.name}</div>
        <div class="suggest-slug">slug: ${s.slug || '—'}</div>
        <div class="suggest-comment">${s.comment || ''}</div>
      </div>
      <span class="suggest-status ${statusClass}">${statusLabel}</span>
    </div>`;
  }

  function getStatusClass(status) {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'confirmed') return 'approved';
    if (s === 'rejected' || s === 'cancelled') return 'rejected';
    return 'pending';
  }

  function getStatusLabel(status) {
    if (!status) return 'Kutilmoqda';
    const map = {
      pending:   'Kutilmoqda',
      approved:  'Tasdiqlandi',
      confirmed: 'Tasdiqlandi',
      rejected:  'Rad etildi',
      cancelled: 'Bekor qilindi',
    };
    return map[status.toLowerCase()] || status;
  }

  // ── Stats ─────────────────────────────────────────────────────────────
  function updateStats() {
    const totalEl   = document.getElementById('totalSuggests');
    const pendingEl = document.getElementById('pendingCount');
    if (totalEl)   totalEl.textContent   = _suggests.length;
    if (pendingEl) pendingEl.textContent =
      _suggests.filter(s => !s.status || s.status.toLowerCase() === 'pending').length;
  }

  // ── Modal ─────────────────────────────────────────────────────────────
  function openSuggestModal() {
    // Reset form
    document.getElementById('suggestName').value    = '';
    document.getElementById('suggestComment').value = '';
    document.getElementById('suggestImage').value   = '';
    document.getElementById('suggestImageLabel').textContent = 'Fayl tanlang...';

    const previewWrap = document.getElementById('suggestImagePreviewWrap');
    if (previewWrap) previewWrap.classList.remove('show');

    const resultInfo = document.getElementById('suggestResultInfo');
    if (resultInfo) { resultInfo.style.display = 'none'; resultInfo.textContent = ''; }

    const btn = document.getElementById('suggestSaveBtn');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bxr bx-send"></i> Yuborish'; }

    document.getElementById('suggestModal').classList.add('open');
  }

  // exposed globally for HTML onclick
  window.openSuggestModal = openSuggestModal;

  // ── Save suggest ──────────────────────────────────────────────────────
  window.saveSuggest = async function () {
    const name    = document.getElementById('suggestName').value.trim();
    const comment = document.getElementById('suggestComment').value.trim();
    const imgFile = document.getElementById('suggestImage').files[0];

    if (!name) { showToastMsg('Kategoriya nomini kiriting!', 'error'); return; }
    if (!comment) { showToastMsg('Izoh matnini kiriting!', 'error'); return; }
    if (!imgFile) { showToastMsg('Rasm faylini tanlang!', 'error'); return; }

    const btn = document.getElementById('suggestSaveBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="bxr bx-loader bx-spin"></i> Yuborilmoqda...';

    const formData = new FormData();
    formData.append('name',    name);
    formData.append('image',   imgFile);
    formData.append('comment', comment);

    try {
      const res = await apiFetch(SUGGEST_API, {
        method: 'POST',
        body:   formData,
        // NOTE: Do NOT set Content-Type manually — browser sets multipart boundary
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(errData));
      }

      const data = await res.json();

      // Show success info inside modal
      const resultInfo = document.getElementById('suggestResultInfo');
      resultInfo.style.display = 'block';
      resultInfo.innerHTML = `
        ✅ Taklif muvaffaqiyatli yuborildi!<br>
        <span style="font-weight:400;font-size:12px">
          ID: ${data.id} &nbsp;|&nbsp; Slug: ${data.slug} &nbsp;|&nbsp; Status: ${getStatusLabel(data.status)}
        </span>`;

      btn.innerHTML = '<i class="bxr bx-check"></i> Yuborildi';

      showToastMsg('Kategoriya taklifi yuborildi! ✅', 'success');

      // Reload list
      _loaded = false;
      await loadSuggests();

      // Close modal after 1.8s
      setTimeout(() => {
        document.getElementById('suggestModal').classList.remove('open');
      }, 1800);

    } catch (err) {
      showToastMsg(`Xatolik: ${err.message}`, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bxr bx-send"></i> Yuborish';
    }
  };

  // ── Toast helper (uses admin-home.js showToast if available) ──────────
  function showToastMsg(msg, type = 'success') {
    if (typeof showToast === 'function') {
      showToast(msg, type);
      return;
    }
    // Fallback
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

})();
