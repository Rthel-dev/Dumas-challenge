---
name: Timezone-safe date strings in specs
description: Use noon UTC timestamps (T12:00:00.000Z) in test data when the source uses new Date() with local getDate()/getMonth()/getFullYear()
type: feedback
---

When test data contains ISO date strings that are parsed by `parseDate` (which uses `new Date(str).getDate()` etc. in local time), midnight UTC strings like `'2026-05-15T00:00:00.000Z'` shift to the previous day in negative-offset timezones (e.g. UTC-3 Argentina).

**Why:** The browser running Karma uses the local system timezone. `new Date('2026-05-15T00:00:00.000Z').getDate()` returned 14 in UTC-3, causing `Expected $.day = 14 to equal 15` failures.

**How to apply:** Always use noon UTC (`T12:00:00.000Z`) for date-only test fixtures that go through `parseDate` (or any date parser that uses local time methods). This keeps the date stable across all timezones within ±12 hours of UTC.
