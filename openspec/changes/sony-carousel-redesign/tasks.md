# Tasks

## 1. Changer experience

- [x] 1.1 Build the dimensional carousel, hardware display, synchronized album details, and dark shared styling; verify a production build and inspect the desktop rendering.
- [x] 1.2 Implement wrapping selection, drag/touch, keyboard controls, jog dial, and random selection; verify selection math with unit tests and browser interaction.

## 2. Catalog integration

- [x] 2.1 Integrate search, carousel/grid views, empty states, local-art fallbacks, and exact multi-disc locations; verify search and detail links in the browser.
- [x] 2.2 Preserve responsive, reduced-motion, and no-JavaScript browsing, and document controls in README; verify mobile layout, reduced-motion transitions, and static index availability.

## 3. Integration checks

- [x] 3.1 Run the full tests, production build, and strict OpenSpec validation; inspect artist and album routes and resolve browser errors.

## 4. Browsing refinements

- [x] 4.1 Fix player and control dimensions across title lengths, retaining readable metadata; verify short and LOTR titles have identical geometry on desktop and mobile.
- [x] 4.2 Replace independent case motion with a shared circular path and sufficient clearance; verify geometry checks and inspect moving cases in the browser.
- [x] 4.3 Add an easing surprise spin with a predetermined destination, cancellation, and reduced-motion behavior; verify the spin passes intermediate albums, lands accurately, and cannot overwrite a later search or manual selection.
- [x] 4.4 Update browsing documentation and run the production build, tests, and browser regression checks; refresh the existing local preview.
- [x] 4.5 Remove the homepage introduction and navbar caption; reorder mobile browsing to show album information, carousel, then a prominent jog dial while preserving the desktop layout and fixed geometry.

## Refinement verification

- All ten Node tests pass, including continuous case clearance, predetermined spin landing, and acceleration/deceleration behavior. Production build produces 282 pages.
- Across all 170 titles, measured player height and control offsets remain constant at each tested layout. After breakpoint updates, short and LOTR selections have identical geometry at 320, 390, 768, 1440, and 1700 pixels. Long metadata remains scrollable and none of these widths has horizontal page overflow.
- A sampled surprise spin passed through 67 distinct albums and landed on the preselected destination. Measured minimum case clearance throughout motion was 34.46 pixels in scene coordinates; the player height remained constant.
- Search and manual navigation cancel spins without stale updates five seconds later. Reduced motion selects immediately. A two-album filtered spin lands correctly. No browser JavaScript errors occurred.
- The homepage introduction and navbar caption are absent at desktop and mobile widths. At 390×844, the mobile album panel is 198px tall, the carousel is 216px tall, and the 144px jog dial follows it fully within the initial viewport; at 320×800, the 132px dial remains prominent with no horizontal overflow. Album details precede the carousel in document order. At 1440px, the carousel remains left of the detail panel and the dial stays in the control deck.
- Refreshed the existing in-app preview at port 4322. Updated screenshots are under ignored `output/playwright/`.

## Initial verification

- Seven Node tests pass, including circular boundaries, physical slot sorting, multi-disc search, and existing import safeguards.
- Production build produces 282 pages; repeat build reuses 158 local covers and one known-unavailable marker.
- Browser checks pass for next/previous, keyboard, wraparound, mouse drag, rotary dial drag/click, random selection, search, empty recovery, grid filtering, and album/artist routes.
- Emulated mobile touch swipe advances slots 106 to 109. Capture transfer from a touched child preserves the active drag.
- Layout inspected at 320, 390, 768, 1024, and 1440 pixels; multi-disc location remains complete at 320 pixels.
- Reduced motion computes zero carousel transition duration. With JavaScript disabled, all 170 album cards remain accessible. Blocked artwork requests reveal the designed fallback. Final production page has no JavaScript errors.
- Desktop and mobile screenshots are saved locally under ignored `output/playwright/`. No deployment performed.
