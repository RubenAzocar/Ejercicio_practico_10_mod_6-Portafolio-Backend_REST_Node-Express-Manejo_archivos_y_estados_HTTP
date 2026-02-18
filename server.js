const express = require('express');
const path = require('path');
const { promises: fs } = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, 'data');
const FILE_PROD = path.join(DATA_DIR, 'productos.json');
const FILE_VENT = path.join(DATA_DIR, 'ventas.json');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ensureDir = async (dir) => {
    try { await fs.mkdir(dir, { recursive: true }); } catch (e) { /* ignore */ }
};

const leerJson = async (file) => {
    try {
        const txt = await fs.readFile(file, 'utf-8');
        return JSON.parse(txt || '[]');
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
};

const escribirJson = async (file, data) => {
    await ensureDir(path.dirname(file));
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};

app.get('/productos', async (req, res) => {
    try {
        const productos = await leerJson(FILE_PROD);
        res.status(200).json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

app.post('/producto', async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;
        if (!nombre || precio == null || stock == null)
            return res.status(400).json({ error: 'Datos incompletos' });
        const productos = await leerJson(FILE_PROD);
        if (productos.find(p => p.nombre === nombre))
            return res.status(409).json({ error: 'Producto ya existe' });
        const nuevo = { id: uuidv4(), nombre, precio: Number(precio), stock: Number(stock) };
        productos.push(nuevo);
        await escribirJson(FILE_PROD, productos);
        res.status(201).json(nuevo);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

app.put('/producto', async (req, res) => {
    try {
        const { id, nombre, precio, stock } = req.body;
        if (!id) return res.status(400).json({ error: 'Falta id' });
        const productos = await leerJson(FILE_PROD);
        const idx = productos.findIndex(p => p.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
        if (nombre != null) productos[idx].nombre = nombre;
        if (precio != null) productos[idx].precio = Number(precio);
        if (stock != null) productos[idx].stock = Number(stock);
        await escribirJson(FILE_PROD, productos);
        res.status(200).json(productos[idx]);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/producto', async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return res.status(400).json({ error: 'Falta id' });
        const productos = await leerJson(FILE_PROD);
        const idx = productos.findIndex(p => p.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
        const [eliminado] = productos.splice(idx, 1);
        await escribirJson(FILE_PROD, productos);
        res.status(200).json({ deleted: eliminado });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

app.get('/ventas', async (req, res) => {
    try {
        const ventas = await leerJson(FILE_VENT);
        res.status(200).json(ventas);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer ventas' });
    }
});

app.post('/venta', async (req, res) => {
    try {
        const { items } = req.body; // items: [{ id, cantidad }]
        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ error: 'Carrito vacío o inválido' });

        const productos = await leerJson(FILE_PROD);
        const ventas = await leerJson(FILE_VENT);

        // Verificar stock
        const insuficiente = [];
        let total = 0;
        const detalle = items.map(it => {
            const prod = productos.find(p => p.id === it.id);
            const cantidad = Number(it.cantidad || 0);
            if (!prod) {
                insuficiente.push({ id: it.id, reason: 'No existe' });
                return null;
            }
            if (cantidad <= 0) {
                insuficiente.push({ id: it.id, reason: 'Cantidad inválida' });
                return null;
            }
            if (prod.stock < cantidad) {
                insuficiente.push({ id: it.id, available: prod.stock });
                return null;
            }
            const subtotal = prod.precio * cantidad;
            total += subtotal;
            return { id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad, subtotal };
        }).filter(x => x !== null);

        if (insuficiente.length > 0) return res.status(409).json({ error: 'Stock insuficiente o productos inválidos', details: insuficiente });

        // Descontar stock
        for (const it of items) {
            const prod = productos.find(p => p.id === it.id);
            prod.stock = prod.stock - Number(it.cantidad);
        }

        const nuevaVenta = {
            id: uuidv4(),
            fecha: new Date().toISOString(),
            items: detalle,
            total: Number(total.toFixed(2))
        };

        ventas.push(nuevaVenta);

        // Guardar cambios
        await escribirJson(FILE_PROD, productos);
        await escribirJson(FILE_VENT, ventas);

        res.status(201).json(nuevaVenta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al procesar venta' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
