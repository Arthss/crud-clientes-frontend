import initSqlJs from "sql.js";
import type { Database, SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { Cliente } from "../types/cliente";

let database: Database | null = null;
let initialization: Promise<Database> | null = null;

const clientesIniciais: Omit<Cliente, "id">[] = [
    {
        nome: "Ana Silva",
        email: "ana.silva@example.com",
        telefone: "11987654321",
    },
    {
        nome: "Bruno Santos",
        email: "bruno.santos@example.com",
        telefone: "11976543210",
    },
    {
        nome: "Carla Oliveira",
        email: "carla.oliveira@example.com",
        telefone: "11965432109",
    },
];

async function inicializarBanco(): Promise<Database> {
    const SQL: SqlJsStatic = await initSqlJs({
        locateFile: () => wasmUrl,
    });

    const db = new SQL.Database();

    db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL CHECK(length(trim(nome)) BETWEEN 3 AND 100),
      email TEXT NOT NULL COLLATE NOCASE UNIQUE
        CHECK(length(email) <= 150),
      telefone TEXT NOT NULL
        CHECK(length(telefone) IN (10, 11))
    )
  `);

    const resultado = db.exec("SELECT COUNT(*) AS total FROM clientes");
    const total = Number(resultado[0]?.values[0]?.[0] ?? 0);

    if (total === 0) {
        const inserir = db.prepare("INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)");

        try {
            for (const cliente of clientesIniciais) {
                inserir.run([cliente.nome, cliente.email, cliente.telefone]);
            }
        } finally {
            inserir.free();
        }
    }

    database = db;

    return db;
}

export function obterBanco(): Promise<Database> {
    if (database) {
        return Promise.resolve(database);
    }

    if (!initialization) {
        initialization = inicializarBanco().catch((error) => {
            initialization = null;
            throw error;
        });
    }

    return initialization;
}

export function consultarClientes<T>(sql: string, parametros: unknown[] = []): T[] {
    if (!database) {
        throw new Error("O banco de dados ainda não foi inicializado.");
    }

    const statement = database.prepare(sql);

    try {
        statement.bind(parametros as (string | number | null | Uint8Array)[]);

        const resultados: T[] = [];

        while (statement.step()) {
            resultados.push(statement.getAsObject() as T);
        }

        return resultados;
    } finally {
        statement.free();
    }
}

export function executarSql(sql: string, parametros: unknown[] = []): void {
    if (!database) {
        throw new Error("O banco de dados ainda não foi inicializado.");
    }

    database.run(sql, parametros as (string | number | null | Uint8Array)[]);
}
