# Pruebas de caja blanca y caja negra — Frontend FastExpress

## Cómo ejecutar

```bash
npm install
npm run test:run
```

Modo interactivo: `npm run test`

---

## Caja blanca (conocimiento del código)

Se validan **ramas, funciones puras y manejo de errores** sin depender de la UI.

| Módulo | Archivo de prueba | Qué se cubre |
|--------|-------------------|--------------|
| Formateo | `src/utils/format.test.js` | Moneda, porcentaje, fechas inválidas/válidas |
| Errores API | `src/utils/errors.test.js` | `DATOS_INVALIDOS`, detalle string, fallback |
| Paginación/orden | `src/utils/cotizacionesLista.test.js` | Orden asc/desc, slice por página |
| Cliente HTTP | `src/api/services.test.js` | 200, 204, red caída, JSON inválido, 4xx |
| Diálogo | `src/components/ConfirmDialog.test.jsx` | `abierto=false`, Escape, botones |

### Matriz de decisiones — `pedirDatos` (`services.js`)

| Condición | Resultado esperado |
|-----------|-------------------|
| `fetch` lanza | `{ codigo: "RED_NO_DISPONIBLE" }` |
| `status === 204` | `null` |
| `res.json()` falla | `{ codigo: "RESPUESTA_INVALIDA" }` |
| `!res.ok` | Se lanza el cuerpo JSON |
| `res.ok` | Devuelve cuerpo parseado |

---

## Caja negra (comportamiento del usuario)

Entradas y salidas **visibles**; la API se simula con mocks (no se inspecciona el código interno del componente en el test).

| Caso | Entrada (usuario) | Salida esperada | Archivo |
|------|-------------------|-----------------|---------|
| CB-01 | Abrir app | Título "Historial de cotizaciones" | `App.blackbox.test.jsx` |
| CB-02 | Clic "Nueva cotización" | Formulario "Nueva cotización" + campo peso | `App.blackbox.test.jsx` |
| CB-03 | Formulario incompleto | "Calcular total" deshabilitado | `Form.blackbox.test.jsx` |
| CB-04 | Peso + cliente + envío + Calcular | Muestra total formateado (ej. `$45.00`) | `Form.blackbox.test.jsx` |

### Pruebas manuales recomendadas (caja negra en navegador)

Con `npm run dev` y backend en `127.0.0.1:8001`:

1. **Listado**: aplicar filtro por tipo cliente VIP y verificar que la tabla cambia.
2. **Cotización**: calcular con peso fuera de rango (backend) y ver mensaje de error en pantalla.
3. **Eliminar**: pulsar Eliminar, cancelar en el diálogo → la fila sigue; confirmar → desaparece o mensaje de éxito.
4. **Navegación**: editar desde historial → formulario en modo edición con badge "Modo edición".

---

## Relación con el proyecto

- **Blanca**: asegura que utilidades y capa API no rompan casos límite.
- **Negra**: asegura flujos que el evaluador/usuario puede repetir sin leer el código fuente.
