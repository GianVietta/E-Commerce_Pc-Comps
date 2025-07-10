# Pixel Factory - Frontend

Este repositorio contiene la aplicación cliente en Angular de **Pixel Factory**, una plataforma de comercio electrónico que permite a los usuarios explorar, comparar y comprar componentes de PC. Diseñado para ser intuitivo y funcional, el sitio incluye funcionalidades como un carrito de compras, filtros y opciones de pago integradas (MercadoPago).

---

## 📂 Estructura del repo

E-Commerce_Pc-Comps/ ← este repo (Frontend)
├─ back/ ← submódulo al repo “PixelFactory-Backend”
│ └─ … ← código y README del backend
│
├─ public/ ← archivos públicos (index.html, assets)
├─ src/ ← código Angular (components, services…)
├─ angular.json
├─ package.json
├─ proxy.conf.json ← proxy para desarrollo (opcional)
├─ README.md ← este archivo
└─ …

> **Nota**: si aún no inicializaste el submódulo, tras clonar ejecuta:
>
> ```bash
> git submodule update --init --recursive
> ```

---

## ⚙️ Requisitos previos

- **Node.js** ≥ 16
- **Angular CLI** ≥ 18
- **Git** (para clonar con submódulos)
- El backend debe estar accesible (ver sección “Backend” más abajo)

---

## 🚀 Instalación y arranque

1. **Clonar este repo con submódulos**

   ```bash
   git clone --recurse-submodules git@github.com:TuUsuario/E-Commerce_Pc-Comps.git
   cd E-Commerce_Pc-Comps

   ```

2. **(Si ya clonaste sin --recurse-modules)**
   git submodule update --init --recursive

3. **Instalar dependencias del front**
   npm install

4. **Levantar el back**
   El backend está en back/ y tiene su propio README con pasos de instalación. En otra terminal, ve a back/ y sigue las instrucciones allí (Composer, .env, XAMPP, etc.).

5. **Configurar proxy para desarrollo (opcional)**
   Si no deseas lidiar con CORS, ya está preparado proxy.conf.json. Simplemente arranca:
   ng serve --proxy-config proxy.conf.json

---

## 🔗 API Reference

Todas las llamadas deben ir a rutas relativas bajo el prefijo `/api`. El proxy de desarrollo o tu servidor web se encargará de redirigirlas al backend PHP.

| Archivo PHP             | Método HTTP | Ruta                         | Descripción                                                        |
| :---------------------- | :---------- | :--------------------------- | :----------------------------------------------------------------- |
| `apiProducts.php`       | GET         | `/api/apiProducts.php`       | Obtiene todos los productos o uno en concreto (añadiendo `?id=`)   |
|                         | POST        | `/api/apiProducts.php`       | Crea un nuevo producto (payload JSON)                              |
|                         | PUT         | `/api/apiProducts.php`       | Actualiza un producto existente (payload JSON + `?id=`)            |
|                         | DELETE      | `/api/apiProducts.php`       | Elimina un producto (`?id=`)                                       |
| `apiCart.php`           | GET         | `/api/apiCart.php`           | Obtiene los ítems del carrito del usuario activo                   |
|                         | POST        | `/api/apiCart.php`           | Agrega un producto al carrito (payload JSON)                       |
|                         | PUT         | `/api/apiCart.php`           | Modifica cantidad de un ítem (`?id=` + payload JSON)               |
|                         | DELETE      | `/api/apiCart.php`           | Elimina un ítem del carrito (`?id=`)                               |
| `apiSale.php`           | GET         | `/api/apiSale.php`           | Lista ventas o detalle de venta (`?id=`)                           |
|                         | POST        | `/api/apiSale.php`           | Registra una nueva venta con sus ítems (payload JSON)              |
| `apiUsers.php`          | GET         | `/api/apiUsers.php`          | Lista usuarios o uno específico (`?id=`)                           |
|                         | POST        | `/api/apiUsers.php`          | Crea un usuario nuevo (payload JSON)                               |
|                         | PUT         | `/api/apiUsers.php`          | Actualiza datos de usuario (`?id=` + payload JSON)                 |
|                         | DELETE      | `/api/apiUsers.php`          | Elimina un usuario (`?id=`)                                        |
| `apiReview.php`         | GET         | `/api/apiReview.php`         | Obtiene todas las reviews o las de un producto (`?productId=`)     |
|                         | POST        | `/api/apiReview.php`         | Crea una review (payload JSON)                                     |
|                         | PUT         | `/api/apiReview.php`         | Edita una review (`?id=` + payload JSON)                           |
|                         | DELETE      | `/api/apiReview.php`         | Elimina una review (`?id=`)                                        |
| `apiReview_comment.php` | GET         | `/api/apiReview_comment.php` | Lista comentarios de una review (`?reviewId=`)                     |
|                         | POST        | `/api/apiReview_comment.php` | Crea un comentario (payload JSON)                                  |
|                         | DELETE      | `/api/apiReview_comment.php` | Elimina un comentario (`?id=`)                                     |
| `apiPago.php`           | POST        | `/api/apiPago.php`           | Punto de entrada para iniciar/capturar pago con MercadoPago/PayPal |

## Usage

👤 Uso

Usuario final

1.  Navega por el catálogo.
2.  Agrega productos al carrito.
3.  Realiza el pago con PayPal.
4.  Consulta tu historial en Mi Perfil.

Administrador

1.  Ingresa a la sección Admin.
2.  Gestiona productos, usuarios e inventario.
3.  Revisa el historial de ventas de todos los usuarios.

## Authors

- [@AlexBarrientos](https://github.com/BarrientosAlex)
- [@LeopoldoBasanta](https://github.com/LeoBasan)
- [@LucianoDominella](https://github.com/LuchoDominella)
- [@GianVietta](https://github.com/GianVietta)

## Documentation

Puedes consultar la documentación completa del proyecto en el siguiente [enlace](https://docs.google.com/document/d/17P9ttMkUG_KrY-D9G8yVLMb3Zdi-SAAZUJvX8tMREG4/edit?tab=t.0).
