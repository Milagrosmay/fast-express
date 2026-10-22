import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "./Form";
import { calcularCotizacion } from "../api/services";

vi.mock("../api/services", () => ({
  calcularCotizacion: vi.fn(),
  guardarCotizacion: vi.fn(),
  editarCotizacion: vi.fn(),
}));

describe("Form (caja negra)", () => {
  it("usuario completa datos, calcula y ve el total sin conocer la implementación", async () => {
    calcularCotizacion.mockResolvedValue({
      id: null,
      peso_kg: "5",
      tipo_cliente: "VIP",
      tipo_envio: "EXPRESS",
      subtotal: 50,
      descuento: 5,
      total: 45,
    });

    const user = userEvent.setup();
    render(
      <Form cotizacionDetalle={null} setCotizacionDetalle={() => {}} />,
    );

    await user.type(screen.getByLabelText(/peso \(kg\)/i), "5");
    await user.selectOptions(
      screen.getByLabelText(/tipo de cliente/i),
      "VIP",
    );
    await user.selectOptions(
      screen.getByLabelText(/tipo de envío/i),
      "EXPRESS",
    );

    const calcular = screen.getByRole("button", { name: /calcular total/i });
    expect(calcular).toBeEnabled();
    await user.click(calcular);

    await waitFor(() => {
      expect(screen.getByText(/\$45\.00/)).toBeInTheDocument();
    });
  });

  it("botón calcular deshabilitado si faltan campos (regla de negocio visible)", () => {
    render(
      <Form cotizacionDetalle={null} setCotizacionDetalle={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: /calcular total/i }),
    ).toBeDisabled();
  });
});
