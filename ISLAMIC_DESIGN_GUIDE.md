# 🕌 Islamic Modern Design System - Implementation Guide

## 📚 Table of Contents
1. [Core Components](#core-components)
2. [Color Palette](#color-palette)
3. [Pattern Library](#pattern-library)
4. [Implementation Examples](#implementation-examples)
5. [Quick Reference](#quick-reference)

---

## 🎨 Core Components

### 1. IslamicCard
```jsx
import { IslamicCard, IslamicCardHeader } from '@/components/ui/IslamicCard';

<IslamicCard pattern decorative hover>
  <IslamicCardHeader
    icon={BookOpen}
    title="Card Title"
    subtitle="Optional subtitle"
    action={<button>Action</button>}
  />
  {/* Content */}
</IslamicCard>
```

### 2. IslamicButton
```jsx
import { IslamicButton, IslamicIconButton } from '@/components/ui/IslamicButton';

<IslamicButton variant="primary" icon={Save}>
  Save Data
</IslamicButton>

<IslamicIconButton icon={Edit} variant="secondary" tooltip="Edit" />
```

### 3. IslamicPageHeader
```jsx
import { IslamicPageHeader } from '@/components/ui/IslamicPageHeader';

<IslamicPageHeader
  icon={Users}
  title="Page Title"
  subtitle="Description"
  badge="2024/2025"
  actions={<IslamicButton>Action</IslamicButton>}
/>
```

---

## 🎨 Color Palette

### Sage (Primary - Islamic Green)
```
sage-50: #f8faf7   /* Lightest */
sage-100: #e8f0e5
sage-200: #d1e1cc
sage-300: #a8c5a0
sage-400: #7fa978
sage-500: #5f8d58  /* Base */
sage-600: #4a7046
sage-700: #3c5a39
sage-800: #32482f
sage-900: #2a3d28  /* Darkest */
```

### Cream (Warm Accent)
```
cream-50: #fdfcfa   /* Lightest */
cream-100: #faf7f2
cream-200: #f5ede0
cream-300: #ecddc8
cream-400: #dfc8a8
cream-500: #d0b088  /* Base */
cream-600: #b8956f
cream-700: #9a7958
cream-800: #7c614a
cream-900: #64513e  /* Darkest */
```

### Gradient Combinations
```jsx
// Emerald to Teal (Success)
from-emerald-400 to-teal-500

// Amber to Orange (Primary CTA)
from-amber-400 to-orange-500

// Blue to Indigo (Info)
from-blue-400 to-indigo-500

// Purple to Violet (Special)
from-purple-400 to-violet-500

// Red to Rose (Danger)
from-red-400 to-rose-500
```

---

## 🕌 Pattern Library

### Full Page Background
```jsx
<div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L61.8 38.2 100 38.2 69.1 61.8 80.9 100 50 76.4 19.1 100 30.9 61.8 0 38.2 38.2 38.2 Z' fill='%23059669' fill-opacity='1'/%3E%3C/svg%3E")`,
  backgroundSize: '100px 100px'
}}></div>
```

### Card Pattern (Cross/Plus)
```jsx
<div className="absolute inset-0 opacity-[0.03]" style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  backgroundSize: '60px 60px'
}}></div>
```

### Card Pattern (Circles)
```jsx
<div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
}}></div>
```

---

## 💡 Implementation Examples

### Before & After - Simple List Page

#### ❌ Before (Old Design)
```jsx
export default function ListPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Page Title</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <table>...</table>
        </div>
      </div>
    </AdminLayout>
  );
}
```

#### ✅ After (Islamic Modern)
```jsx
import { IslamicPageHeader } from '@/components/ui/IslamicPageHeader';
import { IslamicCard, IslamicCardHeader } from '@/components/ui/IslamicCard';
import { IslamicButton } from '@/components/ui/IslamicButton';
import { Users, Plus } from 'lucide-react';

export default function ListPage() {
  return (
    <AdminLayout>
      {/* Full Page Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L61.8 38.2 100 38.2 69.1 61.8 80.9 100 50 76.4 19.1 100 30.9 61.8 0 38.2 38.2 38.2 Z' fill='%23059669' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      <div className="relative space-y-6 pb-8">
        <IslamicPageHeader
          icon={Users}
          title="Page Title"
          subtitle="Manage your data"
          actions={
            <IslamicButton icon={Plus} variant="primary">
              Add New
            </IslamicButton>
          }
        />

        <IslamicCard pattern decorative>
          <IslamicCardHeader
            icon={Users}
            title="Data List"
            subtitle="Total: 100 items"
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table with modern styling */}
            </table>
          </div>
        </IslamicCard>
      </div>
    </AdminLayout>
  );
}
```

---

## ⚡ Quick Reference

### Card Styling Pattern
```jsx
className="
  relative bg-white rounded-3xl p-8
  shadow-md hover:shadow-xl
  border border-sage-100
  transition-all duration-300
  overflow-hidden
"
```

### Gradient Icon Badge
```jsx
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
</div>
```

### Decorative Circles
```jsx
{/* Top Right */}
<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full"></div>

{/* Bottom Left */}
<div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-100/20 to-transparent rounded-full"></div>
```

### Text Gradients
```jsx
{/* Heading */}
className="text-4xl font-bold bg-gradient-to-r from-sage-800 to-emerald-700 bg-clip-text text-transparent"

{/* Number/Value */}
className="text-3xl font-bold bg-gradient-to-br from-sage-700 to-sage-500 bg-clip-text text-transparent"
```

### Hover Effects
```jsx
{/* Scale on Hover */}
className="group-hover:scale-110 transition-transform duration-300"

{/* Rotate on Hover */}
className="group-hover:rotate-3 transition-all duration-300"

{/* Shadow on Hover */}
className="hover:shadow-2xl transition-shadow duration-500"
```

### Progress Bar
```jsx
<div className="relative w-full h-3 bg-sage-100 rounded-full overflow-hidden">
  <div
    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
    style={{ width: `${progress}%` }}
  >
    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
  </div>
</div>
```

### Alert/Notification Cards
```jsx
<div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200 shadow-md overflow-hidden">
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
  <div className="relative flex items-start gap-5">
    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-emerald-900 mb-2">Alert Title</h3>
      <p className="text-emerald-800">Message content</p>
    </div>
  </div>
</div>
```

---

## 🚀 How to Apply to Your Pages

1. **Import Components**
   ```jsx
   import { IslamicPageHeader } from '@/components/ui/IslamicPageHeader';
   import { IslamicCard } from '@/components/ui/IslamicCard';
   import { IslamicButton } from '@/components/ui/IslamicButton';
   ```

2. **Add Full Page Background**
   - Copy pattern background div to your page layout

3. **Replace Old Headers**
   - Use `<IslamicPageHeader />` instead of plain h1

4. **Wrap Content in IslamicCard**
   - Replace plain divs with `<IslamicCard>`

5. **Update Buttons**
   - Replace old buttons with `<IslamicButton>`

6. **Add Gradient to Icons**
   - Wrap icons in gradient badge divs

7. **Apply Hover Effects**
   - Add `group` to parent, `group-hover:scale-110` to child

---

## 📋 Checklist per Page

- [ ] Full page pattern background added
- [ ] IslamicPageHeader implemented
- [ ] All cards wrapped in IslamicCard
- [ ] Buttons converted to IslamicButton
- [ ] Icons have gradient badges
- [ ] Hover effects applied
- [ ] Text gradients on headers
- [ ] Border-radius updated to rounded-3xl/2xl
- [ ] Colors updated to sage/cream/gradients
- [ ] Decorative elements added where appropriate

---

## 🎯 Priority Pages to Update

### Admin (13 pages)
1. ✅ `/admin/dashboard` - Already done
2. `/admin/siswa` - Student management
3. `/admin/guru` - Teacher management
4. `/admin/kelas` - Class management
5. `/admin/tahun-ajaran` - Academic year
6. `/admin/orangtua` - Parent management
7. `/admin/validasi-siswa` - Student validation
8. `/admin/laporan/hafalan` - Memorization report
9. `/admin/laporan/kehadiran` - Attendance report
10. `/admin/laporan/statistik` - Statistics report
11. `/admin/activity-logs` - Activity logs
12. `/admin/kelas/[id]` - Class detail

### Guru (TBD)
- Find all guru pages first

### Siswa/Dashboard (TBD)
- Find all dashboard pages first

### Orang Tua (TBD)
- Find all orangtua pages first

---

**Made with ❤️ for SIMTAQ (Sistem Informasi Manajemen Tahfidz Qur'an)**
