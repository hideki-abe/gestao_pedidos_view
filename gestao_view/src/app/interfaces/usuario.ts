export interface Usuario {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  nivel_acesso: number;
  is_active: boolean;
  is_staff: boolean;
}