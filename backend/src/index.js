require('node:path');
require('node:fs');
require('node:http');
require('node:crypto');
require('node:buffer');
require('node:stream');
require('node:util');
require('node:url');
require('node:querystring');
require('node:events');
require('node:string_decoder');
require('node:zlib');
require('node:os');
require('node:net');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const app = require('./app');

const PORT = process.env.PORT || 3001;

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// グローバルにSupabaseクライアントを公開
global.supabase = supabase;

// デバッグ用（確認後は削除可）
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.SUPABASE_ANON_KEY);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 