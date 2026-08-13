# Coral — Sillas de diseño (Frontend)

Aplicación web en **Angular 22** para la gestión y venta de una tienda de sillas de diseño (posicionamiento high-ticket). Consume la API REST del backend NestJS incluido en la raíz de este repositorio.

## Integrantes

- Andrea Lizcano
- Gabriela Rincón

## Tecnologías utilizadas

- **Angular 22** (standalone components, signals, control flow `@if`/`@for`)
- **TypeScript**
- **RxJS** (HttpClient, interceptores)
- **CSS** con variables de diseño propias (sin librerías de UI de terceros)
- Backend: **NestJS** + **TypeORM** + **PostgreSQL** (Supabase) — ver [README de la raíz](../README.md)

## Funcionalidades

- Home pública: listado de productos, búsqueda, filtro por categoría, estados de carga y vacío
- Detalle de producto público, con botón de favorito si hay sesión iniciada
- Registro e inicio de sesión (JWT)
- Gestión de Productos y Categorías (crear, editar, eliminar) — rutas protegidas
- Favoritos y Perfil (con cambio de contraseña) — rutas protegidas
- Guard de rutas e interceptor HTTP que agrega el token automáticamente y maneja sesiones expiradas (401)
- Logout

## Cómo instalar

Requiere Node.js y el backend corriendo (ver [README de la raíz](../README.md) para configurar la base de datos y las variables de entorno del backend).

```bash
cd frontend
npm install
```

## Cómo ejecutar

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

Por defecto, el frontend consume la API en `http://localhost:3000` (configurado en `src/environment.ts`). Asegúrate de tener el backend corriendo en ese puerto:

```bash
# desde la raíz del repositorio
npm run start:dev
```

## URL de la API

`http://localhost:3000` en desarrollo local. Documentación interactiva (Swagger) en `http://localhost:3000/api/docs`.

## Estructura del proyecto

```text
src/app/
├── core/            # servicios, guards, interceptores, modelos - sin UI
├── shared/          # componentes reutilizables (layout, product-card, etc.)
├── pages/           # una carpeta por pantalla
├── app.routes.ts
└── app.config.ts
```

## Tests

```bash
npx ng test --watch=false
```
