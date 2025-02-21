import 'node:path';
import 'node:fs';
import 'node:http';
import 'node:crypto';
import 'node:buffer';
import 'node:stream';
import 'node:util';
import 'node:url';
import 'node:querystring';
import 'node:events';
import 'node:string_decoder';
import 'node:zlib';
import 'node:os';
import 'node:net';
import { createClient } from '@supabase/supabase-js';
import app from './app';

// Cloudflare Workers用のfetchハンドラー
export default {
  async fetch(request, env, ctx) {
    // Supabaseクライアントの初期化
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );

    // グローバルにSupabaseクライアントを公開
    global.supabase = supabase;

    // デバッグ用（確認後は削除可）
    console.log('Supabase URL:', env.SUPABASE_URL);
    console.log('Supabase Key exists:', !!env.SUPABASE_ANON_KEY);

    return app(request);
  }
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 