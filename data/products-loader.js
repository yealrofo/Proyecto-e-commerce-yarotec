// data/products-loader.js
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("promos-grid");
  if (!grid) {
    console.log("⏭️ Página sin sección de promociones. Se omite renderizado desde products-loader.js");
    return;
  }

  // Formatear moneda
  const formatCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  // Cargar JSON de productos
  fetch("./data/products.json")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar products.json");
      return res.json();
    })
    .then((data) => {
      const productos = data.productos || [];

      // Filtrar productos en promoción
      let promociones = productos.filter((p) => {
        const promo =
          p.PROMOCION ||
          p.promocion ||
          p["Promocion"] ||
          p["promoción"] ||
          "";
        return String(promo).toLowerCase().trim() === "si";
      });

      // Tomar hasta 8 promociones
      promociones = promociones.slice(0, 8);

      // Renderizar en el index
      promociones.forEach((prod) => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const img =
          prod["IMAGEN  principal"] ||
          prod["imagen_principal"] ||
          prod["IMAGEN principal"] ||
          "no-image.webp";

        const nombre = prod.concatenado || prod.nombre || "Producto sin nombre";
        const precio = prod.precio || 0;

        card.innerHTML = `
          <div class="product-img">
            <img src="./img/${img}" alt="${nombre}" loading="lazy" />
          </div>
          <h3 class="product-title">${nombre}</h3>
          <p class="product-price">${formatCOP(precio)}</p>
        `;

        grid.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("❌ Error cargando productos en promoción:", err);
      grid.innerHTML = "<p style='color:red'>No se pudieron cargar los productos.</p>";
    });
});
