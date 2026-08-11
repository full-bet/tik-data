-- 認証機能を撤廃し社内共有DBへ移行するため、旧 Supabase Auth 前提の
-- Row Level Security ポリシーを撤去し、RLSを無効化する。
DROP POLICY IF EXISTS "users_own_accounts" ON "accounts";
DROP POLICY IF EXISTS "users_own_items" ON "items";
DROP POLICY IF EXISTS "users_own_analytics_imports" ON "analytics_imports";
DROP POLICY IF EXISTS "users_own_analytics_snapshots" ON "analytics_snapshots";

ALTER TABLE "accounts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_imports" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_snapshots" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "competitors" DISABLE ROW LEVEL SECURITY;
