# PROJECT STATE — Orquestador

> Memoria persistente del sistema multiagente para este repo. Se actualiza en cada tarea relevante, no en cada mensaje.

## Objetivo actual
Backend (NestJS) ya construido y estable. Bloqueado en migración de base de datos por credenciales de Supabase. **El frontend Angular ya arrancó**: existe la rama remota `feature/angular-setup` con el scaffold inicial (`frontend/`, Angular 22.1, `ng new` + `provideHttpClient()` + `environment.ts` apuntando a `http://localhost:3000`). Todavía no está mergeada a `main`.

## Tareas pendientes
- Resolver credenciales válidas de conexión a Supabase (bloqueante — requiere decisión/acción humana, ver "Preguntas abiertas")
- Correr `npm run migration:run` una vez resuelto lo anterior
- Decidir si se arregla el e2e test roto (`test/app.e2e-spec.ts`)
- Decidir si se agregan tests de negocio (auth, products, categories, favorites) — hoy no existen
- Decidir si se agrega ownership check en products/categories (hoy cualquier usuario autenticado puede editar/borrar lo de cualquier otro)
- Decidir qué hacer con `feature/angular-setup`: seguir trabajando ahí, mergear a `main`, o mantenerla separada hasta que avance más
- Completar el resto del issue de Día 1 `[Day1][Setup] Estructura de carpetas core/shared/pages` — el scaffold actual es el `ng new` puro, todavía sin `core/`, `shared/`, `pages/`, sin layout (Navbar/Footer), y `app.routes.ts` está vacío

## Tareas en progreso
- `[Day1][Setup] Crear proyecto Angular 22 + routing base + environment` (issue #1) — parcial: proyecto creado, `HttpClient` provisto, `environment.ts` con `baseUrl`. Falta `app.routes.ts` (sigue vacío).
- `[Day1][Setup] Estructura de carpetas core/shared/pages` (issue #2) — **DONE**, pusheado por el equipo (commit `76dfaef`, `.gitkeep` en cada carpeta).
- Modo de trabajo activo: el usuario pidió modo "manual/aprendizaje" — yo explico paso a paso con lenguaje para principiantes, ellos escriben el código. No debo escribir código de `frontend/` a menos que lo pidan explícitamente. Vamos en el Paso 2 (modelos/interfaces) de la ruta: 1) carpetas ✅ 2) modelos 3) servicios 4) componentes UI 5) layout 6) rutas 7) página Home.

## Rama de trabajo actual
`feature/angular-setup` (checkout local creado y trackeando `origin/feature/angular-setup`). `main` sigue disponible aparte, sin tocar.

## Ramas remotas detectadas (`git fetch --all`)
- `main` — igual que antes, sin cambios
- `feature/angular-setup` — 1 commit nuevo (`0a3d86e`): scaffold Angular 22 en `frontend/`. Ver detalle arriba.
- `developer` — sin commits nuevos, igual que `main`
- `qa` — sin commits nuevos, igual que `main`

## Tareas terminadas
- Discovery completo del repositorio (backend, arquitectura, contrato de API verificado contra código real)
- Backlog de frontend creado en GitHub: 15 labels, 4 milestones (Día 1–4), 33 issues, Project (v2) con tablero Backlog/In Progress/Done
- Corrección de seguridad: secretos reales movidos de `.env.example` (tracked, repo público) a `.env` (gitignored)
- Definición de los 6 agentes especializados en `.claude/agents/`: `frontend`, `ux-ui`, `backend`, `qa`, `arquitectura`, `documentacion` (el Orquestador no tiene archivo propio — ese rol lo cumple la sesión principal). `frontend`, `backend`, `qa` y `documentacion` pueden leer/escribir código; `ux-ui` y `arquitectura` son de solo lectura (diagnostican, no implementan) por diseño.
- Agregado 7mo agente: `creative-frontend` (Creative Frontend & Motion Design) — sistema visual, motion design, microinteracciones, hero sections, stagger, skeletons. Trabaja sobre lo que `frontend` ya construyó funcional, no reemplaza su rol de arquitectura/integración.

## Tareas bloqueadas
- **BLOCKED**: `npm run migration:run` — `password authentication failed` (código `28P01`) contra Supabase. Probadas 3 contraseñas distintas, todas rechazadas. El TCP al pooler conecta bien (no es problema de red ni proyecto pausado). Pendiente: usuario debe copiar la cadena de conexión completa y actual desde el dashboard de Supabase (Project Settings → Database → Connect → Session pooler).

## Decisiones arquitectónicas
- El backend se mantiene tal cual está, sin refactors.
- Se adoptó el spec completo de "Creative Frontend & Motion Design" para el agente `creative-frontend`, pese a que el enunciado del reto (`gistfile1.md`) indica explícitamente que "se evaluará la comprensión de Angular, no la complejidad del diseño visual" y clasifica animaciones como bonus opcional (P2, "solo si sobra tiempo"). Decisión explícita del usuario tras conocer el tradeoff — no revertir sin que lo pida.

## Riesgos
- Sin tests de negocio: cualquier cambio futuro puede introducir regresiones sin detección automática.
- Sin ownership checks en products/categories: cualquier usuario autenticado puede modificar/borrar recursos de otro usuario. Puede ser intencional para el alcance de un curso, pero no está confirmado.
- Mientras la migración esté bloqueada, nada del backend es verificable end-to-end (ni por mí ni por el frontend que lo va a consumir).
- El scope de `creative-frontend` (sistema visual completo + motion) puede consumir tiempo de las 4 jornadas que el equipo necesita para las funcionalidades obligatorias (CRUD, auth, guards, interceptor) que sí califican en la rúbrica. Vigilar que no se priorice pulido visual antes que funcionalidad en el Día 1–3.

## Archivos modificados (esta sesión)
- `.env` — creado (gitignored), contiene credenciales reales
- `.env.example` — restaurado a placeholders (estaba con secretos reales por error)
- `.claude/agents/frontend.md` — creado
- `.claude/agents/ux-ui.md` — creado
- `.claude/agents/backend.md` — creado
- `.claude/agents/qa.md` — creado
- `.claude/agents/arquitectura.md` — creado
- `.claude/agents/documentacion.md` — creado
- `.claude/agents/creative-frontend.md` — creado
- `PROJECT_STATE.md` — creado (este archivo)
- `node_modules/`, `package-lock.json` — generados por `npm install`

## Tests ejecutados
Ninguno corrido todavía en esta sesión (no se puede validar nada end-to-end sin conexión a la DB).

## Problemas encontrados
1. Migración bloqueada por credenciales de Supabase (ver "Tareas bloqueadas")
2. `test/app.e2e-spec.ts` espera `'Hello World!'` en `GET /`, pero la respuesta real es `{status, message, docs}` — test roto, boilerplate no actualizado
3. Cero cobertura de tests en la lógica de negocio real de los 5 módulos
4. Sin autorización por ownership en products/categories (ver "Riesgos")

## Preguntas abiertas (requieren decisión humana)
- ¿Cuál es la cadena de conexión real y vigente de Supabase? **(bloqueante)**
- ¿La falta de ownership checks es intencional para el alcance del curso, o hay que agregarla?
- ¿Se arregla el e2e test y se agregan tests de negocio ahora, o queda fuera de alcance?
- ¿El foco inmediato sigue siendo el backend, o pasa a ser dar soporte al equipo de frontend con el backlog ya creado?
