# FastExpress — Frontend

Aplicación web para **gestionar cotizaciones de envío**: listar el historial, calcular tarifas, guardar, editar y eliminar cotizaciones. Se conecta a una API REST (backend del proyecto integrador) y forma parte del stack **React + Vite** con estilos en **Tailwind CSS**.

Repositorio: [github.com/Milagrosmay/fast-express](https://github.com/Milagrosmay/fast-express)

---

## Funcionalidades

| Área | Descripción |
|------|-------------|
| **Historial** | Tabla de cotizaciones con filtros (id, peso, tipo de cliente, tipo de envío, fecha), ordenamiento y paginación. |
| **Nueva cotización** | Formulario con peso, tipo de cliente y tipo de servicio; cálculo del total vía API antes de guardar. |
| **Detalle y edición** | Ver una cotización desde el listado; abrir en modo edición (PATCH) con indicador visual. |
| **Eliminar** | Confirmación en diálogo modal antes de borrar. |
| **Estado del backend** | Indicador de conexión con la API en la cabecera. |
| **Accesibilidad** | Enlace “Saltar al contenido”, navegación por vistas y feedback de errores en pantalla. |

---

## Requisitos

- **Node.js** 18+ (recomendado LTS)
- **Backend** FastExpress (o compatible) escuchando en `http://127.0.0.1:8001` con prefijo `/api/v1`

Sin backend activo la app sigue abriendo, pero listados y formularios mostrarán errores de conexión.

---

## Inicio rápido

```bash
# Clonar e instalar
git clone https://github.com/Milagrosmay/fast-express.git
cd fast-express
npm install

# Desarrollo (http://localhost:5173 por defecto)
npm run dev
```

Asegúrate de tener el servidor API en marcha antes de probar listado, cálculo o guardado.

---

## Scripts disponibles

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint sobre el proyecto |
| `npm run test` | Vitest en modo watch |
| `npm run test:run` | Suite de pruebas una sola vez (CI / entrega) |

---

## Configuración de la API

La URL base está definida en `src/api/services.js`:

```js
export const API_URL = "http://127.0.0.1:8001/api/v1"
```

Endpoints usados por el cliente:

| Método | Ruta | Uso en la app |
|--------|------|----------------|
| `GET` | `/cotizaciones/` | Listado con query params de filtros y paginación |
| `GET` | `/cotizaciones/:id/` | Detalle |
| `POST` | `/cotizaciones/calcular/` | Calcular total sin persistir |
| `POST` | `/cotizaciones/` | Crear cotización |
| `PUT` / `PATCH` | `/cotizaciones/:id/` | Actualizar |
| `DELETE` | `/cotizaciones/:id/` | Eliminar |
| `GET` | `/tarifas/` | Consulta de tarifas (según backend) |

Para otro host o puerto, cambia `API_URL` y vuelve a levantar `npm run dev`.

---

## Estructura del proyecto

```
src/
├── api/
│   └── services.js       # Cliente HTTP (fetch) y funciones de cotizaciones
├── components/
│   ├── Header.jsx        # Marca y navegación Listado / Nueva cotización
│   ├── List.jsx          # Historial, filtros, tabla, acciones
│   ├── Form.jsx          # Alta, cálculo y edición
│   ├── ConfirmDialog.jsx # Confirmación de eliminación
│   ├── ConnectionStatus.jsx
│   └── TableSkeleton.jsx # Carga del listado
├── utils/
│   ├── format.js         # Moneda, porcentaje, fechas
│   ├── errors.js         # Mensajes desde respuestas de error
│   └── cotizacionesLista.js  # Orden y paginación en cliente
├── test/
│   └── setup.js          # Configuración Vitest + Testing Library
├── App.jsx               # Vista 1 = listado, vista 2 = formulario
└── main.jsx
```

---

## Pruebas

El proyecto incluye **caja blanca** (utilidades, API simulada) y **caja negra** (flujos de usuario con mocks).

```bash
npm run test:run
```

Documentación detallada de casos y matrices: [`PRUEBAS.md`](./PRUEBAS.md).

Informes de QA del frontend (proyecto integrador):

- [`INFORME-QA-FRONTEND-PROYECTO-INTEGRADOR.md`](./INFORME-QA-FRONTEND-PROYECTO-INTEGRADOR.md)
- [`INFORME-PRUEBAS.md`](./INFORME-PRUEBAS.md)

---

## Stack técnico

- React 19, Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Vitest, jsdom, React Testing Library
- ESLint (config en `eslint.config.js`)

---

## Flujo de trabajo en Git

1. Crear rama o trabajar en `main` según acuerdo del equipo.
2. `npm run lint` y `npm run test:run` antes de subir cambios.
3. Push al remoto configurado (`origin` → repositorio de Milagrosmay).

Quien suba cambios necesita **permiso de escritura** en el repositorio de GitHub (colaborador o cuenta propietaria).

---

## Licencia y autoría

Proyecto académico / integrador — FastExpress. Consulta con el equipo del repositorio para uso y distribución.
