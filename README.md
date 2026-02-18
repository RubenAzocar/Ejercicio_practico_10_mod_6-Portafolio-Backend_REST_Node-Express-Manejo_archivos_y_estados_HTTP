# 🚀 Premium Store - Módulo 6 (Backend REST & File System)

Este proyecto es una aplicación de comercio electrónico moderna que implementa un backend robusto con Node.js y Express, utilizando el sistema de archivos (`fs`) para la persistencia de datos. Cuenta con una interfaz de usuario premium diseñada con técnicas de vanguardia como glassmorphism y micro-interacciones.

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.
- **Persistencia**: JSON Files (`fs.promises`).
- **Seguridad/ID**: UUID v4.
- **Frontend**: HTML5, CSS3 (Variables, Grid, Flexbox), JavaScript Vanilla.
- **Estilo**: Glassmorphism, Gradientes vibrantes, Diseño Responsivo.

## 📂 Estructura del Proyecto

```text
m6-backend/
├─ public/                # Frontend estático
│  ├─ css/                # Hojas de estilo
│  │  └─ styles.css       # Estilos premium (glassmorphism)
│  ├─ js/                 # Lógica de cliente
│  │  └─ main.js          # Consumo de API y renderizado
│  ├─ img/                # Biblioteca de imágenes de productos
│  └─ index.html          # Estructura principal
├─ data/                  # Persistencia de datos
│  ├─ productos.json      # Base de datos de productos e inventario
│  └─ ventas.json         # Registro histórico de ventas
├─ server.js              # Servidor Express y API REST
├─ package.json           # Dependencias y scripts
└─ README.md              # Documentación del proyecto
```

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio** (o descargar el código).
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Ejecutar en modo producción**:
   ```bash
   npm start
   ```
4. **Ejecutar en modo desarrollo** (con recarga automática):
   ```bash
   npm run dev
   ```
5. **Acceder a la aplicación**:
   Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints (REST)

### Productos

- `GET /productos`: Obtiene la lista completa de productos con su stock.
- `POST /producto`: Registra un nuevo producto. (Body: `nombre`, `precio`, `stock`).
- `PUT /producto`: Actualiza un producto existente. (Body: `id`, `nombre?`, `precio?`, `stock?`).
- `DELETE /producto?id=...`: Elimina un producto por su ID.

### Ventas

- `POST /venta`: Registra una nueva compra. (Body: `{ items: [{ id, cantidad }] }`).
  - _Lógica_: Calcula montos, genera ID con UUID, guarda en `ventas.json` y descuenta stock en `productos.json`.
- `GET /ventas`: Retorna el historial completo de ventas guardadas.

## ✨ Características del Frontend

- **Galería Dinámica**: Los productos se cargan desde el API y se muestran con sus imágenes correspondientes.
- **Carrito de Compras**: Gestión de ítems en tiempo real con persistencia en `localStorage`.
- **Validación de Stock**: El botón de compra se deshabilita si no hay stock y el backend rechaza compras que excedan la disponibilidad (error 409).
- **Diseño Premium**: Interfaz oscura con efectos de desenfoque de fondo y animaciones suaves al interactuar con los productos.

---

_Desarrollado para el Módulo 6 - Desarrollo de Aplicaciones Backend con Node y Express._
# Ejercicio_practico_10_mod_6-Portafolio-Backend_REST_Node-Express-Manejo_archivos_y_estados_HTTP
