import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClienteForm } from "./components/ClienteForm";
import { ClienteList } from "./components/ClienteList";
import { clienteService } from "./services/clienteService";
import type { Cliente } from "./types/cliente";
import { useTheme } from "./hooks/useTheme";
import { ConfirmModal } from "./components/ConfirmModal";

function App() {
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<Cliente | null>(null);
  const queryClient = useQueryClient();
  const { dark, toggleTheme } = useTheme();

  const {
    data = [],
    isLoading,
    isFetching,
  } = useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: clienteService.listar,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<Cliente, "id">) => {
      if (clienteEditando) {
        await clienteService.atualizar(clienteEditando.id, data);
        return;
      }

      await clienteService.criar(data);
    },
    onSuccess: async () => {
      toast.success(
        clienteEditando
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!"
      );
      setClienteEditando(null);
      await queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: () => {
      toast.error("Erro ao salvar cliente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await clienteService.deletar(id);
    },
    onMutate: (id: number) => {
      setPendingDeleteId(id);
    },
    onSuccess: async () => {
      toast.success("Cliente deletado com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: () => {
      toast.error("Erro ao deletar cliente");
    },
    onSettled: () => {
      setPendingDeleteId(null);
    },
  });

  const deletar = (cliente: Cliente) => {
    setClienteParaDeletar(cliente);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "14px",
          },
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 p-4 md:p-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Sistema de Clientes
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Cadastro, edição e remoção com interface animada.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-200 px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {dark ? "☀️ Tema claro" : "🌙 Tema escuro"}
            </button>
          </div>
        </header>

        <ClienteForm
          onSubmit={async (data) => {
            await saveMutation.mutateAsync(data);
          }}
          clienteEditando={clienteEditando}
          cancelarEdicao={() => setClienteEditando(null)}
          loading={saveMutation.isPending}
        />

        <ClienteList
          clientes={data}
          onEdit={(cliente) => {
            setClienteEditando(cliente);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={(id) => {
            const cliente = data.find(c => c.id === id);
            if (cliente) deletar(cliente);
          }}
          loading={isLoading}
          fetching={isFetching}
          deletingId={pendingDeleteId}
        />

        <ConfirmModal
          open={!!clienteParaDeletar}
          title="Confirmar exclusão"
          description={`Deseja realmente deletar ${clienteParaDeletar?.nome}?`}
          confirmText="Deletar"
          cancelText="Cancelar"
          loading={deleteMutation.isPending}
          onCancel={() => setClienteParaDeletar(null)}
          onConfirm={() => {
            if (!clienteParaDeletar) return;
            deleteMutation.mutate(clienteParaDeletar.id);
            setClienteParaDeletar(null);
          }}
        />
      </div>
    </div>
  );
}

export default App;