// data/products-loader.js
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("promos-grid");

  // Formatear moneda en pesos colombianos
  const formatCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  // Cargar el JSON
  fetch("./data/products.json")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar products.json");
      return res.json();
    })
    .then((data) => {
      let productos = data.productos || [];

      // --- FILTRO CORREGIDO ---
      // Normaliza clave PROMOCION (mayúscula, minúscula, con o sin espacios)
      let promociones = productos.filter((p) => {
        const promo =
          p.PROMOCION ||
          p.promocion ||
          p["Promocion"] ||
          p["promoción"] ||
          "";
        return String(promo).toLowerCase().trim() === "si";
      });

      // Tomar solo 8 (o menos si hay menos disponibles)
      promociones = promociones.slice(0, 8);

      // Renderizar productos en el grid
      promociones.forEach((prod, idx) => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        // Normalizar campo imagen principal
        const img =
          prod["IMAGEN  principal"] ||
          prod["imagen_principal"] ||
          prod["IMAGEN principal"] ||
          "no-image.webp";

        const nombre = prod.concatenado || "Producto sin nombre";
        const precio = prod.precio || 0;
        const descripcion = prod.descripcion || "";

        card.innerHTML = `
          <div class="product-img">
            <img src="./img/${img}" alt="${nombre}" loading="lazy"/>
          </div>
          <h3 class="product-title">${nombre}</h3>
          <p class="product-price">${formatCOP(precio)}</p>
          <button class="btn-detalle" data-index="${idx}">Ver más</button>
        `;

        grid.appendChild(card);

        // Manejar clic en "Ver más" → abre modal
        card
          .querySelector(".btn-detalle")
          .addEventListener("click", () => showModal(prod));
      });
    })
    .catch((err) => {
      console.error("Error cargando productos:", err);
      grid.innerHTML =
        "<p style='color:red'>No se pudieron cargar los productos en promoción.</p>";
    });

  // ----- MODAL -----
  const modal = document.getElementById("modal-producto");
  const modalContent = modal.querySelector(".modal-content");

  function showModal(prod) {
    const img =
      prod["IMAGEN  principal"] ||
      prod["imagen_principal"] ||
      prod["IMAGEN principal"] ||
      "no-image.webp";

    modalContent.innerHTML = `
      <span class="close-modal">&times;</span>
      <div class="modal-body">
        <img src="./img/${img}" alt="${prod.concatenado}" class="modal-img"/>
        <div class="modal-info">
          <h2>${prod.concatenado}</h2>
          <p>${prod.descripcion}</p>
          <p><strong>Precio:</strong> ${formatCOP(prod.precio)}</p>
          <p><strong>Stock:</strong> ${prod.stock}</p>
          <button class="add-to-cart">Agregar al carrito</button>
        </div>
      </div>
    `;

    modal.style.display = "block";

    // Botón cerrar
    modalContent.querySelector(".close-modal").onclick = () =>
      (modal.style.display = "none");

    // Agregar al carrito (demo, luego lo conectamos a cart.js)
    modalContent
      .querySelector(".add-to-cart")
      .addEventListener("click", () => {
        alert(`${prod.concatenado} agregado al carrito (demo).`);
        modal.style.display = "none";
      });
  }

  // Cerrar modal si se hace clic fuera del contenido
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
});
