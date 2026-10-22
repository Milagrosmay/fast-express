import { describe, expect, it } from "vitest";
import {
  formatoFechaLocal,
  formatoMoneda,
  formatoPorcentaje,
} from "./format";

describe("format (caja blanca)", () => {
  it("formatoMoneda convierte números a cadena con 2 decimales", () => {
    expect(formatoMoneda(10)).toBe("$10.00");
    expect(formatoMoneda("5.5")).toBe("$5.50");
  });

  it("formatoPorcentaje multiplica por 100 y redondea", () => {
    expect(formatoPorcentaje(0.15)).toBe("15%");
    expect(formatoPorcentaje(0.105)).toBe("11%");
  });

  it("formatoFechaLocal: vacío o inválido devuelve em dash", () => {
    expect(formatoFechaLocal(null)).toBe("—");
    expect(formatoFechaLocal("")).toBe("—");
    expect(formatoFechaLocal("no-es-fecha")).toBe("—");
  });

  it("formatoFechaLocal: ISO válido devuelve fecha corta", () => {
    const texto = formatoFechaLocal("2024-06-15T12:00:00.000Z");
    expect(texto).not.toBe("—");
    expect(texto.length).toBeGreaterThan(0);
  });
});
