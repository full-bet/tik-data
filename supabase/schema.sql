-- TikTok Analytics App Schema

create table public.accounts (
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

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  category text,
  hook text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  script_id uuid references public.scripts(id) on delete set null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  tiktok_video_id text not null unique,
  tiktok_title text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

create table public.post_metrics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  recorded_at date not null,
  views bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  unique(post_id, recorded_at)
);

-- RLS
alter table public.accounts enable row level security;
alter table public.scripts enable row level security;
alter table public.posts enable row level security;
alter table public.post_metrics enable row level security;

create policy "users_own_accounts" on public.accounts for all using (auth.uid() = user_id);
create policy "users_own_scripts" on public.scripts for all using (auth.uid() = user_id);
create policy "users_own_posts" on public.posts for all using (auth.uid() = user_id);
create policy "users_own_metrics" on public.post_metrics for all using (
  exists (select 1 from public.posts where posts.id = post_metrics.post_id and posts.user_id = auth.uid())
);

-- Indexes
create index on public.posts(script_id);
create index on public.posts(account_id);
create index on public.post_metrics(post_id);
create index on public.post_metrics(recorded_at);
