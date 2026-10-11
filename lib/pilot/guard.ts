// Checks the server runs on words. None of them trusts the language model.

/** Lower case, plain quotes, single spaces. Used to compare a quote with the message it came from. */
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

/**
 * True when the quote is words the resident wrote in this message.
 * The language model supplies the quote. The server holds the message.
 */
export function quoteIsIn(quote: unknown, message: string, minWords = 2): boolean {
  if (typeof quote !== 'string') return false;
  const q = plain(quote);
  if (!q) return false;
  if (q.split(' ').length < minWords) return false;
  return plain(message).includes(q);
}

// Words that make a sentence a thought. A thought is kept in the conversation. It is filed only when the resident confirms it.
const HEDGE = /\b(might|maybe|perhaps|possibly|probably|i may\b|may\s+(?:go|stop|try|quit|take|do|have|need|switch|move|start|skip)|thinking (?:about|of)|thought about|considering|not sure|unsure|i guess|i suppose|should i|what if|wondering|could (?:go|do|try|stop|take|quit)|kind of want|sort of want|if i (?:go|do|have|can|get|feel)|i don't know if|idk)\b/i;

export function isTentative(quote: string): boolean {
  return HEDGE.test(plain(quote));
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

/**
 * Language Standard 10.7.1. A government identification number, a payment card number,
 * a bank account number, and a password are never kept. They are taken out before the message is stored.
 */
export function removeNumbers(text: string): { text: string; removed: string[] } {
  const removed = new Set<string>();
  let out = text;

  out = out.replace(/\b(?:\d[ -]?){13,19}\b/g, m => {
    const d = m.replace(/\D/g, '');
    if (d.length >= 13 && d.length <= 19 && luhn(d)) { removed.add('payment card number'); return `[payment card number removed]${/\s$/.test(m) ? ' ' : ''}`; }
    return m;
  });

  out = out.replace(/\b\d{3}[- ]\d{2}[- ]\d{4}\b/g, () => {
    removed.add('government identification number');
    return '[government identification number removed]';
  });
  out = out.replace(/\b(ssn|social security(?: number)?|social)(\s*(?:is|:|#|number is)?\s*)(\d{9})\b/gi, (_m, a, b) => {
    removed.add('government identification number');
    return `${a}${b}[government identification number removed]`;
  });

  out = out.replace(/\b(account|acct|routing|iban)((?:\s+(?:number|no\.?|#))?\s*(?:is|:|#)?\s*)([A-Z]{0,4}\d[\d -]{5,30}\d)\b/gi, (_m, a, b) => {
    removed.add('bank account number');
    return `${a}${b}[bank account number removed]`;
  });

  out = out.replace(/\b(password|passcode|pin)(\s*(?:is|:|=)\s*)(\S+)/gi, (_m, a, b) => {
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
