export const PAGE_SIZE_LISTA = 10;

export const ordenarPorId = (lista, direccion) => {
  const copia = [...lista].sort((a, b) => Number(a.id) - Number(b.id));
  return direccion === "asc" ? copia : copia.reverse();
};

export const paginaLocal = (lista, pagina, pageSize = PAGE_SIZE_LISTA) => {
  const inicio = (pagina - 1) * pageSize;
  return lista.slice(inicio, inicio + pageSize);
};
