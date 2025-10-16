// js/modal.js
class ModalManager {
  constructor() {
    this.initModals();
  }

  initModals() {
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn)
      closeModalBtn.addEventListener('click', () => this.closeProductModal());

    const openCartBtn = document.getElementById('open-cart');
    if (openCartBtn)
      openCartBtn.addEventListener('click', () => this.openCartModal());

    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn)
      closeCartBtn.addEventListener('click', () => this.closeCartModal());
  }

  // ✅ Mostrar modal de producto
  openProductModal(productIdOrObj) {
    // Soporta recibir el objeto completo o el ID
    const product =
      typeof productIdOrObj === 'object'
        ? productIdOrObj
        : window.productManager?.getProductById?.(productIdOrObj);

    if (!product) {
      console.error('❌ Producto no encontrado:', productIdOrObj);
      return;
    }

    // Rellenar info
    document.getElementById('modal-title').textContent = product.nombre || 'Producto';
    document.getElementById('modal-desc').textContent =
      product.descripcion || 'Sin descripción disponible';
    document.getElementById('modal-price').textContent =
      window.cartManager.formatCOP(product.precio || 0);
    document.getElementById('modal-stock').textContent = product.stock || 'N/D';

    // ✅ Construir lista de imágenes desde el JSON (flexible)
    const gallery = document.getElementById('modal-gallery');
    gallery.innerHTML = '';

    const imgs = [];

    // Caso 1: si el JSON tiene campo "imagenes" (array)
    if (Array.isArray(product.imagenes)) {
      imgs.push(...product.imagenes);
    }

    // Caso 2: si tiene campos separados tipo imagen_1, imagen_2, etc.
    for (const key in product) {
      if (key.toLowerCase().startsWith('imagen') && product[key]) {
        imgs.push(product[key]);
      }
    }

    // Caso 3: imagen principal
    if (product.imagen_principal && !imgs.includes(product.imagen_principal)) {
      imgs.unshift(product.imagen_principal);
    }

    // Fallback si no hay ninguna imagen
    if (imgs.length === 0) imgs.push('no-image.webp');

    // Render de imágenes
    imgs.forEach((img) => {
      const image = document.createElement('img');
      image.src = 'img/' + img;
      image.alt = product.nombre;
      image.style = 'max-height:240px;border-radius:8px;object-fit:cover;margin-right:8px';
      image.onerror = () => (image.src = 'img/no-image.webp');
      gallery.appendChild(image);
    });

    // Acción agregar al carrito
    const addBtn = document.getElementById('add-to-cart');
    addBtn.onclick = () => {
      const qty = Number(document.getElementById('modal-qty').value) || 1;
      window.cartManager.addToCart(product, qty);
      this.closeProductModal();
    };

    // Mostrar modal
    document.getElementById('product-modal')?.classList.add('open');
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
      modals.forEach((modal) => {
        if (!modal.contains(e.target) && !e.target.closest('.dialog')) {
          modal.classList.remove('open');
        }
      });
    });
  }
}

window.modalManager = new ModalManager();
