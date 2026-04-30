import { useEffect, useState } from "react";
import type { Cliente } from "../types/cliente";

type Props = {
  onSubmit: (data: Omit<Cliente, "id">) => Promise<void>;
  clienteEditando: Cliente | null;
  cancelarEdicao: () => void;
  loading: boolean;
};

type FormErrors = Partial<Record<"nome" | "email" | "telefone", string>>;

export function ClienteForm({
  onSubmit,
  clienteEditando,
  cancelarEdicao,
  loading,
}: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erros, setErros] = useState<FormErrors>({});

  useEffect(() => {
    if (clienteEditando) {
      setNome(clienteEditando.nome ?? "");
      setEmail(clienteEditando.email ?? "");
      setTelefone((clienteEditando.telefone ?? "").replace(/\D/g, "").slice(0, 11));
      setErros({});
      return;
    }

    setNome("");
    setEmail("");
    setTelefone("");
    setErros({});
  }, [clienteEditando]);

  const clearErro = (campo: keyof FormErrors) => {
    setErros((prev) => {
      const next = { ...prev };
      delete next[campo];
      return next;
    });
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length === 0) return "";
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const novosErros: FormErrors = {};

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    if (!nomeLimpo) {
      novosErros.nome = "Nome obrigatório";
    } else if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      novosErros.nome = "Nome deve ter entre 3 e 100 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLimpo) {
      novosErros.email = "Email obrigatório";
    } else if (!emailRegex.test(emailLimpo)) {
      novosErros.email = "Email inválido";
    } else if (emailLimpo.length > 150) {
      novosErros.email = "Email muito longo";
    }

    if (!telefone) {
      novosErros.telefone = "Telefone obrigatório";
    } else if (telefone.length !== 10 && telefone.length !== 11) {
      novosErros.telefone = "Telefone inválido";
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    await onSubmit({
      nome: nomeLimpo,
      email: emailLimpo,
      telefone,
    });
  };

  const inputBase =
    "w-full rounded-xl border px-4 py-3 outline-none transition duration-200 bg-white text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

  const inputNormal =
    "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-900/30";

  const inputErro =
    "border-red-500 ring-2 ring-red-100 dark:ring-red-900/40";

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900 dark:ring-gray-800">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {clienteEditando ? "Editar cliente" : "Novo cliente"}
        </h2>

        {clienteEditando && (
          <button
            type="button"
            onClick={cancelarEdicao}
            className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancelar edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            disabled={loading}
            className={`${inputBase} ${erros.nome ? inputErro : inputNormal} ${loading ? "opacity-70" : ""}`}
            placeholder="Nome"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erros.nome) clearErro("nome");
            }}
          />
          {erros.nome && <p className="mt-1 text-sm text-red-500">{erros.nome}</p>}
        </div>

        <div>
          <input
            disabled={loading}
            className={`${inputBase} ${erros.email ? inputErro : inputNormal} ${loading ? "opacity-70" : ""}`}
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (erros.email) clearErro("email");
            }}
          />
          {erros.email && <p className="mt-1 text-sm text-red-500">{erros.email}</p>}
        </div>

        <div>
          <input
            disabled={loading}
            className={`${inputBase} ${erros.telefone ? inputErro : inputNormal} ${loading ? "opacity-70" : ""}`}
            placeholder="Telefone"
            value={formatarTelefone(telefone)}
            onChange={(e) => {
              setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11));
              if (erros.telefone) clearErro("telefone");
            }}
          />
          {erros.telefone && (
            <p className="mt-1 text-sm text-red-500">{erros.telefone}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          )}
          <span>{clienteEditando ? "Atualizar" : "Cadastrar"}</span>
        </button>
      </form>
    </section>
  );
}