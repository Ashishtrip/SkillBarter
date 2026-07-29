# Skill Barter UI Redesign Plan

## Executive Summary
Transform Skill Barter's UI from its current minimalist design to incorporate sophisticated patterns from LinkedIn, BYJUS, Google Meet, and Reddit. This is a comprehensive design system overhaul affecting layout, navigation, components, color scheme, and key feature pages.

## Current State
- **Navigation**: Top navbar (desktop) + bottom mobile nav
- **Design**: Minimalist, mobile-first, sky blue primary color, subtle shadows
- **Layout**: Card-based with centered content
- **Features**: Profile, Search, Dashboard, Exchanges, Groups, Video Calls

---

## Phase 1: Design System & Navigation Overhaul

### 1.1 New Layout Architecture
**Sidebar-based navigation** (inspired by LinkedIn & Reddit):
- **Desktop**: Left sidebar (collapsible, 250px expanded / 80px collapsed) + main content area
- **Mobile**: Bottom navigation retained but enhanced with swipeable sheet for nested options
- **Content area**: Responsive grid layout, not full-width

**Files to modify**:
- `src/app/layout.tsx` — Restructure to include sidebar wrapper
- `src/components/Header.tsx` — Refactor header logic
- Create `src/components/Sidebar.tsx` (new)
- Create `src/components/SidebarNav.tsx` (new)
- Update `src/components/MobileBottomNav.tsx` — Keep but enhance

### 1.2 Navigation Structure
**Primary Sidebar Navigation**:
- Home (dashboard)
- Search (user discovery)
- My Skills
- Exchanges
- Community (groups/feed)
- Messages/Chat
- Profile (user's own)
- Settings

**Desktop sidebar highlights**:
- User's mini profile card at top (avatar, name, current skills count)
- Icons + labels on expanded, icons only on collapsed
- Hover tooltips on collapsed state

### 1.3 Updated Color Palette
**Core colors** (moving beyond sky blue to a richer palette inspired by LinkedIn/BYJUS):
- **Primary**: Deeper blue `#0A66C2` (LinkedIn blue) for main actions
- **Secondary**: Slate gray `#333333` for text
- **Accent**: Orange `#FF9500` (BYJUS accent) for highlights/achievements
- **Success**: Green `#31A24C` for positive states
- **Warning/Attention**: Amber `#E6A500` for notifications
- **Error**: Red `#E74C3C` for errors
- **Backgrounds**: White primary, light gray `#F8FAFC` for secondary
- **Meet Dark**: `#202124` for video call dark mode sections

**Files to modify**:
- `src/tailwind.config.js` — Update color palette
- `src/app/globals.css` — Update utility classes

---

## Phase 2: Component Library Redesign

### 2.1 Updated UI Components

**Button System** (more varied):
- `btn-primary` — Solid blue, full-width on mobile
- `btn-secondary` — Gray background
- `btn-ghost` — Transparent, text-only
- `btn-outline` — Border only, no fill
- `btn-icon` — Square icon buttons (for sidebar, chat)
- `btn-icon-circle` — Circular icon buttons (for quick actions, FAB)

**Cards** (evolved):
- Standard `.card` — Minimal border, no shadow
- `.card-hover` — Elevates on hover with shadow
- `.profile-card` — For user profiles (avatar, headline, skills, CTA)
- `.stat-card` — For dashboard metrics (large number, label, trend)
- `.feed-post` — For community posts/exchanges (author, content, engagement)

**Inputs & Forms** (refined):
- `.input-field` — Cleaner, no focus ring by default, subtle underline on focus
- `.textarea` — For longer inputs
- `.select-dropdown` — Styled select elements
- `.tag-input` — For skill/interest selection
- `.search-field` — Prominent search bars (for user/skill search)

**Badges & Pills**:
- Skill badges — Rounded pills with optional dismiss (x)
- Status badges — Small colored badges (online, pending, completed)
- Achievement badges — Larger, colorful, with icons (gamification)

### 2.2 New Components

**Profile Card** (`src/components/ProfileCard.tsx`):
- Avatar, name, headline, location, bio snippet
- Skill badges (top 3)
- "Connect" or "Message" CTA
- Reputation/rating (stars + count)

**Stat Card** (`src/components/StatCard.tsx`):
- Icon, large metric number, label
- Optional trend (up/down arrow + %)
- Optional tooltip with breakdown

**Post/Feed Item** (`src/components/FeedPost.tsx`):
- Author profile (avatar, name, timestamp)
- Post content (text, images)
- Engagement footer (likes, comments, shares)
- Reply thread toggle

**Sidebar User Profile** (`src/components/SidebarUserProfile.tsx`):
- Compact user card at top of sidebar
- Avatar, name, current role/focus
- Quick settings icon
- Sign out option

### 2.3 Modal & Overlay System
- Refine existing Modal component to match new design
- Add "sheet" variant for mobile (slides up from bottom)
- Drawer variant for sidebar actions on mobile

**Files to create/modify**:
- `src/components/` — Add new component files listed above
- Update existing component files (buttons, cards, inputs) in globals.css

---

## Phase 3: Key Page Redesigns

### 3.1 Dashboard Page (`src/app/dashboard/page.tsx`)
**Inspired by BYJUS analytics dashboard**:
- Hero section: Welcome message + quick stats
- Stat grid: 4-6 key metrics (active exchanges, completed, skills count, reputation score, badges earned, learning progress)
- "Upcoming Sessions" timeline
- "Recommended Skills to Learn" personalized feed (powered by `/api/recommendations`)
- "Recent Activity" feed with filters
- Sidebar: Quick navigation to next steps

**New API integration**:
- `/api/user/recommendations` (if not existing)
- `/api/user/achievements` (badges, milestones)
- `/api/user/activity-feed` (activity history)

### 3.2 Profile Page (`src/app/profile/page.tsx`)
**Inspired by LinkedIn profile layout**:
- Top section: Hero/banner image, avatar overlay, name, headline, location, rating
- "Edit Profile" button in header
- Main sections below banner:
  - **About**: Bio, location, social links
  - **Skills**: Skill pills with endorsement counts + "Add Skill" button
  - **Experience**: Work/education timeline
  - **Projects**: Project cards with images
  - **Certificates**: Certificate tiles
  - **Achievements**: Achievement badges (gamification)
  - **Exchanges**: Recent exchanges (mini cards or feed)
- Sidebar: Quick actions (message, connect, report)

### 3.3 Search/Discover Page (`src/app/search/page.tsx`)
**Inspired by LinkedIn's search**:
- Top: Prominent search bar with advanced filters toggle
- Sidebar: Filter panel (skills, location, level, rating, availability)
  - Collapsible on mobile, persistent on desktop
- Main area: Grid of profile cards (not list)
  - Each card shows: avatar, name, headline, location, top skills, rating, "Connect" button
- Pagination or infinite scroll at bottom

### 3.4 Exchanges List & Detail (`src/app/exchanges/page.tsx` & `[id]/page.tsx`)
**Inspired by Reddit feed + Google Meet**:

**Exchanges List**:
- Feed-style list of exchanges (similar to Reddit post feed)
- Each item shows: partner info, exchange title, status badge, time, engagement count
- Filter sidebar: Status (pending, active, completed), date range, partner name

**Exchange Detail** (`[id]`):
- Top: Partner profile card + exchange details (skills, start date, status)
- Tab-based layout:
  - **Chat**: Reddit-style threaded comments (enhanced)
  - **Schedule**: Calendar + timing details
  - **Video Call**: Google Meet-style UI (see below)
  - **Notes**: Shared notes/progress

### 3.5 Video Call Page (`src/app/video/[room]/page.tsx`)
**Inspired by Google Meet**:
- Main video area: Large speaker view, smaller grid for other participant(s)
- Bottom control bar (fixed):
  - Mute/Unmute (microphone toggle)
  - Camera on/off
  - Chat toggle
  - Screen share
  - More options (settings, report, hand raise, reactions)
  - Leave call (end button, red)
- Right sidebar (collapsible): Participant list + chat
- Top bar: Room info, timer, recording status (if applicable)

### 3.6 Community/Groups Page (`src/app/groups/page.tsx`)
**Inspired by Reddit community structure**:
- Sidebar: Browse communities by category
- Main area: Community feed (post-style)
  - Each post shows: community badge, author, title, content, engagement (upvotes, comments)
  - Voting/engagement buttons below each post
- Sort options: Hot, New, Top (upvotes)
- Create post button (prominent FAB or button)

### 3.7 Messages/Chat (`src/app/` - new or enhanced)
**Inspired by Reddit DMs + LinkedIn messaging**:
- Layout: Sidebar (conversation list) + main area (current conversation)
- Conversation list: Avatar, name, last message snippet, unread indicator, timestamp
- Chat window: 
  - Threaded messages (nested replies)
  - Typing indicator
  - Read receipt (if applicable)
  - Quick actions (emoji reactions, file share)
  - Call integration (start video/audio call)

---

## Phase 4: Responsive & Mobile Adjustments

### 4.1 Breakpoints
- **Mobile (< 640px)**: Sidebar collapses to bottom nav, full-width content
- **Tablet (640px - 1024px)**: Sidebar on left but narrower (80px), grid adjusts
- **Desktop (> 1024px)**: Full sidebar, multi-column layouts

### 4.2 Mobile Enhancements
- Bottom navigation stays (enhanced)
- Swipeable sheets for filters and actions
- Full-screen modals for forms
- Touch-optimized (44px+ tap targets)

---

## Phase 5: Gamification & Engagement Elements

### 5.1 Achievement System
- Badge component to display achievements
- Achievement icons + names on profile and dashboard
- Milestone notifications

### 5.2 Reputation/Rating System
- Display star rating prominently on profiles
- Upvote/downvote system on posts and comments (Reddit-inspired)
- Reputation score in sidebar

### 5.3 Analytics & Insights
- User stats dashboard (BYJUS-inspired metrics)
- Learning progress visualization
- Contribution tracking

---

## Implementation Strategy

### Priority Order
1. **Design System** (Phase 1): Colors, typography, layout structure, sidebar
2. **Core Components** (Phase 2): Buttons, cards, new components
3. **Navigation** (Phase 1.1-1.2): Sidebar, restructured layout
4. **Dashboard** (Phase 3.1): Primary landing page, metrics
5. **Profile** (Phase 3.2): Key user-facing page
6. **Search** (Phase 3.3): Core discovery feature
7. **Video Calls** (Phase 3.5): Google Meet UI
8. **Community/Feed** (Phase 3.4 & 3.6): Reddit-inspired threads and posts
9. **Messages** (Phase 3.7): Enhanced chat
10. **Polish & Testing**: Mobile responsiveness, animations, edge cases

### Key Files to Modify (in order)
1. `src/tailwind.config.js` — Color palette
2. `src/app/globals.css` — Component utilities
3. `src/app/layout.tsx` — New sidebar structure
4. `src/components/Sidebar.tsx` (new)
5. `src/components/` — New components
6. Page files: dashboard, profile, search, exchanges, groups, video
7. `src/app/api/` — Potential new endpoints for recommendations, activity feed, achievements

### API Additions (if missing)
- `/api/user/recommendations` — Personalized skill recommendations
- `/api/user/achievements` — User badges and milestones
- `/api/user/activity-feed` — Recent activity for dashboard
- `/api/feed` or `/api/posts` — For community feed (if Reddit-style content is new)

---

## Design Tokens Summary

### Spacing
- Sidebar width: 250px (expanded), 80px (collapsed)
- Grid gaps: 16px (mobile), 20px (desktop)
- Card padding: 16px (mobile), 24px (desktop)

### Border Radius
- Buttons: 8px
- Cards: 12px
- Avatars: 50% (circles)
- Icons: 8px

### Shadows
- Card: `0 1px 3px rgba(0,0,0,0.12)`
- Elevated: `0 4px 8px rgba(0,0,0,0.15)`
- Sidebar: `0 2px 8px rgba(0,0,0,0.08)`

### Typography
- Headings: Manrope (bold, semibold)
- Body: Source Sans 3 (regular, medium)
- Monospace: For code/timestamps (if needed)

---

## Success Criteria
- ✅ Sidebar navigation functional on desktop and mobile
- ✅ Dashboard displays analytics metrics and recommendations
- ✅ Profile page matches LinkedIn layout with skills, experience, achievements
- ✅ Search features advanced filters and profile cards
- ✅ Video calls have Google Meet-style controls and participant view
- ✅ Community pages support threaded posts with upvote system
- ✅ All pages are responsive and touch-friendly
- ✅ No regressions in existing API functionality
- ✅ Performance maintained (no significant bundle size increase)
