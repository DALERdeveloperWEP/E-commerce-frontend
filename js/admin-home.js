// ─── CONFIG ──────────────────────────────────────────────────────────────────
// BASE_URL, apiFetch, authHeader — api.js dan keladi (admin-home.html da oldin yuklanadi)
const API = typeof BASE_URL !== 'undefined' ? BASE_URL : 'http://localhost:8000';

// ─── STATE ───────────────────────────────────────────────────────────────────
let allProducts   = [];
let allCategories = [];
let currentPage   = 'products';
let detailProduct  = null;
let detailCategory = null;

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCategories();
});

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  document.getElementById('topbarTitle').textContent =
    page === 'products' ? 'Mahsulotlar' : 'Kategoriyalar';
  document.getElementById('searchBar').value = '';
  document.getElementById('searchBar').placeholder =
    page === 'products' ? 'Mahsulot qidirish...' : 'Kategoriya qidirish...';
}

// ─── SEARCH ──────────────────────────────────────────────────────────────────
function handleSearch() {
  const q = document.getElementById('searchBar').value.toLowerCase();
  if (currentPage === 'products') {
    renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(q)));
  } else {
    renderCategories(allCategories.filter(c => c.name.toLowerCase().includes(q)));
  }
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
  });
});

// ─── ADD MODAL OPENER ────────────────────────────────────────────────────────
function openAddModal() {
  if (currentPage === 'products') {
    openProductModal(null);
  } else {
    openCategoryModal(null);
  }
}

// ─── FILE PREVIEW ────────────────────────────────────────────────────────────
function previewImage(input, previewId, labelId) {
  const file    = input.files[0];
  const preview = document.getElementById(previewId);
  const wrap    = preview?.parentElement;
  const label   = document.getElementById(labelId);
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      wrap?.classList.add('show');
    };
    reader.readAsDataURL(file);
    if (label) label.textContent = file.name;
  } else {
    wrap?.classList.remove('show');
    if (label) label.textContent = 'Fayl tanlang...';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//                          PRODUCTS CRUD
// ─────────────────────────────────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await apiFetch(`${API}/api/catalog/products/`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    allProducts = data.results || data; // handle paginated response
    const total = data.count !== undefined ? data.count : allProducts.length;
    document.getElementById('totalProducts').textContent = total;
    document.getElementById('availableProducts').textContent =
      allProducts.filter(p => p.is_available).length;
    renderProducts(allProducts);
  } catch {
    showToast('Mahsulotlarni yuklashda xatolik', 'error');
  }
}

function renderProducts(products) {
  const c = document.getElementById('productsContainer');
  if (!products.length) {
    c.innerHTML = `<div class="empty-state"><i class="bxr bx-box"></i><p>Mahsulotlar topilmadi</p></div>`;
    return;
  }
  c.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'products-grid';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'shoping';
    const regularPrice = parseFloat(p.regular_price) || 0;
    const cardPrice    = p.card_price ? parseFloat(p.card_price) : null;
    const discountPct  = p.discount_percent ? Math.round(parseFloat(p.discount_percent)) : null;
    const displayPrice = cardPrice !== null ? cardPrice : regularPrice;

    card.innerHTML = `
      <div class="img_product" style="cursor:pointer" onclick="showProductDetail(${p.id})">
        <img src="${p.image || 'https://via.placeholder.com/300x160?text=No+Image'}" alt="${p.title}" />
        ${discountPct ? `<div class="foiz">-${discountPct}%</div>` : ''}
        <div class="stock-badge ${p.is_available ? '' : 'out'}">${p.is_available ? 'Mavjud' : 'Tugagan'}</div>
      </div>
      <div class="info_product" style="flex:1">
        <div class="narx">
          <span class="price-main">${displayPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}&#8381;</span>
          ${cardPrice !== null ? `<span class="price-old">${regularPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}&#8381;</span>` : ''}
        </div>
        ${cardPrice !== null ? '<div class="malumot"><p>С картой</p><p>Обычная</p></div>' : ''}
        <div class="city">${p.title}</div>
        <div><span class="brand-badge">${p.brand}</span></div>
        <div class="product-actions">
          <button class="btn-edit" onclick="openProductModal(${p.id})"><i class="bxr bx-edit"></i> Tahrir</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})"><i class="bxr bx-trash"></i></button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  c.appendChild(grid);
}

function showProductDetail(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  detailProduct = p;
  document.getElementById('dp-img').src = p.image || 'https://via.placeholder.com/180?text=No+Image';
  document.getElementById('dp-title').textContent = p.title;
  const regularPrice = parseFloat(p.regular_price) || 0;
  const cardPrice    = p.card_price ? parseFloat(p.card_price) : null;
  const discountPct  = p.discount_percent ? Math.round(parseFloat(p.discount_percent)) : null;
  document.getElementById('dp-meta').innerHTML = `
    <span class="dp-badge orange">Обычная: ${regularPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}&#8381;</span>
    ${cardPrice !== null ? `<span class="dp-badge green">С картой: ${cardPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}&#8381;</span>` : ''}
    ${discountPct ? `<span class="dp-badge green">-${discountPct}%</span>` : ''}
    <span class="dp-badge gray">${p.brand} · ${p.country}</span>
    <span class="dp-badge gray">Ombor: ${p.stock}</span>
    <span class="dp-badge ${p.is_available ? 'green' : 'orange'}">${p.is_available ? 'Mavjud' : 'Tugagan'}</span>`;
  document.getElementById('dp-desc').textContent = p.description || "Tavsif yo'q";
  const panel = document.getElementById('productDetail');
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editFromDetail() {
  if (detailProduct) openProductModal(detailProduct.id);
}
function deleteFromDetail() {
  if (detailProduct) deleteProduct(detailProduct.id);
}
function closeDetail(type) {
  if (type === 'product') document.getElementById('productDetail').classList.remove('open');
  else document.getElementById('categoryDetail').classList.remove('open');
}

function openProductModal(id) {
  const p = id ? allProducts.find(x => x.id === id) : null;
  document.getElementById('productId').value = p ? p.id : '';
  document.getElementById('productModalTitle').textContent = p ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot';
  document.getElementById('productTitle').value = p ? p.title : '';
  document.getElementById('productDesc').value = p ? (p.description || '') : '';
  document.getElementById('productRegularPrice').value = p ? (p.regular_price || '') : '';
  document.getElementById('productCardPrice').value = p ? (p.card_price || '') : '';
  document.getElementById('productBrand').value = p ? p.brand : '';
  document.getElementById('productCountry').value = p ? p.country : '';
  document.getElementById('productWeight').value = p ? p.weight : '';
  document.getElementById('productStock').value = p ? p.stock : '';
  document.getElementById('productAvailable').checked = p ? p.is_available : true;
  // Reset file input
  document.getElementById('productImage').value = '';
  document.getElementById('productImageLabel').textContent = 'Fayl tanlang...';
  document.getElementById('productImagePreviewWrap').classList.remove('show');
  // Show current image if editing
  const note = document.getElementById('productCurrentImage');
  if (p && p.image) {
    note.innerHTML = `Hozirgi rasm: <a href="${p.image}" target="_blank">ko'rish</a>`;
  } else {
    note.innerHTML = '';
  }
  openModal('productModal');
}

async function saveProduct() {
  const id = document.getElementById('productId').value;
  const imageFile = document.getElementById('productImage').files[0];

  if (!document.getElementById('productTitle').value.trim())    { showToast('Nomini kiriting', 'error'); return; }
  if (!document.getElementById('productRegularPrice').value)    { showToast('Oddiy narxni kiriting', 'error'); return; }
  // Require image only on create
  if (!id && !imageFile) { showToast('Rasm faylini tanlang', 'error'); return; }

  const fd = new FormData();
  fd.append('title',         document.getElementById('productTitle').value.trim());
  fd.append('description',   document.getElementById('productDesc').value.trim());
  fd.append('regular_price', String(parseFloat(document.getElementById('productRegularPrice').value) || 0));
  const cp = parseFloat(document.getElementById('productCardPrice').value);
  if (cp) fd.append('card_price', String(cp));
  fd.append('brand',        document.getElementById('productBrand').value.trim());
  fd.append('country',      document.getElementById('productCountry').value.trim());
  fd.append('weight',       document.getElementById('productWeight').value.trim());
  fd.append('stock',        String(parseInt(document.getElementById('productStock').value) || 0));
  fd.append('is_available', document.getElementById('productAvailable').checked);
  if (imageFile) fd.append('image', imageFile);

  try {
    const url    = id ? `${API}/api/catalog/products/${id}/` : `${API}/api/catalog/products/`;
    const method = id ? 'PUT' : 'POST';

    const res = await apiFetch(url, { method, body: fd });

    if (!res.ok) {
      // Log detailed error from server
      const errData = await res.json().catch(() => null);
      console.error('Save product error:', res.status, errData);
      showToast(`Saqlashda xatolik: ${res.status} ${errData ? JSON.stringify(errData).slice(0, 80) : ''}`, 'error');
      throw new Error('Save failed');
    }

    showToast(id ? "Mahsulot yangilandi ✓" : "Mahsulot qo'shildi ✓");
    closeModal('productModal');
    loadProducts();
  } catch (e) {
    if (e.message === 'Save failed') return;
    showToast('Saqlashda xatolik', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
  try {
    const res = await apiFetch(`${API}/api/catalog/products/${id}/`, {
      method: 'DELETE'
    });
    if (res.status !== 204) throw new Error();
    showToast("Mahsulot o'chirildi");
    closeDetail('product');
    loadProducts();
  } catch {
    showToast("O'chirishda xatolik", 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//                          CATEGORIES CRUD
// ─────────────────────────────────────────────────────────────────────────────
async function loadCategories() {
  try {
    const res = await apiFetch(`${API}/api/catalog/categories/`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    allCategories = data.results || data; // handle possible paginated response
    document.getElementById('totalCategories').textContent = allCategories.length;
    renderCategories(allCategories);
  } catch {
    showToast('Kategoriyalarni yuklashda xatolik', 'error');
  }
}

function renderCategories(categories) {
  const c = document.getElementById('categoriesContainer');
  if (!categories.length) {
    c.innerHTML = `<div class="empty-state"><i class="bxr bx-category"></i><p>Kategoriyalar topilmadi</p></div>`;
    return;
  }
  c.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'categories-grid';
  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="cat-img" onclick="showCategoryDetail('${cat.slug}')">
        <img src="${cat.image || 'https://via.placeholder.com/180x110?text=' + encodeURIComponent(cat.name)}" alt="${cat.name}" />
      </div>
      <div class="cat-info" onclick="showCategoryDetail('${cat.slug}')" style="cursor:pointer">
        <div class="cat-name">${cat.name}</div>
        <div class="cat-slug">${cat.slug}</div>
      </div>
      <div class="cat-actions">
        <button class="btn-edit" onclick="openCategoryModal('${cat.slug}')">Tahrir</button>
        <button class="btn-delete" onclick="deleteCategory('${cat.slug}')">O'chir</button>
      </div>`;
    grid.appendChild(card);
  });
  c.appendChild(grid);
}

function showCategoryDetail(slug) {
  const cat = allCategories.find(c => c.slug === slug);
  if (!cat) return;
  detailCategory = cat;
  document.getElementById('cdp-img').src = cat.image || 'https://via.placeholder.com/180?text=No+Image';
  document.getElementById('cdp-name').textContent = cat.name;
  document.getElementById('cdp-meta').innerHTML = `<span class="dp-badge gray">slug: ${cat.slug}</span>`;
  const panel = document.getElementById('categoryDetail');
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editCatFromDetail() {
  if (detailCategory) openCategoryModal(detailCategory.slug);
}
function deleteCatFromDetail() {
  if (detailCategory) deleteCategory(detailCategory.slug);
}

function openCategoryModal(slug) {
  const cat = slug ? allCategories.find(c => c.slug === slug) : null;
  document.getElementById('categoryId').value = cat ? cat.slug : '';
  document.getElementById('categoryModalTitle').textContent = cat ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya';
  document.getElementById('categoryName').value = cat ? cat.name : '';
  // Reset file input
  document.getElementById('categoryImage').value = '';
  document.getElementById('categoryImageLabel').textContent = 'Fayl tanlang...';
  document.getElementById('categoryImagePreviewWrap').classList.remove('show');
  // Show current image if editing
  const note = document.getElementById('categoryCurrentImage');
  if (cat && cat.image) {
    note.innerHTML = `Hozirgi rasm: <a href="${cat.image}" target="_blank">ko'rish</a>`;
  } else {
    note.innerHTML = '';
  }
  openModal('categoryModal');
}

async function saveCategory() {
  const slug = document.getElementById('categoryId').value;
  const imageFile = document.getElementById('categoryImage').files[0];

  if (!document.getElementById('categoryName').value.trim()) { showToast('Nomini kiriting', 'error'); return; }
  // Require image only on create
  const idVal = slug ? allCategories.find(c => c.slug === slug)?.id : null;
  if (!idVal && !imageFile) { showToast('Rasm faylini tanlang', 'error'); return; }

  const fd = new FormData();
  fd.append('name', document.getElementById('categoryName').value.trim());
  if (imageFile) fd.append('image', imageFile);

  try {
    const realUrl = idVal ? `${API}/api/catalog/categories/${idVal}/` : `${API}/api/catalog/categories/`;
    const method  = idVal ? 'PUT' : 'POST';
    const res     = await apiFetch(realUrl, { method, body: fd });
    if (!res.ok) throw new Error();
    showToast(idVal ? "Kategoriya yangilandi ✓" : "Kategoriya qo'shildi ✓");
    closeModal('categoryModal');
    loadCategories();
  } catch {
    showToast('Saqlashda xatolik', 'error');
  }
}

async function deleteCategory(slug) {
  if (!confirm("Kategoriyani o'chirishni tasdiqlaysizmi?")) return;
  const cat = allCategories.find(c => c.slug === slug);
  if (!cat) return;
  try {
    const res = await apiFetch(`${API}/api/catalog/categories/${cat.id}/`, {
      method: 'DELETE'
    });
    if (res.status !== 204) throw new Error();
    showToast("Kategoriya o'chirildi");
    closeDetail('category');
    loadCategories();
  } catch {
    showToast("O'chirishda xatolik", 'error');
  }
}
