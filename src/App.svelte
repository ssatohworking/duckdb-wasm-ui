<script lang="ts">
  import { onMount } from 'svelte';
  import { initDB } from './lib/db';
  import './app.css';

  // CSVファイルの選択肢を定義
  const csvOptions = [
    { 
      value: 'sample.csv', 
      label: 'サンプルデータ（テストデータ）', 
      defaultQuery: 'SELECT * FROM people LIMIT 10' 
    },
    { 
      value: 'sales_data.csv', 
      label: '売上データ（書籍ECサイト）', 
      defaultQuery: 'SELECT book_category, COUNT(*) as 注文数, SUM(final_amount) as 売上合計 FROM people GROUP BY book_category ORDER BY 売上合計 DESC' 
    },
    { 
      value: 'sales_data.csv', 
      label: '売上データ（日付別分析）', 
      defaultQuery: 'SELECT order_date, COUNT(*) as 注文数, SUM(final_amount) as 売上合計, AVG(final_amount) as 平均単価 FROM people GROUP BY order_date ORDER BY order_date DESC LIMIT 10' 
    },
    // 追加のCSVファイルはここに定義
  ];

  let selectedCsv = csvOptions[0];
  let filename = selectedCsv.value;
  let query = selectedCsv.defaultQuery;
  let results: any[] = [];
  let loading = false;
  let error: string | null = null;

  // CSVファイル変更時の処理
  function onCsvChange() {
    filename = selectedCsv.value;
    query = selectedCsv.defaultQuery;
  }

  // データ型判定とフォーマット関数
  
  // 数値判定関数
  function isNumericValue(value: any): boolean {
    if (value == null) return false;
    
    // プリミティブ数値型
    if (typeof value === 'number' && !isNaN(value)) return true;
    if (typeof value === 'bigint') return true;
    
    // DuckDB数値型
    if (value?.constructor?.name === 'DecimalBigNum') return true;
    
    // TypedArray（数値配列）
    if (value?.constructor && value.constructor.name.includes('Array') && value.length >= 1) {
      return isNumericValue(value[0]);
    }
    
    // 文字列数値（カンマ区切りを含む）
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // カンマを除去して数値判定
      const withoutCommas = trimmed.replace(/,/g, '');
      return trimmed !== '' && !isNaN(Number(withoutCommas));
    }
    
    return false;
  }

  // 日付判定関数
  function isDateValue(value: any): boolean {
    if (value == null) return false;
    
    // Date オブジェクト
    if (value instanceof Date) return true;
    
    // DuckDB日付型
    if (value?.constructor?.name?.includes('Date') || 
        value?.constructor?.name?.includes('Time')) return true;
    
    // DuckDBが返す日付値の特徴的なパターンを判定
    if (typeof value === 'number') {
      // より厳密な日付タイムスタンプの範囲チェック
      // 1990年～2050年の範囲に限定（より保守的に）
      const minTimestamp = 631152000000; // 1990-01-01
      const maxTimestamp = 2524608000000; // 2050-01-01
      
      // さらに、値が年単位で妥当かチェック（通常の金額などを除外）
      if (value >= minTimestamp && value <= maxTimestamp) {
        const date = new Date(value);
        // 日付として妥当で、かつ年が1990-2050の範囲内
        if (!isNaN(date.getTime()) && date.getFullYear() >= 1990 && date.getFullYear() <= 2050) {
          return true;
        }
      }
    }
    
    // ISO形式の文字列日付
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // YYYY-MM-DD 形式
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return true;
      // ISO datetime 形式
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) return true;
      // その他の日付形式をDateで解析
      const date = new Date(trimmed);
      return !isNaN(date.getTime()) && trimmed.length > 8; // 短すぎる文字列は除外
    }
    
    return false;
  }

  // 真偽値判定関数
  function isBooleanValue(value: any): boolean {
    if (typeof value === 'boolean') return true;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      return trimmed === 'true' || trimmed === 'false';
    }
    return false;
  }  // 数値フォーマット関数
  function formatNumericValue(value: any): string {
    // bigintの場合
    if (typeof value === 'bigint') {
      return value.toLocaleString();
    }
    
    // DuckDBのDecimalBigNum型の場合
    if (value?.constructor?.name === 'DecimalBigNum') {
      const numStr = value.toString();
      const num = Number(numStr);
      return !isNaN(num) ? num.toLocaleString() : numStr;
    }
    
    // TypedArrayの場合、最初の要素を取得
    if (value?.constructor && value.constructor.name.includes('Array') && value.length >= 1) {
      return formatNumericValue(value[0]);
    }
    
    // 数値の場合
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    // 文字列の場合、数値に変換してフォーマット
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const withoutCommas = trimmed.replace(/,/g, '');
      const num = Number(withoutCommas);
      if (!isNaN(num)) {
        return num.toLocaleString();
      }
    }
    
    return String(value);
  }

  // 日付フォーマット関数
  function formatDateValue(value: any): string {
    try {
      let date: Date;
      
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'number') {
        // DuckDBのタイムスタンプ（ミリ秒）として解釈
        date = new Date(value);
      } else if (typeof value === 'string') {
        date = new Date(value);
      } else if (value?.toString) {
        date = new Date(value.toString());
      } else {
        return String(value);
      }
      
      if (isNaN(date.getTime())) {
        return String(value);
      }
      
      // 時刻情報があるかチェック
      const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
      
      if (hasTime) {
        // 日時表示
        return date.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } else {
        // 日付のみ表示
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    } catch {
      return String(value);
    }
  }

  // 真偽値フォーマット関数
  function formatBooleanValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === 'true') return 'true';
      if (trimmed === 'false') return 'false';
    }
    return String(value);
  }

  async function runQuery() {
    loading = true;
    error = null;
    results = [];
    try {
      const db = await initDB();
      const conn = await db.connect();
      const csvUrl = `https://duckdb-lab-ssatohworking.s3.ap-northeast-1.amazonaws.com/${filename}`;

      await conn.query(`CREATE TABLE people AS SELECT * FROM read_csv_auto('${csvUrl}')`);
      const result = await conn.query(query);
      results = result.toArray().map((r) => r.toJSON());
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = 'Unknown error';
      }
    } finally {
      loading = false;
    }
  }
</script>

<div>
  <!-- ヘッダー -->
  <div class="header">
    <div class="container">
      <div class="header-content">
        <div class="header-icon">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 class="header-title">DuckDB Analytics</h1>
          <p class="header-subtitle">S3 CSV Query Tool</p>
        </div>
      </div>
    </div>
  </div>

  <!-- メインコンテンツ -->
  <div class="container main-content">
    <div class="grid">
      
      <!-- 左側：クエリ設定パネル -->
      <div>
        <div class="card">
          <div class="card-header">
            <h2>クエリ設定</h2>
          </div>
          
          <div class="card-content">
            <!-- CSVファイル選択 -->
            <div class="form-group">
              <label for="csv-select" class="form-label">データソース</label>
              <select 
                id="csv-select" 
                class="form-select"
                bind:value={selectedCsv}
                on:change={onCsvChange}
              >
                {#each csvOptions as option}
                  <option value={option}>{option.label}</option>
                {/each}
              </select>
            </div>

            <!-- SQLクエリ -->
            <div class="form-group">
              <label for="sql-query" class="form-label">SQLクエリ</label>
              <textarea 
                id="sql-query" 
                class="form-textarea"
                rows="6"
                bind:value={query}
                placeholder="SELECT * FROM people LIMIT 10"
              ></textarea>
            </div>

            <!-- 実行ボタン -->
            <button
              class="btn"
              on:click={runQuery}
              disabled={loading}
            >
              {#if loading}
                <div class="spinner"></div>
                <span>実行中...</span>
              {:else}
                <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>クエリ実行</span>
              {/if}
            </button>
          </div>
        </div>
      </div>

      <!-- 右側：結果表示エリア -->
      <div>
        <div class="card">
          <div class="card-header" style="background: #f9fafb; color: #111827;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h2>クエリ結果</h2>
              {#if results.length > 0}
                <span class="badge">{results.length} 件のレコード</span>
              {/if}
            </div>
          </div>
          
          <div class="card-content">
            {#if loading}
              <div class="text-center">
                <div class="spinner" style="margin: 0 auto 1rem;"></div>
                <p>クエリを実行中です...</p>
              </div>
              
            {:else if error}
              <div class="error-box">
                <svg style="width: 1.5rem; height: 1.5rem; color: #ef4444; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 style="font-weight: 500; color: #991b1b; margin: 0 0 0.25rem;">エラーが発生しました</h3>
                  <p style="color: #b91c1c; margin: 0;">{error}</p>
                </div>
              </div>
              
            {:else if results.length > 0}
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      {#each Object.keys(results[0]) as key}
                        <th>{key}</th>
                      {/each}
                    </tr>
                  </thead>
                  <tbody>
                    {#each results as row}
                      <tr>
                        {#each Object.entries(row) as [key, value]}
                          {#if isDateValue(value) || (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) && typeof value === 'number'}
                            <td class="text-center" 
                                style="text-align: center; font-family: monospace;">
                              {formatDateValue(value)}
                            </td>
                          {:else if isNumericValue(value)}
                            <td class="text-right" 
                                style="text-align: right; font-family: monospace; font-weight: 500;">
                              {formatNumericValue(value)}
                            </td>
                          {:else if isBooleanValue(value)}
                            <td class="text-center" 
                                style="text-align: center; font-weight: 500;">
                              {formatBooleanValue(value)}
                            </td>
                          {:else}
                            <td>
                              {value}
                            </td>
                          {/if}
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              
            {:else}
              <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <p style="font-weight: 500; color: #4b5563; margin: 0 0 0.25rem;">クエリを実行してデータを表示</p>
                  <p style="color: #6b7280; margin: 0;">左側のパネルからクエリを実行してください</p>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
      
    </div>
  </div>
</div>

<style>
  /* コンポーネント固有のスタイルがあればここに追加 */
</style>

