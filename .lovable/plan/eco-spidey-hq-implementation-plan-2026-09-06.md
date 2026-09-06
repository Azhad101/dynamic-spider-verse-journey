# Eco-Spidey HQ implementation plan

## Outcome

Turn the five uploaded Eco-Heroes screens into one cohesive working Eco-Spidey HQ experience at `/`, preserving the uploaded black/red/deep-blue comic-command style while replacing mock content with working navigation, reports, mission activity, leaderboard updates, and a real map.

## Product work

1. **Unify the experience**
   - Replace the placeholder home screen with a single command-center page that combines the home briefing, live map, hero board, mission telemetry, report signal form, pose gallery, and footer.
   - Reuse the uploaded navigation and footer structure with real in-app section navigation and mobile behavior.
   - Keep controls purposeful: open map, inspect cleanup zones, view rankings, activate missions, and send a report signal.

2. **Original visual identity and artwork**
   - Add semantic Eco-Spidey design tokens in `src/styles.css` for ink, deep navy, signal red, electric blue, warm neutral, borders, glows, and motion.
   - Create an original Eco-Spidey spider/web emblem rather than relying on an external trademarked logo or CDN icon.
   - Generate a cohesive set of original web-slinger-inspired action poses: hero feature pose, web swing, wall crawl, landing, web shot, and leaderboard avatars. Use the poses as actual visuals across the major sections instead of placeholder or static generic imagery.
   - Keep type pairing and layout aligned with the selected Superdesign/reference direction: condensed display headings, readable operations text, restrained motion, sharp command-center modules.

3. **Real interactive map**
   - Add a real map library integration for the Web Map section using Google Maps Platform through the approved connector flow, with bounded requests and no public unauthenticated proxy.
   - Show cleanup markers for active alerts, clearing zones, and en-route crews; selecting a marker updates the mission detail panel.
   - Add map controls, legend, zone filtering, and a safe fallback state when the map service is unavailable.

4. **Backend-powered workflows**
   - Enable Lovable Cloud before adding persistence.
   - Create the minimum data model for cleanup reports, cleanup zones/markers, mission activity, and leaderboard totals, with explicit grants and row-level security in the migration.
   - Add authenticated server functions for creating reports, updating mission activity, and reading user-facing dashboard data; keep secrets and privileged access server-side.
   - Seed the first-screen demo rows in the migration so the experience is populated on first load without page-load seeding.
   - Wire the report form to persist a signal, show a confirmation state, and update the live dashboard counts.

5. **Quality and accessibility**
   - Add route-specific metadata for `/` and remove all placeholder/template metadata.
   - Keep one clear H1, semantic sections, alt text for generated artwork, keyboard-accessible controls, visible focus states, and reduced-motion support.
   - Verify desktop and mobile layout, map visibility, report submission, navigation, and console/build diagnostics in the live preview.

## Technical implementation

- Primary route: `src/routes/index.tsx`.
- Shared document shell and providers: `src/routes/__root.tsx`.
- Design tokens and animations: `src/styles.css`.
- Small focused UI modules under `src/components/` for navigation, action pose art, map, leaderboard, telemetry, report form, and footer.
- Backend functions in client-safe `src/lib/*.functions.ts` with server-only imports contained inside handlers.
- Database migration under the project migration workflow with grants before RLS policies for every public table.
- Map calls remain behind the connector/server boundary; no provider secrets in browser code.
- Generated art stored through the project asset flow and imported from `src/assets/`.

## Delivery order

1. Fetch/reconcile the supplied Superdesign draft when authenticated, then lock the final composition.
2. Enable Lovable Cloud and add the migration with seeded demo data.
3. Generate the Eco-Spidey emblem and pose set.
4. Add tokens and build the unified page shell and working client interactions.
5. Connect the backend report/mission flows.
6. Connect and verify the real map.
7. Run preview QA, fix any build/runtime issues, and re-check responsive states.
