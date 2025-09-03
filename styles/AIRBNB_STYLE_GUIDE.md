# Airbnb Style Guide - Quick Reference

## 🎨 Design System Applied

Your MockTest AI now has Airbnb's clean, modern visual style. Here's how to use it:

## Color Palette

### Primary Colors (Your Brand)
```css
--color-primary: #6366F1      /* Indigo - Main brand color */
--color-primary-hover: #4F46E5 /* Darker for hover states */
--color-primary-light: #E0E7FF /* Light background accent */
```

### Text Colors (Airbnb's Hierarchy)
```css
--foreground: #222222          /* Main text - almost black */
--foreground-secondary: #717171 /* Secondary text - gray */
--foreground-muted: #B0B0B0    /* Muted text - light gray */
```

### Backgrounds
```css
--background: #FFFFFF           /* Pure white - cards, modals */
--background-secondary: #F7F7F7 /* Off-white - page background */
```

### Status Colors (Softer, Airbnb-style)
```css
--color-success: #00A699  /* Teal - success states */
--color-error: #C13515    /* Soft red - errors */
--color-warning: #FFB400  /* Warm yellow - warnings */
```

## 📦 Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn-airbnb btn-airbnb-primary">
  Take Test
</button>

<!-- Secondary Button -->
<button class="btn-airbnb btn-airbnb-secondary">
  View Details
</button>

<!-- Ghost Button -->
<button class="btn-airbnb btn-airbnb-ghost">
  Cancel
</button>
```

### Cards
```html
<!-- Basic Card -->
<div class="card-airbnb">
  <h3 class="heading-airbnb-3">Quick Test</h3>
  <p class="text-airbnb-body">5 questions • 10 minutes</p>
</div>

<!-- Clickable Card with Hover -->
<div class="card-airbnb card-airbnb-clickable hover-lift">
  <!-- Content -->
</div>
```

### Forms
```html
<!-- Input Field -->
<input 
  type="text" 
  class="input-airbnb" 
  placeholder="Enter topic name"
/>

<!-- Select Dropdown -->
<select class="select-airbnb">
  <option>Easy</option>
  <option>Medium</option>
  <option>Hard</option>
</select>

<!-- Error State -->
<input class="input-airbnb input-airbnb-error" />
```

### Typography
```html
<!-- Headings -->
<h1 class="heading-airbnb-1">Dashboard</h1>
<h2 class="heading-airbnb-2">Your Tests</h2>
<h3 class="heading-airbnb-3">Recent Activity</h3>
<h4 class="heading-airbnb-4">Test Details</h4>

<!-- Body Text -->
<p class="text-airbnb-body">Regular paragraph text</p>
<p class="text-airbnb-small">Small text for descriptions</p>
<p class="text-airbnb-xs">Tiny text for labels</p>
```

### Badges
```html
<!-- Status Badges -->
<span class="badge-airbnb badge-airbnb-success">Completed</span>
<span class="badge-airbnb badge-airbnb-warning">In Progress</span>
<span class="badge-airbnb badge-airbnb-error">Failed</span>
<span class="badge-airbnb badge-airbnb-neutral">Draft</span>
```

## 🎯 Tailwind Integration

Since you're using Tailwind v4, you can use CSS variables directly:

```html
<!-- Using CSS variables with Tailwind -->
<div class="bg-[var(--background-elevated)] shadow-[var(--shadow-card)] rounded-[var(--radius-base)]">
  <h3 class="text-[var(--foreground)] text-[var(--text-xl)]">Test Card</h3>
  <p class="text-[var(--foreground-secondary)]">Description</p>
</div>
```

## 💫 Animations

```html
<!-- Fade In -->
<div class="animate-fade-in">Content appears smoothly</div>

<!-- Slide Up -->
<div class="animate-slide-up">Content slides up</div>

<!-- Scale In -->
<div class="animate-scale-in">Content scales in</div>

<!-- Hover Effects -->
<div class="hover-lift">Lifts on hover</div>
<div class="hover-scale">Scales on hover</div>
```

## 🔄 Converting Existing Components

### Before (Old Style)
```html
<div class="bg-white rounded-lg shadow-sm p-6 border">
  <button class="bg-indigo-600 text-white px-4 py-2 rounded">
    Submit
  </button>
</div>
```

### After (Airbnb Style)
```html
<div class="card-airbnb">
  <button class="btn-airbnb btn-airbnb-primary">
    Submit
  </button>
</div>
```

## 📱 Responsive Design

```html
<!-- Container with responsive padding -->
<div class="container-airbnb">
  <!-- Content -->
</div>

<!-- Hide on mobile -->
<div class="hide-mobile">Desktop only</div>

<!-- Hide on desktop -->
<div class="hide-desktop">Mobile only</div>
```

## 🎨 Quick Style Updates

To apply Airbnb style to existing pages:

1. **Replace shadows**: 
   - `shadow-sm` → `shadow-[var(--shadow-sm)]`
   - `shadow-lg` → `shadow-[var(--shadow-lg)]`

2. **Update colors**:
   - `text-gray-600` → `text-[var(--foreground-secondary)]`
   - `bg-gray-50` → `bg-[var(--background-secondary)]`
   - `border-gray-200` → `border-[var(--border-color)]`

3. **Update buttons**:
   - Replace all button classes with `btn-airbnb btn-airbnb-primary`

4. **Update cards**:
   - Replace card divs with `card-airbnb` class

5. **Border radius**:
   - `rounded-lg` → `rounded-[var(--radius-base)]`
   - `rounded-xl` → `rounded-[var(--radius-lg)]`

## 🚀 Implementation Priority

1. **Dashboard** - Apply card styles and typography
2. **Buttons** - Update all CTAs with new button classes
3. **Forms** - Update test generation forms
4. **Modals** - Apply modal-airbnb class
5. **Navigation** - Clean, minimal header style

## 💡 Design Principles

- **Lots of white space** - Don't crowd elements
- **Subtle shadows** - Use shadows instead of borders
- **Consistent radius** - 12px for cards, 8px for buttons
- **Clear hierarchy** - Use color and size to show importance
- **Smooth transitions** - Everything should animate smoothly