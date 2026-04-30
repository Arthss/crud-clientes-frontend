import { supabase } from "../lib/supabase";
import type { Cliente } from "../types/cliente";

export const clienteService = {
  async listar(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async criar(data: Omit<Cliente, "id">): Promise<void> {
    const { error } = await supabase
      .from("clientes")
      .insert([data]);

    if (error) throw error;
  },

  async atualizar(id: number, data: Omit<Cliente, "id">): Promise<void> {
    const { error } = await supabase
      .from("clientes")
      .update(data)
      .eq("id", id);

    if (error) throw error;
  },

  async deletar(id: number): Promise<void> {
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};