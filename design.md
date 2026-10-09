# PaceIQ: Design Document

Version: 1.0
Status: Proposed, for review
Related: `PRD.md`, `APP_FLOW.md`, `TECH_SPEC.md`

---

## 1. Design direction

PaceIQ should look like it belongs in the same visual world as a modern F1 fan app and a race-weekend social feed, while staying clearly its own product. The direction draws from three references, each assigned a specific role in the product:

| Reference | Role in PaceIQ | What we take from it |
|---|---|---|
| **Reference 1: Fan app screens (red, dark, driver-led)** | App shell, navigation, Races and Driver pages, standings-style lists | Deep red-to-black backgrounds, wide display headings, driver hero imagery with ghosted numbers, red slash markers, rounded cards, floating bottom navigation |
| **Reference 2: Telemetry dashboard (dark teal, data-first)** | Race Detail, Driver Explainer, Replay | Dark teal-black canvas, outlined panels with corner details, thin line charts, big numerals with small units, colour-coded status bars |
| **Reference 3: Race-weekend social cards (bold, colour-blocked)** | Share cards, badges, Game results, empty-state moments | Saturated colour blocks, halftone and sunburst textures, outlined display headlines, sticker-style accents, a bottom wordmark strip |

The three references do not need to appear on the same screen. A user should feel the same brand across all of them because the typography, spacing, and accent logic stay constant. Only the surface treatment changes between "app", "data", and "share".

### 1.1 Design principles

1. **Data first, decoration second.** Every decorative element must sit on a surface that is not carrying a number the user needs to read.
2. **One accent system.** Red is the primary accent. Teal is the secondary accent for data and charts. Everything else is neutral or team-driven.
3. **Predictions are estimates.** The visual language must never make a prediction look certain. Probabilities are shown as bars and percentages, never as bold verdicts.
4. **Mobile-first, dense on desktop.** The app is designed at 390px wide first, then expanded.
5. **Motion explains change.** Animation is used to show something updated, not for ambience.

## 2. Colour

### 2.1 Core tokens

All colours are defined as CSS custom properties on `:root`. The app is dark-first. A light theme is out of scope for v1.

| Token | Hex | Use |
|---|---|---|
| `--color-bg-base` | `#0B0B0D` | Page background (near black) |
| `--color-bg-red-deep` | `#2A0606` | Top of hero gradients, Races header |
| `--color-bg-red-mid` | `#5C0C0C` | Mid-gradient on hero and share card |
| `--color-bg-teal-deep` | `#0A1F1F` | Telemetry dashboard canvas |
| `--color-surface-1` | `#141417` | Cards |
| `--color-surface-2` | `#1C1C21` | Nested panels, table rows on hover |
| `--color-surface-outline` | `#2E2E36` | Hairline borders |
| `--color-text-primary` | `#F5F5F7` | Headings and key numbers |
| `--color-text-secondary` | `#B4B4BE` | Body and labels |
| `--color-text-muted` | `#7C7C88` | Captions, timestamps (use only on surface-1 or darker) |
| `--color-accent-red` | `#E10600` | Primary accent, slash markers, active nav, primary buttons |
| `--color-accent-red-hot` | `#FF3B30` | Hover and focus highlight on red elements |
| `--color-accent-teal` | `#2EE6C5` | Secondary accent, positive deltas, primary chart line |
| `--color-accent-teal-dim` | `#1A8C7A` | Chart secondary lines, grid emphasis |
| `--color-accent-amber` | `#FFB800` | Warnings, neutral status, midpoint in gauges |
| `--color-accent-orange` | `#FF8000` | Pole and highlight badges |
| `--color-status-success` | `#34C759` | Correct picks, completed states |
| `--color-status-danger` | `#FF453A` | Errors, DNF |
| `--color-status-info` | `#3671C6` | Information badges, links |

### 2.2 Telemetry status scale

Used on Race Detail and Driver Explainer for temperature, pressure, and delta indicators. The scale is cool to hot so that users read it without a legend.

| Level | Token | Hex |
|---|---|---|
| Cold | `--color-temp-cold` | `#3671C6` |
| Optimal | `--color-temp-optimal` | `#2EE6C5` |
| Warm | `--color-temp-warm` | `#FFB800` |
| Hot | `--color-temp-hot` | `#FF8000` |
| Critical | `--color-temp-critical` | `#E10600` |

### 2.3 Tyre compound colours

Used on stint timelines and lap-chart legends. Every compound also has a letter label (S, M, H, I, W) so colour is never the only signal.

| Compound | Token | Hex | Letter |
|---|---|---|---|
| Soft | `--color-tyre-soft` | `#E10600` | S |
| Medium | `--color-tyre-medium` | `#FFD12B` | M |
| Hard | `--color-tyre-hard` | `#F2F2F2` | H |
| Intermediate | `--color-tyre-inter` | `#34C759` | I |
| Wet | `--color-tyre-wet` | `#3671C6` | W |

### 2.4 Sector and lap colours

| Meaning | Token | Hex |
|---|---|---|
| Personal best | `--color-lap-pb` | `#34C759` |
| Overall best | `--color-lap-best` | `#A855F7` |
| Slower than best | `--color-lap-slower` | `#FFD12B` |

### 2.5 Team colours

Team colours are never hard-coded in components. They come from the `drivers.team_colour` field in the data. The UI must still work if a team colour is missing or too dark on a dark background. In that case, fall back to `--color-text-secondary` and add a thin coloured underline instead of a coloured fill.

### 2.6 Gradients

| Name | Definition | Use |
|---|---|---|
| `--gradient-hero` | `linear-gradient(160deg, #5C0C0C 0%, #2A0606 45%, #0B0B0D 100%)` | Race Detail and Driver hero backgrounds |
| `--gradient-telemetry` | `radial-gradient(ellipse at top, #0F3A3A 0%, #0A1F1F 55%, #061212 100%)` | Replay and Explainer canvas |
| `--gradient-card-sheen` | `linear-gradient(120deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 40%)` | Subtle highlight on cards |

Gradients are used only for backgrounds and hero areas, never behind body text longer than one line.

### 2.7 Contrast rules

- Body text on `--color-surface-1` must meet WCAG AA (4.5:1).
- `--color-text-muted` is only used for non-essential captions and must be checked on the actual background.
- Red text (`--color-accent-red`) on black is used only for large text or icons. For small red text, use `--color-accent-red-hot` or switch to white with a red marker.
- Teal on dark surfaces passes AA at all sizes used in the product.

## 3. Typography

### 3.1 Typefaces

| Role | Recommended family | Fallback stack | Why |
|---|---|---|---|
| Display | **Michroma** | `"Eurostile", "Arial Black", sans-serif` | Wide, squared letterforms that match the headings in Reference 1 and the social headlines in Reference 3 |
| Heading | **Saira** (SemiBold, Bold) | `"Titillium Web", "Segoe UI", sans-serif` | Condensed-enough for lists and card titles, clear at small sizes |
| Body | **Inter** | `system-ui, -apple-system, "Segoe UI", sans-serif` | Neutral, legible at small sizes, good for long text |
| Data and numerals | **JetBrains Mono** | `ui-monospace, "SFMono-Regular", Menlo, monospace` | Tabular figures for lap times, gaps, and telemetry |
| Social headline (outlined) | **Michroma** with stroke | same as display | Reuses display family for share cards |

All fonts load from Google Fonts, which the published-artifact CSP allows. For the local app, fonts are self-hosted in `frontend/public/fonts/` to avoid runtime dependency.

Final font choice is pending review. Michroma is proposed because it is the closest free match to the wide display type in Reference 1. Alternatives to test: Orbitron (more sci-fi), Exo 2 (less wide).

### 3.2 Type scale

Base size is 16px on mobile and 16px on desktop. Scale uses a modular ratio of 1.25.

| Token | Size (rem) | Line height | Family | Use |
|---|---|---|---|---|
| `--type-display-xl` | 2.75 | 1.1 | Display | Hero titles (driver name, race name on hero) |
| `--type-display-lg` | 2.0 | 1.15 | Display | Page titles |
| `--type-heading-lg` | 1.5 | 1.25 | Heading | Section titles |
| `--type-heading-md` | 1.25 | 1.3 | Heading | Card titles |
| `--type-body-lg` | 1.0 | 1.5 | Body | Paragraphs |
| `--type-body-md` | 0.875 | 1.5 | Body | Secondary text |
| `--type-label` | 0.75 | 1.3 | Body, uppercase, letter-spacing 0.08em | Field labels, nav labels |
| `--type-data-xl` | 2.5 | 1.0 | Mono | Hero numerals (predicted position, points) |
| `--type-data-md` | 1.125 | 1.2 | Mono | Table numbers, lap times |
| `--type-data-sm` | 0.8125 | 1.2 | Mono | Gaps, deltas, units |

### 3.3 Typographic rules

- Display type is always uppercase or title case with letter-spacing 0.02em. Never all lowercase.
- Numbers in tables and telemetry always use `font-variant-numeric: tabular-nums` and the mono family.
- Units are smaller and muted (for example, `287` with `km/h` at `--type-data-sm`).
- Lap times use the format `M:SS.mmm`. Gaps use `+SS.mmm` or `+L` for lapped drivers.
- Driver names: full name on profile and detail pages, three-letter acronym in dense tables.
- Maximum line length for body text is 68 characters.

## 4. Shape, space, and elevation

### 4.1 Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Chips, badges, inputs |
| `--radius-md` | 12px | Cards, panels |
| `--radius-lg` | 20px | Hero cards, share cards on screen |
| `--radius-pill` | 999px | Filter pills, bottom nav active indicator |

### 4.2 Spacing

4px base grid. Tokens: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (24px), `--space-6` (32px), `--space-7` (48px), `--space-8` (64px).

Default card padding is `--space-4` on mobile and `--space-5` on desktop. Section gaps are `--space-6` on mobile and `--space-7` on desktop.

### 4.3 Elevation

Dark UI uses light edges more than shadows.

| Level | Treatment |
|---|---|
| 0 | Background only |
| 1 | `--color-surface-1` with `1px solid --color-surface-outline` |
| 2 | `--color-surface-2`, plus inner top highlight `inset 0 1px 0 rgba(255,255,255,0.04)` |
| 3 | Floating elements (bottom nav, toasts): `0 12px 32px rgba(0,0,0,0.6)` |

### 4.4 Signature shapes

These are the recognisable shapes that tie the three references together. Use them consistently and sparingly.

| Shape | Source | Spec | Where |
|---|---|---|---|
| **Slash marker** | Reference 1 | 3px-wide, 16px-tall, `--color-accent-red`, skewed 20° | Position rows, section headings, active nav |
| **Corner brackets** | Reference 2 | 12px L-shapes on the four corners of a panel, 1px `--color-accent-teal-dim` | Telemetry panels, Driver Explainer chart container |
| **Ghost number** | Reference 1 | Driver number at 180px display size, 6% opacity, positioned behind the driver cutout | Driver hero, share cards |
| **Halftone dot field** | Reference 3 | Radial dot pattern, 6px spacing, 12% opacity | Share cards only |
| **Sunburst rays** | Reference 3 | Conic-gradient ray pattern, 8% opacity | Share card backgrounds only |
| **Sticker star** | Reference 3 | Simple 5-point star, `--color-accent-amber`, soft glow | Badges and celebratory moments only |

Limit each screen to two signature shapes. Share cards may combine more, since they are displayed as standalone artwork.

## 5. Imagery

### 5.1 Driver imagery

Driver cutouts follow Reference 1: a transparent PNG of the driver placed over a tinted gradient, with the driver number as a ghost numeral behind.

Rules:
- Use only images the project has rights to use. Driver photos, helmets, and team kit are likely covered by third-party rights. See §11 before using any real imagery.
- Until rights are cleared, use an illustrated silhouette set or neutral placeholder cutouts that share the same framing, lighting direction, and crop.
- Cutouts are cropped at the waist on hero layouts and at the shoulders on list rows.
- Background tint is derived from the team colour at 40% opacity over `--color-bg-base`.

### 5.2 Car and telemetry imagery

- Top-down car diagrams (Reference 2) are drawn as simple line-art SVG so they can be recoloured and do not depend on any photo.
- Onboard video and photo imagery are out of scope for v1.

### 5.3 Track maps

- Track outlines are drawn as stroked SVG paths in `--color-text-primary` at 1.5px.
- Corner numbers are optional and shown only on the Replay page.
- Track outline data is not in OpenF1 in the form needed, so v1 uses a hand-simplified SVG per circuit, stored in `frontend/src/assets/tracks/`. This is a known gap. Circuits without an outline show a text-only header.

## 6. Data visualisation

### 6.1 Line charts (lap times, pace)

- Stroke width 2px, rounded joins.
- Primary line in `--color-accent-teal`. Comparison lines use team colours or the distinct palette in §6.4.
- Gridlines at 4% opacity white, horizontal only.
- Safety car and red flag laps shaded with a 6% opacity red band.
- Axis labels in `--type-label` uppercase.
- Hover shows a vertical guide line and a tooltip card with lap, time, compound, and delta to best.

### 6.2 Probability bars (podium probability)

- Horizontal bar, 8px tall, rounded ends.
- Fill in `--color-accent-teal` when probability is at least 0.5, otherwise `--color-accent-teal-dim`.
- Percentage label in `--type-data-sm` at the bar end.
- Always labelled "Estimated podium probability" on first use in a session.

### 6.3 Stint timeline

- One row per driver, 20px tall bars.
- Segments coloured by compound (§2.3) with the letter label inside each segment when wide enough.
- Pit stops marked as a 2px vertical tick above the bar.

### 6.4 Multi-series palette

Used when comparing up to six drivers on one chart. These colours are for comparison only and do not replace team colours.

| Index | Hex |
|---|---|
| 1 | `#2EE6C5` |
| 2 | `#FF3B30` |
| 3 | `#FFD12B` |
| 4 | `#3671C6` |
| 5 | `#A855F7` |
| 6 | `#FF8000` |

### 6.5 Telemetry gauges

Used on Driver Explainer for tyre and brake temperatures (where the source data provides them) and for the model's feature contribution indicators.

- Horizontal bar with segmented ticks.
- Colour follows the telemetry status scale (§2.2).
- Numeric value always visible. Colour is never the only signal.

### 6.6 Contribution chart (SHAP)

- Diverging horizontal bars centred on the base value.
- Positive contributions (raising predicted position) in `--color-accent-red`; negative (lowering it) in `--color-accent-teal`. Note: for predicted position, lower is better, so this mapping is intentional and must be explained in the legend.
- Each bar labelled with feature name, value, and signed contribution.

## 7. Components

### 7.1 Navigation

**Mobile: floating bottom navigation** (Reference 1)
- Four items: Races, Standings, Game, Profile.
- Floating container, `--radius-pill`, `--elevation-3`, inset 16px from screen edges.
- Active item: `--color-accent-red` icon plus a small pill indicator behind the icon.
- Icons are outlined, 24px, 1.5px stroke.
- Labels are hidden on mobile. Every item has an `aria-label`.

**Desktop: left rail**
- 72px wide icon rail that expands to 220px on hover or focus.
- Same four items, same icons, same active treatment.

### 7.2 Race card

Used on Races page.

- Top row: round number in `--type-label`, status badge on the right.
- Title: Grand Prix name in `--type-heading-md`.
- Subtitle: circuit and date in `--type-body-md`, `--color-text-secondary`.
- Predicted podium: three small driver chips with team colour underline.
- For completed races: a result strip showing "Podium correct", "Partly correct", or "Missed", coloured with status tokens and always with text.
- Left edge: 3px slash marker in red when the race is upcoming and selected.

Status badges:

| Status | Background | Text |
|---|---|---|
| Upcoming | `--color-surface-2` | `--color-text-secondary` |
| Live | `--color-accent-red` | white, with pulsing dot |
| Completed | `--color-surface-2` | `--color-text-primary` |

### 7.3 Position row

Used on Race Detail (predicted and actual lists).

- Layout: position (display numerals), slash marker, driver acronym and full name, team strip, probability bar, actual position and delta on completed races.
- Height 64px mobile, 56px desktop.
- Hover and focus: `--color-surface-2` background and a 2px left border in `--color-accent-red`.
- Delta chip: teal for improvement, red for drop, neutral grey for zero. Text always shows sign and number.

### 7.4 Driver hero

Used on Driver Explainer and as the top of a driver profile.

- Full-width hero, height 320px mobile, 360px desktop.
- Background: team-tinted gradient plus ghost number.
- Cutout bottom-aligned, overlapping the content card by 24px.
- Name in `--type-display-lg`, team and nationality flag below.
- Key stats row: predicted position, podium probability, grid, points.

### 7.5 Stat row

Used on Driver hero and Game cards.

- Label left in `--type-label`, value right in `--type-data-md`.
- Separated by 1px `--color-surface-outline` dividers.
- Values use tabular numerals.

### 7.6 Explainer summary card

- Heading "Why this prediction".
- Three bullet-like rows, each with a slash marker, the feature name, its value, and a plain-language sentence from the template library.
- Footer line: "Model estimate. Not a guarantee."

### 7.7 Lap chart container

- Corner brackets (§4.4) on all four corners.
- Chart title in `--type-heading-md`, legend chips below the title.
- Chart area min height 240px mobile, 360px desktop.

### 7.8 Pick form (Game)

- Three numbered slots: P1, P2, P3. Each is a select showing team colour underline, driver acronym, and full name.
- Slot P1 uses the gold accent (`--color-accent-orange`) to echo the podium motif in Reference 3. P2 and P3 use neutral silver and bronze tints derived from `--color-text-secondary` and `--color-accent-orange` at reduced opacity. Silver and bronze are not new brand colours; they are tints only.
- Duplicate selection shows an inline error below the field.
- Submit button full-width on mobile, `--color-accent-red` background, white text, disabled state at 40% opacity.

### 7.9 Leaderboard row

- Rank in display numerals. Top three ranks use the P1, P2, P3 colour tints from §7.8.
- Username, points in `--type-data-md`, exact picks and podium hits as small chips.
- Current user row: slash marker and `--color-surface-2` background.

### 7.10 Buttons

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--color-accent-red` | `#FFFFFF` | none | Submit, Watch, primary CTA |
| Secondary | transparent | `--color-text-primary` | 1px `--color-surface-outline` | Secondary actions |
| Ghost | transparent | `--color-text-secondary` | none | Tertiary, inline |
| Destructive | `--color-status-danger` | `#FFFFFF` | none | Only for clearing a username |

All buttons have a minimum touch target of 44px, a visible focus ring (2px `--color-accent-teal`, 2px offset), and a press state that scales to 98%.

### 7.11 Empty, loading, and error states

- **Loading:** skeleton blocks in `--color-surface-2` with a slow left-to-right shimmer (2.4s, reduced under reduced-motion).
- **Empty:** a short line of text, one slash marker, and a single suggested action. Share-card-style imagery (Reference 3) may appear here as an illustration.
- **Error:** a surface-1 card with a red slash marker, a plain sentence, and a Retry button. Never show raw error codes.

### 7.12 Toasts

- Position: top on mobile, bottom-right on desktop.
- Max three visible. Auto-dismiss after 4 seconds, except errors.
- Success uses a teal left border; error uses red.

## 8. Share cards (Reference 3 treatment)

Share cards are the most expressive surface in the product. They are generated as standalone images and linked from the Game page.

### 8.1 Formats

| Format | Size | Use |
|---|---|---|
| Portrait | 1080 × 1350 px | Instagram feed and most social sharing |
| Square | 1080 × 1080 px | Cross-platform and messaging |
| Link preview | 1200 × 630 px | Open Graph and Twitter cards |

### 8.2 Card types

| Card | Headline (display, outlined) | Accent colour | Content |
|---|---|---|---|
| Pick scored | "PÓDIO" style headline, English: "PODIUM" or "PERFECT PICK" | Orange | User's three picks, the actual podium, points |
| Model call | "MODEL CALL" | Teal | Model's top three with probabilities |
| Race result | "RESULT" | Red | Actual podium, race name, date |
| Leaderboard | "TOP PICKS" | Amber | Top three usernames and points |

Headline words are chosen from a fixed list in `config.py` so copy stays consistent and can be translated later. Other headlines from Reference 3 (for example, "POLE", "FRONT ROW") map to PaceIQ equivalents such as "GRID LOCK", "FRONT ROW", "PERFECT".

### 8.3 Composition

- Background: one colour block (team or accent) with a diagonal split into a second block at 20% opacity.
- Halftone dot field (§4.4) on the upper-right quadrant at 12% opacity.
- Sunburst rays radiating from behind the headline at 8% opacity.
- Driver cutouts (§5.1) in the lower half, cropped at the waist, with a dark gradient at the bottom to hold the footer.
- Headline: display family, outlined text with a 3px stroke and a solid fill of white, or gradient fill from `--color-accent-teal` to `--color-accent-amber` for the "scored" card variant.
- Footer strip: "PaceIQ" wordmark on the left (see §8.4), "Model estimate · Unofficial fan project" on the right in `--type-label`.
- One optional sticker star (§4.4) placed near the headline, never more than two stickers per card.

### 8.4 PaceIQ wordmark

- Set in the display family, uppercase, letter-spacing 0.06em.
- Accent: the "IQ" in `--color-accent-teal`, the rest in `--color-text-primary`.
- A slash marker sits before the wordmark.
- Minimum clear space equals the height of the "P".
- Minimum size: 96px wide on screen, 24mm in print.

### 8.5 Export rules

- Rendered client-side from the card's data (no server-side image generation in v1).
- Text is always rendered as live text in the image, never baked into a photograph.
- The card includes a model version and generation date in the footer for transparency.

## 9. Motion

### 9.1 Principles

- Motion reveals change or confirms an action. It does not decorate.
- Durations are short: 150ms for micro-interactions, 250ms for panel transitions, 400ms for chart entrances.
- Easing: `cubic-bezier(0.2, 0, 0, 1)` for entrances, `cubic-bezier(0.4, 0, 1, 1)` for exits.

### 9.2 Specific motions

| Moment | Motion |
|---|---|
| Position row enters | Fade and move 8px up, staggered 30ms per row |
| Probability bar fills | Width animates from 0 over 400ms |
| Points or probabilities update | Count up over 300ms |
| Lap chart draws | Stroke draws left to right over 400ms |
| Live badge | Dot pulses at 1.2s interval |
| Share card preview | Subtle scale from 0.98 to 1 over 250ms |
| Pick submitted | Slash marker sweeps across the form row once (200ms) |

### 9.3 Reduced motion

When `prefers-reduced-motion: reduce` is set:
- All transitions become instant, except fades under 100ms.
- Count-up animations show the final value immediately.
- Shimmer is replaced by a static skeleton.
- Pulse is removed; the Live badge keeps its dot without animation.

## 10. Layout and responsiveness

### 10.1 Breakpoints

| Name | Min width | Layout |
|---|---|---|
| Mobile | 0 | Single column, bottom navigation, 16px side padding |
| Tablet | 768px | Two columns for lists, left rail navigation hidden |
| Desktop | 1120px | Left rail navigation, up to 1200px content width, 12-column grid |
| Wide | 1440px | Content max width 1280px, centred |

### 10.2 Page layouts

- **Races:** single column on mobile, two-column grid of race cards on tablet, three columns on desktop.
- **Race Detail:** hero summary on top, then predicted and actual tables side by side on desktop, stacked on mobile.
- **Driver Explainer:** driver hero full width, then explanation card and contribution chart side by side on desktop.
- **Replay:** chart full width on top, stint timeline below, driver selector as a horizontal scrolling chip row on mobile.
- **Game:** pick form and upcoming races in two columns on desktop; stacked on mobile.

### 10.3 Touch and density

- Minimum touch target 44px.
- Table rows on mobile collapse to cards at widths under 480px.
- Desktop tables use 56px rows; compact mode (48px) is an option in settings and is out of scope for v1.

## 11. Brand and legal guardrails

The references include official-looking F1 branding, team logos, and real driver photography. PaceIQ is an unofficial fan project, so the following rules apply:

1. **Do not use the official F1 logo, team logos, sponsor logos, or driver likenesses** in the product or in share cards without written permission. The visual language is inspired by these references; the marks themselves are not reused.
2. **Use neutral placeholders** for driver cutouts and team marks during development. Replace only after rights are confirmed.
3. **Team colours are factual data** and may be used. Do not reproduce team livery patterns.
4. **Typography and layouts** are not protected in the same way as logos and photos, but avoid copying a specific reference's exact composition.
5. **Attribution and disclaimer** appear in the footer of every page and on every share card (see §8.3).
6. **Language:** Reference 3 uses Portuguese headlines. PaceIQ's default language is English. Headline strings live in one file so they can be localised later without touching layouts.

## 12. Accessibility

- Every interactive element is reachable by keyboard, with a visible focus ring.
- Colour is never the only indicator: tyre compounds include letters, deltas include signs, statuses include text.
- Charts have a text summary and a data table alternative, toggled from a "Table view" button.
- Images have alt text. Decorative shapes (ghost numbers, halftone, sunburst) are marked `aria-hidden="true"`.
- Minimum body text 16px on mobile. Labels never smaller than 12px.
- Respect reduced motion (§9.3).
- Language attribute set on `<html>`. Screen reader labels for icon-only buttons.

## 13. Content and tone

- Plain, confident, and factual. Show the model's estimate and its basis; avoid hype.
- Use "predicted" and "estimated", never "will".
- Use Formula 1's common terms (pole, front row, podium, stint, pit) consistently.
- Keep sentences short on cards and buttons. Explanation text may run to two sentences.
- Headline words on share cards are short, uppercase, and drawn from the fixed list in §8.2.

## 14. Implementation notes

### 14.1 Tokens file

Tokens live in `frontend/src/styles/tokens.css` and are imported once in `main.tsx`. Components reference tokens only; they never use raw hex values.

```css
:root {
  /* Colour */
  --color-bg-base: #0B0B0D;
  --color-bg-red-deep: #2A0606;
  --color-bg-red-mid: #5C0C0C;
  --color-bg-teal-deep: #0A1F1F;
  --color-surface-1: #141417;
  --color-surface-2: #1C1C21;
  --color-surface-outline: #2E2E36;
  --color-text-primary: #F5F5F7;
  --color-text-secondary: #B4B4BE;
  --color-text-muted: #7C7C88;
  --color-accent-red: #E10600;
  --color-accent-red-hot: #FF3B30;
  --color-accent-teal: #2EE6C5;
  --color-accent-teal-dim: #1A8C7A;
  --color-accent-amber: #FFB800;
  --color-accent-orange: #FF8000;
  --color-status-success: #34C759;
  --color-status-danger: #FF453A;
  --color-status-info: #3671C6;

  /* Fonts */
  --font-display: "Michroma", "Eurostile", "Arial Black", sans-serif;
  --font-heading: "Saira", "Titillium Web", "Segoe UI", sans-serif;
  --font-body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-data: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;

  /* Shape */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;

  /* Motion */
  --duration-micro: 150ms;
  --duration-panel: 250ms;
  --duration-chart: 400ms;
  --ease-in: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-micro: 0ms;
    --duration-panel: 0ms;
    --duration-chart: 0ms;
  }
}
```

### 14.2 Component library

- Build the 12 components in §7 as React components under `frontend/src/components/`.
- Each component takes data as props and has no direct API calls.
- Storybook is optional. If skipped, each component is exercised in a `/dev/components` route that is excluded from production builds.

### 14.3 Share card rendering

- Built as a fixed-size React component, rendered off-screen at the target resolution, and exported with `html-to-image` (or the canvas API if a simpler path is needed).
- Fonts must be loaded before export to avoid fallback fonts in the image.

## 15. Open decisions

These need your input before the design is locked.

1. **Display font:** Michroma (proposed) or another wide display face such as Orbitron or Exo 2.
2. **Driver imagery:** placeholder silhouettes for v1, or source licensed cutouts. This affects the Driver Explainer and share cards.
3. **Share card language:** English headlines (proposed), or bilingual, or Portuguese for the Brazilian audience you referenced.
4. **Light theme:** out of scope for v1 (proposed), or required.
5. **Signature accent:** red as primary (proposed, from Reference 1) or teal as primary (from Reference 2).
6. **Wordmark:** whether PaceIQ gets a custom logo or stays as typeset text for v1.
