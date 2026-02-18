const api = {
    listar: () => fetch('/productos').then(r => r.json()),
    comprar: (items) => fetch('/venta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }).then(r => r.json().then(j => ({ status: r.status, body: j })))
};

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

const $lista = document.getElementById('lista-productos');
const $carrito = document.getElementById('lista-carrito');
const $total = document.getElementById('total');
const $comprar = document.getElementById('comprar');
const $mensaje = document.getElementById('mensaje');

function renderProductos() {
    $lista.innerHTML = '';
    productos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${p.imagen}" alt="${p.nombre}">
            </div>
            <div>
                <h3>${p.nombre}</h3>
                <div class="precio">$${p.precio.toLocaleString()}</div>
                <div class="stock">Stock disponible: ${p.stock}</div>
            </div>
        `;
        const btn = document.createElement('button');
        btn.textContent = p.stock > 0 ? 'Agregar al carrito' : 'Sin stock';
        btn.disabled = p.stock <= 0;
        btn.addEventListener('click', () => addToCart(p.id));
        card.appendChild(btn);
        $lista.appendChild(card);
    });
}

function renderCarrito() {
    $carrito.innerHTML = '';
    let total = 0;
    carrito.forEach(item => {
        const p = productos.find(x => x.id === item.id) || { nombre: 'Producto eliminado', precio: 0 };
        const el = document.createElement('div');
        el.className = 'car-item';
        el.innerHTML = `<span>${p.nombre} x ${item.cantidad}</span> <span>$${(p.precio * item.cantidad).toFixed(2)}</span>`;
        $carrito.appendChild(el);
        total += (p.precio || 0) * item.cantidad;
    });
    $total.textContent = total.toFixed(2);
}

function saveCart() { localStorage.setItem('carrito', JSON.stringify(carrito)); }

function addToCart(id) {
    const existing = carrito.find(i => i.id === id);
    if (existing) existing.cantidad += 1; else carrito.push({ id, cantidad: 1 });
    saveCart();
    renderCarrito();
}

async function load() {
    productos = await api.listar();
    renderProductos();
    renderCarrito();
}

$comprar.addEventListener('click', async () => {
    if (!carrito.length) return showMessage('El carrito está vacío', 'error');
    const items = carrito.map(i => ({ id: i.id, cantidad: i.cantidad }));
    const res = await api.comprar(items);
    if (res.status === 201) {
        showMessage('Compra realizada con éxito. ID: ' + res.body.id, 'success');
        carrito = [];
        saveCart();
        await load();
    } else if (res.status === 409) {
        showMessage('Error: stock insuficiente. Revise el carrito.', 'error');
    } else {
        showMessage('Error en la compra: ' + (res.body.error || 'Desconocido'), 'error');
    }
});

function showMessage(txt, cls) {
    $mensaje.textContent = txt;
    $mensaje.className = 'mensaje ' + cls;
    setTimeout(() => { $mensaje.textContent = ''; $mensaje.className = 'mensaje'; }, 4000);
}

load();
