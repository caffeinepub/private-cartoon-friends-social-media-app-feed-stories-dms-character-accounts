# Specification

## Summary
**Goal:** Fix the blank screen and broken conversation flow on the Messages page after starting a new chat.

**Planned changes:**
- Fix `CreateConversationDialog` to properly call the backend `createConversation` mutation and return a valid conversation ID via the `onCreated` callback
- Fix `Messages.tsx` to use the returned conversation ID to immediately render `MessageThread` instead of a blank screen
- Fix the Messages page to fetch and display existing conversations on mount instead of always showing "No conversations yet"
- Fix `MessageThread` to show a loading spinner/skeleton while data is loading and a visible error state if the conversation cannot be loaded, never rendering a blank screen
- Show an error message inside the dialog if conversation creation fails

**User-visible outcome:** Users can start a new conversation from the Messages dialog and immediately see the MessageThread with the character's header and message input. Previously created conversations are also listed correctly when opening the Messages tab.
