import * as duckdb from '@duckdb/duckdb-wasm';

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: '/duckdb/duckdb-mvp.wasm',
    mainWorker: '/duckdb/duckdb-browser-mvp.worker.js'
  },
  eh: {
    mainModule: '/duckdb/duckdb-eh.wasm',
    mainWorker: '/duckdb/duckdb-browser-eh.worker.js'
  }
};

const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
if (!bundle.mainWorker || !bundle.mainModule) {
  throw new Error('WASM バンドルのロードに失敗しました');
}
const worker = new Worker(bundle.mainWorker);
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);

await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

// テストクエリ実行
const conn = await db.connect();
await conn.query(`
  CREATE TABLE people AS 
  SELECT * FROM read_csv_auto('https://duckdb-lab-ssatohworking.s3.ap-northeast-1.amazonaws.com/sample.csv')
`);
const result = await conn.query(`SELECT * FROM people`);
console.log('[Arrow Table Raw Result]', result);

// StructRow の配列を JSON へ変換
const rows = result.toArray().map(row => row.toJSON());
console.log('[Structured Rows as JSON]', rows);