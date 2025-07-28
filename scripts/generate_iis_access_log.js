// IIS風のECサイトアクセスログ生成スクリプト (200,000行)
import fs from 'fs';
import path from 'path';

// 設定
const TOTAL_RECORDS = 200000;
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'iis_access_log.csv');

// サンプルデータ
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
  'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
];

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
const httpStatusCodes = [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 500, 502, 503];
const statusWeights = [0.7, 0.05, 0.02, 0.03, 0.04, 0.05, 0.02, 0.01, 0.02, 0.04, 0.01, 0.005, 0.005];

// ECサイトの典型的なURLパス
const urlPaths = [
  '/',
  '/products',
  '/products/books',
  '/products/electronics',
  '/products/clothing',
  '/products/home-garden',
  '/products/sports',
  '/cart',
  '/checkout',
  '/login',
  '/register',
  '/account',
  '/search',
  '/api/products',
  '/api/cart',
  '/api/user',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/images/logo.png',
  '/favicon.ico'
];

const queryStrings = [
  '',
  '?category=books&page=1',
  '?category=electronics&sort=price',
  '?q=laptop&limit=20',
  '?user_id=12345',
  '?product_id=67890',
  '?utm_source=google&utm_medium=cpc',
  '?ref=homepage',
  '?lang=ja'
];

// IPアドレス生成
function generateIP() {
  const ranges = [
    [192, 168], [10, 0], [172, 16], // プライベートIP
    [203, 104], [210, 188], [133, 242], // 日本のパブリックIP例
    [8, 8], [1, 1] // 外部IP例
  ];
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return `${range[0]}.${range[1]}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// 重み付きランダム選択
function weightedRandom(items, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

// レスポンスサイズ生成（バイト）
function generateResponseSize(status, path) {
  if (status >= 400) return Math.floor(Math.random() * 1000) + 200; // エラーページ
  if (path.includes('.css')) return Math.floor(Math.random() * 50000) + 5000;
  if (path.includes('.js')) return Math.floor(Math.random() * 100000) + 10000;
  if (path.includes('.png') || path.includes('.jpg')) return Math.floor(Math.random() * 500000) + 10000;
  if (path.includes('api')) return Math.floor(Math.random() * 5000) + 100;
  return Math.floor(Math.random() * 20000) + 1000; // HTMLページ
}

// レスポンス時間生成（ミリ秒）
function generateResponseTime(status, path) {
  if (status >= 500) return Math.floor(Math.random() * 5000) + 1000; // サーバーエラー
  if (path.includes('api')) return Math.floor(Math.random() * 500) + 50;
  if (path.includes('search')) return Math.floor(Math.random() * 1000) + 200;
  return Math.floor(Math.random() * 300) + 50; // 通常ページ
}

// セッションID生成
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

console.log(`IISアクセスログ生成開始: ${TOTAL_RECORDS.toLocaleString()}行`);

// CSVヘッダー
const header = 'datetime,client_ip,method,url_path,query_string,http_version,status_code,response_size,response_time_ms,referer,user_agent,session_id,server_name\n';

let csvContent = header;
const startTime = new Date('2024-01-15T00:00:00Z'); // 24時間のログ

for (let i = 0; i < TOTAL_RECORDS; i++) {
  // 24時間の間に均等に分散（少しランダム性を加える）
  const timeOffset = (i / TOTAL_RECORDS) * 24 * 60 * 60 * 1000; // 24時間をミリ秒で
  const randomOffset = (Math.random() - 0.5) * 60000; // ±30秒のランダム
  const timestamp = new Date(startTime.getTime() + timeOffset + randomOffset);
  
  const clientIP = generateIP();
  const method = httpMethods[Math.floor(Math.random() * httpMethods.length)];
  const urlPath = urlPaths[Math.floor(Math.random() * urlPaths.length)];
  const queryString = queryStrings[Math.floor(Math.random() * queryStrings.length)];
  const httpVersion = Math.random() > 0.1 ? 'HTTP/1.1' : 'HTTP/2.0';
  const statusCode = weightedRandom(httpStatusCodes, statusWeights);
  const responseSize = generateResponseSize(statusCode, urlPath);
  const responseTime = generateResponseTime(statusCode, urlPath);
  const referer = Math.random() > 0.3 ? 'https://www.google.com/' : '-';
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const sessionId = Math.random() > 0.2 ? generateSessionId() : '-';
  const serverName = 'web-server-01';
  
  // ISO形式の日時文字列
  const datetimeStr = timestamp.toISOString().replace('T', ' ').substring(0, 19);
  
  const row = [
    datetimeStr,
    clientIP,
    method,
    urlPath,
    queryString,
    httpVersion,
    statusCode,
    responseSize,
    responseTime,
    `"${referer}"`,
    `"${userAgent}"`,
    sessionId,
    serverName
  ].join(',');
  
  csvContent += row + '\n';
  
  // 進捗表示
  if (i % 20000 === 0) {
    console.log(`進捗: ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} (${Math.round(i/TOTAL_RECORDS*100)}%)`);
  }
}

// ファイル書き込み
fs.writeFileSync(OUTPUT_FILE, csvContent);

console.log(`✅ IISアクセスログ生成完了!`);
console.log(`📁 ファイル: ${OUTPUT_FILE}`);
console.log(`📊 レコード数: ${TOTAL_RECORDS.toLocaleString()}行`);
console.log(`💾 ファイルサイズ: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
