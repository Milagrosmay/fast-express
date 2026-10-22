import { describe, expect, it } from "vitest";
import { ordenarPorId, paginaLocal, PAGE_SIZE_LISTA } from "./cotizacionesLista";

describe("cotizacionesLista (caja blanca)", () => {
  const muestra = [{ id: 3 }, { id: 1 }, { id: 2 }];

  it("ordenarPorId asc y desc", () => {
    expect(ordenarPorId(muestra, "asc").map((x) => x.id)).toEqual([1, 2, 3]);
    expect(ordenarPorId(muestra, "desc").map((x) => x.id)).toEqual([3, 2, 1]);
  });

  it("paginaLocal corta según página y tamaño", () => {
    const lista = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
    expect(paginaLocal(lista, 1)).toHaveLength(PAGE_SIZE_LISTA);
    expect(paginaLocal(lista, 1)[0].id).toBe(1);
    expect(paginaLocal(lista, 3)[0].id).toBe(21);
    expect(paginaLocal(lista, 3)).toHaveLength(5);
  });
});
