# Flui branding assets

Assets uploaded to the OIDC provider at bootstrap by `OidcIdentityBranding`. They are applied to the org `LabelPolicy` and activated on the hosted login page.

## Required files

File names are **fixed** — the uploader looks them up by exact path.

| File | Where it shows up | Format | Recommended size | Background | Notes |
|---|---|---|---|---|---|
| `logo-light.png` | Large logo above the login form (light theme) | PNG, 24-bit + alpha | 280 × 80 px (≤ 200 KB) | Transparent | Designed for light background (`#FAFAFA`). Bake in any padding you want — the provider adds none. |
| `logo-dark.png` | Large logo above the login form (dark theme) | PNG, 24-bit + alpha | 280 × 80 px (≤ 200 KB) | Transparent | Light/positive variant for dark background (`#1F1F22`). |
| `icon-light.png` | Browser tab favicon + small icon in some provider screens (light theme) | Square PNG | 192 × 192 px (≤ 50 KB) | Transparent | Compact mark. Must stay legible at 16 × 16 px. |
| `icon-dark.png` | Favicon + small icon (dark theme) | Square PNG | 192 × 192 px (≤ 50 KB) | Transparent | Dark-theme variant. |

> **`favicon.ico`**: not uploaded. The provider derives the browser favicon from `icon-light.png`. You can keep it in this folder for other consumers (e.g. flui.web standalone), but the bootstrap ignores it.

## Provider constraints

- Only PNG/JPG are accepted by the asset API (`/assets/v1/org/policy/label/...`). No SVG.
- Per-file limit: ~1 MB. Larger payloads return HTTP 413.
- Missing files are skipped with a warning — they don't fail the bootstrap. Safe to add files progressively.

## How they get published

1. At OIDC provider bootstrap (or via `POST /auth/branding/resync` on already-bootstrapped clusters), `OidcIdentityBranding` hashes all present bytes plus the colors, compares it against the `flui-branding-version` value stored in org metadata, and if it differs re-uploads every asset and activates the policy.
2. Idempotent: subsequent restarts are no-ops when nothing changed.

## Colors

Policy colors are configured via env (sensible defaults baked in):

```
FLUI_BRANDING_PRIMARY_COLOR        # default #5B6CFF
FLUI_BRANDING_PRIMARY_COLOR_DARK   # default #7C8BFF
FLUI_BRANDING_BG_COLOR             # default #FAFAFA
FLUI_BRANDING_BG_COLOR_DARK        # default #1F1F22
FLUI_BRANDING_WARN_COLOR           # default #CD3D56
FLUI_BRANDING_FONT_COLOR           # default #1D1D1F
```

`disableWatermark` is forced to `true` (removes the "powered by Zitadel" footer from the hosted login page).FF