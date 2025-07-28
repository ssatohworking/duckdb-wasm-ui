// 書籍販売ECサイトの売上データ生成スクリプト
const fs = require('fs');

// サンプルデータの定義
const bookCategories = ['小説', 'ビジネス', '技術書', '漫画', '実用書', '学習参考書', '雑誌', '児童書'];
const bookTitles = {
  '小説': ['夏目漱石全集', '芥川龍之介短編集', '村上春樹作品集', '東野圭吾ミステリー', '太宰治名作選'],
  'ビジネス': ['7つの習慣', 'ドラッカー経営学', 'リーン・スタートアップ', 'デザイン思考', '成功への道筋'],
  '技術書': ['JavaScript入門', 'Python実践ガイド', 'データベース設計', 'クラウド技術', 'AI・機械学習'],
  '漫画': ['ワンピース', '鬼滅の刃', '呪術廻戦', '進撃の巨人', 'ドラゴンボール'],
  '実用書': ['料理レシピ集', '健康管理法', 'DIY実践', 'ガーデニング入門', '投資入門'],
  '学習参考書': ['高校数学', '英語文法', '現代文読解', '物理基礎', '世界史'],
  '雑誌': ['週刊誌A', '月刊誌B', 'ファッション誌', 'IT情報誌', 'ビジネス週刊'],
  '児童書': ['世界名作劇場', '科学図鑑', '絵本シリーズ', '冒険小説', '学習漫画']
};

const prefectures = ['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '北海道', '福岡県', '静岡県'];
const paymentMethods = ['クレジットカード', 'コンビニ決済', '銀行振込', 'PayPay', 'Amazon Pay', '楽天ペイ'];
const customerAges = [18, 19, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65];

// ランダム値生成関数
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomPrice(category) {
  const priceRanges = {
    '小説': [800, 2500],
    'ビジネス': [1200, 3500],
    '技術書': [2500, 6000],
    '漫画': [500, 800],
    '実用書': [1000, 2800],
    '学習参考書': [1500, 4000],
    '雑誌': [300, 1200],
    '児童書': [600, 1800]
  };
  const [min, max] = priceRanges[category];
  return randomInt(min, max);
}

// CSVデータ生成
function generateSalesData(rows = 10000) {
  const headers = [
    'order_id',
    'order_date',
    'customer_id',
    'customer_age',
    'customer_prefecture',
    'book_title',
    'book_category',
    'unit_price',
    'quantity',
    'total_amount',
    'payment_method',
    'shipping_fee',
    'discount_amount',
    'final_amount'
  ];

  let csvContent = headers.join(',') + '\n';

  for (let i = 1; i <= rows; i++) {
    const orderId = `ORD${String(i).padStart(8, '0')}`;
    const orderDate = randomDate(new Date('2023-01-01'), new Date('2024-12-31'));
    const customerId = `CUST${String(randomInt(1, 5000)).padStart(6, '0')}`;
    const customerAge = randomChoice(customerAges);
    const customerPrefecture = randomChoice(prefectures);
    
    const bookCategory = randomChoice(bookCategories);
    const bookTitle = randomChoice(bookTitles[bookCategory]);
    const unitPrice = randomPrice(bookCategory);
    const quantity = randomInt(1, 5);
    const totalAmount = unitPrice * quantity;
    
    const paymentMethod = randomChoice(paymentMethods);
    const shippingFee = totalAmount >= 2000 ? 0 : 500;
    const discountAmount = Math.random() < 0.3 ? randomInt(100, 1000) : 0;
    const finalAmount = totalAmount + shippingFee - discountAmount;

    const row = [
      orderId,
      orderDate,
      customerId,
      customerAge,
      customerPrefecture,
      `"${bookTitle}"`,
      bookCategory,
      unitPrice,
      quantity,
      totalAmount,
      paymentMethod,
      shippingFee,
      discountAmount,
      finalAmount
    ];

    csvContent += row.join(',') + '\n';
  }

  return csvContent;
}

// ファイル生成
console.log('書籍販売ECサイトの売上データを生成中...');
const salesData = generateSalesData(10000);

// publicディレクトリに保存
fs.writeFileSync('../public/sales_data.csv', salesData);
console.log('sales_data.csv が生成されました！（10,000行）');

// 統計情報を表示
console.log('\n=== 生成データ統計 ===');
console.log('総行数: 10,000行');
console.log('カテゴリ数:', bookCategories.length);
console.log('都道府県数:', prefectures.length);
console.log('決済方法数:', paymentMethods.length);
console.log('期間: 2023-01-01 〜 2024-12-31');
