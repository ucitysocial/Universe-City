#!/usr/bin/env python3
"""Language Standard check.

Runs the countable checks in LANGUAGE_STANDARD.md section 11 (11.9 to 11.13,
plus retired terms from section 2) on every sentence a resident can read.

Usage:
    python3 scripts/language-check.py              # every page, summary
    python3 scripts/language-check.py --all        # print every failing sentence
    python3 scripts/language-check.py path.html    # one file
    python3 scripts/language-check.py --text FILE  # a plain text or markdown file

Exit code is 1 when the count is above zero.
"""
import glob
import html
import re
import sys

PLACEHOLDER = r"\b(anything|something|things|everything|someone|somewhere|various|several|certain|as needed)\b"
RULES = [
    ("6.8 placeholder word", re.compile(PLACEHOLDER, re.I)),
    ("6.9 prohibited verb", re.compile(
        r"\b(surfac(?:es|ed|ing)|captur(?:es|ed|ing)|unlock(?:s|ed|ing)?|leverag(?:e|es|ed|ing)|"
        r"enabl(?:es|ed|ing)|flag(?:s|ged|ging)|(?:it|agent|system|folder|this|that) (?:drives|powers|informs))\b", re.I)),
    ("6.11 contrast", re.compile(
        r"(,\s*not\b|\bnot\b[^.,;]{1,60},?\s+but\b|\bnot (?:just|only|merely|simply)\b|\binstead of\b|\brather than\b)", re.I)),
    ("6.13 sample list", re.compile(
        r"(\bor (?:an)?other\b|\band (?:an)?other\b|\band so on\b|\betc\b|\band more\b|\bsuch as\b|\bfor example\b|\blike [a-z]+, [a-z]+)", re.I)),
    ("5.13 hyphen or dash", re.compile(r"[—–]|\b[A-Za-z]{2,}-[A-Za-z]{2,}\b")),
    ("5.6 prohibited phrase", re.compile(
        r"\b(journey|empower\w*|unlock your potential|mindset|best self|level up|crush it|you(?:'ve| have) got this)\b", re.I)),
    ("5.8 names the channel", re.compile(r"\b(in the chat|chat history|the chat\b|by text\b|over text\b)", re.I)),
    ("2 retired term", re.compile(
        r"\b(membership|members?(?! of)|sign in|signed in|dashboard|workspace|forty eight systems|48 systems|"
        r"12 systems|choose a system|KPIs|Info Technology)\b", re.I)),
    ("7.5 prohibited button word", re.compile(r"^(continue|get started|next)$", re.I)),
]
# A hyphen inside these is a name or a code, not prose.
HYPHEN_OK = re.compile(r"\b(en-US|e-mail|[A-Z][a-z]+-[A-Z][a-z]+)\b")


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z\"“])", text) if s.strip()]


def static_lines(path):
    s = open(path, encoding="utf8").read()
    i = s.find("<body")
    s = s[i:] if i >= 0 else s
    js = " ".join(re.findall(r"<script[^>]*>([\s\S]*?)</script>", s))
    s = re.sub(r"<(script|style)[\s\S]*?</\1>", "\n", s)
    out = []
    t = re.sub(r"<br\s*/?>", " ", s)
    t = re.sub(r"</?(span|b|i|em|strong|u|small|a)\b[^>]*>", "", t)
    t = html.unescape(re.sub(r"<[^>]+>", "\n", t))
    out += [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    for m in re.finditer(r"'((?:[^'\\\n]|\\.){12,})'|\"((?:[^\"\\\n]|\\.){12,})\"|`([^`$]{12,})`", js):
        v = (m.group(1) or m.group(2) or m.group(3) or "").replace("\\'", "'")
        v = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", v))).strip()
        if " " in v and re.search(r"[a-z]{3,} [a-z]{2,}", v) and not re.search(r"[{};=]|querySelector|function|cubic-bezier|\bpx\b", v):
            out.append(v)
    return [l for l in out if len(l) > 1]


def tsx_lines(path):
    s = open(path, encoding="utf8").read()
    out = []
    for m in re.finditer(r">([^<>{}\n]*[A-Za-z][^<>{}\n]*)<", s):
        t = html.unescape(m.group(1)).strip()
        if len(t) > 1 and not re.search(r"=>|&&|\|\||;$", t):
            out.append(t)
    for m in re.finditer(r"(?<![\w/@.])'((?:[^'\\\n]|\\.){12,})'|\"((?:[^\"\\\n]|\\.){12,})\"|`([^`$]{12,})`", s):
        v = (m.group(1) or m.group(2) or m.group(3) or "").replace("\\'", "'").strip()
        if " " in v and re.search(r"[A-Za-z]{3,} [a-z]{2,}", v) and not re.search(r"^(use client|[@./])|className|[{};=<>]|\b(px|rem|rgba?|var\()", v):
            out.append(v)
    return out


def text_lines(path):
    out = []
    for l in open(path, encoding="utf8").read().split("\n"):
        l = l.strip()
        # Quoted failures, tables of retired words, and code are not prose.
        if not l or l.startswith(("INCORRECT", "DO NOT", "|", "#", "```", "COMPLIANT Time.")):
            continue
        if re.match(r"^(\d+\.)+\d* ?The (following|prohibited)", l) or "are prohibited" in l or "shall not appear" in l:
            continue
        out.append(re.sub(r"`[^`]*`", "", l))
    return out


def check(lines):
    hits = []
    seen = set()
    for line in lines:
        for s in sentences(line) or [line]:
            if s in seen:
                continue
            seen.add(s)
            for name, rx in RULES:
                if name.startswith("7.5"):
                    m = rx.search(s.strip())
                elif name.startswith("5.13"):
                    m = rx.search(HYPHEN_OK.sub("", s))
                elif len(s.split()) < 3 and not name.startswith("2 "):
                    m = None
                else:
                    m = rx.search(s)
                if m:
                    hits.append((name, m.group(0).strip(), s))
    return hits


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show_all = "--all" in sys.argv
    as_text = "--text" in sys.argv
    if args:
        files = args
    else:
        files = sorted(glob.glob("ucitysocial/*.html")) + sorted(
            f for f in glob.glob("app/**/*.tsx", recursive=True) + glob.glob("components/*.tsx")
            if "(agent)" not in f and "AgentRail" not in f and "DeskCards" not in f
        ) + sorted(glob.glob("supabase/templates/*.html"))
    total = 0
    by_rule = {}
    for f in files:
        if as_text or f.endswith((".md", ".txt")):
            lines = text_lines(f)
        elif f.endswith(".html"):
            lines = static_lines(f)
        else:
            lines = tsx_lines(f)
        hits = check(lines)
        if not hits:
            continue
        total += len(hits)
        print(f"\n{f}: {len(hits)}")
        for name, word, s in hits:
            by_rule[name] = by_rule.get(name, 0) + 1
            if show_all or len(files) == 1:
                print(f"  [{name}] ({word}) {s[:170]}")
    print("\nBy rule:")
    for name, n in sorted(by_rule.items(), key=lambda kv: -kv[1]):
        print(f"  {n:4d}  {name}")
    print(f"\nTotal: {total}")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
