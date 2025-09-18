// Variables globales
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let remitos = JSON.parse(localStorage.getItem('remitos')) || [];
let contadorRemitos = parseInt(localStorage.getItem('contadorRemitos')) || 1;
let productosRemito = [];
let editandoProducto = null;
let editandoRemito = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
    configurarEventos();
    cargarProductos();
    cargarRemitos();
    actualizarFechaActual();
});

function inicializarApp() {
    // Configurar navegación
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-section');
            
            // Actualizar botones de navegación
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

function configurarEventos() {
    // Formulario de productos
    document.getElementById('producto-form').addEventListener('submit', guardarProducto);
    
    // Formulario de remitos
    document.getElementById('remito-form').addEventListener('submit', guardarRemito);
    
    // Actualizar fecha automáticamente
    document.getElementById('fecha').addEventListener('change', function() {
        if (this.value) {
            this.value = this.value;
        }
    });
}

function actualizarFechaActual() {
    const hoy = new Date();
    const fecha = hoy.toISOString().split('T')[0];
    document.getElementById('fecha').value = fecha;
}

// ========== GESTIÓN DE PRODUCTOS ==========

function mostrarFormularioProducto() {
    const formulario = document.getElementById('formulario-producto');
    formulario.style.display = 'block';
    formulario.scrollIntoView({ behavior: 'smooth' });
    
    // Limpiar formulario
    document.getElementById('producto-form').reset();
    editandoProducto = null;
}

function cancelarFormularioProducto() {
    document.getElementById('formulario-producto').style.display = 'none';
    document.getElementById('producto-form').reset();
    editandoProducto = null;
}

function guardarProducto(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const producto = {
        id: editandoProducto ? editandoProducto.id : Date.now(),
        categoria: formData.get('categoria'),
        nombre: formData.get('nombre'),
        precio: parseFloat(formData.get('precio'))
    };
    
    if (editandoProducto) {
        // Editar producto existente
        const index = productos.findIndex(p => p.id === editandoProducto.id);
        productos[index] = producto;
    } else {
        // Agregar nuevo producto
        productos.push(producto);
    }
    
    guardarEnStorage();
    cargarProductos();
    cancelarFormularioProducto();
    
    // Mostrar mensaje de éxito
    mostrarMensaje(editandoProducto ? 'Producto actualizado correctamente' : 'Producto guardado correctamente', 'success');
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    editandoProducto = producto;
    document.getElementById('categoria').value = producto.categoria;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    
    mostrarFormularioProducto();
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarEnStorage();
        cargarProductos();
        mostrarMensaje('Producto eliminado correctamente', 'success');
    }
}

function cargarProductos() {
    const tbody = document.getElementById('productos-tbody');
    tbody.innerHTML = '';
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">No hay productos registrados</td></tr>';
        return;
    }
    
    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.categoria}</td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary" onclick="editarProducto(${producto.id})" style="margin-right: 5px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="eliminarProducto(${producto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Actualizar select de productos en remitos
    actualizarSelectProductos();
}

function actualizarSelectProductos() {
    const select = document.getElementById('producto-select');
    select.innerHTML = '<option value="">Seleccionar producto...</option>';
    
    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)}`;
        select.appendChild(option);
    });
}

// ========== GESTIÓN DE REMITOS ==========

function mostrarFormularioRemito() {
    const formulario = document.getElementById('formulario-remito');
    formulario.style.display = 'block';
    formulario.scrollIntoView({ behavior: 'smooth' });
    
    // Limpiar formulario
    document.getElementById('remito-form').reset();
    productosRemito = [];
    editandoRemito = null;
    
    // Generar número de remito
    document.getElementById('numero-remito').value = `REM-${contadorRemitos.toString().padStart(4, '0')}`;
    actualizarFechaActual();
    
    // Actualizar tabla de productos del remito
    actualizarTablaProductosRemito();
}

function cancelarFormularioRemito() {
    document.getElementById('formulario-remito').style.display = 'none';
    document.getElementById('remito-form').reset();
    productosRemito = [];
    editandoRemito = null;
    document.getElementById('btn-imprimir').style.display = 'none';
}

function agregarProducto() {
    const productoId = parseInt(document.getElementById('producto-select').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    
    if (!productoId || !cantidad || cantidad <= 0) {
        mostrarMensaje('Por favor selecciona un producto y una cantidad válida', 'error');
        return;
    }
    
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarMensaje('Producto no encontrado', 'error');
        return;
    }
    
    // Verificar si el producto ya está en el remito
    const productoExistente = productosRemito.find(p => p.id === productoId);
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        productosRemito.push({
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: producto.precio,
            cantidad: cantidad
        });
    }
    
    actualizarTablaProductosRemito();
    
    // Limpiar selección
    document.getElementById('producto-select').value = '';
    document.getElementById('cantidad').value = '1';
}

function eliminarProductoRemito(id) {
    productosRemito = productosRemito.filter(p => p.id !== id);
    actualizarTablaProductosRemito();
}

function actualizarTablaProductosRemito() {
    const tbody = document.getElementById('productos-remito-tbody');
    tbody.innerHTML = '';
    
    let total = 0;
    
    productosRemito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger" onclick="eliminarProductoRemito(${producto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('total-remito').textContent = total.toFixed(2);
}

function guardarRemito(e) {
    e.preventDefault();
    
    if (productosRemito.length === 0) {
        mostrarMensaje('Debes agregar al menos un producto al remito', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const remito = {
        id: editandoRemito ? editandoRemito.id : Date.now(),
        numero: formData.get('numero-remito'),
        fecha: formData.get('fecha'),
        cliente: formData.get('cliente'),
        productos: [...productosRemito],
        total: productosRemito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0)
    };
    
    if (editandoRemito) {
        // Editar remito existente
        const index = remitos.findIndex(r => r.id === editandoRemito.id);
        remitos[index] = remito;
    } else {
        // Agregar nuevo remito
        remitos.push(remito);
        contadorRemitos++;
        localStorage.setItem('contadorRemitos', contadorRemitos.toString());
    }
    
    guardarEnStorage();
    cargarRemitos();
    cancelarFormularioRemito();
    
    // Mostrar botón de impresión
    document.getElementById('btn-imprimir').style.display = 'inline-flex';
    
    mostrarMensaje(editandoRemito ? 'Remito actualizado correctamente' : 'Remito guardado correctamente', 'success');
}

function editarRemito(id) {
    const remito = remitos.find(r => r.id === id);
    if (!remito) return;
    
    editandoRemito = remito;
    productosRemito = [...remito.productos];
    
    document.getElementById('numero-remito').value = remito.numero;
    document.getElementById('fecha').value = remito.fecha;
    document.getElementById('cliente').value = remito.cliente;
    
    actualizarTablaProductosRemito();
    mostrarFormularioRemito();
}

function eliminarRemito(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este remito?')) {
        remitos = remitos.filter(r => r.id !== id);
        guardarEnStorage();
        cargarRemitos();
        mostrarMensaje('Remito eliminado correctamente', 'success');
    }
}

function cargarRemitos() {
    const tbody = document.getElementById('remitos-tbody');
    tbody.innerHTML = '';
    
    if (remitos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No hay remitos registrados</td></tr>';
        return;
    }
    
    remitos.forEach(remito => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${remito.numero}</td>
            <td>${new Date(remito.fecha).toLocaleDateString('es-ES')}</td>
            <td>${remito.cliente}</td>
            <td>$${remito.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-info" onclick="verRemito(${remito.id})" style="margin-right: 5px;">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary" onclick="editarRemito(${remito.id})" style="margin-right: 5px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="eliminarRemito(${remito.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function verRemito(id) {
    const remito = remitos.find(r => r.id === id);
    if (!remito) return;
    
    // Crear contenido para impresión
    const contenido = generarContenidoImpresion(remito);
    document.getElementById('contenido-impresion').innerHTML = contenido;
    
    // Mostrar modal
    document.getElementById('modal-impresion').style.display = 'block';
}

function imprimirRemito() {
    if (productosRemito.length === 0) {
        mostrarMensaje('No hay productos en el remito para imprimir', 'error');
        return;
    }
    
    const formData = new FormData(document.getElementById('remito-form'));
    const remito = {
        numero: formData.get('numero-remito'),
        fecha: formData.get('fecha'),
        cliente: formData.get('cliente'),
        productos: [...productosRemito],
        total: productosRemito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0)
    };
    
    const contenido = generarContenidoImpresion(remito);
    document.getElementById('contenido-impresion').innerHTML = contenido;
    
    // Mostrar modal
    document.getElementById('modal-impresion').style.display = 'block';
}

function cerrarModalImpresion() {
    document.getElementById('modal-impresion').style.display = 'none';
}

function imprimirDocumento() {
    const contenido = document.getElementById('contenido-impresion').innerHTML;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Remito</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .remito-impresion { width: 100%; max-width: 800px; margin: 0 auto; }
                .remito-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                .remito-header h1 { font-size: 24px; margin-bottom: 10px; }
                .remito-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
                .remito-cliente { margin-bottom: 20px; font-size: 16px; font-weight: bold; }
                .remito-productos { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .remito-productos th, .remito-productos td { border: 1px solid #000; padding: 8px; text-align: left; }
                .remito-productos th { background-color: #f0f0f0; font-weight: bold; }
                .remito-total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding: 10px; border-top: 2px solid #000; }
                .remito-footer { margin-top: 30px; text-align: center; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
                @media print {
                    body { margin: 0; padding: 10px; }
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${contenido}
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    
    // Esperar a que se cargue el contenido y luego imprimir
    ventanaImpresion.onload = function() {
        ventanaImpresion.print();
    };
    
    cerrarModalImpresion();
}

function generarContenidoImpresion(remito) {
    const fecha = new Date(remito.fecha).toLocaleDateString('es-ES');
    
    let productosHTML = '';
    remito.productos.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        productosHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    return `
        <div class="remito-impresion">
            <!-- Primera copia -->
            <div class="remito-header">
                <h1>REMITO</h1>
                <p>Número: ${remito.numero}</p>
            </div>
            
            <div class="remito-info">
                <div>Fecha: ${fecha}</div>
                <div>Cliente: ${remito.cliente}</div>
            </div>
            
            <div class="remito-cliente">
                Cliente: ${remito.cliente}
            </div>
            
            <table class="remito-productos">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>
            
            <div class="remito-total">
                Total: $${remito.total.toFixed(2)}
            </div>
            
            <div class="remito-footer">
                <p>Firma del Cliente: _________________________</p>
                <p>Fecha de Entrega: _________________________</p>
            </div>
            
            <!-- Línea divisoria para cortar -->
            <div style="border-top: 2px dashed #000; margin: 40px 0; text-align: center; color: #666;">
                CORTAR AQUÍ
            </div>
            
            <!-- Segunda copia (duplicado) -->
            <div class="remito-header">
                <h1>REMITO (DUPLICADO)</h1>
                <p>Número: ${remito.numero}</p>
            </div>
            
            <div class="remito-info">
                <div>Fecha: ${fecha}</div>
                <div>Cliente: ${remito.cliente}</div>
            </div>
            
            <div class="remito-cliente">
                Cliente: ${remito.cliente}
            </div>
            
            <table class="remito-productos">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>
            
            <div class="remito-total">
                Total: $${remito.total.toFixed(2)}
            </div>
            
            <div class="remito-footer">
                <p>Firma del Cliente: _________________________</p>
                <p>Fecha de Entrega: _________________________</p>
            </div>
        </div>
    `;
}

// ========== UTILIDADES ==========

function guardarEnStorage() {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('remitos', JSON.stringify(remitos));
}

function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    // Estilos del mensaje
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Colores según el tipo
    switch(tipo) {
        case 'success':
            mensajeDiv.style.backgroundColor = '#28a745';
            break;
        case 'error':
            mensajeDiv.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            mensajeDiv.style.backgroundColor = '#ffc107';
            mensajeDiv.style.color = '#000';
            break;
        default:
            mensajeDiv.style.backgroundColor = '#17a2b8';
    }
    
    // Agregar al DOM
    document.body.appendChild(mensajeDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.parentNode.removeChild(mensajeDiv);
            }
        }, 300);
    }, 3000);
}

// Agregar estilos de animación para los mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
