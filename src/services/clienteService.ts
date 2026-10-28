import { executarSql, obterBanco, consultarClientes } from "../lib/database";
import type { Cliente } from "../types/cliente";

export const clienteService = {
    async listar(): Promise<Cliente[]> {
        await obterBanco();

        return consultarClientes<Cliente>("SELECT id, nome, email, telefone FROM clientes ORDER BY id ASC");
    },

    async criar(data: Omit<Cliente, "id">): Promise<void> {
        await obterBanco();

        executarSql("INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)", [
            data.nome,
            data.email,
            data.telefone,
        ]);
    },

    async atualizar(id: number, data: Omit<Cliente, "id">): Promise<void> {
        await obterBanco();

        executarSql("UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?", [
            data.nome,
            data.email,
            data.telefone,
            id,
        ]);
    },

    async deletar(id: number): Promise<void> {
        await obterBanco();

        executarSql("DELETE FROM clientes WHERE id = ?", [id]);
    },
};
