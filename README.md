# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** <https://github.com/Gabriel071185/tpi-food-store-Etchegoyen-Gabriel-prog4>
- **Video de demostración:** `<link público del video>`

## Estructura

```
.
├── backend/    API REST — FastAPI + SQLModel + PostgreSQL
└── frontend/   Aplicación web — React + TypeScript + Vite + Tailwind
```

| | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel, PostgreSQL (SQLite para desarrollo), JWT en cookie HttpOnly, Passlib + bcrypt |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios |

## Requisitos

- **Python** 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14)
- **Node.js** 20.19 o superior y **pnpm** 9 o superior
- **PostgreSQL** 15 o superior (opcional: para desarrollo local alcanza con SQLite)

## Backend

Desde la carpeta `backend/`:

```bash
# 1. Entorno virtual e instalación de dependencias
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Variables de entorno
cp .env.example .env              # Windows: copy .env.example .env
#    editar .env (ver tabla de variables más abajo)

# 3. Datos iniciales (idempotente: se puede ejecutar varias veces)
python -m app.db.seed

# 4. Levantar la API
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1`. Las tablas se crean automáticamente al iniciar.

- Documentación interactiva: <http://localhost:8000/docs>
- Documentación alternativa: <http://localhost:8000/redoc>

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave para firmar el JWT, **mínimo 32 caracteres** | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

> Para usar PostgreSQL hay que crear antes la base (por ejemplo `CREATE DATABASE foodstore_db;`).

### Usuario del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

El seed también carga 4 categorías y 8 productos con stock. Los clientes se crean desde la pantalla de registro (rol `user`).

## Frontend

Desde la carpeta `frontend/`:

```bash
pnpm install
cp .env.example .env              # Windows: copy .env.example .env
pnpm dev                          # servidor de desarrollo en http://localhost:5173
pnpm build                        # verifica los tipos (tsc) y genera el build de producción
```

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Levantar primero el backend: el frontend consume la API con cookie de sesión, por lo que `FRONTEND_ORIGIN` del backend debe coincidir con la URL donde corre el frontend.

## Funcionalidades

**Cliente (`user`)**
- Registro e inicio de sesión.
- Catálogo con paginación en el servidor, búsqueda por nombre y filtro por categoría.
- Carrito persistido en el navegador.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- «Mis pedidos» con detalle y cancelación mientras el pedido está `PENDIENTE`.

**Administrador (`admin`)** — acceso desde «Panel de administración»
- Resumen con indicadores del negocio.
- ABM de categorías y productos, con cambio de stock y disponibilidad.
- Gestión de pedidos: filtro por estado y cambio de estado.
- Gestión de usuarios: activar y desactivar (no puede desactivarse a sí mismo).

## Reglas de negocio

- **RN-01 Crear pedido:** al menos un ítem, sin productos repetidos; cada producto debe existir, estar activo, disponible y con stock suficiente. El stock se descuenta y las líneas copian nombre y precio del producto, todo en una única transacción: si algo falla, no se persiste nada.
- **RN-02 Máquina de estados:** `PENDIENTE → EN_PREPARACION → ENTREGADO`; `PENDIENTE` y `EN_PREPARACION` pueden pasar a `CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales. Una transición inválida responde 400.
- **RN-03 Cancelar:** restituye el stock de cada línea en la misma transacción que cambia el estado.
- **RN-04 Permisos:** el cliente solo ve y cancela sus pedidos y solo desde `PENDIENTE`; el admin ve todos y puede avanzar o cancelar desde cualquier estado no terminal.
- **RN-05 Inmutabilidad:** las líneas y el total no cambian después de crear el pedido; no existen endpoints de edición ni de borrado de pedidos.
- **RN-06 Validación:** `forma_pago` ∈ {`EFECTIVO`, `TRANSFERENCIA`} y `direccion_entrega` entre 5 y 200 caracteres.

## Arquitectura

**Backend** — módulos por dominio en `backend/app/modules/` (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`). Cada módulo sigue la cadena *Router → Service → Unit of Work → Repository → Model*, con schemas de entrada y salida. El commit ocurre únicamente en el `__exit__` del Unit of Work: ningún Service ni Router llama a `session.commit()`. La infraestructura compartida (configuración, base de datos, seguridad, dependencias, Unit of Work y repositorio base) vive en `backend/app/core/`.

**Frontend** — organizado por *features* (`auth`, `categorias`, `productos`, `usuarios`, `pedidos`), cada una con `pages/`, `components/`, `hooks/`, `api/` y `types/`. Lo transversal está en `shared/`, el estado global del cliente en `store/` (Zustand: sesión y carrito) y las rutas en `routes/`. El estado del servidor lo maneja TanStack Query.

**Sesión** — el JWT viaja en una cookie `HttpOnly` que el navegador adjunta en cada petición (Axios con `withCredentials`). El frontend nunca lee ni guarda el token; solo persiste los datos básicos del usuario. La autorización real se aplica en el backend con `require_role`.

## Códigos de error principales

| Código | Cuándo |
|---|---|
| 400 | Cuenta desactivada, stock insuficiente, producto no disponible o repetido, transición de estado inválida |
| 401 | Sin sesión, token inválido o vencido, credenciales incorrectas |
| 403 | Rol no permitido o pedido de otro usuario |
| 404 | Recurso inexistente o dado de baja |
| 409 | Usuario o nombre duplicado |
| 422 | El cuerpo o los parámetros no pasan la validación |
