# AI Usage Log

All AI tool usage for this project is documented here as required by the course assignment brief.

**Format:** Tool | Date | Purpose | Outcome

---

## Log - Sergiu

| Tool | Date | Purpose | Outcome |
|------|------|---------|---------|
| Claude (Anthropic) | 10 Mar 2026 | Brainstorming project structure, user flow, and mood-to-film mapping concept | Refined project brief and two-stage approach; all code and logic written independently |
| Claude (Anthropic) | 11 Mar 2026 | Planning sprint breakdown, task board structure, and testing strategy | Created task organisation plan; no code generated |
| Claude (Anthropic) | 24 Mar 2026 | Brainstorming architecture for the group session feature: database schema, session flow (create, join, lobby, mood, swipe, results), guest vs authenticated access | Decided on Supabase tables (sessions, participants, swipes), 6-char codes, 4-hour expiry, and the lobby to swiping state machine |
| Claude (Anthropic) | 24–25 Mar 2026 | Explaining Supabase Realtime (postgres_changes), Next.js App Router patterns (server vs client components), and how to structure API routes with auth validation | Understood when to use "use client" vs server components, how Realtime subscriptions work, and the pattern for auth-gated API routes |
| Claude (Anthropic) | 25–28 Mar 2026 | Used AI to understand and implement group session API routes (create, join, lobby, ready, start, kick, leave, mood, swipe, results) and Supabase schema/migrations | Built all 12 group API routes. I directed all feature requirements, used AI for implementation guidance, and reviewed every line of code |
| Claude (Anthropic) | 26–30 Mar 2026 | Used AI for guidance on building group session frontend pages (lobby, mood selection, swipe deck, results) and shared components (ParticipantList, SwipeCard, SwipeDeck, TopPickCard, VoteBreakdown, and others) | Built all 4 group pages and 12+ components. I made all design and UX decisions; AI helped translate specs into working React code |
| Claude (Anthropic) | 27 Mar 2026 | Explaining drag gesture handling (pointer events, transforms, thresholds) for the swipe deck feature | Understood how pointer-based drag works and why transforms are used instead of position changes |
| Claude (Anthropic) | 28–29 Mar 2026 | Debugging stale JWT tokens (401 errors after Supabase auto-refresh) and swipe card race condition (polling resetting card position) | Identified root cause: React state holds stale tokens while Supabase refreshes internally. Created getAuthHeaders() helper. Fixed race condition with Math.max guard and optimistic vote pattern |
| Claude (Anthropic) | 29 Mar 2026 | Explaining optimistic UI updates for the voting system and why cards should not snap back after swiping | Understood the pattern: update UI immediately, retry failed requests in background, never roll back visual state |
| Claude (Anthropic) | 30 Mar–1 Apr 2026 | Used AI for guidance on building dashboard components (MoodBox, MoodPanel, MoodCard, ExploreBox, ExplorePanel, BottomSheet, DashboardShell, HeroSection, FilmoodLogo) | Built the full dashboard. AI helped with animation keyframes and responsive patterns; all structure and design decisions were mine |
| Claude (Anthropic) | 1–2 Apr 2026 | Explaining and debugging Tailwind v4 CSS layer conflicts causing custom classes to be overridden in production builds | Understood root cause: Tailwind v4 layers have higher specificity. Switched to inline styles and a useMediaQuery hook for layout-critical rules |
| Claude (Anthropic) | 2 Apr 2026 | Used AI to understand and implement the v9 design system: dual-theme CSS variables, typography scale (Lora + Plus Jakarta Sans), accent colour families, component patterns | Built globals.css with full theme system. AI helped translate the HTML prototype into CSS custom properties |
| Claude (Anthropic) | 3 Apr 2026 | Used AI for guidance on restyling the results page: TopPick hero card, mood pills, streaming providers, staggered animations | Restyled results page to match the group results visual hierarchy |
| Claude (Anthropic) | 4–5 Apr 2026 | Used AI for guidance on refactoring group session code: extracting shared helpers (resolveSession, resolveParticipant), hooks (useParticipantId, useGroupRealtime), and constants (AVATAR_COLORS, ACCENT_VARS) | Removed approximately 674 lines of duplicated code. Understood DRY principles in practice through the process |
| Claude (Anthropic) | 5–6 Apr 2026 | Used AI to help write and understand unit tests with Vitest: test structure, mocking Supabase, edge cases for validation, mood mapping, group lifecycle, and API routes | Wrote 106 tests across 7 files. Learned mocking patterns, boundary-value testing, and API route testing independently |
| Claude (Anthropic) | 7 Apr 2026 | Accessibility audit: keyboard navigation, ARIA attributes, focus management, semantic HTML, colour contrast | Updated 27 files with accessibility improvements. Learned WCAG patterns for interactive components |
| Claude (Anthropic) | 8 Apr 2026 | Debugging hydration mismatch with useMediaQuery hook (server/client value mismatch on first render) | Fixed by defaulting to false on the server and syncing the real value in useEffect |

> What I want to emphasise is that AI was a tool I worked with, not a tool that worked for me. I directed every feature, reviewed every line of code, asked for explanations of things I did not understand, and made sure I could walk through the logic myself. The learning was real. I now understand how to build a real-time feature with Supabase, how to structure a Next.js App Router project, how to implement optimistic UI patterns, how to write meaningful unit tests, and how to build a design system in code.

---

## Log - Thuba

| Tool | Date | Purpose | Outcome |
|------|------|---------|---------|
| Not documented | | | |

---

## Log - Khan

| Tool | Date | Purpose | Outcome |
|------|------|---------|---------|
| Not documented | | | |

---

## Log - Kacper

| Tool | Date | Purpose | Outcome |
|------|------|---------|---------|
| AI Tool (unspecified) | 4 Apr 2026 | Reviewing overall project structure for a deeper understanding of the codebase | Better understanding of the project before contributing |
| AI Tool (unspecified) | 6 Apr 2026 | Planning the redesign of the login page and identifying reusable code from the sign-in page | Cleaner redesign with reused components |
| AI Tool (unspecified) | 6 Apr 2026 | Debugging an issue with NEXTAUTH_SECRET generation where the openssl command returned errors | Successfully generated a valid NEXTAUTH_SECRET after debugging |
| AI Tool (unspecified) | 8 Apr 2026 | Resolving an overflow issue on the login page across different screen sizes | Login page displays correctly at all screen sizes |

---

## Reminders

- **Allowed:** Brainstorming project structure or user flow, explaining complex JavaScript concepts, generating placeholder text, debugging assistance by describing errors
- **Not allowed:** Generating core application logic for fetching APIs, managing state, or dynamically rendering pages
- **Rule:** Do not submit code you cannot explain line-by-line
- **Rule:** Do not copy-paste AI-generated code without attribution, understanding, and integration into your own solution