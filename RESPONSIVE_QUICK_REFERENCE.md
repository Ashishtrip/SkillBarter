# Responsive Design - Quick Reference Card

## Breakpoints at a Glance

```
Mobile      < 640px   Base (no prefix)
Tablet      640-1024  @media (min-width: 640px) - use 'sm:' prefix
Desktop     1024-1280 @media (min-width: 1024px) - use 'lg:' prefix
Large       > 1280px  @media (min-width: 1280px) - use 'xl:' prefix
```

## Pages Updated

| Page      | Status      | Key Changes                                         |
| --------- | ----------- | --------------------------------------------------- |
| Dashboard | ✅ Complete | Stats 1→4 cols, responsive buttons, Profile summary |
| Exchanges | ✅ Complete | Stacking layout, responsive cards, Touch targets    |
| Profile   | ✅ Complete | Header layout, Form grid, Text truncation           |
| Search    | ✅ Complete | 1→3 column grid, Responsive forms, Icon scaling     |

## Essential Patterns

### Text Sizing

```tsx
// Heading large
className = "text-2xl sm:text-3xl lg:text-4xl";

// Body text
className = "text-sm sm:text-base";

// Small labels
className = "text-xs sm:text-sm";
```

### Button Sizing

```tsx
// Primary button
className = "btn-primary text-sm sm:text-base py-2 px-4 sm:py-2.5 sm:px-5";

// Full width on mobile
className = "w-full sm:w-auto";

// Stacking
className = "flex flex-col sm:flex-row gap-3 sm:gap-4";
```

### Grid Layouts

```tsx
// 1 → 2 → 4 columns
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6";

// 1 → 2 → 3 columns
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

// Full width on mobile
className = "w-full sm:w-auto sm:max-w-md";
```

### Flex Layouts

```tsx
// Stack on mobile, row on tablet+
className = "flex flex-col sm:flex-row gap-3 sm:gap-4";

// Side by side with space between
className = "flex flex-col sm:flex-row sm:items-center sm:justify-between";
```

### Icon Sizing

```tsx
// Small icon
className = "w-4 h-4 sm:w-5 sm:h-5";

// Medium icon
className = "w-5 h-5 sm:w-6 sm:h-6";

// Avatar
className = "w-10 h-10 sm:w-12 sm:h-12";
```

## Common Responsive Classes

### Text

| Class     | Desktop | Mobile              |
| --------- | ------- | ------------------- |
| text-xs   | 12px    | -                   |
| text-sm   | 14px    | 12px (sm:text-sm)   |
| text-base | 16px    | 14px (sm:text-base) |
| text-lg   | 18px    | 16px (sm:text-lg)   |
| text-xl   | 20px    | 18px (sm:text-xl)   |
| text-2xl  | 24px    | 20px (sm:text-2xl)  |
| text-3xl  | 30px    | 24px (sm:text-3xl)  |

### Sizing

| Class     | Size        |
| --------- | ----------- |
| w-4 h-4   | 16px × 16px |
| w-5 h-5   | 20px × 20px |
| w-6 h-6   | 24px × 24px |
| w-10 h-10 | 40px × 40px |
| w-12 h-12 | 48px × 48px |

### Spacing

| Class | Mobile | Tablet+ |
| ----- | ------ | ------- |
| gap-2 | -      | 8px     |
| gap-3 | 12px   | -       |
| gap-4 | 16px   | 16px    |
| gap-6 | -      | 24px    |

## Documentation Files

| File                             | Purpose                              | Audience    |
| -------------------------------- | ------------------------------------ | ----------- |
| RESPONSIVE_DESIGN_UPDATES.md     | Detailed page changes, testing guide | Developers  |
| RESPONSIVE_DESIGN_TESTING.md     | Testing checklist, device guide      | QA, Testers |
| RESPONSIVE_PATTERNS_REFERENCE.md | Pattern examples, best practices     | Developers  |
| RESPONSIVE_DESIGN_SUMMARY.md     | Overview, achievements, status       | Everyone    |

## Quick Checklist

**Before Committing Changes:**

- [ ] All pages compile without errors
- [ ] Mobile layout is single column
- [ ] Tablet layout is 2 columns
- [ ] Desktop layout is optimal
- [ ] No horizontal scrolling
- [ ] Buttons are 44px+ tall
- [ ] Text is readable
- [ ] Icons scale properly

**Testing Locally:**

- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1366px)
- [ ] Test on large desktop (1920px)
- [ ] Test landscape orientation
- [ ] Test with keyboard navigation
- [ ] Test with screen reader

## File Changes Overview

### Dashboard (`/src/app/dashboard/page.tsx`)

- Stats cards: `sm:grid-cols-2 lg:grid-cols-4`
- Responsive icons: `sm:w-12 sm:h-12`
- Recent exchanges: stacking buttons
- Quick actions: 2-column on mobile
- Profile summary: responsive avatar

### Exchanges (`/src/app/exchanges/page.tsx`)

- Header: `text-2xl sm:text-3xl`
- Responsive padding: `px-4 sm:px-6 lg:px-8`
- Cards stack on mobile
- Buttons full-width on mobile
- Status badge compact on mobile

### Profile (`/src/app/profile/page.tsx`)

- Header stacks on mobile
- Avatar: `w-16 h-16 sm:w-20 sm:h-20`
- Form single column on mobile
- GitHub/LinkedIn: `sm:grid-cols-2`
- Buttons stack on mobile

### Search (`/src/app/search/page.tsx`)

- Heading: `text-2xl sm:text-3xl`
- Results grid: `sm:grid-cols-2 lg:grid-cols-3`
- Filters single column on mobile
- User cards responsive
- Icons scale properly

## Deployment Checklist

- [ ] All changes reviewed
- [ ] All pages tested on multiple devices
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Accessibility is maintained
- [ ] Documentation is clear
- [ ] No breaking changes
- [ ] Ready for production

## Support & Questions

### Common Issues

**Q: Content is cut off on mobile**  
A: Add `min-w-0` to flex children and use `truncate` for text

**Q: Buttons are too small on mobile**  
A: Use `py-2.5 px-4 sm:py-2 sm:px-4` for proper sizing

**Q: Text is too small to read**  
A: Use `text-sm sm:text-base` and avoid single-size text

**Q: Layout breaks on tablet**  
A: Use correct breakpoint - use `sm:` not `md:` for tablet

**Q: Icons don't scale**  
A: Use responsive sizing: `w-4 h-4 sm:w-5 sm:h-5`

### Testing Tools

- Chrome DevTools (F12)
- Responsive Design Mode (Ctrl+Shift+M)
- Mobile phone browsers
- Real devices for best results

---

**Last Updated**: 2024  
**Status**: ✅ Complete  
**Ready**: Yes  
**Version**: 1.0
