# Guía de estudio — Coral (Frontend Angular)

> Para Andrea y Gabriela. Esto cubre **todo** lo que puede preguntar el profesor: qué hace cada pieza, dónde está, qué pasa si no está, y cómo se conecta todo. Está escrito para leerlo en voz alta y poder explicarlo con tus propias palabras, no para memorizar.

---

## 0. Cómo se reparte el estudio

Según quién construyó cada parte en el backlog de GitHub. La idea: cada quien domina a fondo lo que hizo (porque si el profesor pregunta detalle fino, tiene que salir natural), y las dos dominan por igual lo que es **crítico y cruza todo el proyecto** — nadie puede quedarse callada si preguntan por el flujo de autenticación o el enrutamiento, sin importar quién lo haya escrito.

### Andrea — estudia a fondo (lo construyó ella)
- **Sección 3 completa** (Autenticación): `AuthService`, el interceptor, el guard — es lo suyo, tiene que poder explicar cada línea.
- **Sección 4** (Enrutamiento): armó el `app.routes.ts` base y el `authGuard` que usan las rutas protegidas.
- **Sección 6** → `Layout` (Navbar/Footer), `Loading`, `NoResults`.
- **Sección 5** → páginas de **Categorías** (CRUD) y **Favoritos**, y el logout real en el Navbar.

### Gabriela — estudia a fondo (lo construyó ella)
- **Sección 2 completa** (Cómo se conecta al backend): todos los Services (`ProductService`, `CategoryService`, `FavoriteService`, `UserService`).
- **Sección 7** (Modelos/interfaces).
- **Sección 6** → `ProductCard`, `SearchBar`, `ErrorMessage`, `ConfirmDialog`.
- **Sección 5** → páginas de **Login/Register**, **Product Detail** (+ botón de favorito), **Productos** (CRUD), **Perfil**.
- **Sección 8** (Manejo de errores): escribió `http-error.util.ts` y el patrón de `loadError`/`errorMessage`.

### Las dos por igual (crítico, es conjunto o cruza todo)
- **Sección 1** (arquitectura general) y **Sección 5 → Home** (se construyó entre las dos, es el checkpoint del Día 1).
- **Sección 3.4** (el flujo completo de autenticación de punta a punta) — aunque Andrea construyó las piezas, las dos deben poder narrar el flujo completo sin trabarse.
- **Sección 9** (preguntas típicas) y **Sección 10** (qué pasa si borro X) — son las que más probablemente pregunte el profesor directo, sin importar de quién sea el código.
- Bonus: si preguntan por el **backend** (no es de ustedes, pero conecta todo), basta con saber: NestJS + PostgreSQL/Supabase, JWT stateless, y que el contrato de cada endpoint está en `FRONTEND_GUIDE.md` en la raíz del repo.

---

## 1. La arquitectura, en una frase

`core/` = lógica sin interfaz (servicios, guards, interceptores, modelos). `shared/` = piezas de UI que se repiten en varias pantallas. `pages/` = una carpeta por cada pantalla completa que el usuario visita.

```text
src/app/
├── core/
│   ├── services/       → hablan con el backend (HTTP)
│   ├── guards/          → deciden si puedes entrar a una ruta
│   ├── interceptors/    → interceptan TODAS las peticiones HTTP
│   ├── models/          → forma de los datos (interfaces TS)
│   └── utils/           → funciones sueltas reutilizables
├── shared/components/   → Layout, product-card, search-bar, loading,
│                          no-results, error-message, confirm-dialog
├── pages/                → home, login, register, product-detail,
│                          products, categories, favorites, profile
├── app.routes.ts        → mapa de URLs → componentes
├── app.config.ts        → arranque de la app (router, http, interceptor)
└── main.ts               → punto de entrada real (arranca App con appConfig)
```

**Pregunta típica: "¿por qué separar así?"** — Porque si mezclas todo en una carpeta, en una semana no encuentras nada. Además, `shared/` y `core/` se pueden **reutilizar** sin duplicar código: `product-card` se usa en Home y en Favoritos sin copiar nada.

**¿Qué pasa si esta separación no existiera?** Nada se rompe técnicamente (Angular no obliga esta estructura), pero sería mucho más difícil de mantener y no cumpliría el criterio de "arquitectura y organización" de la rúbrica.

---

## 2. Cómo el frontend habla con el backend

### 2.1 `environment.ts` — la URL base

```typescript
// src/environment.ts
export const environment = {
  baseUrl: 'http://localhost:3000'
};
```

Es **el único lugar** donde está escrita la URL del backend. Cada Service arma su URL completa a partir de esto: `${environment.baseUrl}/products`, `${environment.baseUrl}/auth`, etc.

**¿Qué pasa si esto está mal o el backend no está corriendo en esa URL?** Todas las peticiones fallan con `ERR_CONNECTION_REFUSED`. Antes esto dejaba la pantalla pegada en "Cargando..." para siempre (bug real que encontramos); ahora se muestra un mensaje de error con botón "Reintentar" (ver sección 8).

### 2.2 `HttpClient` — quién hace las peticiones

Angular no deja hacer peticiones HTTP directo desde un componente "a mano" (bueno, técnicamente sí, pero no se hace así). Se usa el servicio `HttpClient`, que Angular inyecta donde se necesite. Para que `HttpClient` exista en toda la app, se activa una sola vez en `app.config.ts`:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

**¿Qué pasa si se quita `provideHttpClient()`?** Ningún Service puede inyectar `HttpClient` — la app ni siquiera compila/arranca, error de inyección de dependencias.

### 2.3 Los Services — un archivo por recurso del backend

Cada uno vive en `core/services/` y **solo** se encarga de hablar con un endpoint del backend. Ningún componente llama a `HttpClient` directamente — siempre pasa por un Service.

| Service | Archivo | Qué hace |
|---|---|---|
| `ProductService` | `core/services/product.service.ts` | `getAll(query)`, `getById(id)`, `create`, `update`, `remove` sobre `/products` |
| `CategoryService` | `core/services/category.service.ts` | mismo patrón sobre `/categories` |
| `FavoriteService` | `core/services/favorite.service.ts` | `getAll`, `add`, `remove` sobre `/favorites` |
| `UserService` | `core/services/user.service.ts` | `getProfile`, `changePassword` sobre `/users/me` |
| `AuthService` | `core/services/auth.service.ts` | `register`, `login`, `logout` + maneja la sesión (ver sección 3) |

Ejemplo real (`ProductService`):

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/products`;

  getAll(query: ProductQuery = {}): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    // ...
    return this.http.get<PaginatedResponse<Product>>(this.baseUrl, { params });
  }
}
```

**`@Injectable({ providedIn: 'root' })`** significa: Angular crea **una sola instancia** de este service para toda la app (singleton) y te la da automáticamente donde la pidas con `inject(ProductService)` — no hay que registrarlo en ningún módulo.

**¿Qué pasa si dos componentes usan `ProductService` al mismo tiempo?** Comparten la misma instancia — no hay estado duplicado ni llamadas redundantes de configuración.

**¿Qué devuelve `getAll()`? ¿Por qué `Observable` y no una `Promise`?** RxJS/`Observable` es lo que usa Angular (y su `HttpClient`) para trabajar con datos asíncronos. La diferencia clave con una `Promise`: un `Observable` **no hace nada hasta que alguien se suscribe** (`.subscribe(...)`). El Service arma la petición, pero es el componente el que decide cuándo dispararla suscribiéndose.

---

## 3. Autenticación — paso a paso completo

Esta es la parte que más preguntan porque tiene más piezas moviéndose juntas: `AuthService`, el interceptor, el guard, y `localStorage`.

### 3.1 `AuthService` — dueño de la sesión

```typescript
// core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/auth`;

  private currentUserSignal = signal<User | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }
}
```

**¿Dónde se guarda la sesión?** En `localStorage` del navegador (dos claves: `accessToken` y `currentUser`). Por eso si recargas la página **sigues logueado** — al crear el `AuthService`, `currentUserSignal` se inicializa leyendo lo que ya había en `localStorage` (`readStoredUser()`).

**¿Qué es `isLoggedIn`? ¿Por qué es un `computed` y no una función normal?** Un `computed` es un valor derivado de un signal que se **recalcula solo** cuando el signal del que depende cambia, y cualquier parte del HTML que lo use (`authService.isLoggedIn()`) se actualiza sola en pantalla sin que nadie tenga que "avisarle" manualmente. Por eso cuando haces login, el Navbar cambia de inmediato sin recargar la página.

**¿Qué pasa si borras `AuthService`?** Nada de auth funciona: no hay dónde guardar el token, el interceptor no tiene de dónde sacarlo, el guard no puede preguntar si hay sesión. Toda la app protegida deja de compilar (todos esos archivos lo importan).

### 3.2 El interceptor — se mete en TODAS las peticiones

```typescript
// core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      const isPasswordChange = req.url.includes('/users/me/password');
      if (error.status === 401 && !isPasswordChange) {
        authService.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
```

Se activa una sola vez, en `app.config.ts`: `provideHttpClient(withInterceptors([authInterceptor]))`.

**¿Qué hace exactamente?** Dos cosas, en orden:
1. **Antes** de que la petición salga: si hay un token guardado, le agrega el header `Authorization: Bearer <token>` **a todas** las peticiones, automáticamente. Por eso ningún Service tiene que preocuparse de mandar el token a mano.
2. **Después**, si la respuesta es un error 401 (no autorizado / token vencido): borra la sesión local y manda al usuario a `/login` — **excepto** si la petición era el cambio de contraseña (ver sección 8, es un caso especial).

**¿Qué pasa si quitas el interceptor?** Ninguna petición a rutas protegidas llevaría el token → el backend respondería `401` en todas → nada de lo que requiere sesión funcionaría (crear productos, favoritos, perfil...), y encima nadie te sacaría automáticamente al login cuando el token vence.

**¿Por qué se excluye `/users/me/password` del logout automático?** Porque esa ruta también responde `401` cuando el usuario escribe mal su contraseña **actual** al querer cambiarla — eso es un error de formulario normal, no una sesión vencida. Si no se excluyera, cada vez que alguien se equivocara escribiendo su contraseña actual, lo sacaríamos de la sesión sin razón.

### 3.3 El guard — quién puede entrar a una ruta

```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

Se usa en `app.routes.ts` con `canActivate: [authGuard]` en cada ruta protegida. Angular Router lo ejecuta **antes** de mostrar el componente de esa ruta.

**¿Qué pasa si no hay sesión y entras a `/profile`?** El guard devuelve `false` → Angular nunca crea el componente `Profile` → el guard mismo redirige a `/login`. Lo probamos en vivo: funciona.

**¿Qué diferencia hay entre el guard y el interceptor si los dos "protegen"?** El guard protege la **navegación** (evita que veas la pantalla). El interceptor protege las **peticiones HTTP** (evita que una llamada sin token le llegue al backend, y reacciona si el backend dice 401). Son capas distintas — podrías tener una sin la otra, pero juntas dan defensa doble.

### 3.4 El flujo completo, de principio a fin

```text
Usuario llena el form de Register
        ↓
AuthService.register() → POST /auth/register
        ↓
Backend responde { accessToken, user }
        ↓
storeSession() guarda todo en localStorage + actualiza el signal
        ↓
isLoggedIn() pasa a true → Navbar cambia solo (por el computed)
        ↓
Usuario navega a /products (protegida)
        ↓
authGuard revisa isLoggedIn() → true → deja pasar
        ↓
Products.ts pide datos → interceptor le agrega el header Authorization
        ↓
Si en algún momento el token vence (401) → interceptor limpia sesión y
manda a /login automáticamente
        ↓
Usuario hace clic en "Cerrar sesión" → Layout.logout() → 
AuthService.logout() → POST /auth/logout (solo confirmación, el JWT es
stateless) → clearSession() localmente → redirige a Home
```

---

## 4. Enrutamiento — `app.routes.ts` explicado línea por línea

```typescript
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'products', component: Products, canActivate: [authGuard] },
  { path: 'products/:id', component: ProductDetail },
  { path: 'categories', component: Categories, canActivate: [authGuard] },
  { path: 'favorites', component: Favorites, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];
```

| Ruta | Componente | ¿Protegida? | Notas |
|---|---|---|---|
| `/` | `Home` | No | pública, listado + búsqueda |
| `/login` | `Login` | No | pública |
| `/register` | `Register` | No | pública |
| `/products` | `Products` | **Sí** | admin: crear/editar/eliminar |
| `/products/:id` | `ProductDetail` | No | pública (el `:id` es un parámetro dinámico) |
| `/categories` | `Categories` | **Sí** | admin |
| `/favorites` | `Favorites` | **Sí** | requiere sesión |
| `/profile` | `Profile` | **Sí** | requiere sesión |

**¿Qué es `:id` en `products/:id`?** Un **parámetro de ruta** — cualquier texto ahí (un UUID en este caso) se puede leer dentro del componente con `ActivatedRoute`. Así es como `ProductDetail` sabe cuál producto mostrar: `this.route.snapshot.paramMap.get('id')`.

**¿Por qué `/products` (admin) y `/products/:id` (detalle) no chocan?** Angular Router matchea por **cantidad de segmentos** y coincidencia exacta. `products` (un segmento, sin nada más) solo matchea la ruta exacta `/products`. `products/:id` necesita un segundo segmento. No hay ambigüedad.

**Esta ruta está conectada a `main.ts` así:** `main.ts` llama a `bootstrapApplication(App, appConfig)`. `appConfig` (en `app.config.ts`) incluye `provideRouter(routes)`, que es lo que activa el Router con este arreglo. El componente raíz `App` tiene `<router-outlet>` (dentro de `<app-layout>`) — ahí es donde Angular inserta el componente de la ruta actual.

**¿Qué pasa si entras a una URL que no está en la lista (ej. `/no-existe`)?** No hay ruta comodín (`**`) configurada — Angular no encuentra coincidencia y no renderiza nada dentro del `<router-outlet>` (queda vacío, sin crashear). No es un 404 elegante, es una limitación consciente que se puede mencionar si preguntan "¿y si...?".

---

## 5. Cada pantalla, explicada

Para cada una: qué hace, qué Service usa, qué pasa si algo falla.

### Home (`pages/home/`) — pública
Hero + búsqueda + filtro de categoría + grilla de productos. Al cargar (`ngOnInit`), pide categorías (`CategoryService.getAll()`) y productos (`ProductService.getAll()`). Cada vez que escribes en la barra de búsqueda o cambias el filtro, se vuelve a pedir (`loadProducts()` de nuevo) — **no hay debounce** (no se retrasa la petición mientras escribes), pide en cada tecla.
**Si falla la petición:** muestra `error-message` + botón "Reintentar" (arreglado en el commit `7b3a279`).

### Login / Register (`pages/login/`, `pages/register/`) — públicas
Formularios con `[(ngModel)]` (two-way binding: el input y la variable de TypeScript se mantienen sincronizados solos). Validan campos vacíos/longitud **antes** de mandar la petición (validación en el cliente), y también manejan lo que el backend rechace (400/401/409) mostrándolo con `error-message`. Si el login/registro funciona, `AuthService` guarda la sesión y se navega a Home.

### Product Detail (`pages/product-detail/`) — pública
Lee el `:id` de la URL, pide el producto (`ProductService.getById`). Si hay sesión, también pregunta si ya es favorito (`FavoriteService.getAll()` y busca el id en la lista) para saber si el botón dice "Agregar" o "Quitar" de favoritos.
**¿Por qué pregunta la lista completa de favoritos en vez de un solo endpoint "¿es favorito?"?** Porque el backend no tiene ese endpoint específico — solo `GET /favorites` (lista completa). Es una solución simple y correcta para el tamaño de este proyecto, no la más eficiente a gran escala.

### Products / Categories (admin) (`pages/products/`, `pages/categories/`) — protegidas
CRUD completo: un formulario que sirve tanto para **crear** como para **editar** (según si `editingId()` tiene valor o no), tabla/lista con botones Editar/Eliminar. Eliminar pasa primero por `confirm-dialog` (no borra directo). Usan `error-message` tanto para errores de validación del formulario como para errores al cargar la lista (dos signals separados: `errorMessage` para el form, `loadError` para la carga inicial).

### Favorites (`pages/favorites/`) — protegida
Pide `FavoriteService.getAll()` y muestra los productos reutilizando **el mismo** `product-card` que usa Home — por eso se ve idéntico visualmente sin duplicar código.

### Profile (`pages/profile/`) — protegida
Muestra los datos del usuario (`UserService.getProfile()`) y tiene el form de cambio de contraseña. **Caso especial ya explicado en 3.2**: un 401 aquí no desloguea.

---

## 6. Componentes reutilizables (`shared/components/`)

| Componente | Qué hace | Input/Output |
|---|---|---|
| `Layout` | Navbar + `<ng-content>` + Footer. Envuelve toda la app. Cambia qué links muestra según `authService.isLoggedIn()` | — |
| `ProductCard` | Tarjeta de producto (imagen, categoría, nombre, precio), clickeable → va al detalle | `input.required<Product>()` |
| `SearchBar` | Input de texto que **emite** lo que escribes, no busca por sí mismo | `output<string>()` |
| `Loading` | Spinner + "Cargando..." | — |
| `NoResults` | Mensaje de "no hay nada" (con texto configurable) | `input<string>()` con default |
| `ErrorMessage` | Muestra un mensaje de error en rojo | `input.required<string>()` |
| `ConfirmDialog` | `<dialog>` nativo del navegador, pide confirmar antes de eliminar | `output<void>` `confirmed`/`cancelled` |

**¿Por qué `SearchBar` no busca directamente?** Separación de responsabilidades: `SearchBar` no sabe nada de productos ni de servicios, solo sabe "el usuario escribió esto". Quien lo usa (Home) decide qué hacer con ese texto. Así `SearchBar` se podría reutilizar para buscar cualquier otra cosa en el futuro sin tocarle una línea.

**¿Cómo funciona `ConfirmDialog` técnicamente?** Usa el elemento HTML nativo `<dialog>` (no una librería). El componente que lo usa (ej. `Categories`) tiene una referencia (`viewChild.required(ConfirmDialog)`), guarda qué id se quiere borrar (`pendingDeleteId`), llama a `.open()` para mostrarlo, y escucha el evento `(confirmed)` para ejecutar el borrado real.

---

## 7. Modelos — el "contrato" con el backend

Viven en `core/models/`, son **interfaces de TypeScript** (no generan código, solo le dicen al compilador qué forma esperar). Están escritos exactamente como el backend real los devuelve (verificado contra el código del backend, no inventados):

- `User`: `id, name, email, createdAt` — **nunca** trae password.
- `Category`: `id, name, description (string | null), createdAt, updatedAt`.
- `Product`: `id, name, description, price, stock, categoryId, category (objeto completo), images (array), createdAt, updatedAt`.
- `ProductImage`: `id, url, order`.
- `AuthResponse`: `accessToken, user`.
- `PaginatedResponse<T>`: `data, total, page, limit, totalPages` — genérico, se usa como `PaginatedResponse<Product>`.

**¿Por qué `Product` tiene tanto `categoryId` como `category`?** Uno es para **leer** (mostrar el nombre de la categoría sin pedir nada más), el otro es para **escribir** (el backend solo necesita el id al crear/editar).

---

## 8. Manejo de errores

### `core/utils/http-error.util.ts`

```typescript
export function extractErrorMessage(error: HttpErrorResponse): string {
  const message = error?.error?.message;
  if (Array.isArray(message)) {
    return message.join(' ');
  }
  return message || 'Ocurrió un error inesperado.';
}
```

El backend, en errores de validación (400), manda `message` como un **arreglo** de strings (uno por campo inválido); en otros errores (401/404/409) manda un solo string. Esta función unifica los dos casos en un solo texto para mostrar.

### Tabla de códigos de error

| Código | Cuándo pasa | Qué hace el frontend |
|---|---|---|
| 400 | Datos inválidos (ej. nombre muy corto) | Muestra el mensaje en el formulario |
| 401 | Sin token / token vencido / credenciales inválidas | El **interceptor** desloguea y manda a `/login` (excepto cambio de contraseña) |
| 404 | Recurso no encontrado | Se muestra el mensaje de la API |
| 409 | Conflicto (nombre de producto/categoría repetido, email repetido, ya en favoritos) | Se muestra el mensaje de la API |
| Error de red (`status: 0`) | Backend caído / sin conexión | Mensaje "No pudimos conectar con el servidor..." + botón Reintentar |

---

## 9. Preguntas típicas del profesor (y cómo responderlas)

**"¿Por qué usan signals en vez de variables normales?"**
Un signal es una variable que Angular "vigila": cuando cambia, todo lo que lo usa en el HTML se actualiza solo, sin que el programador tenga que decir manualmente "actualiza la pantalla". Es el sistema de reactividad moderno de Angular (reemplaza patrones más viejos).

**"¿Qué diferencia hay entre `@if`/`@for` y `*ngIf`/`*ngFor`?"**
Son la sintaxis nueva de control de flujo de Angular (desde la v17), integrada al compilador en vez de ser una directiva estructural. Es más rápida de compilar/ejecutar y no requiere importar `CommonModule`. `@for` además **obliga** a poner `track` (ej. `track product.id`) — le dice a Angular cómo identificar cada elemento de la lista para no re-renderizar todo cuando cambia un dato.

**"¿Qué es `inject()`?"**
La forma moderna de pedirle a Angular una dependencia (un Service, el Router, etc.), en vez de recibirla por el constructor. Se puede usar en cualquier parte donde Angular tenga "contexto de inyección" (dentro de la clase de un componente/service, o dentro de un guard/interceptor funcional).

**"¿Cómo saben que el usuario está logueado al recargar la página?"**
`AuthService` lee `localStorage` al crearse (`readStoredUser()`), no depende de que el usuario acabe de hacer login en esa sesión del navegador.

**"¿Qué pasa si alguien manipula el `localStorage` a mano y pone un token falso?"**
El interceptor lo mandaría igual en el header, pero el **backend** es quien realmente valida el JWT (firma con `JWT_SECRET`) — si es falso o inválido, el backend responde 401 y el interceptor te saca a `/login`. El frontend nunca es la única barrera de seguridad, el backend es la autoridad final.

**"¿Por qué separaron `loadError` de `errorMessage` en Products/Categories?"**
Son dos cosas distintas: `loadError` es "no pude traer la lista" (pantalla completa, con reintentar). `errorMessage` es "tu formulario tiene un error" (aparece junto al form). Mezclarlos mostraría el error en el lugar equivocado.

---

## 10. Tabla rápida "¿qué pasa si borro/quito X?"

| Si quitas... | Pasa esto |
|---|---|
| `provideHttpClient()` en `app.config.ts` | La app no compila — ningún Service puede inyectar `HttpClient` |
| `withInterceptors([authInterceptor])` | Ninguna petición lleva el token → todo lo protegido responde 401, y nadie te saca de sesión automáticamente al vencer el token |
| `canActivate: [authGuard]` de una ruta | Esa ruta queda accesible sin sesión (el componente se renderiza igual, y sus peticiones fallarían 401 sin control) |
| El archivo `environment.ts` | Nada compila — todos los Services lo importan para `baseUrl` |
| `AuthService` | No compila nada de auth ni de lo que dependa de saber si hay sesión (Layout, guard, interceptor, botón de favorito, CRUD protegido) |
| El `@Injectable({ providedIn: 'root' })` de un Service | Angular ya no sabe cómo crear una instancia automáticamente — error en tiempo de ejecución al intentar inyectarlo |
| `imports: [...]` de un componente (ej. quitar `RouterLink`) | Angular no reconoce esa directiva en el HTML del componente — error de compilación (`NG8002` o similar) |

---

## 11. El sistema visual (por si preguntan por el diseño)

Todo vive en `src/styles.css` como variables CSS (`--color-accent`, `--space-3`, etc.) — un solo lugar define tipografía, colores, espaciados y sombras, y **se hereda automáticamente** en formularios/botones/tablas de todas las pantallas sin tocarlas una por una. El hero del Home usa `animation-timeline: scroll()` (CSS puro, sin librerías) para que la imagen reaccione al scroll, más una animación en loop (`rotateY`) para el efecto de "vitrina". Todo respeta `prefers-reduced-motion` (si el usuario pide menos movimiento en su sistema operativo, las animaciones se desactivan).
