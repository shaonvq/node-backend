import knex from "knex";

const db = knex({
    client: "pg",
    connection: `postgres://postgres:${process.env.POSTGRES_PASSWORD}@postgres:5432/postgres`,
});

export default db;
