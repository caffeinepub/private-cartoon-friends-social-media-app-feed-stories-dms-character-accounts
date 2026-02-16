# Specification

## Summary
**Goal:** Make long name/friend selection dropdowns reliably scrollable and navigable so users can reach any name.

**Planned changes:**
- Update the shared custom Select dropdown content used for long lists to support vertical scrolling via mouse wheel/trackpad on desktop and touch-drag scrolling on touch devices.
- Add functional Up/Down arrow scroll controls inside the dropdown using the existing Radix select scroll button components already imported in `ScrollableSelectContent`, showing them only when scrolling is possible in that direction.
- Audit all name/friend/character selectors across the app and ensure they use the shared `ScrollableSelectContent` (or equivalent scroll-enabled SelectContent) so the fix applies everywhere names are chosen (e.g., post/comment/story author and message sender selectors) without breaking selection behavior.

**User-visible outcome:** Users can scroll through long name lists (wheel/trackpad/touch drag) and use Up/Down arrows to move through the list, allowing them to reach and select names at the top or bottom without the dropdown getting stuck.
