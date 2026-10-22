import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog (caja blanca)", () => {
  it("no renderiza nada si abierto es false", () => {
    const { container } = render(
      <ConfirmDialog
        abierto={false}
        titulo="T"
        mensaje="M"
        onConfirmar={() => {}}
        onCancelar={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("Escape y cancelar llaman onCancelar", async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    render(
      <ConfirmDialog
        abierto
        titulo="Eliminar"
        mensaje="¿Seguro?"
        onConfirmar={() => {}}
        onCancelar={onCancelar}
      />,
    );
    await user.keyboard("{Escape}");
    expect(onCancelar).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancelar).toHaveBeenCalledTimes(2);
  });

  it("confirmar dispara onConfirmar", async () => {
    const user = userEvent.setup();
    const onConfirmar = vi.fn();
    render(
      <ConfirmDialog
        abierto
        titulo="T"
        mensaje="M"
        confirmarTexto="Sí, eliminar"
        onConfirmar={onConfirmar}
        onCancelar={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));
    expect(onConfirmar).toHaveBeenCalledOnce();
  });
});
