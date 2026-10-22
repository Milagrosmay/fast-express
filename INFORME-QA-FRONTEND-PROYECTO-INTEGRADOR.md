# Proyecto Integrador — Módulo QA (Frontend)
## FastExpress · Cotización de envíos y descuentos

**Asignatura:** Calidad de Software  
**Componente:** Frontend (React + Vite)  
**Repositorio:** `fast-express`  
**Rol responsable:** Analista QA + Desarrollador Frontend  
**Fecha:** 22/10/2026  

> Este documento corresponde al **apartado B.1 — Plan de Pruebas de Caja Negra (QA + Frontend)** del entregable *Documento de Calidad de Software* descrito en *PROYECTO INTEGRADOR*.  
> Las secciones B.2 (CFG / complejidad ciclomática) y cobertura del **algoritmo core** corresponden al **Backend**; aquí se incluye solo soporte de pruebas blancas del **cliente** (utilidades y API JS) como anexo.

---

## 1. Contexto y alcance (Frontend)

| Elemento | Descripción |
|----------|-------------|
| **Sistema** | Interfaz web para historial de cotizaciones, cálculo, guardado/edición y eliminación |
| **API** | `http://127.0.0.1:8001/api/v1` |
| **Reglas de negocio (referencia BR-01 a BR-04)** | Validadas en UI de forma **indirecta**: el front envía datos y muestra totales/errores que devuelve el backend |
| **Validación en cliente** | Campo **Peso (kg)**: `min=0.01`, `max=20`, `step=0.01`; formulario incompleto deshabilita “Calcular total” |

**Pantallas principales**

1. **Historial** (`List.jsx`) — filtros, tabla, paginación, detalle, editar, eliminar  
2. **Nueva cotización / Edición** (`Form.jsx`) — peso, tipo cliente, tipo envío, calcular, guardar  
3. **Navegación** (`Header.jsx`, `App.jsx`) — Historial ↔ Nueva cotización  

---

## 2. Plan de pruebas de caja negra (QA + Frontend)

Metodologías aplicadas según el proyecto integrador:

- **Particiones de equivalencia (EP)**
- **Análisis de valores límite (BVA)**
- **Tablas de decisión** (combinación **Tipo de cliente** + **Tipo de envío**)

### 2.1 Particiones de equivalencia — campo **Peso (kg)**

| ID partición | Clase | Rango / condición | Representante | Comportamiento esperado en UI |
|--------------|-------|-------------------|---------------|-------------------------------|
| EP-P-1 | Válida baja | 0,01 ≤ peso ≤ 5,00 | 2,50 | Permite calcular; petición al backend |
| EP-P-2 | Válida alta | 5,01 ≤ peso ≤ 20,00 | 10,00 | Permite calcular; tarifa por kg distinta (BR-02) reflejada en resumen |
| EP-P-3 | Inválida vacía | Campo vacío | — | Botón **Calcular total** deshabilitado |
| EP-P-4 | Inválida bajo HTML5 | peso &lt; 0,01 | 0 | Navegador puede bloquear envío o backend responde error; mensaje en `role="alert"` o errores por campo |
| EP-P-5 | Inválida sobre límite | peso &gt; 20 | 20,01 o 25 | Backend rechaza (BR-02); UI muestra error de API en alerta o bajo campo |
| EP-P-6 | Inválida no numérica | texto | `abc` | Input tipo `number` impide o ignora; si se envía, error del servidor |

**Caso automatizado relacionado:** `Form.blackbox.test.jsx` — formulario incompleto → botón deshabilitado (EP-P-3).

---

### 2.2 Valores límite (BVA) — campo **Peso (kg)**

Límites según BR-02 y restricciones HTML del formulario (`min=0.01`, `max=20`).

| ID | Valor (kg) | Tipo límite | Entrada usuario | Resultado esperado |
|----|------------|-------------|-----------------|-------------------|
| BVA-P-01 | 0 | Mínimo inválido | 0 | No cumple regla; error backend o validación |
| BVA-P-02 | 0,01 | Mínimo válido | 0,01 | Cálculo exitoso si resto de campos OK |
| BVA-P-03 | 0,02 | Mínimo + δ | 0,02 | Cálculo exitoso |
| BVA-P-04 | 5,00 | Frontera tramo 1 | 5,00 | Cálculo exitoso (tramo $2/kg) |
| BVA-P-05 | 5,01 | Frontera tramo 2 | 5,01 | Cálculo exitoso (tramo $4/kg) |
| BVA-P-06 | 20,00 | Máximo válido | 20,00 | Cálculo exitoso |
| BVA-P-07 | 20,01 | Máximo + δ | 20,01 | Rechazo (BR-02 límite excedido) |
| BVA-P-08 | (vacío) | Sin dato | — | **Calcular total** deshabilitado |

**Evidencia manual sugerida:** captura por cada fila con backend activo (`npm run dev`).

---

### 2.3 Particiones de equivalencia — **Monto** (salida en UI)

En el frontend el usuario **no digita** el monto; se **muestra** tras calcular (subtotal, descuento, recargo, **total**). Las pruebas de “Monto” son de **salida / presentación**.

| ID partición | Clase | Condición | Representante | Resultado esperado |
|--------------|-------|-----------|---------------|-------------------|
| EP-M-1 | Monto coherente | API 200 con totales | total = 45,00 | Texto **`$45.00`** visible en resumen (función `formatoMoneda`) |
| EP-M-2 | Desglose visible | API devuelve desglose | subtotal, descuento, recargo | Filas “Subtotal”, “Descuento”, “Recargo”, “Total” pobladas |
| EP-M-3 | Sin monto aún | No hay `result.total` | Sin calcular | Panel “Resumen de cotización” con texto guía; **Guardar** deshabilitado |
| EP-M-4 | Error de negocio | API 4xx | peso &gt; 20 | No se muestra total válido; mensaje de error visible |
| EP-M-5 | Error de red | `RED_NO_DISPONIBLE` | backend apagado | Alerta de conexión / error general en listado o formulario |

**Caso automatizado:** `Form.blackbox.test.jsx` — tras calcular, aparece `$45.00` (EP-M-1).

---

### 2.4 Valores límite (BVA) — **Monto total mostrado**

Se prueba con entradas de peso límite y combinaciones de cliente/envío; el **valor numérico esperado** lo define el backend (BR); el front debe **mostrarlo formateado** sin truncar decimales.

| ID | Escenario | Peso (kg) | Cliente | Envío | Validación en UI |
|----|-----------|-----------|---------|-------|------------------|
| BVA-M-01 | Total mínimo representativo | 0,01 | NUEVO | ESTANDAR | Total mostrado = respuesta API; formato `$X.XX` |
| BVA-M-02 | Total en frontera de tramo | 5,00 | NUEVO | ESTANDAR | Cambio de tramo peso reflejado en “Costo por peso” |
| BVA-M-03 | Total con recargo máximo combo | 5,00 | VIP | EXPRESS | Descuento 20% y recargo 25% visibles en % y montos |
| BVA-M-04 | Total rechazado | 20,01 | cualquiera | cualquiera | Sin total válido; mensaje de error |

---

### 2.5 Tabla de decisión — **Tipo de cliente** × **Tipo de envío**

Condiciones de entrada (formulario). Acciones: pulsar **Calcular total** con peso fijo de prueba **5,00 kg** (controlado).

| Regla | Tipo cliente | Tipo envío | Descuento esperado (BR-03) | Recargo esperado (BR-04) | Resultado esperado en UI |
|-------|--------------|------------|----------------------------|--------------------------|---------------------------|
| TD-01 | NUEVO | ESTANDAR | 0% | 0% | Resumen con 0% descuento y 0% recargo; total coherente con API |
| TD-02 | NUEVO | EXPRESS | 0% | +25% | Fila recargo con +25%; total &gt; TD-01 |
| TD-03 | FRECUENTE | ESTANDAR | 10% | 0% | Descuento 10% en desglose |
| TD-04 | FRECUENTE | EXPRESS | 10% | +25% | Descuento y recargo simultáneos visibles |
| TD-05 | VIP | ESTANDAR | 20% | 0% | Descuento 20% |
| TD-06 | VIP | EXPRESS | 20% | +25% | Mayor diferencia vs TD-01; total highest en la tabla |

**Precondiciones:** backend activo; peso = 5,00; sin errores de red.  
**Postcondición común:** botón **Guardar cotización** habilitado solo si existe total calculado (`pasoResultado`).

---

### 2.6 Casos de prueba ejecutables (matriz resumen caja negra)

| ID | Técnica | Objetivo | Pasos | Resultado esperado | Auto / Manual | Estado |
|----|---------|----------|-------|-------------------|---------------|--------|
| CN-01 | EP | Vista inicial | Abrir app | Título “Historial de cotizaciones” | Auto `App.blackbox` | OK |
| CN-02 | EP | Navegación | Clic “Nueva cotización” | Formulario “Nueva cotización” + campo peso | Auto `App.blackbox` | OK |
| CN-03 | EP | Accesibilidad | Revisar skip link | `href="#contenido-principal"` | Auto `App.blackbox` | OK |
| CN-04 | EP-P-3 | Formulario incompleto | Abrir formulario vacío | “Calcular total” deshabilitado | Auto `Form.blackbox` | OK |
| CN-05 | EP-M-1 | Flujo feliz | Peso 5, VIP, EXPRESS, Calcular | Muestra `$45.00` (mock) o total API en manual | Auto / Manual | OK (auto con mock) |
| CN-06 | BVA-P-06 | Peso máximo | Peso 20,00 + calcular | Total OK | Manual | Pendiente evidencia |
| CN-07 | BVA-P-07 | Sobre límite | Peso 20,01 + calcular | Error visible | Manual | Pendiente evidencia |
| CN-08 | TD-01 … TD-06 | Tabla decisión | Para cada fila TD, calcular | % y montos acordes a BR en UI | Manual | Pendiente evidencia |
| CN-09 | EP | Filtro historial | Filtro VIP en listado | Tabla actualizada | Manual | Pendiente evidencia |
| CN-10 | EP | Eliminar | Eliminar → Cancelar / Confirmar | Diálogo; acción correcta | Manual | Pendiente evidencia |

---

## 3. Pruebas de caja blanca en el Frontend (anexo — no sustituye B.2 Backend)

El integrador asigna CFG y **V(G)** al algoritmo de cálculo del **Backend**. En el front se aplicó caja blanca a **módulos auxiliares** críticos para la calidad del cliente:

| Módulo | Motivo | Archivo test | Casos |
|--------|--------|--------------|-------|
| `format.js` | Formato de montos en UI | `format.test.js` | 4 |
| `errors.js` | Mensajes al usuario | `errors.test.js` | 4 |
| `cotizacionesLista.js` | Orden/paginación listado | `cotizacionesLista.test.js` | 2 |
| `services.js` | Ramas de `fetch` / errores | `services.test.js` | 6 |
| `ConfirmDialog.jsx` | Ramas modal eliminar | `ConfirmDialog.test.jsx` | 3 |

**Ejecución:**

```bash
npm run test:run
```

**Resultado registrado:** 7 archivos, **23/23** pruebas aprobadas.

---

## 4. Automatización y evidencias

| Evidencia | Descripción |
|-----------|-------------|
| E-01 | Captura terminal: `Tests 23 passed (23)` |
| E-02 | Capturas manuales CN-06 a CN-10 (navegador + backend) |
| E-03 | (Opcional) Video corto: calcular TD-06 VIP + EXPRESS |

**Archivos de prueba en repo:**

- `src/App.blackbox.test.jsx`
- `src/components/Form.blackbox.test.jsx`
- `src/utils/*.test.js`
- `src/api/services.test.js`
- `src/components/ConfirmDialog.test.jsx`

---

## 5. Observaciones

1. Los avisos `act(...)` en consola al probar `<App />` provienen de actualizaciones asíncronas (`List`, `ConnectionStatus`); **no fallan** las pruebas.  
2. La caja negra automatizada usa **mocks** de API; la validación contra **BR-01–BR-04** debe completarse con casos **manuales** TD y BVA contra backend real.  
3. La meta de **85% code coverage** del entregable aplica al proyecto global; reporte de cobertura del front puede añadirse con `vitest --coverage` si el equipo lo exige.

---

## 6. Conclusiones (Frontend / QA)

1. Se documentó el **plan de caja negra** con **EP**, **BVA** (Peso y Monto en UI) y **tabla de decisión** Cliente × Envío, alineado al Proyecto Integrador.  
2. Se implementaron **5 casos de caja negra automatizados** y **18 de caja blanca** en el cliente, todos exitosos.  
3. Los casos manuales CN-06 a CN-10 cierran la trazabilidad con las reglas de negocio y el historial.

---

## 7. Bloque para pegar en Claude (integración al informe final)

Copia el siguiente prompt junto con este archivo y el `PROYECTO INTEGRADOR.docx`:

```text
Redacta la sección "B. Documento de Calidad — Plan de Pruebas de Caja Negra (QA + Frontend)"
del informe final del Proyecto Integrador FastExpress usando INFORME-QA-FRONTEND-PROYECTO-INTEGRADOR.md.

Requisitos:
- Mantener tablas EP, BVA (Peso y Monto), Tabla de Decisión TD-01..TD-06 y matriz CN-01..CN-10.
- Vincular reglas BR-01 a BR-04 solo como referencia de resultados esperados en UI.
- Incluir resultados de automatización (23/23) y listar evidencias E-01 a E-03.
- NO incluir CFG ni complejidad ciclomática del cálculo (eso es Backend B.2).
- Tono: informe académico en español, listo para Word.
- Añadir portada con: Integrantes, roles (Frontend / QA), repositorio GitHub, fecha.
```

---

*Documento preparado para entrega parcial del equipo — módulo Frontend / QA.*
