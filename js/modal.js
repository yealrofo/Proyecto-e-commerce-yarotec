// js/modal.js
class ModalManager {
  constructor() {
    this.initModals();
  }

  initModals() {
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeProductModal());

    const openCartBtn = document.getElementById('open-cart');
    if (openCartBtn) openCartBtn.addEventListener('click', () => this.openCartModal());

    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.closeCartModal());
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