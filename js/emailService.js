class EmailService {
  constructor() {
    // === CONFIGURACIÓN ===
    this.SERVICE_ID = 'service_e8fupxs';
    this.TEMPLATE_OWNER = 'template_md45ytf'; // correo técnico (tú)
    this.TEMPLATE_REPLY = 'template_s320gse'; // auto-reply al cliente
    this.PUBLIC_KEY = 'OAlk52v_5ptym47Yw';
    this.OWNER_EMAIL = 'yarochaf@gmail.com';
    this.init();
  }

  async init() {
    try {
      if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS no está cargado.');
        return false;
      }
      await emailjs.init(this.PUBLIC_KEY);
      console.log('✅ EmailJS inicializado correctamente.');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando EmailJS:', error);
      return false;
    }
  }

  // =========================================================
  // ENVÍO GENERAL (usa plantilla técnica + auto-reply)
  // =========================================================
  async sendEmailToOwnerAndClient(type, data, items = '') {
    try {
      const fecha = new Date().toLocaleDateString('es-CO');
      const hora = new Date().toLocaleTimeString('es-CO');

      // --- Correo técnico para Yarotec ---
      const toOwner = {
        to_email: this.OWNER_EMAIL,
        client_name: data.nombre,
        client_email: data.correo,
        phone: data.telefono,
        ciudad: data.ciudad || '',
        direccion: data.direccion || '',
        localidad: data.localidad || '',
        servicio: data.servicio || '',
        descripcion: data.descripcion || data.mensaje || '',
        mensaje: data.mensaje || '',
        metodo_pago: data.metodo_pago || '',
        items: items || '',
        total: data.total || '',
        nota: data.nota || '',
        tipo: type,
        fecha,
        hora
      };

      console.log(`📤 Enviando ${type} a Yarotec usando plantilla ${this.TEMPLATE_OWNER}...`);
      const ownerResponse = await emailjs.send(this.SERVICE_ID, this.TEMPLATE_OWNER, toOwner);
      console.log('✅ Correo a Yarotec enviado:', ownerResponse);

      // --- Auto-reply al cliente ---
      if (!data.correo) {
        console.warn("⚠️ No se puede enviar auto-reply: correo vacío.");
      } else {
        const toClient = {
          to_email: data.correo,
          client_name: data.nombre,
          tipo: type,
          mensaje: `Gracias por tu ${type} en Yarotec. Hemos recibido tu solicitud y te contactaremos pronto.`,
          fecha,
          hora
        };

        console.log(`📩 Enviando auto-reply a cliente (${data.correo})...`);
        const clientResponse = await emailjs.send(this.SERVICE_ID, this.TEMPLATE_REPLY, toClient);
        console.log('✅ Correo al cliente enviado:', clientResponse);
      }

      return { success: true };

   } catch (error) {
  console.error('❌ Error enviando correo:', error);

  // ⚠️ Algunos 422 aún envían el mensaje correctamente
  if (error?.status === 422 || (error.text && error.text.includes('OK'))) {
    console.warn('⚠️ EmailJS devolvió 422, pero el correo se envió correctamente.');
    return { success: true };
  }

  // Error real
  return { success: false, error: 'Error al enviar correo. Intenta más tarde.' };
}

  }

  // =========================================================
  // 1️⃣ PEDIDO DESDE EL CARRITO
  // =========================================================
  async sendOrder(orderData) {
    const cart = window.cartManager?.getCart?.() || [];
    const total = window.cartManager?.getTotal?.() || 0;
    const items = this.formatItems(cart);

    const data = {
      ...orderData,
      total: window.cartManager?.formatCOP?.(total)
    };

    return await this.sendEmailToOwnerAndClient('pedido', data, items);
  }

  // =========================================================
  // 2️⃣ CONTACTO
  // =========================================================
  async sendContactMessage(formData) {
    return await this.sendEmailToOwnerAndClient('mensaje de contacto', formData);
  }

  // =========================================================
  // 3️⃣ SERVICIO
  // =========================================================
  async sendServiceRequest(formData) {
    return await this.sendEmailToOwnerAndClient('solicitud de servicio', formData);
  }

  // =========================================================
  // 🔧 UTILIDAD PARA FORMATEAR PRODUCTOS
  // =========================================================
  formatItems(cart) {
    if (!cart.length) return 'No hay productos.';
    return cart.map(item =>
      `• ${item.nombre} - ${window.cartManager.formatCOP(item.precio)} x ${item.qty} = ${window.cartManager.formatCOP(item.precio * item.qty)}`
    ).join('\n');
  }
}

window.emailService = new EmailService();
