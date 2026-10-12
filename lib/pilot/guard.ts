// Checks the server runs on words. None of them trusts the language model.
//
// The model names the words a File entry rests on. These functions decide whether the resident
// wrote those words, in one sentence, as a plain statement. They are a second line behind the
// model's own judgment. Where they are unsure they refuse, and the entry is asked about first.

/** Lower case, plain quotes, single spaces. */
export function plain(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'.,;:!?]+|[\s"'.,;:!?]+$/g, '')
    .trim();
}

/** Words only. Punctuation is dropped, so a comma the model left out does not fail a match. A clock colon stays. */
function loose(s: string): string {
  return plain(s)
    .replace(/[^a-z0-9':\s]/g, ' ')
    .replace(/:(?!\d)/g, ' ')
    .replace(/(?<!\d):/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The message, cut into sentences. A quote has to sit inside one of them. */
export function sentencesOf(message: string): string[] {
  return message
    .replace(/\r/g, '')
    .split(/\n+|(?<=[.!?])\s+(?=\S)/)
    .map(s => s.trim())
    .filter(Boolean);
}

// A break between two clauses that each have their own subject. A hedge in one does not reach the other.
const CLAUSE_BREAK = /\s+but\s+|\s+and\s+(?=(?:i|i'm|i'll|i've|i'd|we|we're|we'll|then i)\b)|\s+so\s+(?=(?:i|i'm|i'll|we)\b)|\s+then\s+(?=(?:i|i'm|i'll|we)\b)|\s+because\s+/g;

const HEDGE = /\b(might|maybe|perhaps|possibly|probably|i may|we may|may (?:go|stop|try|quit|take|do|have|need|switch|move|start|skip|get|be)|thinking (?:about|of)|thought about|considering|not sure|unsure|i guess|i suppose|should i|what if|wondering|wonder if|could (?:go|do|try|stop|take|quit|maybe)|kind of want|sort of want|if|unless|i don't know if|i do not know if|idk|hoping|hopefully|we'll see|we will see|depends|in theory)\b/;

// Words that mean another person is the source.
const REPORTED = /(?<!\bi )(?<!\bi've )(?<!\bwe )\b(said|says|told me|tells me|telling me|thinks|claims|claimed|according to|apparently|supposedly|rumor|heard that|i heard)\b/;

const NEGATION = /\b(not|no|never|didn't|did not|don't|do not|doesn't|does not|won't|will not|can't|cannot|couldn't|could not|wasn't|was not|weren't|were not|isn't|is not|aren't|are not|haven't|have not|hasn't|hadn't|ain't|skipped|skip|missed|forgot|bailed|canceled|cancelled|no longer|without)\b/;

// A question that asks software to act is a request. It is no question about a fact.
const REQUEST = /^(?:please\s+)?(?:can|could|would|will)\s+you\b|^(?:please\s+)?(?:put|add|schedule|move|change|take|remove|cancel|file|note|save|keep|remember|set|mark|plan|log|record)\b/;
const QUESTION_START = /^(?:(?:do|does|did|would|could|should|can|will|is|are|am|was|were|have|has|had)\s+(?:i|you|we|they|he|she|it|my|the|this|that|there)\b|(?:what|when|where|who|why|how)\b)/;

const TIME_WORD = /\d|\bnoon\b|\bmidnight\b|\bmidday\b/;

export type QuoteCheck =
  | { ok: true; said: string; sentence: string; clause: string }
  | { ok: false; why: 'missing' | 'not_in_message' | 'too_short' | 'tentative' | 'reported' | 'question' | 'negation_left_out' | 'negated' | 'no_time' };

export type QuoteRules = {
  minWords?: number;        // a quote shorter than this passes only when it is the whole sentence
  allowTentative?: boolean;
  allowNegation?: boolean;  // false for an entry that says a thing will happen or did happen
  needsTime?: boolean;      // the entry carries a clock time, so the resident's words have to carry one
};

/**
 * True when the quote is words the resident wrote in this message, inside one sentence, on word boundaries,
 * and the clause they sit in is a plain statement.
 */
export function checkQuote(quote: unknown, message: string, rules: QuoteRules = {}): QuoteCheck {
  if (typeof quote !== 'string' || !quote.trim()) return { ok: false, why: 'missing' };
  const q = loose(quote);
  if (!q) return { ok: false, why: 'missing' };
  const qWords = q.split(' ').length;

  for (const sentence of sentencesOf(message)) {
    // The sentence as words. Commas are dropped for matching, and their places are kept for the reach of a negation.
    const parts = sentence.split(',').map(loose).filter(Boolean);
    const s = parts.join(' ');
    const at = ` ${s} `.indexOf(` ${q} `);
    if (at < 0) continue;
    if (qWords < (rules.minWords ?? 3) && q !== s) return { ok: false, why: 'too_short' };
    const end = at + q.length;

    // The clause or clauses the quote sits in. A hedge anywhere in them reaches the quote.
    const breaks: { from: number; to: number }[] = [];
    let from = 0;
    for (const hit of s.matchAll(CLAUSE_BREAK)) {
      breaks.push({ from, to: hit.index ?? 0 });
      from = (hit.index ?? 0) + hit[0].length;
    }
    breaks.push({ from, to: s.length });
    const clause = breaks.filter(b => b.from < end && b.to > at).map(b => s.slice(b.from, b.to)).join(' ') || s;

    // A negation reaches as far as the next comma or clause break.
    const reach: string[] = [];
    let cursor = 0;
    for (const part of parts) {
      const pFrom = cursor;
      const pTo = cursor + part.length;
      cursor = pTo + 1;
      for (const b of breaks) {
        const lo = Math.max(pFrom, b.from);
        const hi = Math.min(pTo, b.to);
        if (lo < hi && lo < end && hi > at) reach.push(s.slice(lo, hi));
      }
    }
    const scope = reach.join(' ') || clause;

    const asked = /\?\s*$/.test(sentence.trim()) || QUESTION_START.test(s);
    if (asked && !REQUEST.test(s)) return { ok: false, why: 'question' };
    if (!rules.allowTentative && HEDGE.test(clause)) return { ok: false, why: 'tentative' };
    if (REPORTED.test(clause)) return { ok: false, why: 'reported' };
    if (NEGATION.test(scope)) {
      if (!NEGATION.test(q)) return { ok: false, why: 'negation_left_out' };
      if (rules.allowNegation === false) return { ok: false, why: 'negated' };
    }
    if (rules.needsTime && !TIME_WORD.test(s)) return { ok: false, why: 'no_time' };
    return { ok: true, said: quote.replace(/\s+/g, ' ').trim(), sentence, clause };
  }
  return { ok: false, why: 'not_in_message' };
}

/** True when the words sit in the message on word boundaries, inside one sentence. It judges nothing else. */
export function quotePresent(quote: unknown, message: string): boolean {
  if (typeof quote !== 'string') return false;
  const q = loose(quote);
  if (!q) return false;
  return sentencesOf(message).some(sentence => ` ${sentence.split(',').map(loose).filter(Boolean).join(' ')} `.includes(` ${q} `));
}

/** True when the quote sits in the message on word boundaries, inside one sentence. */
export function quoteIsIn(quote: unknown, message: string, minWords = 3): boolean {
  return checkQuote(quote, message, { minWords, allowTentative: true, allowNegation: true }).ok;
}

export function isTentative(textToCheck: string): boolean {
  return HEDGE.test(loose(textToCheck));
}

export function hasNegation(textToCheck: string): boolean {
  return NEGATION.test(loose(textToCheck));
}

const YES = /\b(yes|yeah|yep|yup|ya|sure|ok|okay|correct|right|confirm|confirmed|approve|approved|go ahead|do it|sounds good|looks good|looks right|that works|works for me|perfect|good|great|fine|please do|file it|add it|keep it|save it|exactly|absolutely|definitely|agreed|agree)\b/;
const NO = /\b(no|nope|nah|not|don't|do not|never|wait|hold on|cancel|stop|wrong|incorrect|decline|skip|leave it|forget it|scratch that|actually|instead)\b/;
const DROP = /\b(never mind|nevermind|drop|forget|cancel|no longer|don't need|do not need|not needed|skip|no need)\b/;

/**
 * The resident's answer to an item that waits for an answer.
 * A confirm needs a word of agreement and no word of refusal in the same sentence. A decline needs a word of refusal.
 */
export function checkAnswer(quote: unknown, message: string, decision: 'confirm' | 'decline' | 'drop'): { ok: true; said: string } | { ok: false; why: string } {
  const r = checkQuote(quote, message, { minWords: 1, allowTentative: true, allowNegation: true });
  if (!r.ok) {
    if (r.why === 'question') return { ok: false, why: 'The resident asked a question. A question answers no waiting item.' };
    return { ok: false, why: 'The quote is not in the resident\'s latest message.' };
  }
  const s = loose(r.sentence);
  if (decision === 'confirm') {
    if (HEDGE.test(s)) return { ok: false, why: 'The resident\'s answer is tentative.' };
    if (NO.test(s)) return { ok: false, why: 'The resident\'s sentence holds a word of refusal.' };
    if (!YES.test(s)) return { ok: false, why: 'The resident\'s sentence holds no word of agreement.' };
  } else if (decision === 'decline') {
    if (!NO.test(s)) return { ok: false, why: 'The resident\'s sentence holds no word of refusal.' };
  } else if (!DROP.test(s) && !NO.test(s)) {
    return { ok: false, why: 'The resident\'s sentence does not say to drop it.' };
  }
  return { ok: true, said: r.said };
}

// Words that mark a clock time as a rough one.
const ROUGH = /\b(around|about|roughly|approximately|ish|i think|maybe|probably|or so|something like)\b|\d\s?ish\b/i;

export function isRough(quote: string): boolean {
  return ROUGH.test(plain(quote));
}

function luhn(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function holdsCard(digits: string): boolean {
  for (let len = 19; len >= 13; len--) {
    for (let i = 0; i + len <= digits.length; i++) {
      if (luhn(digits.slice(i, i + len))) return true;
    }
  }
  return false;
}

const PHONE = /^\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}$/;
// After "my password is", these words start a remark about the password. They are no password.
const REMARK = /^(too|not|weak|strong|wrong|expired|old|new|the same|different|saved|stored|written|gone|lost|in|on|compromised|working|being|stuck|safe|secure|long|short|hard|easy|a|an|what|where|still|always|never|probably|something)\b/i;

/**
 * Language Standard 10.7.1. A government identification number, a payment card number,
 * a bank account number, and a password are never kept. They are taken out, in the common
 * ways they are written, before the message is stored.
 */
export function removeNumbers(text: string): { text: string; removed: string[] } {
  const removed = new Set<string>();
  let out = text;

  // A run of digits, with separators between them, that holds a valid payment card number.
  out = out.replace(/\d(?:[ .\-\t]{0,3}\r?\n?[ .\-\t]{0,3}\d){12,24}/g, m => {
    const d = m.replace(/\D/g, '');
    if (d.length >= 13 && holdsCard(d)) { removed.add('payment card number'); return '[payment card number removed]'; }
    return m;
  });

  out = out.replace(/\b\d{3}[-. ]\d{2}[-. ]\d{4}\b/g, () => {
    removed.add('government identification number');
    return '[government identification number removed]';
  });
  out = out.replace(/\b(ssn|social security(?: number)?|social|itin|tax id|ein)(\s*(?:number\s*)?(?:is|:|=|#)?\s*)(\d[\d\-. ]{7,12}\d)\b/gi, (_m, a, b) => {
    removed.add('government identification number');
    return `${a}${b}[government identification number removed]`;
  });
  out = out.replace(/\b(passport|driver'?s? licen[sc]e|licen[sc]e|state id|id card|green card|visa)((?:\s+(?:number|no\.?|#))?\s*(?:is|:|=|#)?\s*)([A-Z0-9][A-Z0-9\- ]{5,14})\b/gi, (m, a, b, c) => {
    if ((String(c).match(/\d/g) || []).length < 4) return m;
    removed.add('government identification number');
    return `${a}${b}[government identification number removed]`;
  });

  out = out.replace(/\b(account|acct|routing|iban|aba)((?:\s+(?:number|no\.?|#))?\s*(?:is|:|=|#)?\s*)([A-Z]{0,4}\d[\d -]{5,30}\d)\b/gi, (m, a, b, c) => {
    if (PHONE.test(String(c).trim())) return m;
    removed.add('bank account number');
    return `${a}${b}[bank account number removed]`;
  });

  // A password, up to the end of the clause, so a phrase of several words goes too.
  out = out.replace(/\b(password|passcode|passphrase|pw)\b([^.!?\n]{0,40}?)(\s+is\s*:?\s*|\s*[:=]\s*)([^.!?\n]+)/gi, (m, a, mid, sep, secret) => {
    const sec = String(secret).trim();
    if (!sec || REMARK.test(sec)) return m;
    removed.add('password');
    return `${a}${mid}${sep}[password removed]`;
  });
  out = out.replace(/\b(pin)((?:\s+(?:number|code))?\s*(?:is|:|=|#)?\s*)(\d{3,8})\b/gi, (_m, a, b) => {
    removed.add('password');
    return `${a}${b}[password removed]`;
  });

  return { text: out, removed: [...removed] };
}

/**
 * Language Standard 5.13. Text a resident reads holds no hyphen and no dash.
 * Applied to what the language model wrote, after the model has finished.
 */
export function cleanReply(text: string): string {
  let t = text;
  t = t.replace(/```[\s\S]*?```/g, m => m.replace(/```\w*\n?/g, ''));
  t = t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1');
  t = t.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  t = t.replace(/^\s*[-*•]\s+/gm, '');
  t = t.replace(/\s*[—–]\s*/g, ', ');
  t = t.replace(/(\d{1,2}(?::\d{2})?\s?(?:AM|PM)?)\s?-\s?(\d{1,2}(?::\d{2})?\s?(?:AM|PM))/gi, '$1 to $2');
  t = t.replace(/(\S) - (\S)/g, '$1, $2');
  t = t.replace(/([A-Za-z])-([A-Za-z])/g, '$1 $2');
  t = t.replace(/ ,/g, ',').replace(/,\s*,/g, ',').replace(/,\s*\./g, '.');
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}

export function clip(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`;
}

/** Where a quote sits in a message, counted in plain characters. Two quotes that overlap cover the same words. */
export function spanOf(quote: string, message: string): [number, number] | null {
  const m = loose(message);
  const q = loose(quote);
  if (!q) return null;
  const at = ` ${m} `.indexOf(` ${q} `);
  return at < 0 ? null : [at, at + q.length];
}
