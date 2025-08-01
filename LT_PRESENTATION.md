# 🎤 LT発表用アーキテクチャ説明

## スライド1: 概要
```
🦆 DuckDB Analytics
「ブラウザでデータ分析を民主化」

従来: サーバー → データベース → 分析ツール
今回: ブラウザ完結！S3 → DuckDB WASM → 即座に結果
```

## スライド2: システム構成
```
┌─────────────┐    HTTPS    ┌─────────────────┐
│  Amazon S3  │────────────▶│   Webブラウザ   │
│             │             │                 │
│ • sample.csv│             │ ┌─────────────┐ │
│ • sales.csv │             │ │ DuckDB WASM │ │
│ • logs.csv  │◀────────────│ │ SQL Engine  │ │
│   (49MB)    │   read_csv  │ └─────────────┘ │
└─────────────┘             │ ┌─────────────┐ │
                            │ │ Svelte UI   │ │
                            │ │ 型判定+整形 │ │
                            │ └─────────────┘ │
                            └─────────────────┘
```

## スライド3: デモシナリオ
```
🎯 デモの流れ

1. 小さなサンプル(1KB) → クエリ実行 → 瞬時表示
2. 売上データ(100KB) → 集計クエリ → すぐ結果
3. ログデータ(49MB/20万行) → 複雑分析 → それでも高速！

「サイズが1000倍になっても同じ速度感」
```

## スライド4: 技術的なポイント
```
🚀 なぜ高速？

• DuckDB = 列指向データベース
• WebAssembly = ネイティブ並みの性能  
• Web Worker = UIブロックなし
• 型判定 = 自動で数値・日付・真偽値を識別
• 直接S3アクセス = サーバー経由不要
```

## スライド5: 実用性
```
📊 実際の現場で

• Webアクセスログ分析 (時間別、エラー別)
• ECサイト売上分析 (カテゴリ別、日別)  
• 大容量データもブラウザで瞬時分析
• SQLが書ければ誰でも使える
• インフラ不要でコスト削減
```

## 🎯 LT発表時のセリフ例

### オープニング (30秒)
「データ分析って、サーバーセットアップして、データベース構築して...面倒ですよね？
今日は**ブラウザだけ**で、49MBの大容量データも瞬時に分析できるツールを作ったので紹介します！」

### デモ中 (60秒)  
「S3にあるCSVファイルに、ブラウザから**直接SQLクエリ**を投げています。
DuckDB WebAssemblyが裏で動いて...ほら、20万行のアクセスログも瞬時に集計！
**サーバーゼロ**でこの速度です」

### クロージング (30秒)
「DuckDB WebAssemblyを使えば、インフラ不要でデータ分析を**民主化**できます。
GitHubで公開してるので、ぜひ試してみてください！」

## 📱 デモ用クエリ集

### 1. サンプルデータ (ウォームアップ)
```sql
SELECT * FROM people LIMIT 10
```

### 2. 売上データ (中規模)
```sql
SELECT book_category, 
       COUNT(*) as 注文数, 
       SUM(final_amount) as 売上合計 
FROM people 
GROUP BY book_category 
ORDER BY 売上合計 DESC
```

### 3. アクセスログ (大規模・インパクト重視)
```sql
SELECT strftime('%H', datetime) as 時間帯, 
       COUNT(*) as アクセス数,
       AVG(response_time_ms) as 平均応答時間ms
FROM people 
GROUP BY 時間帯 
ORDER BY 時間帯
```

### 4. エラー分析 (実用的)
```sql
SELECT url_path, 
       status_code, 
       COUNT(*) as エラー数 
FROM people 
WHERE status_code >= 400 
GROUP BY url_path, status_code 
ORDER BY エラー数 DESC 
LIMIT 20
```
