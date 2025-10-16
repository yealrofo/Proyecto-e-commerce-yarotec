class YarotecApp {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // 1️⃣ Inicializar servicios (EmailJS, etc.)
      await this.initServices();

      // 2️⃣ Cargar productos solo si hay contenedor de promos
      const promosGrid = document.getElementById('promos-grid');
      if (promosGrid && window.productManager) {
        await this.loadAndRenderProducts();
      } else {
        console.log("⏭️ Página sin grid de productos, se omite renderizado.");
      }

      // 3️⃣ Configurar eventos globales
      this.setupEventListeners();

      // 4️⃣ Actualizar carrito (si existe)
      if (window.cartManager) window.cartManager.updateCartBadge();

      console.log('✅ Yarotec App inicializada correctamente.');
    } catch (error) {
      console.error('❌ Error inicializando la app:', error);
    }
  }

  async initServices() {
    if (window.emailService && typeof window.emailService.init === 'function') {
      await window.emailService.init();
    } else {
      console.warn('⚠️ EmailService no está disponible.');
    }
  }

  async loadAndRenderProducts() {
    await window.productManager.loadProducts();
    this.renderPromotionalProducts();
  }

  renderPromotionalProducts() {
    const grid = document.getElementById('promos-grid');
    if (!grid) {
      console.warn("⚠️ No se encontró #promos-grid en esta página.");
      return;
    }

    const promotionalProducts = window.productManager.getPromotionalProducts();
    grid.innerHTML = '';

    if (!promotionalProducts.length) {
      grid.innerHTML = `
        <div class="full" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
          No hay productos en promoción en este momento
        </div>
      `;
      return;
    }

    promotionalProducts.forEach(product => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="imgwrap">
          <img src="img/${product.imagen_principal}" alt="${product.nombre}" 
               onerror="this.src='img/placeholder.png'">
        </div>
        <div class="card-body">
          <h3>${product.nombre}</h3>
          <div class="short-desc">${this.truncateDescription(product.descripcion)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <div class="price">${window.cartManager.formatCOP(product.precio)}</div>
            <div style="font-size:13px;color:var(--muted)">Stock: ${product.stock}</div>
          </div>
        </div>
        <div class="actions">
          <button class="btn" data-id="${product.id}" data-action="view">Ver</button>
          <button class="btn ghost" data-id="${product.id}" data-action="add">Agregar</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  truncateDescription(desc, maxLength = 70) {
    if (!desc) return '';
    return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc;
  }

  setupEventListeners() {
    // 🟩 Delegación de clicks en botones de productos
    document.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;

      const action = button.dataset.action;
      const productId = button.dataset.id;

      switch (action) {
        case 'view':
          if (window.modalManager)
            window.modalManager.openProductModal(productId);
          break;

        case 'add':
          const product = window.productManager?.getProductById(productId);
          if (product && window.cartManager) {
            window.cartManager.addToCart(product, 1);
          }
          break;
      }
    });

    // 🟦 Navegación suave entre secciones
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToSection(href);
      });
    });

    const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm && !checkoutForm.dataset.bound) {
  checkoutForm.dataset.bound = "true"; // evita múltiples bindings
  checkoutForm.addEventListener('submit', async (e) => {
    e.stopImmediatePropagation(); // detiene listeners duplicados
    await this.handleCheckout(e);
  });
}

  }

  scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }

  async handleCheckout(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData.entries());
    const cart = window.cartManager?.getCart?.() || [];

    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

        const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    const result = await window.emailService.sendOrder(orderData);

    if (result && result.success) {
      alert('✅ Pedido enviado correctamente. Te contactaremos pronto.');
      window.cartManager.clearCart();
      window.modalManager?.closeAllModals?.();
      form.reset();
    } else {
      const msg = result?.error || 'Error al enviar el pedido. Intenta nuevamente.';
      alert('❌ ' + msg);
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

  }
}

// 🚀 Inicializar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.yarotecApp = new YarotecApp();
});
