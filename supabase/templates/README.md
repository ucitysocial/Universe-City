# Universe City Auth Email Templates

These templates are for Supabase Auth.

## Sender

Recommended display name:

```
Universe City
```

Recommended From address:

```
management@ucitysocial.com
```

Result:

```
Universe City <management@ucitysocial.com>
```

The sender address requires custom SMTP in Supabase Auth.

## Subjects

Use short transactional subjects:

- Confirm signup — `Welcome to Universe City`
- Reset password — `Reset your Universe City password`
- Magic link — `Your Universe City sign-in link`
- Invite user — `Your Universe City invitation`
- Change email — `Confirm your new Universe City email`
- Reauthentication — `{{ .Token }} is your Universe City verification code`
- Password changed — `Your Universe City password was changed`
- Email address changed — `Your Universe City email was changed`
- Phone number changed — `Your Universe City phone number was changed`
- Sign-in method linked — `A sign-in method was linked to your Universe City account`
- Sign-in method removed — `A sign-in method was removed from your Universe City account`
- MFA method added — `A verification method was added to your Universe City account`
- MFA method removed — `A verification method was removed from your Universe City account`

## Template mapping

- Confirm signup → `confirmation.html`
- Reset password → `recovery.html`
- Magic link → `magic_link.html`
- Invite user → `invite.html`
- Change email → `email_change.html`
- Reauthentication → `reauthentication.html`
- Password changed notification → `password_changed.html`
- Email address changed notification → `email_changed.html`
- Phone number changed notification → `phone_changed.html`
- Sign-in method linked notification → `identity_linked.html`
- Sign-in method removed notification → `identity_unlinked.html`
- MFA method added notification → `mfa_factor_enrolled.html`
- MFA method removed notification → `mfa_factor_unenrolled.html`

## Hosted Supabase setup

For the hosted project, configure the templates under Supabase Authentication email settings.

For the sender, enable Custom SMTP under Supabase Authentication SMTP settings and use the SMTP credentials supplied by the chosen transactional email provider.

Recommended production approach:

1. Verify `ucitysocial.com` with a transactional email provider such as Resend or Postmark.
2. Keep the existing Google Workspace mailbox for `management@ucitysocial.com`.
3. Configure Supabase Auth to send through the transactional provider's SMTP server.
4. Set sender name to `Universe City`.
5. Set sender email to `management@ucitysocial.com`.
6. Publish the provider's SPF/DKIM records in DNS.
7. If an SPF TXT record already exists for Google Workspace, merge the new provider include into that one record rather than creating a second SPF record.
8. Add/verify DMARC.

Using a transactional provider does not move the mailbox away from Google Workspace. It only authorizes the provider to send authentication mail using the Universe City domain.

## Branding principle

Auth email is transactional, not marketing.

Keep:
- one action
- short copy
- no promotional sections
- restrained department-color stripe
- black / white / ivory
- account / membership / resident language

Avoid:
- resident-facing "File" language
- multiple CTAs
- marketing banners
- heavy image assets
- emoji-heavy subjects
- long product descriptions
