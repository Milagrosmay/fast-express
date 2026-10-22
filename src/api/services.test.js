import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calcularCotizacion,
  eliminarCotizacion,
  listarCotizaciones,
} from "./services";

describe("services / pedirDatos (caja blanca)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devuelve JSON en respuesta 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ total: 100 }),
      }),
    );
    await expect(calcularCotizacion({ peso_kg: 1 })).resolves.toEqual({
      total: 100,
    });
  });

  it("204 devuelve null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error("sin cuerpo")),
      }),
    );
    await expect(eliminarCotizacion(1)).resolves.toBeNull();
  });

  it("fallo de red lanza RED_NO_DISPONIBLE", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    await expect(listarCotizaciones()).rejects.toMatchObject({
      codigo: "RED_NO_DISPONIBLE",
    });
  });

  it("JSON inválido lanza RESPUESTA_INVALIDA", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error("parse")),
      }),
    );
    await expect(listarCotizaciones()).rejects.toMatchObject({
      codigo: "RESPUESTA_INVALIDA",
    });
  });

  it("!ok propaga cuerpo del error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            codigo: "DATOS_INVALIDOS",
            detalle: { peso_kg: ["inválido"] },
          }),
      }),
    );
    await expect(calcularCotizacion({})).rejects.toMatchObject({
      codigo: "DATOS_INVALIDOS",
    });
  });

  it("listarCotizaciones omite filtros vacíos en la URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ results: [], count: 0 }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await listarCotizaciones({ tipo_cliente: "VIP", page: "", id: null });
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("tipo_cliente=VIP");
    expect(url).not.toMatch(/page=/);
  });
});
