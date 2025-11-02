# Mobile-Native Design Fixes - Quick Reference

## Problem Statement
- Cards terlalu kecil/sempit di mobile
- Masih ada horizontal scroll
- Tidak terlihat seperti native mobile app

## Solution Strategy

### 1. Container/Wrapper Fixes
```javascript
// Main container - CRITICAL untuk prevent overflow
style={{
  minHeight: '100vh',
  width: '100%',
  maxWidth: '100vw',
  overflowX: 'hidden',
  position: 'relative',
}}

// Content wrapper - untuk centering dengan max-width
style={{
  width: '100%',
  maxWidth: '1280px', // max container
  margin: '0 auto',
  padding: '20px', // mobile base
}}
className="md:px-8 lg:px-12"
```

### 2. Card Styling - Mobile-Native
```javascript
// Stats/Info Cards
style={{
  width: '100%',
  padding: '24px', // generous padding
  minHeight: '140px', // consistent height
  borderRadius: '16px',
  background: '#FFFFFF',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}}
className="md:p-6 lg:p-8"

// Icon containers
style={{
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}}
```

### 3. Grid Layouts - Mobile First
```javascript
// Stats grid
style={{
  display: 'grid',
  gridTemplateColumns: '1fr', // mobile: 1 column
  gap: '20px',
  width: '100%',
}}
className="sm:grid-cols-2 lg:grid-cols-3 md:gap-6"

// Content grid
style={{
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
  width: '100%',
}}
className="lg:grid-cols-2"
```

### 4. Typography - Readable on Mobile
```javascript
// Page title
style={{
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1.2,
}}
className="md:text-3xl lg:text-4xl"

// Card title
style={{
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: 1.3,
}}
className="md:text-xl lg:text-2xl"

// Body text
style={{
  fontSize: '14px',
  lineHeight: 1.5,
}}
className="md:text-base"

// Stats numbers
style={{
  fontSize: '32px',
  fontWeight: 700,
}}
className="md:text-4xl lg:text-5xl"
```

### 5. Buttons - Touch-Friendly
```javascript
style={{
  minHeight: '48px', // iOS HIG standard
  padding: '12px 20px',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '12px',
  width: '100%', // full width mobile
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}}
className="sm:w-auto md:px-6 md:text-base"
```

### 6. Spacing - Generous
```javascript
// Section spacing
style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '24px', // mobile
}}
className="md:gap-8"

// Padding patterns
- Mobile: 20-24px
- Tablet: 28-32px
- Desktop: 32-48px
```

### 7. Critical Fixes for All Pages

**Remove these patterns:**
- Fixed widths like `width: '280px'`
- Small padding like `padding: '12px'`
- `minmax(400px, 1fr)` in grids
- Any `overflow: visible` on decorative elements

**Add these patterns:**
- `width: '100%'` on all cards
- `maxWidth: '100vw'` on containers
- `overflowX: 'hidden'` on wrapper
- `flexShrink: 0` on icons
- `minHeight` on buttons (48px+)

## Implementation Checklist

### Guru Dashboard
- [ ] Main container: overflow-x-hidden, max-width-100vw
- [ ] Content padding: 20px base, md:32px, lg:48px
- [ ] Stats cards: width 100%, padding 24px, min-height 140px
- [ ] Grid: 1 col mobile, 2 tablet, 3 desktop
- [ ] Buttons: min-height 48px, full width mobile
- [ ] Modal: max-height 90vh, overflow-y auto

### Siswa Dashboard
- [ ] Greeting card: width 100%, padding 24px+
- [ ] Decorative elements: contained, no overflow
- [ ] Badges: padding 12px, readable text
- [ ] Grid cards: width 100%, generous spacing

### Orang Tua Dashboard
- [ ] Similar pattern as Siswa
- [ ] Child info cards: full width, clear spacing
- [ ] Text wrapping: proper overflow handling

### Admin Dashboard
- [ ] Check if exists in /admin/dashboard
- [ ] Apply same patterns

## Testing Checklist

### Mobile (375px - 640px)
- [ ] No horizontal scroll at all
- [ ] Cards look full and generous (not cramped)
- [ ] Text readable without zoom
- [ ] Buttons easy to tap (48px+)
- [ ] Spacing comfortable (20-24px)
- [ ] All content fits viewport width

### Tablet (640px - 1024px)
- [ ] Smooth transition from mobile
- [ ] 2-column grids working
- [ ] Padding increases appropriately
- [ ] Text sizes scale up

### Desktop (1024px+)
- [ ] 3-column grids where applicable
- [ ] Max container width prevents too-wide layout
- [ ] Maintains visual hierarchy

## Quick Fixes Script

Run these replacements:

1. Container padding: Change `padding: '32px 48px'` to `padding: '20px'` + className="md:px-8 lg:px-12"
2. Card padding: Change `padding: '20px'` to `padding: '24px'` + className="md:p-6"
3. Grid: Change `gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'` to `gridTemplateColumns: '1fr'` + className="sm:grid-cols-2 lg:grid-cols-3"
4. Buttons: Add `minHeight: '48px'` and `width: '100%'` + className="sm:w-auto"
5. Add to main wrapper: `overflowX: 'hidden'` and `maxWidth: '100vw'`
