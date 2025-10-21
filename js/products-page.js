document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("products-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");
  const pagination = document.getElementById("pagination");

  // ✅ Seguridad: si no estoy en productos.html → salir sin error
  if (!grid || !searchInput || !categoryFilter || !sortFilter || !pagination) {
    console.warn("⏭️ Página sin grid de productos, se omite products-page.js");
    return;
  }

  const ITEMS_PER_PAGE = 12;
  let currentPage = 1;
  let filteredProducts = [];

  // ✅ Cargar productos
  await window.productManager.loadProducts();
  const allProducts = window.productManager.products;

  // ✅ Poblar categorías
  const categorias = [
    ...new Set(
      allProducts
        .map(p => (p.categoria || '').trim().toUpperCase())
        .filter(Boolean)
    )
  ].sort();

  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // ✅ Filtros
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = (categoryFilter.value || '').trim().toUpperCase();
    const sortValue = sortFilter.value;

    filteredProducts = allProducts.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const categoria = (p.categoria || '').trim().toUpperCase();

      const matchesSearch = nombre.includes(searchTerm);
      const matchesCategory = !selectedCategory || categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 🔽 Ordenamiento
    if (sortValue === "precio-asc") filteredProducts.sort((a, b) => a.precio - b.precio);
    if (sortValue === "precio-desc") filteredProducts.sort((a, b) => b.precio - a.precio);
    if (sortValue === "nombre-asc") filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sortValue === "nombre-desc") filteredProducts.sort((a, b) => b.nombre.localeCompare(a.nombre));

    currentPage = 1;
    renderProducts();
  }

  // ✅ Render con paginación
  function renderProducts() {
    grid.innerHTML = "";
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach(product => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="imgwrap">
          <img src="img/${product.imagen_principal}" alt="${product.nombre}"
               onerror="this.src='img/placeholder.png'">
        </div>
        <div class="card-body">
          <h3>${product.nombre}</h3>
          <div class="short-desc">${(product.descripcion || '').substring(0, 60)}...</div>
          <div class="price">${window.cartManager.formatCOP(product.precio)}</div>
        </div>
        <div class="actions">
          <button class="btn" data-id="${product.id}" data-action="view">Ver</button>
          <button class="btn ghost" data-id="${product.id}" data-action="add">Agregar</button>
        </div>
      `;
      grid.appendChild(card);

      // ✅ Esperar modal en GitHub Pages (carga lenta)
      const viewBtn = card.querySelector('[data-action="view"]');
      if (viewBtn) {
        viewBtn.addEventListener("click", async () => {
          while (!window.modalManager) {
            await new Promise(r => setTimeout(r, 50));
          }
          window.modalManager.openProductModal(product.id);
        });
      }
    });

    renderPagination();
  }

  // ✅ Paginación
  function renderPagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = (i === currentPage) ? "active" : "";
      btn.addEventListener("click", () => {
        currentPage = i;
        renderProducts();
      });
      pagination.appendChild(btn);
    }
  }

  // ✅ Eventos
  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  sortFilter.addEventListener("change", applyFilters);

  // ✅ Inicial
  filteredProducts = allProducts;
  renderProducts();
});
