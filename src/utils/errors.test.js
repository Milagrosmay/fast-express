import { describe, expect, it } from "vitest";
import { detalleCampo, mensajeErrorApi } from "./errors";

describe("errors (caja blanca)", () => {
  it("mensajeErrorApi formatea DATOS_INVALIDOS con detalle objeto", () => {
    const msg = mensajeErrorApi(
      {
        codigo: "DATOS_INVALIDOS",
        detalle: { peso_kg: ["Debe ser mayor a 0"], tipo_cliente: "Requerido" },
      },
      "fallback",
    );
    expect(msg).toContain("peso_kg:");
    expect(msg).toContain("tipo_cliente:");
  });

  it("mensajeErrorApi usa detalle string", () => {
    expect(
      mensajeErrorApi({ detalle: "Error de negocio" }, "fallback"),
    ).toBe("Error de negocio");
  });

  it("mensajeErrorApi usa mensaje o fallback", () => {
    expect(mensajeErrorApi({ mensaje: "X" }, "fallback")).toBe("X");
    expect(mensajeErrorApi({}, "fallback")).toBe("fallback");
  });

  it("detalleCampo une arrays o convierte a string", () => {
    expect(detalleCampo(undefined)).toBeUndefined();
    expect(detalleCampo(["a", "b"])).toBe("a, b");
    expect(detalleCampo("solo")).toBe("solo");
  });
});
