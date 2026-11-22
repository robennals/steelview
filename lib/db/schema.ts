import { index, integer, pgTable, primaryKey, text, timestamp, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';

/*
 * The database holds readers and what they write: accounts, suggestions for
 * strengthening a viewpoint, and the discussion of each crux. Editorial
 * content never lives here; it is markdown in `content/`. An item a row is
 * about is named by its content id (topic slug, viewpoint id, crux id), which
 * the API checks against the loaded content before writing.
 */

// --- Auth.js tables, in the shape its Drizzle adapter expects ---

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  /** Shown with what the reader writes. Google supplies one; a reader who signs in by email sets their own. */
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date', withTimezone: true }),
  image: text('image'),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// --- Sign-in bookkeeping ---

/** A fixed-window rate limiter. Keys are namespaced, like "pin_request:<ip>". */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: timestamp('window_start', { mode: 'date', withTimezone: true }).notNull(),
});

/** Email PIN sign-in. One active PIN per email, replaced on each request. */
export const emailPins = pgTable('email_pins', {
  email: text('email').primaryKey(),
  pinHash: text('pin_hash').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  lastSentAt: timestamp('last_sent_at', { mode: 'date', withTimezone: true }).notNull(),
});

// --- Feedback ---

export const SUGGESTION_STATUSES = ['open', 'incorporated', 'answered'] as const;

/** Whether the moderation check passed a post, or it went up unchecked because the check could not run. Blocked posts are not stored. */
export const MODERATION_RESULTS = ['allowed', 'unchecked'] as const;
const moderation = () => text('moderation', { enum: MODERATION_RESULTS }).notNull().default('unchecked');

const createdAt = () => timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow();
/** Set by an editor to take something down; a hidden row is never shown. */
const hiddenAt = () => timestamp('hidden_at', { mode: 'date', withTimezone: true });
/** When the writer last changed what they wrote. */
const editedAt = () => timestamp('edited_at', { mode: 'date', withTimezone: true });

/**
 * A reader's suggestion for making a viewpoint stronger, about its whole case
 * (`card` null) or one card. The card's heading is kept as it read when the
 * suggestion was written, since headings are rewritten.
 */
export const suggestions = pgTable(
  'suggestions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topicSlug: text('topic_slug').notNull(),
    viewpointId: text('viewpoint_id').notNull(),
    card: integer('card'),
    cardHeading: text('card_heading'),
    body: text('body').notNull(),
    status: text('status', { enum: SUGGESTION_STATUSES }).notNull().default('open'),
    /** The editor's reply, once answered. */
    answer: text('answer'),
    moderation: moderation(),
    createdAt: createdAt(),
    editedAt: editedAt(),
    hiddenAt: hiddenAt(),
  },
  (t) => [index('suggestions_viewpoint_idx').on(t.topicSlug, t.viewpointId)],
);

/** A reader backing a suggestion. */
export const suggestionBackers = pgTable(
  'suggestion_backers',
  {
    suggestionId: uuid('suggestion_id')
      .notNull()
      .references(() => suggestions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.suggestionId, t.userId] })],
);

/** A comment in a crux's discussion, or (with `parentId`) a reply to one. Replies go one level deep. */
export const cruxComments = pgTable(
  'crux_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topicSlug: text('topic_slug').notNull(),
    cruxId: text('crux_id').notNull(),
    parentId: uuid('parent_id').references((): AnyPgColumn => cruxComments.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    moderation: moderation(),
    createdAt: createdAt(),
    editedAt: editedAt(),
    /** Set when the writer deletes a comment others have replied to: it stays, emptied, so the replies keep their place. */
    deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
    hiddenAt: hiddenAt(),
  },
  (t) => [index('crux_comments_crux_idx').on(t.topicSlug, t.cruxId)],
);

/** A reader marking a crux comment useful. */
export const commentUseful = pgTable(
  'comment_useful',
  {
    commentId: uuid('comment_id')
      .notNull()
      .references(() => cruxComments.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.commentId, t.userId] })],
);

/** A viewpoint a reader thinks a topic is missing. Read by editors; not shown on the page. */
export const viewpointSuggestions = pgTable('viewpoint_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  topicSlug: text('topic_slug').notNull(),
  title: text('title').notNull(),
  steps: text('steps').notNull(),
  holders: text('holders'),
  moderation: moderation(),
  createdAt: createdAt(),
});
