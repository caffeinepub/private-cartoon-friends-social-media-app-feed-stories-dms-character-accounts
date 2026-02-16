# Specification

## Summary
**Goal:** Fix mobile/touch scrolling for author/sender name Select dropdowns and add a clear visual scroll affordance when the list overflows.

**Planned changes:**
- Update author/sender Select dropdown usage in PostComposer, CommentsPanel, CreateStoryDialog, and MessageThread to constrain the options list to a viewport-relative max height and enable vertical scrolling within the list on mobile/touch.
- Prevent touch scrolling inside the open dropdown from scrolling the page behind it, ensuring reliable swipe/drag list scrolling.
- Add a visible scroll affordance on the right side of the open dropdown when content overflows (e.g., up/down chevrons and/or a visible scrollbar), and hide/disable it when there is no overflow.
- Ensure the same scrollable dropdown treatment is applied consistently across all existing author/sender selection Selects used for creating content, without changing shared UI component source files.

**User-visible outcome:** On mobile, the author/sender dropdown lists no longer extend off-screen and can be smoothly scrolled with touch to reach and select any name, with a clear indicator showing when the list is scrollable.
