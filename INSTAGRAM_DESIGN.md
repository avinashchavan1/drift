# FlowList — Instagram Design System

All colors in this app come exclusively from Instagram's approved palette.
**No other hex values are permitted in any source file.**

---

## Typography

Instagram uses the system font stack — no custom web fonts.

```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

Approved weights: **400** (body), **600** (semibold headings/labels).
Weight 500 is used sparingly only for interactive labels (buttons, active nav).

---

## Core Color Tokens

### Light Theme

| Token               | Value     | Usage                                      |
|---------------------|-----------|--------------------------------------------|
| `--bg`              | `#FFFFFF`  | Page background                            |
| `--surface`         | `#FFFFFF`  | Card / component background                |
| `--surface-hover`   | `#FAFAFA`  | Hovered rows, sidebar items                |
| `--surface-input`   | `#EFEFEF`  | Input fields, inactive chips, kbd          |
| `--border`          | `#DBDBDB`  | Dividers, card outlines, separators        |
| `--border-subtle`   | `#EFEFEF`  | Row separators inside cards                |
| `--border-strong`   | `#DBDBDB`  | Checkbox stroke, sheet outline             |
| `--text-primary`    | `#000000`  | Headings, task titles                      |
| `--text-secondary`  | `#737373`  | Subtitles, descriptions                    |
| `--text-muted`      | `#8E8E8E`  | Placeholder text, meta labels              |
| `--text-faint`      | `#C7C7C7`  | Counts, inactive dots, hints               |
| `--accent`          | `#0095F6`  | Primary CTAs, active states, links         |
| `--accent-bg`       | `#E0F1FF`  | Light tint behind accent icons             |
| `--accent-text`     | `#00376B`  | Accent text on light bg (WCAG AA)          |
| `--danger`          | `#FF3040`  | Delete hover, error states                 |
| `--danger-bg`       | `#FFF0F1`  | Light tint for error/overdue badges        |
| `--scrim`           | `rgba(0,0,0,0.50)` | Sheet backdrop                    |
| `--nav-bg`          | `#FFFFFF`  | Bottom navigation bar                      |

### Dark Theme

| Token               | Value     | Usage                                      |
|---------------------|-----------|--------------------------------------------|
| `--bg`              | `#000000`  | Page background                            |
| `--surface`         | `#121212`  | Elevated card background                   |
| `--surface-hover`   | `#1A1A1A`  | Hovered rows                               |
| `--surface-input`   | `#262626`  | Input fields, inactive chips               |
| `--border`          | `#262626`  | Separators, card outlines                  |
| `--border-subtle`   | `#1A1A1A`  | Row separators inside dark cards           |
| `--border-strong`   | `#363636`  | Checkbox stroke, stronger outlines         |
| `--text-primary`    | `#F5F5F5`  | Headings, task titles                      |
| `--text-secondary`  | `#A8A8A8`  | Subtitles, descriptions                    |
| `--text-muted`      | `#737373`  | Placeholder text, meta labels              |
| `--text-faint`      | `#3F3F3F`  | Counts, inactive dots, hints               |
| `--accent`          | `#0095F6`  | Primary CTAs, active states (same as light)|
| `--accent-bg`       | `#003352`  | Dark tint behind accent elements           |
| `--accent-text`     | `#0095F6`  | Accent text on dark bg                     |
| `--danger`          | `#FF3040`  | Delete hover, error states (same as light) |
| `--danger-bg`       | `#3D0A10`  | Dark tint for error/overdue badges         |
| `--scrim`           | `rgba(0,0,0,0.80)` | Sheet backdrop                    |
| `--nav-bg`          | `#000000`  | Bottom navigation bar                      |

---

## Instagram Brand Gradient

Used for category colour coding. These six colours are taken directly from
Instagram's iconic brand gradient (#FCAF45 → #FD1D1D → #E1306C → #C13584 → #833AB4 → #405DE6).

| Category   | Dot / Brand color | Light chip bg | Light chip text | Dark chip bg | Dark chip text |
|------------|-------------------|---------------|-----------------|--------------|----------------|
| `work`     | `#405DE6`         | `#ECEFFE`     | `#405DE6`       | `#0D1033`    | `#8B96E9`      |
| `personal` | `#833AB4`         | `#F4ECFA`     | `#833AB4`       | `#1E0733`    | `#C084FC`      |
| `social`   | `#C13584`         | `#FAECF4`     | `#C13584`       | `#330A1F`    | `#E07BB8`      |
| `health`   | `#E1306C`         | `#FDECF2`     | `#C13584`       | `#3D0A1A`    | `#F472B6`      |
| `finance`  | `#FD1D1D`         | `#FFF0EE`     | `#C0391B`       | `#3D0800`    | `#FC8A7A`      |
| `learning` | `#FCAF45`         | `#FEF7E8`     | `#B5740A`       | `#3D2800`    | `#FCAF45`      |

---

## Status Badge Colors

| Status     | Light bg   | Light text | Light border | Dark bg    | Dark text  | Dark border |
|------------|------------|------------|--------------|------------|------------|-------------|
| Overdue    | `#FFF0F1`  | `#FF3040`  | `#FFADB3`    | `#3D0A10`  | `#FF3040`  | `#7A1520`   |
| Today      | `#FFF7ED`  | `#FCAF45`  | `#FCAF45`    | `#3D2800`  | `#FCAF45`  | `#7A5000`   |
| Tomorrow   | `#E0F1FF`  | `#0095F6`  | `#93CFFA`    | `#003352`  | `#0095F6`  | `#004E7A`   |
| Future     | `#FAFAFA`  | `#737373`  | `#DBDBDB`    | `#1A1A1A`  | `#737373`  | `#262626`   |

---

## Group Section Colors

Taken from the overdue/today/future status colours above.

| Group    | Dot          | Label text  |
|----------|--------------|-------------|
| Overdue  | `#FF3040`    | `#FF3040`   |
| Today    | `#FCAF45`    | `#FCAF45`   |
| No deadline | `#737373` | `#737373`   |
| Upcoming | `#0095F6`    | `#0095F6`   |

---

## Rules

1. **Never** add a hex color that isn't listed in this document.
2. **Never** import a web font — use the system font stack.
3. All dynamic color values must be CSS custom properties (`var(--token)`).
4. Hardcoded `#ffffff` and `#000000` are allowed **only** for static icon/check colours
   that must remain white/black regardless of theme (e.g., white checkmark on blue button).
5. Box shadows use `rgba(0,0,0,α)` with `α ≤ 0.25` — no coloured shadows except
   `rgba(0,149,246,α)` for accent glows.
