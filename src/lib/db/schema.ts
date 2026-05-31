import { pgTable, uuid, text, timestamp, bigint, integer, numeric } from 'drizzle-orm/pg-core'

export const accounts = pgTable('accounts', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  user_id:             uuid('user_id').notNull(),
  tiktok_open_id:      text('tiktok_open_id').notNull().unique(),
  tiktok_username:     text('tiktok_username'),
  tiktok_display_name: text('tiktok_display_name'),
  tiktok_avatar_url:   text('tiktok_avatar_url'),
  access_token:        text('access_token').notNull(),
  refresh_token:       text('refresh_token'),
  token_expires_at:    timestamp('token_expires_at', { withTimezone: true }),
  created_at:          timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:          timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const items = pgTable('items', {
  id:              uuid('id').primaryKey().defaultRandom(),
  user_id:         uuid('user_id').notNull(),
  account_id:      uuid('account_id'),
  tiktok_video_id: text('tiktok_video_id'),

  // 動画
  video_title: text('video_title').notNull(),
  video_url:   text('video_url'),
  posted_at:   timestamp('posted_at', { withTimezone: true }),

  // 台本
  script_content: text('script_content'),
  category:       text('category'),
  hook:           text('hook'),

  // 累計指標
  views:            bigint('views',            { mode: 'number' }).default(0),
  likes:            bigint('likes',            { mode: 'number' }).default(0),
  followers_gained: bigint('followers_gained', { mode: 'number' }).default(0),
  cv_count:         bigint('cv_count',         { mode: 'number' }).default(0),

  // 初動（72h）指標
  initial_views:            bigint('initial_views',            { mode: 'number' }).default(0),
  initial_likes:            bigint('initial_likes',            { mode: 'number' }).default(0),
  initial_followers_gained: bigint('initial_followers_gained', { mode: 'number' }).default(0),
  initial_cv_count:         bigint('initial_cv_count',         { mode: 'number' }).default(0),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const analyticsImports = pgTable('analytics_imports', {
  id:           uuid('id').primaryKey().defaultRandom(),
  user_id:      uuid('user_id').notNull(),
  filename:     text('filename').notNull(),
  imported_at:  timestamp('imported_at',  { withTimezone: true }).defaultNow(),
  processed_at: timestamp('processed_at', { withTimezone: true }),
  row_count:    integer('row_count').default(0),
  status:       text('status').default('pending'), // pending | processing | done | error
  error_message: text('error_message'),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id:               uuid('id').primaryKey().defaultRandom(),
  user_id:          uuid('user_id').notNull(),
  import_id:        uuid('import_id').notNull(),
  item_id:          uuid('item_id'),
  video_title:      text('video_title'),
  video_id:         text('video_id'),
  post_date:        text('post_date'),
  duration:         text('duration'),
  views:            bigint('views',        { mode: 'number' }).default(0),
  likes:            bigint('likes',        { mode: 'number' }).default(0),
  comments:         bigint('comments',     { mode: 'number' }).default(0),
  shares:           bigint('shares',       { mode: 'number' }).default(0),
  reach:            bigint('reach',        { mode: 'number' }).default(0),
  watch_time_mins:  numeric('watch_time_mins').default('0'),
  profile_views:    bigint('profile_views',{ mode: 'number' }).default(0),
  new_followers:    bigint('new_followers',{ mode: 'number' }).default(0),
  // TikTok Shop / commerce metrics
  gmv:              numeric('gmv').default('0'),
  direct_gmv:       numeric('direct_gmv').default('0'),
  items_sold:       bigint('items_sold',   { mode: 'number' }).default(0),
  // engagement rates (0–100 %)
  ctr:              numeric('ctr').default('0'),
  completion_rate:  numeric('completion_rate').default('0'),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const competitorVideos = pgTable('competitor_videos', {
  id:             uuid('id').primaryKey().defaultRandom(),
  user_id:        uuid('user_id').notNull(),
  tiktok_url:     text('tiktok_url').notNull(),
  title:          text('title'),
  account_name:   text('account_name'),
  category:       text('category'),
  script_content: text('script_content'),
  memo:           text('memo'),
  created_at:     timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:     timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
