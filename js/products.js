class ProductManager {
    constructor() {
        this.products = [];
    }

    async loadProducts() {
        try {
            // Estrategia 1: Variable global (para desarrollo rápido)
            if (typeof window.PRODUCTS !== 'undefined') {
                this.products = this.normalizeProducts(window.PRODUCTS);
                console.log('✅ Productos cargados (variable global):', this.products.length);
                console.log('📢 En promoción:', this.getPromotionalProducts().length);
                return this.products;
            }

            // Estrategia 2: Fetch (para producción / hosting)
            const response = await fetch('./data/products.json');
            if (response.ok) {
                const rawData = await response.json();

                // 👇 Asegurarse de tomar el array correcto
                const rawProducts = rawData.productos || rawData;

                this.products = this.normalizeProducts(rawProducts);
                console.log('✅ Productos cargados desde JSON:', this.products.length);
                console.log('📢 En promoción:', this.getPromotionalProducts().length);
                return this.products;
            }
        } catch (error) {
            console.log('❌ Error cargando productos:', error);
        }

        // Estrategia 3: Fallback mínimo
        console.log('⚠️ Usando productos de respaldo');
        this.products = this.getEmbeddedProducts();
        return this.products;
    }

    getEmbeddedProducts() {
        // SOLO para emergencias / pruebas
        return [
            {
                id: 9991,
                categoria: "Ejemplo",
                nombre: "Producto de ejemplo 1",
                precio: 100000,
                stock: 1,
                descripcion: "Producto de demostración",
                imagen_principal: "placeholder.png",
                promocion: true
            },
            {
                id: 9992,
                categoria: "Ejemplo",
                nombre: "Producto de ejemplo 2",
                precio: 200000,
                stock: 1,
                descripcion: "Producto de demostración",
                imagen_principal: "placeholder.png",
                promocion: true
            }
        ];
    }

    normalizeProducts(rawProducts) {
        return rawProducts.map(product => ({
            id: product.id || Math.floor(Math.random() * 1000000),
            categoria: product.categoria || '',
            nombre: product.concatenado || 'Producto sin nombre',
            precio: Number(product.precio) || 0,
            stock: Number(product.stock) || 0,
            descripcion: product.descripcion || '',
            // 👇 Normalizar clave de imagen principal
            imagen_principal: product['IMAGEN  principal'] 
                               || product['imagen_principal'] 
                               || product['IMAGEN principal'] 
                               || 'placeholder.png',
            imagen_2: product['2 imagen'] || '',
            imagen_3: product['3 imagen'] || '',
            // 👇 Normalizar promoción (si/no)
            promocion: (String(product.PROMOCION || product.promocion || 'no'))
                        .toLowerCase().trim() === 'si'
        }));
    }

    getPromotionalProducts() {
        const promos = this.products.filter(p => p.promocion);
        console.log('🎯 Productos en promoción encontrados:', promos.length);
        return promos.slice(0, 8); // máximo 8 en portada
    }

    getProductById(id) {
        return this.products.find(p => String(p.id) === String(id));
    }
}

window.productManager = new ProductManager();
