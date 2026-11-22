/** What a suggestion is about: the viewpoint's whole case, or one of its cards (0-based). */
export type SuggestionAbout = { kind: 'whole' } | { kind: 'card'; card: number; heading: string };

export type SuggestionStatus = 'open' | 'incorporated' | 'answered';

/** A reader's suggestion for making a viewpoint stronger, as the page shows it. */
export type Suggestion = {
  id: string;
  about: SuggestionAbout;
  text: string;
  author: string;
  /** When it was written, as an ISO timestamp. */
  date: string;
  /** How many readers have backed it. */
  backers: number;
  /** Whether the reader looking at it has backed it. */
  backed: boolean;
  /** Whether the reader looking at it wrote it, and so may edit or delete it. */
  mine: boolean;
  /** Whether its writer has changed it since posting. */
  edited: boolean;
  status: SuggestionStatus;
  /** The editor's reply, for an answered suggestion. */
  answer?: string;
};

export type CruxReply = {
  id: string;
  author: string;
  date: string;
  text: string;
  /** Whether the reader looking at it wrote it. */
  mine: boolean;
  edited: boolean;
};

/** A comment in a crux's discussion, as the page shows it. Replies go one level deep. */
export type CruxComment = {
  id: string;
  author: string;
  date: string;
  text: string;
  /** How many readers found it useful. */
  useful: number;
  /** Whether the reader looking at it marked it useful. */
  markedUseful: boolean;
  /** Whether the reader looking at it wrote it. */
  mine: boolean;
  edited: boolean;
  /** Deleted by its writer, kept only so its replies keep their place: it has no author or text. */
  deleted: boolean;
  replies: CruxReply[];
};

/** The signed-in reader. `name` is what shows with what they write; until they set one, they cannot post. */
export type Reader = { name: string | null };

/** A topic's reader feedback: suggestions keyed by viewpoint id, discussions keyed by crux id. */
export type TopicFeedback = {
  suggestions: Record<string, Suggestion[]>;
  discussions: Record<string, CruxComment[]>;
};

/** What the topic page fetches: the feedback, and who is reading it. */
export type TopicFeedbackResponse = TopicFeedback & { reader: Reader | null };
