import { AnimatePresence, motion } from "motion/react";
import type { Cliente } from "../types/cliente";

type Props = {
    clientes: Cliente[];
    onEdit: (cliente: Cliente) => void;
    onDelete: (id: number) => void;
    loading: boolean;
    fetching: boolean;
    deletingId: number | null;
};

export function ClienteList({ clientes, onEdit, onDelete, loading, fetching, deletingId }: Props) {
    if (loading) {
        return (
            <section className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900 dark:ring-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <div className="h-6 w-40 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400" />
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                    <div className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    <div className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    <div className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                </div>
            </section>
        );
    }

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900 dark:ring-gray-800">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista de clientes</h2>

                {fetching && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400" />
                        Atualizando
                    </div>
                )}
            </div>

            {clientes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Nenhum cliente cadastrado
                </div>
            ) : (
                <div className="md:flex-1 md:overflow-y-auto space-y-3 pr-1">
                    <AnimatePresence mode="popLayout">
                        {clientes.map((cliente) => (
                            <motion.article
                                key={cliente.id}
                                layout
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950/40"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {cliente.nome}
                                        </p>
                                        <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                                            {cliente.email}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{cliente.telefone}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(cliente)}
                                            className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => onDelete(cliente.id)}
                                            disabled={deletingId === cliente.id}
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {deletingId === cliente.id && (
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                                            )}
                                            <span>Deletar</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}
