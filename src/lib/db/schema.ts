import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  bigint,
  unique,
} from 'drizzle-orm/pg-core'

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
  created_at:          timestamp('created_at',  { withTimezone: true }).defaultNow(),
  updated_at:          timestamp('updated_at',  { withTimezone: true }).defaultNow(),
})

export const scripts = pgTable('scripts', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    uuid('user_id').notNull(),
  title:      text('title').notNull(),
  content:    text('content'),
  category:   text('category'),
  hook:       text('hook'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const posts = pgTable('posts', {
  id:               uuid('id').primaryKey().defaultRandom(),
  user_id:          uuid('user_id').notNull(),
  script_id:        uuid('script_id'),
  account_id:       uuid('account_id').notNull(),
  tiktok_video_id:  text('tiktok_video_id').notNull().unique(),
  tiktok_title:     text('tiktok_title'),
  posted_at:        timestamp('posted_at', { withTimezone: true }),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const postMetrics = pgTable(
  'post_metrics',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    post_id:     uuid('post_id').notNull(),
    recorded_at: date('recorded_at').notNull(),
    views:       bigint('views',    { mode: 'number' }).default(0),
    likes:       bigint('likes',    { mode: 'number' }).default(0),
    comments:    bigint('comments', { mode: 'number' }).default(0),
    shares:      bigint('shares',   { mode: 'number' }).default(0),
  },
  t => [unique().on(t.post_id, t.recorded_at)]
)
