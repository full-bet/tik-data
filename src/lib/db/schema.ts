import { pgTable, uuid, text, timestamp, bigint, integer, numeric, date, boolean, unique } from 'drizzle-orm/pg-core'

// =========================================================================
// 人物マスタ（キャスト・編集者・運用者・仲介者などすべての関係者）
// =========================================================================

export const members = pgTable('members', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       text('name').notNull(),
  memo:       text('memo'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// role: 'cast' | 'editor' | 'operator' | 'broker' | 'other'（1人が複数役割を持てる）
export const memberRoles = pgTable('member_roles', {
  id:        uuid('id').primaryKey().defaultRandom(),
  member_id: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  role:      text('role').notNull(),
})

// キャスト詳細（members の1:1拡張）
export const castProfiles = pgTable('cast_profiles', {
  member_id:         uuid('member_id').primaryKey().references(() => members.id, { onDelete: 'cascade' }),
  referrer_member_id: uuid('referrer_member_id').references(() => members.id, { onDelete: 'set null' }), // 紹介者
  contact_method:    text('contact_method'),   // 連絡方法
  contact_person_id: uuid('contact_person_id').references(() => members.id, { onDelete: 'set null' }), // 連絡担当
  age:               integer('age'),
  gender:            text('gender'),
  exposure_range:    text('exposure_range'),   // 露出可能範囲
  ng_notes:          text('ng_notes'),         // NG事項・項目
  created_at:        timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// category: 'face' | 'skin' | 'body' | 'other'
export const castPhotos = pgTable('cast_photos', {
  id:              uuid('id').primaryKey().defaultRandom(),
  cast_member_id:  uuid('cast_member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  url:             text('url').notNull(),
  category:        text('category'),
  created_at:      timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// =========================================================================
// 商材
// =========================================================================

export const clients = pgTable('clients', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       text('name').notNull(),
  notes:      text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const deals = pgTable('deals', {
  id:         uuid('id').primaryKey().defaultRandom(),
  client_id:  uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  name:       text('name').notNull(),
  unit_price: numeric('unit_price'),
  notes:      text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// 仲介者・コミュニケーション担当（複数可）
export const dealContacts = pgTable('deal_contacts', {
  id:        uuid('id').primaryKey().defaultRandom(),
  deal_id:   uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  member_id: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  role_note: text('role_note'), // 例:「仲介者」
})

// 月毎の予算CV数
export const dealMonthlyTargets = pgTable('deal_monthly_targets', {
  id:               uuid('id').primaryKey().defaultRandom(),
  deal_id:          uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  target_month:     date('target_month').notNull(),
  budget_cv_count:  integer('budget_cv_count').default(0),
}, (t) => [unique().on(t.deal_id, t.target_month)])

// リアルタイム更新される累積CVの元ログ。月次累積は occurred_at で集計して算出する
export const dealCvEvents = pgTable('deal_cv_events', {
  id:          uuid('id').primaryKey().defaultRandom(),
  deal_id:     uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  occurred_at: timestamp('occurred_at', { withTimezone: true }).defaultNow(),
  cv_count:    integer('cv_count').default(1),
  source:      text('source'),
  note:        text('note'),
})

// =========================================================================
// 素材（フォルダは物理階層を持たず、cast_member_id / deal_id によるフィルタ表示で代替）
// =========================================================================

export const materials = pgTable('materials', {
  id:             uuid('id').primaryKey().defaultRandom(),
  title:          text('title').notNull(),
  file_url:       text('file_url'),
  file_type:      text('file_type'),
  cast_member_id: uuid('cast_member_id').references(() => members.id, { onDelete: 'set null' }),
  deal_id:        uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  notes:          text('notes'),
  created_at:     timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:     timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// どの投稿（items）でその素材が使われたか。演者は materials.cast_member_id から辿る
export const itemMaterials = pgTable('item_materials', {
  id:          uuid('id').primaryKey().defaultRandom(),
  item_id:     uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  material_id: uuid('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
})

// =========================================================================
// 端末登録・認証メアド
// =========================================================================

// owner_type: 'personal' | 'company'
export const devices = pgTable('devices', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  name:               text('name').notNull(), // 例: そらi15, そらiXR
  owner_type:         text('owner_type'),
  usage_note:         text('usage_note'),      // ログイン〜少しでも使う端末、の別
  assigned_member_id: uuid('assigned_member_id').references(() => members.id, { onDelete: 'set null' }),
  created_at:         timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const authEmails = pgTable('auth_emails', {
  id:         uuid('id').primaryKey().defaultRandom(),
  email:      text('email').notNull().unique(),
  notes:      text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// 認証メアドがログインしている端末（N:N）
export const authEmailDevices = pgTable('auth_email_devices', {
  id:            uuid('id').primaryKey().defaultRandom(),
  auth_email_id: uuid('auth_email_id').notNull().references(() => authEmails.id, { onDelete: 'cascade' }),
  device_id:     uuid('device_id').notNull().references(() => devices.id, { onDelete: 'cascade' }),
}, (t) => [unique().on(t.auth_email_id, t.device_id)])

// =========================================================================
// アカウント（SNSアカウント。旧 TikTok OAuth トークン保存用テーブルを統合）
// =========================================================================

export const accounts = pgTable('accounts', {
  id:                        uuid('id').primaryKey().defaultRandom(),
  auth_email_id:             uuid('auth_email_id').references(() => authEmails.id, { onDelete: 'set null' }),
  primary_operator_member_id: uuid('primary_operator_member_id').references(() => members.id, { onDelete: 'set null' }),

  platform:            text('platform').default('tiktok'),
  tiktok_open_id:      text('tiktok_open_id').unique(),
  tiktok_username:     text('tiktok_username'),
  tiktok_display_name: text('tiktok_display_name'),
  tiktok_avatar_url:   text('tiktok_avatar_url'),
  access_token:        text('access_token'),
  refresh_token:       text('refresh_token'),
  token_expires_at:    timestamp('token_expires_at', { withTimezone: true }),

  birthday:   date('birthday'),       // 登録誕生日
  tts_value:  text('tts_value'),      // tts
  ekyc_value: text('ekyc_value'),     // ekyc
  notes:      text('notes'),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// type: 'main' | 'reply'（1アカウントが両方を持てる＝重複可）
export const accountClassifications = pgTable('account_classifications', {
  id:               uuid('id').primaryKey().defaultRandom(),
  account_id:       uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  type:             text('type').notNull(),
  list_applied:     boolean('list_applied').default(false),
  list_applied_at:  timestamp('list_applied_at', { withTimezone: true }),
}, (t) => [unique().on(t.account_id, t.type)])

// =========================================================================
// コンテンツ（投稿動画。既存の items テーブルをそのまま「コンテンツ」の実体として拡張）
// =========================================================================

export const items = pgTable('items', {
  id:              uuid('id').primaryKey().defaultRandom(),
  account_id:      uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  deal_id:         uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }), // 紐付け商材
  script_id:       uuid('script_id').references(() => scripts.id, { onDelete: 'set null' }),
  tiktok_video_id: text('tiktok_video_id'),

  // 動画
  video_title: text('video_title').notNull(),
  video_url:   text('video_url'),
  posted_at:   timestamp('posted_at', { withTimezone: true }),

  // 台本（簡易メモ。構造化された台本は scripts テーブルを参照）
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

// =========================================================================
// 台本
// =========================================================================

export const scripts = pgTable('scripts', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  operator_member_id:  uuid('operator_member_id').references(() => members.id, { onDelete: 'set null' }), // 担当運用者名
  title:               text('title').notNull(),
  content:             text('content'),
  category:            text('category'),
  hook:                text('hook'),
  created_at:          timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:          timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// =========================================================================
// 使用AIツール（コンテンツ・台本それぞれとN:N）
// =========================================================================

export const aiTools = pgTable('ai_tools', {
  id:   uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
})

export const itemAiTools = pgTable('item_ai_tools', {
  id:         uuid('id').primaryKey().defaultRandom(),
  item_id:    uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  ai_tool_id: uuid('ai_tool_id').notNull().references(() => aiTools.id, { onDelete: 'cascade' }),
}, (t) => [unique().on(t.item_id, t.ai_tool_id)])

export const scriptAiTools = pgTable('script_ai_tools', {
  id:         uuid('id').primaryKey().defaultRandom(),
  script_id:  uuid('script_id').notNull().references(() => scripts.id, { onDelete: 'cascade' }),
  ai_tool_id: uuid('ai_tool_id').notNull().references(() => aiTools.id, { onDelete: 'cascade' }),
}, (t) => [unique().on(t.script_id, t.ai_tool_id)])

// =========================================================================
// 要素（横断検索用タグ。ハイブリッド方式：構造化カラム + ポリモーフィックタグ）
// =========================================================================

export const tags = pgTable('tags', {
  id:       uuid('id').primaryKey().defaultRandom(),
  name:     text('name').notNull(),
  category: text('category'),
}, (t) => [unique().on(t.name, t.category)])

// entity_type: 'member' | 'cast_profile' | 'deal' | 'material' | 'account' | 'item' | 'script' | 'device' 等
export const taggables = pgTable('taggables', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tag_id:      uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  entity_type: text('entity_type').notNull(),
  entity_id:   uuid('entity_id').notNull(),
  created_at:  timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [unique().on(t.tag_id, t.entity_type, t.entity_id)])

// =========================================================================
// 競合分析（既存機能。ユーザースコープを撤廃し社内共有に）
// =========================================================================

export const competitors = pgTable('competitors', {
  id:           uuid('id').primaryKey().defaultRandom(),
  url:          text('url').notNull(),
  platform:     text('platform').default('tiktok'),
  video_title:  text('video_title'),
  creator_name: text('creator_name'),
  posted_at:    timestamp('posted_at', { withTimezone: true }),
  thumbnail_url: text('thumbnail_url'),
  transcript:   text('transcript'),      // Whisper文字起こし
  hook:         text('hook'),            // AI抽出: 冒頭フック
  structure:    text('structure'),       // AI抽出: 構成（JSON文字列）
  cta:          text('cta'),             // AI抽出: CTA
  ai_summary:   text('ai_summary'),      // AI全体まとめ
  notes:        text('notes'),           // 手動メモ
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// =========================================================================
// xlsxインポート（既存機能。ユーザースコープを撤廃）
// =========================================================================

export const analyticsImports = pgTable('analytics_imports', {
  id:           uuid('id').primaryKey().defaultRandom(),
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
