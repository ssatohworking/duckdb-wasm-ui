# 🦆 DuckDB Analytics - S3 CSV Query Tool

ブラウザ上でDuckDB WebAssemblyを使ってS3のCSVファイルに直接SQLクエリを実行できるWebアプリケーションです。

![DuckDB Analytics Screenshot](https://img.shields.io/badge/Status-Demo%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-Svelte%20%2B%20TypeScript%20%2B%20DuckDB%20WASM-blue)

## ✨ 特徴

- 🚀 **高速クエリ実行**: DuckDB WebAssemblyによる高性能な分析処理
- 📊 **S3直接アクセス**: サーバーを経由せずブラウザから直接S3のCSVファイルを読み込み
- 🎨 **モダンUI**: TailwindCSSによる青基調の美しいインターフェース
- 📱 **レスポンシブデザイン**: デスクトップ・タブレット・モバイル対応
- 🔢 **スマートフォーマット**: 数値の3桁区切り表示、日付の自動判定・整形
- 🎯 **型判定**: 数値・日付・真偽値を自動判定して適切に表示

## 🎪 デモデータ

以下のデータセットでクエリを試すことができます：

- **サンプルデータ**: テスト用の基本的なデータセット
- **売上データ（書籍ECサイト）**: カテゴリ別売上分析用データ
- **売上データ（日付別分析）**: 時系列分析用データ

## 🚀 セットアップ & 実行

### 必要な環境
- Node.js 18+
- npm または yarn

### インストール & 起動
```bash
# リポジトリをクローン
git clone https://github.com/ssatohworking/duckdb-wasm-ui.git
cd duckdb-wasm-ui

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

### ビルド
```bash
# プロダクション用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 🛠️ 技術スタック

- **フロントエンド**: Svelte + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS + PostCSS
- **データベース**: DuckDB WebAssembly
- **データソース**: Amazon S3 (CSV)

## 📁 プロジェクト構造

```
src/
├── App.svelte          # メインアプリケーション
├── app.css            # グローバルスタイル
├── main.ts            # エントリーポイント
└── lib/
    ├── db.ts          # DuckDB初期化
    ├── query.ts       # クエリ実行ロジック
    └── _duckdb-runner.ts # DuckDB実行環境
public/
├── duckdb-*.wasm      # DuckDB WebAssembly
└── *.csv              # サンプルデータ
```

## 💡 使い方

1. **データソースを選択**: プルダウンから分析したいCSVファイルを選択
2. **SQLクエリを入力**: テキストエリアにSQLを記述（デフォルトクエリも利用可能）
3. **クエリを実行**: 「クエリ実行」ボタンをクリック
4. **結果を確認**: テーブル形式で結果を表示、数値や日付は自動フォーマット

## 🎯 特徴的な機能

### 自動型判定・フォーマット
- **数値**: 3桁区切り表示、右寄せ
- **日付**: 自動判定してJST表示
- **真偽値**: true/false表示
- **行ストライプ**: 見やすい交互配色

### パフォーマンス最適化
- DuckDB WebAssemblyによる高速処理
- ブラウザ内完結でサーバー負荷なし
- 大容量CSVファイルにも対応

## 🎤 LT発表用

このプロジェクトはLT（Lightning Talk）発表のデモ用に作成されました。
- **テーマ**: ブラウザでのデータ分析の民主化
- **デモポイント**: S3→DuckDB→Webブラウザの流れるような処理

## 🤝 コントリビューション

Issue・PRは歓迎です！以下のような改善アイデアがあります：
- 新しいデータソースの追加
- UIの改善
- クエリテンプレートの追加
- エクスポート機能

## 📄 ライセンス

MIT License

## 🏗️ アーキテクチャ

システムの詳細な構成図とデータフローについては [ARCHITECTURE.md](./ARCHITECTURE.md) をご覧ください。

## 🔗 関連リンク

- [DuckDB](https://duckdb.org/) - 高性能分析データベース
- [Svelte](https://svelte.dev/) - モダンフロントエンドフレームワーク
- [Vite](https://vitejs.dev/) - 高速ビルドツール
