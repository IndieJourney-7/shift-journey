# Shift Journey - Project Instructions

> **This document is the single source of truth for all development decisions.**
> Read this completely before making any changes.

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Core Philosophy](#core-philosophy)
3. [Application Structure](#application-structure)
4. [Design System](#design-system)
5. [Technical Stack](#technical-stack)
6. [Component Guidelines](#component-guidelines)
7. [State Management](#state-management)
8. [Business Rules](#business-rules)
9. [Security Guidelines](#security-guidelines)
10. [Code Standards](#code-standards)
11. [File Structure](#file-structure)
12. [Do's and Don'ts](#dos-and-donts)

---

## Product Vision

### What is Shift Journey?

Shift Journey is **NOT** a todo app, habit tracker, or task manager.

It is a **commitment system** that creates **irreversible accountability** through locked promises.

### Core Purpose

> "The product exists to create commitment, not motivation."

Users break one long-term goal into milestones, then convert one milestone at a time into a **locked promise** that cannot be edited, deleted, or skipped.

### Target User

People who:
- Have failed with traditional productivity apps
- Need external pressure to follow through
- Want consequences for broken commitments
- Value integrity and accountability

---

## Core Philosophy

### Consequences Philosophy

```
Consequences are NOT punishment or shame.
They are MEMORY and IDENTITY PRESSURE.
The product should feel SERIOUS, CALM, and IRREVERSIBLE.
```

### Key Principles

1. **No Escape** - Once locked, a promise cannot be modified
2. **Visible Failure** - Broken promises are permanently recorded
3. **One Focus** - Only one goal and one locked promise at a time
4. **No Gamification** - No points, badges, streaks, or celebrations
5. **Quiet Seriousness** - The UI should feel like a contract, not a game

---

## Application Structure

### User Flow

```
1. CREATE GOAL (safe, editable)
       ↓
2. ADD MILESTONES (planning stage, safe)
       ↓
3. SELECT MILESTONE → WRITE PROMISE → SET DEADLINE
       ↓
4. LOCK PROMISE (irreversible)
       ↓
5. WORK ON PROMISE
       ↓
   ┌────────────────┬────────────────┐
   ↓                ↓                ↓
COMPLETE        DEADLINE PASSES   MANUAL BREAK
(before deadline)  (auto-break)    (with reason)
   ↓                ↓                ↓
+10 Integrity    -15 Integrity    -15 Integrity
   ↓                ↓                ↓
   └────────────────┴────────────────┘
                    ↓
            NEXT MILESTONE
```

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Marketing, value proposition |
| Login | `/login` | Authentication (demo mode) |
| Dashboard | `/dashboard` | Journey view, current promise, countdown |
| Goal Creation | `/goal/create` | Create new goal |
| Milestones | `/milestones` | Add/edit milestones |
| Lock Promise | `/lock-promise/:id` | Lock a milestone as promise |
| Calendar | `/calendar` | Daily work evidence |
| Profile | `/profile` | Integrity score, failure history |
| History | `/history` | All completed/broken milestones |
| Settings | `/settings` | Account, notifications, danger zone |
| Help | `/help` | FAQ and guidance |

---

## Design System

### Color Palette - "Obsidian Theme"

```css
/* Primary Background Colors */
--obsidian-950: #0a0a0a;  /* Main background */
--obsidian-900: #121212;  /* Cards, sidebar */
--obsidian-800: #1a1a1a;  /* Elevated surfaces */
--obsidian-700: #252525;  /* Borders, dividers */
--obsidian-600: #333333;  /* Secondary borders */

/* Text Colors */
--obsidian-500: #4a4a4a;  /* Disabled text */
--obsidian-400: #666666;  /* Secondary text */
--obsidian-300: #888888;  /* Body text */
--obsidian-200: #aaaaaa;  /* Primary text */
--obsidian-100: #cccccc;  /* Headings, emphasis */

/* Accent Colors */
--gold-500: #c9a962;      /* Primary accent (locks, active states) */
--gold-400: #d4b978;      /* Hover states */
--gold-300: #e0ca8e;      /* Light accent */

/* Status Colors */
--green-400: #22c55e;     /* Success, completed */
--red-400: #ef4444;       /* Error, broken */
--yellow-400: #eab308;    /* Warning, building trust */

/* Special */
--broken-500: #8b4513;    /* Cracked/broken visual */
```

### Typography

```css
/* Font Families */
font-family: 'Inter', system-ui, sans-serif;  /* Primary */
font-family: 'Playfair Display', Georgia, serif;  /* Headings (optional) */

/* Font Sizes */
text-xs: 0.75rem;    /* 12px - Labels, captions */
text-sm: 0.875rem;   /* 14px - Secondary text */
text-base: 1rem;     /* 16px - Body text */
text-lg: 1.125rem;   /* 18px - Subheadings */
text-xl: 1.25rem;    /* 20px - Section titles */
text-2xl: 1.5rem;    /* 24px - Page titles */
text-3xl: 1.875rem;  /* 30px - Hero text */
text-4xl: 2.25rem;   /* 36px - Large display */
```

### Visual Elements

1. **Locks** - Represent commitment (gold when active, gray when pending)
2. **Journey Path** - SVG curved line with nodes for milestones
3. **Glowing Node** - Active/locked milestone pulses with gold glow
4. **Cracked Node** - Broken promises show crack pattern overlay
5. **Integrity Gauge** - Semi-circular meter showing trust level

### Design Rules

```
✗ NO bright colors (except status indicators)
✗ NO gamification elements (badges, points display, streaks)
✗ NO celebration animations (confetti, fireworks)
✗ NO playful UI (rounded bubbles, fun icons)
✗ NO emojis unless user explicitly requests

✓ Minimal, quiet, serious aesthetic
✓ High contrast text on dark backgrounds
✓ Subtle animations (gentle glows, smooth transitions)
✓ Clear visual hierarchy
✓ Consistent spacing (4px base unit)
```

---

## Technical Stack

### Core Technologies

```json
{
  "framework": "React 18",
  "styling": "Tailwind CSS 3",
  "routing": "React Router DOM 6",
  "icons": "Lucide React",
  "build": "Vite 5",
  "state": "React Context + localStorage"
}
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0"
  }
}
```

### No Backend (Frontend Only)

- All data stored in `localStorage`
- Mock authentication (demo mode)
- No API calls required
- State persists across browser sessions

---

## Component Guidelines

### Reusable UI Components

Located in `src/components/ui/`:

| Component | Purpose | Variants |
|-----------|---------|----------|
| `Button` | Actions | primary, secondary, gold, danger, ghost |
| `Card` | Containers | default, elevated, highlighted, broken, locked |
| `Input` | Text input | With label, error states |
| `Textarea` | Multi-line input | With label, error states |
| `Badge` | Status labels | default, locked, completed, broken, pending |
| `Modal` | Dialogs | sm, md, lg sizes |

### Journey Components

Located in `src/components/journey/`:

| Component | Purpose |
|-----------|---------|
| `JourneyPath` | SVG visualization of milestone path |
| `MilestoneCard` | Individual milestone display |
| `CountdownTimer` | Live countdown to deadline |
| `IntegrityGauge` | Semi-circular score display |
| `LockAnimation` | Locking promise animation |

### Component Rules

```jsx
// ✓ GOOD: Reusable, prop-driven
<Button variant="gold" size="lg" icon={Lock}>
  Lock Promise
</Button>

// ✗ BAD: Inline styles, hardcoded values
<button style={{ background: '#c9a962' }}>
  Lock Promise
</button>
```

---

## State Management

### Context Structure

```javascript
// AppContext provides:
{
  // User State
  user,                    // User profile + integrity score
  isAuthenticated,         // Login status

  // Goal State
  currentGoal,             // Active goal (only one)
  milestones,              // Array of milestones
  currentLockedMilestone,  // Currently locked promise
  nextPendingMilestone,    // Next available to lock

  // Tracking
  calendarData,            // Daily work evidence
  failureHistory,          // Permanent failure record

  // Flags
  hasActivePromise,        // Boolean: is something locked?
  canCreateNewGoal,        // Boolean: allowed to create goal?
  expiredPromise,          // Milestone that just expired (for modal)

  // Actions
  createGoal,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  lockPromise,
  completeMilestone,
  breakPromise,
  // ... etc
}
```

### localStorage Keys

```javascript
const STORAGE_KEYS = {
  USER: 'shift_journey_user',
  GOAL: 'shift_journey_goal',
  MILESTONES: 'shift_journey_milestones',
  CALENDAR: 'shift_journey_calendar',
  FAILURES: 'shift_journey_failures',
  AUTH: 'shift_journey_auth',
};
```

---

## Business Rules

### CRITICAL RULES (Never Break These)

```
1. ONE GOAL AT A TIME
   - User can only have one active goal
   - Cannot create new goal while promise is locked

2. ONE LOCKED PROMISE AT A TIME
   - Only one milestone can be "locked" status
   - Must complete/break before locking another

3. LOCKED = IMMUTABLE
   - Cannot edit promise text after locking
   - Cannot change deadline after locking
   - Cannot delete locked milestone
   - Cannot skip locked milestone

4. FAILURE IS PERMANENT
   - Broken promises recorded in failureHistory
   - Cannot delete failure records
   - Cannot hide failure records
   - Failure history survives goal reset

5. DEADLINE ENFORCEMENT
   - Auto-break when deadline passes
   - Check runs every second
   - Also checks on app load
   - User cannot mark complete after deadline

6. REASON REQUIRED FOR BREAK
   - Manual break requires written reason
   - Auto-break has system-generated reason
   - Reason is permanently recorded
```

### Integrity Score Rules

```javascript
// Score ranges
100 - 70: "Trusted"        (green)
69 - 50:  "Building Trust" (yellow)
49 - 0:   "Untrusted"      (red)

// Score changes
Complete promise on time:  +10 points
Break promise (any way):   -15 points

// Boundaries
Minimum: 0
Maximum: 100
```

### Milestone Status Flow

```
pending → locked → completed
                ↘ broken

// Valid transitions:
pending → locked    (user locks promise)
locked → completed  (user marks complete before deadline)
locked → broken     (deadline passes OR user admits failure)

// Invalid transitions:
locked → pending    (NEVER - no unlocking)
broken → anything   (NEVER - permanent)
completed → anything (NEVER - permanent)
```

---

## Security Guidelines

### Input Validation

```javascript
// Always validate user input
if (!reason || !reason.trim()) {
  throw new Error('Reason is required');
}

// Sanitize before display (React does this by default)
// Never use dangerouslySetInnerHTML with user content
```

### State Protection

```javascript
// Always check permissions before actions
const completeMilestone = (id) => {
  const milestone = milestones.find(m => m.id === id);

  // Guard: Must exist
  if (!milestone) throw new Error('Milestone not found');

  // Guard: Must be locked
  if (milestone.status !== 'locked') {
    throw new Error('Can only complete locked milestone');
  }

  // Guard: Must be before deadline
  if (new Date() > new Date(milestone.promise.deadline)) {
    throw new Error('Deadline has passed');
  }

  // ... proceed with completion
};
```

### localStorage Security

```javascript
// Always try-catch localStorage operations
const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};
```

### No Sensitive Data

```
✓ Store: User preferences, goals, milestones
✗ Never Store: Passwords, tokens, PII beyond email
```

---

## Code Standards

### File Naming

```
components/ui/Button.jsx       // PascalCase for components
components/ui/index.js         // lowercase for index files
pages/DashboardPage.jsx        // PascalCase + Page suffix
context/AppContext.jsx         // PascalCase + Context suffix
```

### Component Structure

```jsx
// Standard component structure
import React, { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Card } from '../components/ui';

export default function ComponentName({ prop1, prop2 }) {
  // 1. Hooks
  const { contextValue } = useApp();
  const [state, setState] = useState(null);

  // 2. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3. Handlers
  const handleAction = () => {
    // ...
  };

  // 4. Render helpers (if needed)
  const renderItem = (item) => (
    <div key={item.id}>{item.name}</div>
  );

  // 5. Main render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Tailwind Class Order

```jsx
// Order: Layout → Spacing → Sizing → Visual → Interactive → Responsive
<div className="
  flex items-center justify-between    // Layout
  p-4 mb-6                             // Spacing
  w-full max-w-md                      // Sizing
  bg-obsidian-800 border rounded-lg   // Visual
  hover:bg-obsidian-700 transition    // Interactive
  md:flex-row                          // Responsive
">
```

### Import Order

```javascript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';

// 3. Local components
import { Button, Card } from '../components/ui';
import { JourneyPath } from '../components/journey';

// 4. Context/hooks
import { useApp } from '../context/AppContext';

// 5. Utils/constants (if any)
import { formatDate } from '../utils/helpers';
```

---

## File Structure

```
shift-journey/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── index.js           # Barrel export
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Modal.jsx
│   │   ├── journey/               # Domain-specific components
│   │   │   ├── index.js
│   │   │   ├── JourneyPath.jsx
│   │   │   ├── MilestoneCard.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── IntegrityGauge.jsx
│   │   │   └── LockAnimation.jsx
│   │   └── layout/                # Layout components
│   │       ├── index.js
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── AppLayout.jsx
│   ├── context/
│   │   └── AppContext.jsx         # Global state management
│   ├── pages/
│   │   ├── index.js               # Barrel export
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── GoalCreationPage.jsx
│   │   ├── MilestonesPage.jsx
│   │   ├── LockPromisePage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── HelpPage.jsx
│   ├── App.jsx                    # Root component with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── INSTRUCTIONS.md                # This file
```

---

## Do's and Don'ts

### DO ✓

```
✓ Follow the Obsidian color theme strictly
✓ Use existing UI components from src/components/ui/
✓ Check hasActivePromise before allowing new locks
✓ Persist all state changes to localStorage
✓ Show clear error messages for invalid actions
✓ Maintain the serious, quiet tone in all UI text
✓ Use the countdown timer for locked promises
✓ Show cracked visuals for broken milestones
✓ Require reasons for broken promises
✓ Keep failure history permanent and visible
```

### DON'T ✗

```
✗ Add bright colors or gamification elements
✗ Allow editing/deleting locked promises
✗ Let users skip or hide failures
✗ Add celebration animations
✗ Use playful language or emojis
✗ Create multiple active goals
✗ Lock multiple promises simultaneously
✗ Allow completion after deadline passes
✗ Make soft resets that erase failure history
✗ Add social features or sharing
```

---

## Quick Reference

### Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Key Context Values

```javascript
const {
  currentLockedMilestone,  // The one locked promise
  hasActivePromise,        // Quick boolean check
  canCreateNewGoal,        // Safe to create goal?
  expiredPromise,          // Just expired? Show modal
  getTimeRemaining,        // Returns { hours, minutes, seconds, expired }
} = useApp();
```

### Common Patterns

```jsx
// Checking if action is allowed
{!hasActivePromise && <Button>Lock Next Promise</Button>}

// Showing time remaining
<CountdownTimer deadline={milestone.promise.deadline} />

// Conditional styling by status
className={`
  ${status === 'locked' ? 'border-gold-500' : ''}
  ${status === 'broken' ? 'border-red-800' : ''}
  ${status === 'completed' ? 'border-green-700' : ''}
`}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Core app structure, all pages |
| 1.1.0 | Update | Auto-expiration, localStorage, custom consequences |

---

**Remember: This app is about irreversible commitment. Every feature should reinforce that there is no escape from your promises.**
