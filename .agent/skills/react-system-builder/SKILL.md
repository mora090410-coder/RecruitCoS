---
name: react-system-builder
description: Use this skill when building UI components, integrating Gemini API, or frontend optimization.
---
# React System Builder Skill
This skill defines the standards for UI components and AI integration.

## Visual Target: The Perfect Component
```tsx
// 1. Imports
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// 2. Types
interface ComponentProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

// 3. Component Definition
export function MyComponent({ children, variant = 'primary' }: ComponentProps) {
  // 4. Logic & Hooks
  
  return (
    // 5. Semantic HTML & Accessibility
    <section className={/* Tailwind classes */}>
      {children}
    </section>
  );
}

// 6. Error Boundary Wrapper (if complex)
export function SecureMyComponent(props: ComponentProps) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MyComponent {...props} />
    </ErrorBoundary>
  );
}
```

## Gemini Integration Logic
- **Streaming is Mandatory**: When integrating AI responses, use streaming hooks to handle latency and provide immediate feedback.
- **Loading States**: Always show a skeleton or spinner while waiting for the stream to start.
- **Fallbacks**: Handle connection errors gracefully.

## Success Criteria
Output must end with:
```json
{
  "hooks_used": ["useState", "useStreaming"],
  "accessibility_checks": {
    "aria_labels": true,
    "keyboard_nav": true,
    "contrast_ratio": "pass"
  }
}
```
