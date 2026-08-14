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

// role: 'cast' | 'editor' | 'operator' | 'broker' | 'shooter' | 'reviewer' | 'other'（1人が複数役割を持てる）
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
// 取引先（商材提供元法人）
// =========================================================================

export const clients = pgTable('clients', {
  id:             uuid('id').primaryKey().defaultRandom(),
  name:           text('name').notNull(),
  contact_name:   text('contact_name'),   // 担当者名
  contact_method: text('contact_method'), // 連絡方法・連絡先
  notes:          text('notes'),
  created_at:     timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:     timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// =========================================================================
// 商材
// =========================================================================

export const deals = pgTable('deals', {
  id:         uuid('id').primaryKey().defaultRandom(),
  client_id:  uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  name:       text('name').notNull(),
  unit_price: numeric('unit_price'),
  notes:      text('notes'),

  characteristics:     text('characteristics'),     // 商材の特徴
  selection_rationale: text('selection_rationale'), // この商材でテストを行う選定理由

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
// 素材（フォルダは物理階層を持たず、キャスト・商材・要素タグによるフィルタ表示で代替）
// =========================================================================

export const materials = pgTable('materials', {
  id:         uuid('id').primaryKey().defaultRandom(),
  title:      text('title').notNull(), // 選択したタグから生成されるファイル名
  file_url:   text('file_url'),
  notes:      text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// 素材に出演しているキャスト（複数可）
export const materialCasts = pgTable('material_casts', {
  id:             uuid('id').primaryKey().defaultRandom(),
  material_id:    uuid('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  cast_member_id: uuid('cast_member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
}, (t) => [unique().on(t.material_id, t.cast_member_id)])

// 素材が紐づく商材（複数可）
export const materialDeals = pgTable('material_deals', {
  id:          uuid('id').primaryKey().defaultRandom(),
  material_id: uuid('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  deal_id:     uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
}, (t) => [unique().on(t.material_id, t.deal_id)])

// どの投稿（items）でその素材が使われたか。演者は material_casts から辿る
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
// テスト（クリエイティブ施策。1本の動画に関わる全ての情報を書き留める単位）
// =========================================================================

export const tests = pgTable('tests', {
  id:      uuid('id').primaryKey().defaultRandom(),
  deal_id: uuid('deal_id').notNull().references(() => deals.id), // どの商材のテストか
  name:    text('name').notNull(), // 例:「test-1」

  what_how:            text('what_how'),            // このtestでやること - What & How
  account_persona:     text('account_persona'),     // 対象アカウント種別（例:「エリートチー牛アカウント」）
  account_id:          uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }), // 投稿先アカウントが確定したら
  win_condition:       text('win_condition'),        // 勝利条件
  premise:             text('premise'),              // 前提
  rationale:           text('rationale'),             // このtestをやると決めた背景 - Why
  completion_condition: text('completion_condition'), // 完了条件

  // スケジュール
  material_ready_at:          date('material_ready_at'),           // 素材準備完了
  script_review_requested_at: date('script_review_requested_at'),  // 台本レビュー依頼完了
  edit_completed_at:          date('edit_completed_at'),           // 編集完了
  video_review_requested_at:  date('video_review_requested_at'),   // 動画レビュー依頼完了
  posted_at:                  date('posted_at'),                   // 投稿完了

  competitor_id: uuid('competitor_id').references(() => competitors.id, { onDelete: 'set null' }), // 参考にしたベンチマーク動画
  script_id:     uuid('script_id').references(() => scripts.id, { onDelete: 'set null' }),          // 作成した台本
  item_id:       uuid('item_id').references(() => items.id, { onDelete: 'set null' }),              // 実際に投稿されたコンテンツ

  editor_member_id:        uuid('editor_member_id').references(() => members.id, { onDelete: 'set null' }), // 編集者
  edit_request_doc_url:    text('edit_request_doc_url'),    // 編集依頼書
  shooter_member_id:       uuid('shooter_member_id').references(() => members.id, { onDelete: 'set null' }), // 撮影者
  shooting_request_doc_url: text('shooting_request_doc_url'), // 撮影依頼書
  existing_material_drive_url: text('existing_material_drive_url'), // 既にある素材のdrive

  reviewer_member_id:  uuid('reviewer_member_id').references(() => members.id, { onDelete: 'set null' }), // レビュアー
  review_questions:    text('review_questions'),     // 質問・不安なところ
  review_focus_points: text('review_focus_points'),  // レビューしてほしい部分・レビュー時の注意点
  reviewer_feedback:   text('reviewer_feedback'),    // レビュアーからの総評

  caption: text('caption'), // キャプションなど
  notes:   text('notes'),   // その他自由記述

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// コメント方針（投稿直後に社内メンバーが行う仕込みコメント）
export const testSeedComments = pgTable('test_seed_comments', {
  id:           uuid('id').primaryKey().defaultRandom(),
  test_id:      uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  member_id:    uuid('member_id').references(() => members.id, { onDelete: 'set null' }), // 未定の場合はnull（コメント候補）
  comment_text: text('comment_text').notNull(),
  is_candidate: boolean('is_candidate').default(false), // 確定コメントではなく候補の場合true
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
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
  deal_id:      uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }), // どの商材のベンチマークか
  url:          text('url').notNull(),
  platform:     text('platform').default('tiktok'),
  video_title:  text('video_title'),
  creator_name: text('creator_name'),
  posted_at:    timestamp('posted_at', { withTimezone: true }),
  thumbnail_url: text('thumbnail_url'),
  appeal_angle: text('appeal_angle'),    // 訴求内容（例:「身長伸ばす成分訴求」）
  transcript:   text('transcript'),      // Whisper文字起こし（参考動画の文字起こし）
  hook:         text('hook'),            // AI抽出: 冒頭フック
  structure:    text('structure'),       // AI抽出: 構成（JSON文字列）
  cta:          text('cta'),             // AI抽出: CTA
  ai_summary:   text('ai_summary'),      // AI全体まとめ
  notes:        text('notes'),           // 手動メモ
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// 参考動画の分析インサイト（売れている/伸びている理由・改善点・類似動画との比較）
// kind: 'success_reason' | 'improvement_point' | 'comparison_note'
export const competitorInsights = pgTable('competitor_insights', {
  id:           uuid('id').primaryKey().defaultRandom(),
  competitor_id: uuid('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
  kind:         text('kind').notNull(),
  order_index:  integer('order_index').default(0),
  title:        text('title'),
  body:         text('body').notNull(),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// コマ割り（カット割り）。参考動画・作成する動画のどちらにも使う汎用カットリスト
// （competitor_id / test_id のどちらか一方を設定する）
// source_type: 'existing' | 'new_shoot' | 'stock' | 'rednote' | 'image_citation' | 'edit_generated' | 'reused' | 'needs_talent' 等
export const storyboardCuts = pgTable('storyboard_cuts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  competitor_id: uuid('competitor_id').references(() => competitors.id, { onDelete: 'cascade' }),
  test_id:       uuid('test_id').references(() => tests.id, { onDelete: 'cascade' }),
  cut_order:     integer('cut_order').notNull(),
  description:   text('description').notNull(),
  source_type:   text('source_type'),
  material_id:   uuid('material_id').references(() => materials.id, { onDelete: 'set null' }),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
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
