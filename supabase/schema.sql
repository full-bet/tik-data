-- TikTok Analytics App Schema

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tiktok_open_id text not null unique,
  tiktok_username text,
  tiktok_display_name text,
  tiktok_avatar_url text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,

  -- 動画
  video_title text not null,
  video_url text,
  posted_at timestamptz,

  -- 台本
  script_content text,
  category text,
  hook text,

  -- 累計指標
  views bigint default 0,
  likes bigint default 0,
  followers_gained bigint default 0,
  cv_count bigint default 0,

  -- 初動（72h）指標
  initial_views bigint default 0,
  initial_likes bigint default 0,
  initial_followers_gained bigint default 0,
  initial_cv_count bigint default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.accounts enable row level security;
alter table public.items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'users_own_accounts') then
    create policy "users_own_accounts" on public.accounts for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_own_items') then
    create policy "users_own_items" on public.items for all using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists items_user_id_idx on public.items(user_id);
create index if not exists items_posted_at_idx on public.items(posted_at);

-- xlsx import tracking
create table if not exists public.analytics_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  imported_at timestamptz default now(),
  processed_at timestamptz,
  row_count integer default 0,
  status text default 'pending',
  error_message text,
  created_at timestamptz default now()
);

-- per-video rows from each import
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  import_id uuid references public.analytics_imports(id) on delete cascade not null,
  video_title text,
  video_id text,
  post_date text,
  views bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  reach bigint default 0,
  watch_time_mins numeric default 0,
  profile_views bigint default 0,
  new_followers bigint default 0,
  created_at timestamptz default now()
);

alter table public.analytics_imports enable row level security;
alter table public.analytics_snapshots enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'users_own_analytics_imports') then
    create policy "users_own_analytics_imports" on public.analytics_imports for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_own_analytics_snapshots') then
    create policy "users_own_analytics_snapshots" on public.analytics_snapshots for all using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists analytics_imports_user_id_idx on public.analytics_imports(user_id);
create index if not exists analytics_snapshots_import_id_idx on public.analytics_snapshots(import_id);
