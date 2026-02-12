# Specification

## Summary
**Goal:** Build a private, authenticated cartoon-friends social media app with feed, stories, DMs, character accounts, image uploads, and a consistent retro visual theme.

**Planned changes:**
- Add Internet Identity sign-in and gate all app features behind authentication, including a sign-out flow.
- Implement backend Motoko data models + typed APIs for user profile, character profiles, follow/friend links, posts, comments, likes, stories (with expiration), and direct messages, all scoped to the signed-in user.
- Create core screens and navigation: Home (Feed + Stories row/viewer), Messages (threads + chat), Characters (directory + create/edit/delete), and Profile/Settings (edit display name/bio/avatar).
- Implement feed posting (text + optional image) with author selection (user or character), post detail view, comments, and like/unlike.
- Implement stories creation (optional image + caption) with author selection and TTL-based expiration enforced via timestamps.
- Implement direct messages with conversation list, thread view, message history, and sending messages as user or selected character.
- Add local image handling for avatars, post images, and story images stored in a canister-friendly format and rendered with consistent cropping/sizing.
- Apply a cohesive nostalgic/retro (90s/2000s-inspired) theme using Tailwind + shadcn/ui, avoiding blue/purple as primary accents.
- Add UX guardrails stating the app is private and users should only upload content they own or have permission to use.
- Generate static branding assets (logo + background pattern + default avatar) and wire them into the login screen and app shell as static frontend assets.

**User-visible outcome:** After signing in with Internet Identity, the user can manage their profile and cartoon-character friend accounts, post to a private home feed (as self or a character) with images, view/add comments and likes, create/view expiring stories, and chat in persistent DM threads—all in a retro-themed UI with built-in privacy/copyright notices.
