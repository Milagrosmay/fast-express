import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

vi.mock("./api/services", () => ({
  API_URL: "http://127.0.0.1:8001/api/v1",
  listarCotizaciones: vi.fn().mockResolvedValue({
    count: 0,
    results: [],
    next: null,
    previous: null,
  }),
  obtenerCotizacion: vi.fn(),
  eliminarCotizacion: vi.fn(),
  calcularCotizacion: vi.fn(),
  guardarCotizacion: vi.fn(),
  editarCotizacion: vi.fn(),
  tarifasApi: vi.fn(),
}));

describe("App (caja negra)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
  });

  it("usuario ve historial por defecto y puede ir a nueva cotización", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /historial de cotizaciones/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /nueva cotización/i }),
    );

    expect(
      screen.getByRole("heading", { name: /^nueva cotización$/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/peso \(kg\)/i)).toBeInTheDocument();
  });

  it("enlace saltar al contenido apunta al main", () => {
    render(<App />);
    const skip = screen.getByRole("link", { name: /saltar al contenido/i });
    expect(skip).toHaveAttribute("href", "#contenido-principal");
  });
});
