# Claude Instructions

Follow `AGENTS.md` at the repository root before making any change.

Do not summarize the rules back to the user unless asked. Execute them.

Additional Claude-specific requirements:

- Do not work from memory when canonical Google Drive documentation exists.
- Do not revive superseded product decisions from old files or prior chats.
- Do not write directly to `main` for product work.
- Use one task branch and one pull request per logical change.
- Before changing intended behavior, identify the governing Drive document and determine whether it must be updated.
- Do not claim a Drive document, migration, deployment, or code change is complete unless the final external artifact/state has actually been verified.
- For DOCX work, verification means package integrity plus render/visual QA plus post-upload/download verification when applicable.
- Use American English (`en-US`) in Universe City canonical documentation and product copy.
- Never commit secrets or real environment values.