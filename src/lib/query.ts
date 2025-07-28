import * as duckdb from '@duckdb/duckdb-wasm';

export async function queryCSV(db: duckdb.AsyncDuckDB, csvPath: string) {
  const conn = await db.connect();
  await conn.query(`
    CREATE TABLE data AS SELECT * FROM read_csv_auto('/sample.csv', AUTO_DETECT=TRUE);
  `);
  const result = await conn.query(`SELECT * FROM data`);
  return result.toArray();  // [{ id: 1, name: "Alice", ... }, ...]
}
