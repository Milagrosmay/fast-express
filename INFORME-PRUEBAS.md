# INFORME DE PRUEBAS DE SOFTWARE  
## Frontend FastExpress — Caja blanca y caja negra

| Campo | Detalle |
|--------|---------|
| **Proyecto** | FastExpress — aplicación web de cotizaciones de envío |
| **Componente evaluado** | Frontend (React + Vite) |
| **Repositorio / ruta** | `fast-express` |
| **Fecha del informe** | 22 de octubre de 2026 |
| **Herramienta de prueba** | Vitest 3.2.7, Testing Library, jsdom |

---

## 1. Introducción

FastExpress es una interfaz que permite listar cotizaciones de envío, calcular totales según peso y tipo de cliente/servicio, guardar o editar cotizaciones y eliminar registros del historial. El frontend consume una API REST en `http://127.0.0.1:8001/api/v1`.

Este informe documenta las pruebas **de caja blanca** (basadas en el conocimiento del código fuente, ramas y funciones internas) y **de caja negra** (basadas en entradas y salidas visibles para el usuario, sin depender de la implementación interna), aplicadas al código del frontend.

---

## 2. Objetivos

1. Verificar que las utilidades, el cliente HTTP y la lógica de listado respondan correctamente en casos normales y límite (**caja blanca**).
2. Validar flujos de uso principales desde la perspectiva del usuario (**caja negra**).
3. Dejar evidencia reproducible mediante pruebas automatizadas ejecutables con `npm run test:run`.

---

## 3. Alcance

**Incluido**

- Módulos `src/utils/` (`format.js`, `errors.js`, `cotizacionesLista.js`).
- Capa API `src/api/services.js` (función interna `pedirDatos` y endpoints exportados).
- Componentes probados: `ConfirmDialog`, `Form`, `App` (integración con `Header`, `List`, `ConnectionStatus`).

**Excluido (pendiente de ampliación)**

- Pruebas E2E en navegador real (Playwright/Cypress).
- Cobertura exhaustiva de `List.jsx` (filtros, paginación con backend real, eliminación completa).
- Pruebas de rendimiento y accesibilidad automatizada (axe).

---

## 4. Metodología

| Tipo | Criterio | Técnica |
|------|----------|---------|
| **Caja blanca** | Conocimiento de estructuras, condicionales y flujos de error | Pruebas unitarias e integración ligera con mocks de `fetch` |
| **Caja negra** | Especificación funcional observable (textos, botones, estados) | Renderizado de componentes, simulación de usuario (`userEvent`), API mockeada |

**Criterio de aprobación por caso:** el valor obtenido coincide con el resultado esperado definido en la prueba; no se producen excepciones no controladas.

---

## 5. Entorno y herramientas

- **Node.js** + **npm**
- **Vitest** — runner de pruebas
- **@testing-library/react** — interacción con el DOM como usuario
- **jsdom** — entorno de navegador simulado
- **Mocks (`vi.mock`, `vi.fn`)** — sustitución del backend en pruebas de UI

Comandos:

```bash
npm install
npm run test:run    # ejecución única (evidencia para informe)
npm run test        # modo watch durante desarrollo
```

---

## 6. Pruebas de caja blanca

### 6.1 Módulo de formateo (`format.js`)

| ID | Caso | Entrada | Resultado esperado | Estado |
|----|------|---------|-------------------|--------|
| CB-W-01 | Moneda entero | `10` | `"$10.00"` | Aprobado |
| CB-W-02 | Moneda string decimal | `"5.5"` | `"$5.50"` | Aprobado |
| CB-W-03 | Porcentaje | `0.15` | `"15%"` | Aprobado |
| CB-W-04 | Porcentaje con redondeo | `0.105` | `"11%"` | Aprobado |
| CB-W-05 | Fecha nula/vacía/inválida | `null`, `""`, `"no-es-fecha"` | `"—"` | Aprobado |
| CB-W-06 | Fecha ISO válida | `"2024-06-15T12:00:00.000Z"` | Texto de fecha corta ≠ `"—"` | Aprobado |

**Archivo:** `src/utils/format.test.js`

---

### 6.2 Módulo de errores (`errors.js`)

| ID | Caso | Entrada | Resultado esperado | Estado |
|----|------|---------|-------------------|--------|
| CB-W-07 | Error de validación con objeto | `codigo: DATOS_INVALIDOS`, `detalle` con campos | Mensaje con `peso_kg:` y `tipo_cliente:` | Aprobado |
| CB-W-08 | Detalle string | `detalle: "Error de negocio"` | Mismo string | Aprobado |
| CB-W-09 | Campo mensaje | `{ mensaje: "X" }` | `"X"` | Aprobado |
| CB-W-10 | Fallback | `{}` + fallback `"fallback"` | `"fallback"` | Aprobado |
| CB-W-11 | `detalleCampo` array | `["a", "b"]` | `"a, b"` | Aprobado |
| CB-W-12 | `detalleCampo` undefined | `undefined` | `undefined` | Aprobado |

**Archivo:** `src/utils/errors.test.js`

---

### 6.3 Listado — orden y paginación (`cotizacionesLista.js`)

| ID | Caso | Entrada | Resultado esperado | Estado |
|----|------|---------|-------------------|--------|
| CB-W-13 | Orden ascendente por id | Lista `[{id:3},{id:1},{id:2}]`, `"asc"` | `[1, 2, 3]` | Aprobado |
| CB-W-14 | Orden descendente | Misma lista, `"desc"` | `[3, 2, 1]` | Aprobado |
| CB-W-15 | Página 1 | 25 elementos, página 1 | 10 elementos, primer id = 1 | Aprobado |
| CB-W-16 | Página 3 | 25 elementos, página 3 | 5 elementos, primer id = 21 | Aprobado |

**Archivo:** `src/utils/cotizacionesLista.test.js`

---

### 6.4 Cliente API (`services.js` / `pedirDatos`)

| ID | Condición (rama) | Resultado esperado | Estado |
|----|------------------|-------------------|--------|
| CB-W-17 | HTTP 200 + JSON válido | Devuelve objeto parseado | Aprobado |
| CB-W-18 | HTTP 204 | `null` | Aprobado |
| CB-W-19 | `fetch` rechaza (red caída) | `{ codigo: "RED_NO_DISPONIBLE" }` | Aprobado |
| CB-W-20 | `res.json()` falla | `{ codigo: "RESPUESTA_INVALIDA" }` | Aprobado |
| CB-W-21 | HTTP 4xx (`!res.ok`) | Se rechaza con cuerpo (ej. `DATOS_INVALIDOS`) | Aprobado |
| CB-W-22 | Query params | Filtros vacíos omitidos; `tipo_cliente=VIP` presente | Aprobado |

**Archivo:** `src/api/services.test.js`

**Diagrama de decisiones (resumen):**

```
fetch()
  ├─ excepción → RED_NO_DISPONIBLE
  └─ respuesta
       ├─ status 204 → null
       ├─ json() falla → RESPUESTA_INVALIDA
       ├─ !ok → throw cuerpo
       └─ ok → return cuerpo
```

---

### 6.5 Diálogo de confirmación (`ConfirmDialog.jsx`)

| ID | Caso | Entrada | Resultado esperado | Estado |
|----|------|---------|-------------------|--------|
| CB-W-23 | Modal cerrado | `abierto={false}` | DOM vacío | Aprobado |
| CB-W-24 | Tecla Escape | Diálogo abierto | `onCancelar` invocado | Aprobado |
| CB-W-25 | Botón Cancelar | Clic | `onCancelar` invocado | Aprobado |
| CB-W-26 | Botón confirmar | Clic en texto personalizado | `onConfirmar` invocado | Aprobado |

**Archivo:** `src/components/ConfirmDialog.test.jsx`

---

## 7. Pruebas de caja negra

En estos casos **no se inspecciona** la implementación de handlers internos; solo entradas de usuario y elementos visibles. El backend se simula.

| ID | Descripción | Pasos (usuario) | Resultado esperado | Estado |
|----|-------------|-----------------|-------------------|--------|
| CB-B-01 | Vista inicial | Abrir aplicación | Encabezado "Historial de cotizaciones" visible | Aprobado |
| CB-B-02 | Navegación a formulario | Clic en "Nueva cotización" | Título "Nueva cotización" y campo "Peso (kg)" | Aprobado |
| CB-B-03 | Accesibilidad skip link | Inspeccionar enlace "Saltar al contenido" | `href="#contenido-principal"` | Aprobado |
| CB-B-04 | Validación UI del formulario | Abrir formulario sin completar datos | Botón "Calcular total" deshabilitado | Aprobado |
| CB-B-05 | Flujo calcular cotización | Peso 5, cliente VIP, envío EXPRESS, clic "Calcular total" | Se muestra total `$45.00` (respuesta simulada) | Aprobado |

**Archivos:** `src/App.blackbox.test.jsx`, `src/components/Form.blackbox.test.jsx`

---

## 8. Pruebas manuales complementarias (caja negra en navegador)

Recomendadas para el informe si el docente exige demostración en vivo. Requisitos: `npm run dev` y backend activo en puerto 8001.

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|-------------------|
| CB-M-01 | Filtro en historial | Elegir tipo cliente VIP y aplicar filtro | La tabla refleja solo cotizaciones VIP |
| CB-M-02 | Error de negocio | Calcular con peso fuera de rango permitido por API | Mensaje de error visible en formulario |
| CB-M-03 | Eliminar — cancelar | Eliminar → Cancelar en diálogo | La cotización permanece en la lista |
| CB-M-04 | Eliminar — confirmar | Eliminar → Confirmar | Cotización eliminada o mensaje de éxito |
| CB-M-05 | Edición | Editar desde historial | Formulario con badge "Modo edición" e id en título |

*(Estados OK/NO OK de pruebas manuales: completar al ejecutarlas en laboratorio.)*

---

## 9. Resultados de la ejecución automatizada

**Comando ejecutado:** `npm run test:run`

**Resultado:**

| Métrica | Valor |
|---------|--------|
| Archivos de prueba | 7 |
| Casos totales | 23 |
| Aprobados | 23 |
| Fallidos | 0 |
| Duración aproximada | ~5 s (depende del equipo) |

**Desglose por archivo:**

| Archivo | Casos |
|---------|-------|
| `src/utils/errors.test.js` | 4 |
| `src/utils/cotizacionesLista.test.js` | 2 |
| `src/utils/format.test.js` | 4 |
| `src/api/services.test.js` | 6 |
| `src/components/ConfirmDialog.test.jsx` | 3 |
| `src/components/Form.blackbox.test.jsx` | 2 |
| `src/App.blackbox.test.jsx` | 2 |

**Evidencia:** adjuntar captura de pantalla de la terminal con `Test Files 7 passed` y `Tests 23 passed (23)`.

---

## 10. Observaciones y limitaciones

1. **Advertencias `act(...)` en stderr:** Al montar `<App />`, componentes como `ConnectionStatus` y `List` actualizan estado de forma asíncrona tras `fetch`. React puede mostrar avisos en consola de prueba; **no implican fallo** — los 23 casos siguen aprobados.
2. **Mocks:** En caja negra la API no es el servidor real; valida la UI ante respuestas controladas.
3. **List.jsx:** La lógica de filtros y eliminación en producción depende del backend; se recomienda ampliar con pruebas manuales (sección 8) o tests adicionales con mock de `listarCotizaciones` / `eliminarCotizacion`.

---

## 11. Conclusiones

1. Las **pruebas de caja blanca** cubren funciones críticas de formateo, mensajes de error, paginación/orden del listado, ramas del cliente HTTP y comportamiento del diálogo de confirmación.
2. Las **pruebas de caja negra** confirman navegación principal, reglas visibles del formulario y visualización del total tras calcular.
3. La suite automatizada actual (**23/23 aprobados**) proporciona una base sólida y reproducible para la entrega académica; las pruebas manuales complementan la integración con el backend real.

---

## 12. Anexo — estructura de archivos de prueba

```
src/
  api/services.test.js
  utils/format.test.js
  utils/errors.test.js
  utils/cotizacionesLista.test.js
  utils/cotizacionesLista.js
  components/ConfirmDialog.test.jsx
  components/Form.blackbox.test.jsx
  App.blackbox.test.jsx
  test/setup.js
PRUEBAS.md          ← guía rápida
INFORME-PRUEBAS.md  ← este documento
```

---

*Documento generado para soporte de la actividad de pruebas de caja blanca y caja negra del frontend FastExpress.*
