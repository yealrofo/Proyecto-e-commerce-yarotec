// js/modal.js - VERSIÓN CORREGIDA
class ModalManager {
  constructor() {
    this.initModals();
    this.setupOutsideClick();
  }

  initModals() {
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeProductModal());

    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) addToCartBtn.addEventListener('click', () => this.handleAddToCart());

    const openCartBtn = document.getElementById('open-cart');
    if (openCartBtn) openCartBtn.addEventListener('click', () => this.openCartModal());

    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.closeCartModal());
  }

  // ✅ NUEVA FUNCIÓN: Abrir modal de producto
  openProductModal(productId) {
    const product = window.productManager?.getProductById(productId);
    if (!product) {
      console.error('❌ Producto no encontrado:', productId);
      return;
    }

    const modal = document.getElementById('product-modal');
    const gallery = document.getElementById('modal-gallery');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const price = document.getElementById('modal-price');
    const stock = document.getElementById('modal-stock');

    if (!modal || !gallery || !title || !desc || !price || !stock) {
      console.error('❌ Elementos del modal no encontrados');
      return;
    }

    // Limpiar galería
    gallery.innerHTML = '';

    // Agregar imágenes (si existen)
    const images = [
      product.imagen_principal,
      product.imagen_2,
      product.imagen_3
    ].filter(img => img && img.trim() !== '');

    if (images.length === 0) {
      images.push('placeholder.png');
    }

    images.forEach(img => {
      const imgElement = document.createElement('img');
      imgElement.src = `img/${img}`;
      imgElement.alt = product.nombre;
      imgElement.loading = 'lazy';
      imgElement.onerror = function() {
        this.src = 'img/placeholder.png';
      };
      gallery.appendChild(imgElement);
    });

    // Llenar información del producto
    title.textContent = product.nombre;
    desc.textContent = product.descripcion || 'Sin descripción disponible';
    price.textContent = window.cartManager?.formatCOP(product.precio) || '$0';
    stock.textContent = product.stock || 0;

    // Guardar ID del producto actual en el botón "Agregar"
    const addBtn = document.getElementById('add-to-cart');
    if (addBtn) {
      addBtn.dataset.productId = productId;
    }

    // Reset cantidad
    const qtyInput = document.getElementById('modal-qty');
    if (qtyInput) qtyInput.value = 1;

    // Mostrar modal
    modal.classList.add('open');
  }

  // ✅ Manejar agregar al carrito desde modal
  handleAddToCart() {
    const addBtn = document.getElementById('add-to-cart');
    const qtyInput = document.getElementById('modal-qty');
    
    if (!addBtn || !qtyInput) return;

    const productId = addBtn.dataset.productId;
    const quantity = parseInt(qtyInput.value) || 1;

    if (!productId) {
      console.error('❌ No hay producto seleccionado');
      return;
    }

    const product = window.productManager?.getProductById(productId);
    if (product && window.cartManager) {
      window.cartManager.addToCart(product, quantity);
      this.closeProductModal();
    }
  }

  closeProductModal() {
    document.getElementById('product-modal')?.classList.remove('open');
  }

  openCartModal() {
    document.getElementById('cart-modal')?.classList.add('open');
  }

  closeCartModal() {
    document.getElementById('cart-modal')?.classList.remove('open');
  }

  closeCheckoutModal() {
    document.getElementById('checkout-modal')?.classList.remove('open');
  }

  setupOutsideClick() {
    document.addEventListener('click', (e) => {
      const modals = document.querySelectorAll('.modal.open');
      modals.forEach(modal => {
        if (!modal.contains(e.target) && !e.target.closest('.dialog')) {
          modal.classList.remove('open');
        }
      });
    });
  }
}

window.modalManager = new ModalManager();