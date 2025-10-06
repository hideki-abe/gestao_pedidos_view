export interface PaginatedResponse<T> {
  count: number;          // O número total de itens disponíveis no backend.
  next: string | null;    // A URL para a próxima página de resultados.
  previous: string | null;// A URL para a página anterior de resultados.
  results: T[];           // O array de itens para a página atual.
}