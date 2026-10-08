## What changed

Describe the change in plain language.

## Why

What problem or requirement does this address?

## Testing

- [ ] Relevant type checks/tests were run.
- [ ] The changed flow was manually reviewed where appropriate.
- [ ] No secrets or local-only files are included.

## Database / deployment impact

State `None` or describe migrations, environment variables, provider settings, or rollout steps.

## Documentation impact

**Governing Google Drive document(s):**

List the current canonical document(s) that govern this behavior.

Choose one:

- [ ] No doctrine change. This implementation change brings code into alignment with already-current documentation.
- [ ] Doctrine changed. The governing Drive document(s) were updated and verified.
- [ ] Documentation review required before merge.

**Master Index impact:**

- [ ] None.
- [ ] Updated because canonical document status/version/dependencies changed.
- [ ] Pending and blocks merge.

## Record / authority check

- [ ] Canonical/proposal/history boundaries remain correct or are explicitly addressed.
- [ ] Unknown values are not silently converted to confirmed values.
- [ ] Historical records are not destroyed merely because current truth changed.

## Ready to merge

- [ ] Code and canonical documentation agree.
- [ ] Any migration is committed.
- [ ] Any required external state was actually verified, not merely planned.