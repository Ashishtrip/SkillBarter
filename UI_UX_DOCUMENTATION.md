# Skill Barter: Deep-Dive UI/UX Documentation

## 1. Overview and Design Philosophy
Skill Barter employs a **Modern, Minimalist, and Mobile-First** design language. The UI focuses on clean typography, ample whitespace, and a cohesive color palette to foster trust and community. The UX is optimized for "Barter-first" interactions, making it frictionless for users to discover, connect, and exchange skills.

## 2. Color Palette
The project uses a structured Tailwind CSS color system heavily relying on a Sky Blue primary palette and a Slate secondary palette.

### Primary Colors (Brand & Actions)
*   **Primary 600 (`#0284c7`)**: The core brand color. Used for primary buttons, active states, icons, and highlights.
*   **Primary 700 (`#0369a1`)**: Used for hover states on primary actions.
*   **Primary 50 (`#f0f9ff`)**: Used for subtle backgrounds (e.g., active navigation items).
*   **Primary 100 (`#e0f2fe`)**: Used for badge backgrounds and icon containers.

### Secondary Colors (Neutral & Typography)
*   **Secondary 900 (`#0f172a`)**: Primary text color for headings and high-emphasis text.
*   **Secondary 600 (`#475569`)**: Secondary text color for body paragraphs, descriptions, and inactive states.
*   **Secondary 200 (`#e2e8f0`)**: Used for borders, dividers, and card outlines.
*   **Secondary 50 (`#f8fafc`)**: Used for disabled inputs and subtle container backgrounds.
*   **White (`#ffffff`)**: Core background color for cards, modals, and the main layout.

## 3. Typography
The application uses the **Inter** font family (falling back to system-ui and sans-serif).

### Responsive Scaling
Typography scales smoothly across devices using Tailwind's arbitrary breakpoints (`sm`, `md`, `lg`, `xl`):
*   **Heading 1 (h1)**: `text-2xl` (Mobile) → `text-5xl` (Desktop). Font weight: `bold`.
*   **Heading 2 (h2)**: `text-xl` (Mobile) → `text-4xl` (Desktop). Font weight: `bold`.
*   **Heading 3 (h3)**: `text-lg` (Mobile) → `text-2xl` (Desktop). Font weight: `semibold`.
*   **Body (p)**: `text-sm` (Mobile) → `text-base` (Desktop). Line height: `relaxed`.
*   **Labels/Small Text**: `text-xs` (Mobile) → `text-sm` (Desktop).

## 4. Symbols, Icons, and Logos
### The Logo
The logo is a purely CSS/HTML construct, avoiding external image dependencies for faster loading:
*   **Symbol**: A rounded square (`w-8 h-8 rounded-lg`) with the Primary 600 background. Inside, a bold, white "S" (`text-lg font-bold text-white`).
*   **Wordmark**: The text "SkillBarter" next to the symbol, styled as `text-xl font-bold text-secondary-900`.

### Iconography (Lucide React)
The project exclusively uses **Lucide React** for consistent, stroke-based, minimalist icons.
*   **Navigation**: `Home`, `Search`, `Users` (Groups), `MessageSquare` (Exchanges), `User` (Profile).
*   **Actions**: `Plus` (Add skill/exchange), `LogIn`, `LogOut`, `ArrowRight`.
*   **Feature Highlights**: `BookOpen` (Learn), `Heart` (Grow/Community).
*   **Sizing**: Icons scale contextually. Small (`w-4 h-4`), Medium (`w-5 h-5`), Large (`w-8 h-8` inside circular containers), Extra Large (`w-12 h-12` for empty states or dashboard metrics).

## 5. UI Components & Layouts
### Cards
*   **Standard Card (`.card`)**: White background, `rounded-xl`, subtle shadow (`shadow-sm`), bordered (`border-secondary-200`). Padding scales from `p-4` (Mobile) to `p-6` (Desktop).
*   **Hover State**: Elevates slightly (`hover:shadow-md`) with a `duration-200` transition.

### Buttons
*   **Primary Button (`.btn-primary`)**: Solid Primary 600 background, white text, rounded corners (`rounded-lg`). Transitions to Primary 700 on hover.
*   **Secondary Button (`.btn-secondary`)**: Subtle Slate 100 background with Slate 800 text. Transitions to Slate 200 on hover.
*   **Outline Button (`.btn-outline`)**: Transparent background, Primary 300 border, Primary 700 text.
*   **Sizing**: All buttons have adequate touch targets (minimum 40px height) and scale padding (`py-2 px-4` to `py-2.5 px-5`).

### Inputs
*   **Fields (`.input-field`)**: Full width, scaled padding, Slate 300 border.
*   **Focus State**: Replaces border with a solid Primary 500 ring (`focus:ring-2 focus:ring-primary-500`) with smooth transitions.

## 6. UX Flows & Navigation
### Desktop Navigation
*   **Top Navbar**: Sticky header (`z-40`) with logo on the left, primary links (Dashboard, Search, Skills, Profile, Exchanges) in the center, and Auth/Profile actions on the right.
*   **State Awareness**: Replaces "Sign In/Up" with a Notification Bell and User Dropdown when authenticated.

### Mobile Navigation
*   **Bottom Navigation Bar**: Fixed to the bottom (`z-40`), featuring 5 core icons (Home, Search, Groups, Exchanges, Profile).
*   **Active State**: The active tab highlights the icon and text in Primary 600 with a Primary 50 background.
*   **Quick Action**: A floating/inline "New" (`Plus` icon) button specifically for creating exchanges.

### Layout Grids
*   **Responsive Grids (`.grid-responsive`)**: Transitions seamlessly from 1 column (Mobile) to 2 (Tablet) to 3 or 4 columns (Desktop) using CSS Grid. Gaps scale from `gap-4` to `gap-6`.

## 7. Animations and Micro-interactions
Skill Barter keeps animations purposeful and lightweight to ensure high performance:
*   **Hover Transitions**: All interactive elements (buttons, cards, links) utilize `transition-all duration-200` for smooth color and shadow changes.
*   **Loading States**: Skeletons use Tailwind's `animate-pulse` with a `bg-secondary-200` base to indicate loading without jarring spinners.
*   **Reduced Motion**: The system respects user OS settings. `prefers-reduced-motion: reduce` globally disables animations and transitions to 0.01ms.

## 8. Accessibility & Responsiveness (A11y)
*   **Touch Targets**: Strictly adheres to the 44x44px minimum touch target size for mobile buttons and links.
*   **Scrollbars**: Customized webkit scrollbars (slate tracks and thumbs) for a cleaner appearance, preventing bulky default scrollbars from breaking the UI aesthetic.
*   **Contrast**: High contrast between Secondary 900 text and White/Secondary 50 backgrounds ensures readability.
*   **Print Styles**: Includes `@media print` utilities to hide unnecessary navigation (`.no-print`) and avoid page breaks inside cards.
