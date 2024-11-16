# Pixel Factory



Pixel Factory es una plataforma de comercio electrónico que permite a los usuarios explorar, comparar y comprar componentes de PC. Diseñado para ser intuitivo y funcional, el sitio incluye funcionalidades como un carrito de compras, filtros y opciones de pago integradas (PayPal).


## API Reference

PayPal API
La integración con PayPal utiliza su entorno sandbox para pruebas y simulaciones de pagos. Esto permite verificar el funcionamiento completo de la aplicación antes de pasar a producción.

Endpoints Importantes:

Crear una orden de pago
POST /api/paypal/create-order
Crea una orden de pago en el entorno de sandbox.


Capturar una orden de pago
GET /api/paypal/capture-order/
Completa la transacción de una orden aprobada.

Cancelar un Pago (Cancel Payment)

GET /api/paypal/cancel-order
Redirige al usuario a la página adecuada tras cancelar el pago.

Configuración
Actualmente, la integración usa las credenciales de sandbox para pruebas:

Client ID: Configurado en las variables de entorno como PAYPAL_CLIENT_ID.
Client Secret: Configurado en las variables de entorno como PAYPAL_SECRET.
## Installation

Requisitos Previos:

- Node.js >= 16

- Angular CLI >= 17

Nodemon: Instalado  para reiniciar automáticamente el servidor en desarrollo.
Para instalarlo, ejecuta:
```bash
npm install nodemon -D

```
Clona el repositorio:

```bash
 git clone https://github.com/GianVietta/E-Commerce_Pc-Comps.git
  cd -Commerce_Pc-Comps
```
    
Ejecuta la aplicación:

Inicia el frontend:

```bash

npm run backend
```
Inicia el backend:
```bash
npm run dev
```

Accede a la aplicación:

Frontend: http://localhost:4200

json-server: http://localhost:3000

Backend (API): http://localhost:4000

## Usage

Usuario Final

- Navega por el catálogo para explorar productos.

- Agrega productos al carrito y ajusta las cantidades.

- Realiza el pago con  PayPal.

- Consulta tus historial de compras  desde la sección "Mi Perfil".

Administrador

- Accede a la sección Admin .

- Gestiona productos, usuarios e inventario.

- Visualiza el historial de compras de todos los usuarios.



## Authors
- [@AlexBarrientos](https://github.com/BarrientosAlex)  
- [@LeopoldoBasanta](https://github.com/LeoBasan)  
- [@LucianoDominella](https://github.com/LuchoDominella)  
- [@GianVietta](https://github.com/GianVietta)

## Documentation

Puedes consultar la documentación completa del proyecto en el siguiente [enlace](https://docs.google.com/document/d/17P9ttMkUG_KrY-D9G8yVLMb3Zdi-SAAZUJvX8tMREG4/edit?tab=t.0).
