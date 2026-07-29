# Responsive Design Patterns Reference

Quick reference guide for the responsive design patterns implemented in the Skill Barter application.

## Tailwind CSS Breakpoints Used

```
Base (mobile):  < 640px   (default, no prefix)
sm (tablet):    ≥ 640px   (@media (min-width: 640px))
md:             ≥ 768px   (@media (min-width: 768px))
lg (desktop):   ≥ 1024px  (@media (min-width: 1024px))
xl:             ≥ 1280px  (@media (min-width: 1280px))
2xl:            ≥ 1536px  (@media (min-width: 1536px))
```

## Common Responsive Patterns

### 1. Text Sizing

#### Headings - Large (H1)

```tsx
<h1 className="text-2xl sm:text-3xl font-bold">Heading Text</h1>
```

- Mobile: 24px (text-2xl)
- Tablet+: 30px (text-3xl)

#### Headings - Medium (H2)

```tsx
<h2 className="text-xl sm:text-2xl font-semibold">Section Title</h2>
```

- Mobile: 20px
- Tablet+: 24px

#### Body Text

```tsx
<p className="text-sm sm:text-base">Regular paragraph text</p>
```

- Mobile: 14px (smaller for efficiency)
- Tablet+: 16px (standard reading size)

#### Small Text

```tsx
<p className="text-xs sm:text-sm">Small caption or label</p>
```

- Mobile: 12px
- Tablet+: 14px

### 2. Button Sizing

#### Primary Button

```tsx
<button className="btn-primary text-sm sm:text-base py-2 px-4 sm:py-2.5 sm:px-5">
  Click Me
</button>
```

- Mobile: Compact `py-2 px-4` with `text-sm`
- Tablet+: Larger `py-2.5 px-5` with `text-base`

#### Icon Button

```tsx
<button className="btn-icon p-2 sm:p-2.5">
  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
</button>
```

- Mobile: Smaller padding `p-2`
- Desktop: Larger padding `p-2.5`

#### Full-Width on Mobile

```tsx
<button className="btn-primary w-full sm:w-auto">
  Mobile Full, Desktop Auto
</button>
```

- Mobile: Takes full width
- Tablet+: Fits content width

### 3. Layout Patterns

#### Single to Multi-Column Grid

**1 Column Mobile, 2+ Desktop**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

- Mobile: 1 column, compact gap
- Tablet: 2 columns
- Desktop: 3 columns, larger gap

**2 Column on Tablet, 4+ on Desktop**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {stats.map((stat) => (
    <StatCard key={stat.id} {...stat} />
  ))}
</div>
```

#### Flex Stacking

**Column on Mobile, Row on Tablet+**

```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <div className="flex-1">Content 1</div>
  <div className="flex-1">Content 2</div>
</div>
```

- Mobile: Items stack vertically
- Tablet+: Items display in row

#### Space-Between Layout

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
  <div>Left Content</div>
  <div>Right Content</div>
</div>
```

- Mobile: Stacked, gap between
- Tablet+: Side-by-side, space-between

### 4. Spacing Patterns

#### Responsive Padding

```tsx
<div className="p-4 sm:p-6 md:p-8">Responsive internal spacing</div>
```

- Mobile: 16px padding
- Tablet: 24px padding
- Desktop: 32px padding

#### Responsive Gap

```tsx
<div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</div>
```

- Mobile: 12px gap
- Tablet: 16px gap
- Desktop: 24px gap

#### Responsive Margin

```tsx
<div className="mb-6 sm:mb-8 lg:mb-12">
  Content with responsive bottom margin
</div>
```

### 5. Icon Sizing

#### Responsive Icon

```tsx
<Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
```

- Mobile: 16px (w-4)
- Tablet: 20px (w-5)
- Desktop: 24px (w-6)

#### Avatar/Circle Icon

```tsx
<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
</div>
```

### 6. Form Patterns

#### Responsive Form Grid

```tsx
<form className="space-y-4 sm:space-y-6">
  <input className="input-field text-sm" />
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
    <input className="input-field text-sm" />
    <input className="input-field text-sm" />
  </div>
</form>
```

- Mobile: Full-width fields, single column
- Tablet+: 2-column layout for related fields

#### Button Group

```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
  <button className="btn-primary flex-1 sm:flex-none">Save</button>
  <button className="btn-outline flex-1 sm:flex-none">Cancel</button>
</div>
```

- Mobile: Full-width buttons, stacked
- Tablet+: Inline buttons with space between

### 7. Card Patterns

#### Basic Responsive Card

```tsx
<div className="card p-4 sm:p-6">
  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
    Card Title
  </h3>
  <p className="text-xs sm:text-sm text-secondary-600">Card content</p>
</div>
```

#### Card with Icon

```tsx
<div className="card flex gap-3 sm:gap-4">
  <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
    <Icon className="w-full h-full" />
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="text-sm sm:text-base truncate">Title</h3>
    <p className="text-xs sm:text-sm text-secondary-600">Description</p>
  </div>
</div>
```

### 8. Modal/Overlay Patterns

#### Responsive Modal

```tsx
<div className="modal-responsive space-y-3 sm:space-y-4">
  <h2 className="text-lg sm:text-xl font-bold">Title</h2>
  <form className="space-y-3 sm:space-y-4">{/* Form fields */}</form>
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
    <button className="btn-primary flex-1 sm:flex-none text-sm">Submit</button>
    <button className="btn-outline flex-1 sm:flex-none text-sm">Cancel</button>
  </div>
</div>
```

### 9. Navigation Patterns

#### Responsive Header Navigation

```tsx
<nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 p-4 sm:p-6">
  <h1 className="text-xl sm:text-2xl font-bold">Logo</h1>
  <ul className="flex flex-col sm:flex-row gap-3 sm:gap-6">
    <li>
      <a href="#">Link 1</a>
    </li>
    <li>
      <a href="#">Link 2</a>
    </li>
  </ul>
</nav>
```

### 10. Truncation and Overflow

#### Truncate with Tooltip

```tsx
<div className="flex items-center space-x-2">
  <div className="min-w-0 flex-1">
    <p className="text-sm text-secondary-900 truncate" title={fullName}>
      {fullName}
    </p>
  </div>
</div>
```

#### Responsive Truncation

```tsx
<p className="text-sm truncate hidden sm:block">
  Shows full text on tablet+, truncated on mobile
</p>
<p className="text-xs sm:hidden">
  Shortened text visible only on mobile
</p>
```

## Utility Classes Used

### Display/Visibility

```css
.hidden = display: none
.block = display: block
.flex = display: flex
.grid = display: grid
.inline-flex = display: inline-flex
```

### Responsive Display

```css
.hidden sm:block = hidden on mobile, block on tablet+
.block sm:hidden = block on mobile, hidden on tablet+
.hidden md:block = hidden until md breakpoint
```

### Sizing

```css
.w-4 h-4 = 16px × 16px
.w-5 h-5 = 20px × 20px
.w-6 h-6 = 24px × 24px
.w-10 h-10 = 40px × 40px
.w-12 h-12 = 48px × 48px
```

### Spacing

```css
.gap-2 = 8px gap
.gap-3 = 12px gap
.gap-4 = 16px gap
.gap-6 = 24px gap

.p-2 = 8px padding
.p-3 = 12px padding
.p-4 = 16px padding
.p-6 = 24px padding

.mb-2 = 8px margin-bottom
.mb-4 = 16px margin-bottom
.mb-6 = 24px margin-bottom
```

### Flexbox

```css
.flex-col = flex-direction: column
.flex-row = flex-direction: row
.items-center = align-items: center
.items-start = align-items: flex-start
.items-end = align-items: flex-end
.justify-between = justify-content: space-between
.justify-center = justify-content: center
.flex-1 = flex: 1 (grow equal)
.flex-shrink-0 = flex-shrink: 0 (don't shrink)
```

### Grid

```css
.grid-cols-1 = 1 column
.grid-cols-2 = 2 columns
.grid-cols-3 = 3 columns
.grid-cols-4 = 4 columns
```

### Text

```css
.text-xs = 12px
.text-sm = 14px
.text-base = 16px
.text-lg = 18px
.text-xl = 20px
.text-2xl = 24px
.text-3xl = 30px

.font-medium = font-weight: 500
.font-semibold = font-weight: 600
.font-bold = font-weight: 700

.truncate = single line with ellipsis
```

## Real-World Examples from Codebase

### Dashboard Stats Cards

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <div className="flex items-center justify-between">
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm text-secondary-600 truncate">Label</p>
      <p className="text-xl sm:text-2xl font-bold text-secondary-900">Value</p>
    </div>
    <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ml-2">
      <Icon />
    </div>
  </div>
</div>
```

### Exchanges Card List

```tsx
<div className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3 sm:gap-4">
  <div className="flex items-start sm:items-center space-x-3 flex-1">
    <StatusIcon />
    <div className="min-w-0">
      <h3 className="text-sm sm:text-base truncate">Title</h3>
      <p className="text-xs sm:text-sm">Meta</p>
    </div>
  </div>
  <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:space-x-2">
    <button className="flex-1 sm:flex-none">Action</button>
  </div>
</div>
```

### Search Results Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {items.map((item) => (
    <div key={item.id} className="card">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
          <Avatar />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base truncate">{item.name}</h3>
          <p className="text-xs sm:text-sm">{item.description}</p>
        </div>
      </div>
    </div>
  ))}
</div>
```

## Tips for Maintaining Responsive Design

1. **Always use min-w-0** on flex children that need to truncate
2. **Use flex-shrink-0** on fixed-size elements in flex containers
3. **Apply gap, not margin** between flex/grid children
4. **Scale from mobile up** - start with base styles, add sm: and up
5. **Test on real devices** - browser DevTools aren't perfect
6. **Use truncate** with title attributes for long text
7. **Provide adequate touch targets** - minimum 44px × 44px
8. **Scale typography proportionally** - use text-2xl sm:text-3xl pattern
9. **Use responsive gap** - gap-3 sm:gap-4 md:gap-6
10. **Consider content first** - ensure important content is visible on mobile

## Common Mistakes to Avoid

❌ **Wrong**: Using fixed widths

```tsx
// Bad
<div className="w-200px">Content</div>
```

✅ **Right**: Using responsive widths

```tsx
// Good
<div className="w-full sm:max-w-md">Content</div>
```

❌ **Wrong**: Not scaling fonts

```tsx
// Bad
<h1 className="text-3xl">Heading</h1>
```

✅ **Right**: Scaling fonts responsively

```tsx
// Good
<h1 className="text-2xl sm:text-3xl lg:text-4xl">Heading</h1>
```

❌ **Wrong**: Horizontal scrolling

```tsx
// Bad - forces horizontal scroll
<div className="flex space-x-4">
  <div className="w-40">Item 1</div>
  <div className="w-40">Item 2</div>
</div>
```

✅ **Right**: Responsive layout

```tsx
// Good - no horizontal scroll
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

**Last Updated**: 2024
**Version**: 1.0
**Framework**: Tailwind CSS v3
**Status**: ✅ Production Ready
