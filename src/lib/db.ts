import * as duckdb from '@duckdb/duckdb-wasm';

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: '/duckdb/duckdb-mvp.wasm',
    mainWorker: '/duckdb/duckdb-browser-mvp.worker.js'
  },
  eh: {
    mainModule: '/duckdb-eh.wasm',
    mainWorker: '/duckdb-browser-eh.worker.js'
  }
};

export async function initDB() {
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  if (!bundle.mainWorker || !bundle.mainModule) {
    throw new Error('WASM バンドルのロードに失敗しました');
  }
  const worker = new Worker(bundle.mainWorker); // ← type: 'module' 指定は不要
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);

  return db;
}
