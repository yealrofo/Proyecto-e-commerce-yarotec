// js/cart.js
// CartManager: persistencia + APIs públicas + render en todas las páginas
class CartManager {
  constructor() {
    this.key = 'yarotec_cart_v1';
    this.cart = [];
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      this.cart = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error cargando carrito desde localStorage', e);
      this.cart = [];
    }
    this.syncUI();
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.cart));
    this.syncUI();
  }

  clear() {
    this.cart = [];
    this.save();
  }

  getCart() {
    return this.cart;
  }

  getCount() {
    return this.cart.reduce((s, it) => s + it.qty, 0);
  }

  getTotal() {
    return this.cart.reduce((s, it) => s + (it.precio * it.qty), 0);
  }

  formatCOP(valor) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor || 0);
  }

  findIndexById(id) {
    return this.cart.findIndex(i => String(i.id) === String(id));
  }

  addToCart(product, qty = 1) {
    if (!product) return false;
    const idx = this.findIndexById(product.id);
    if (idx === -1) {
      this.cart.push({
        id: product.id,
        nombre: product.nombre || product.concatenado || 'Producto',
        precio: Number(product.precio) || 0,
        qty: Number(qty) || 1
      });
    } else {
      this.cart[idx].qty += Number(qty) || 1;
    }
    this.save();
    this.showToast(`${product.nombre} agregado al carrito`);
    return true;
  }

  updateQty(id, qty) {
    const idx = this.findIndexById(id);
    if (idx === -1) return false;
    this.cart[idx].qty = Math.max(0, Number(qty));
    if (this.cart[idx].qty === 0) this.cart.splice(idx, 1);
    this.save();
    return true;
  }

  removeItem(id) {
    const idx = this.findIndexById(id);
    if (idx === -1) return false;
    const removed = this.cart.splice(idx, 1)[0];
    this.save();
    this.showToast(`${removed.nombre} eliminado del carrito`);
    return true;
  }

  // UI helpers: actualizan cualquier badge/total que exista en la página
  syncUI() {
    // badges posibles: cart-count, cart-badge, cart-total, cart-items (contenedor)
    const count = this.getCount();
    const total = this.getTotal();

    // Actualiza cualquier badge con id cart-count o cart-badge
    const elCount1 = document.getElementById('cart-count');
    const elCount2 = document.getElementById('cart-badge');
    const elCount3 = document.getElementById('cart-badge-header'); // por si hay nombres varios
    if (elCount1) elCount1.textContent = count;
    if (elCount2) elCount2.textContent = count;
    if (elCount3) elCount3.textContent = count;

    // Total (donde exista)
    const elTotal = document.getElementById('cart-total');
    if (elTotal) elTotal.textContent = this.formatCOP(total);

    // Si estás en la página carrito y hay contenedor, re-renderiza lista
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
      this.renderCartItems(cartItemsContainer);
    }
  }

  // Render del carrito (lista completa). container es el elemento DOM donde inyectar
  renderCartItems(container) {
    container.innerHTML = '';
    if (!this.cart.length) {
      container.innerHTML = `<div style="color:var(--muted);padding:12px;text-align:center">El carrito está vacío</div>`;
      return;
    }

    this.cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04)';

      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:600">${item.nombre}</div>
          <div style="color:var(--muted);font-size:13px;margin-top:4px">
            ${this.formatCOP(item.precio)} x 
            <input class="cart-qty" data-id="${item.id}" type="number" min="1" value="${item.qty}" style="width:70px;margin-left:8px;padding:4px;border-radius:6px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--text)"/>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${this.formatCOP(item.precio * item.qty)}</div>
          <button class="btn ghost btn-remove" data-id="${item.id}" style="margin-top:8px">Eliminar</button>
        </div>
      `;
      container.appendChild(row);
    });

    // Delegación: eventos de inputs qty y botones eliminar
    container.querySelectorAll('.cart-qty').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const val = Number(e.target.value) || 1;
        this.updateQty(id, val);
        this.syncUI();
      });
    });

    container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.removeItem(id);
        this.syncUI();
      });
    });
  }

  // Toast simple (puedes cambiar por tu modal)
  showToast(text) {
    // pequeño toast ephemeral
    const t = document.createElement('div');
    t.textContent = text;
    t.style.cssText = 'position:fixed;right:18px;bottom:18px;background:var(--panel);color:var(--text);padding:10px 14px;border-radius:10px;box-shadow:var(--shadow);z-index:9999';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }
  updateCartBadge() {
  this.syncUI();
}

}

// Crear instancia global
window.cartManager = new CartManager();
