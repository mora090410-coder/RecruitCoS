# React Patterns Standard

> [!IMPORTANT]
> These rules are mandatory for all React development in this project.

## React 19 Actions
- Use React 19 Actions for all data mutations.
- Avoid `useEffect` for data fetching where possible; prefer Server Components or appropriate hooks.
- Handle pending states using `usePending` (or `useFormStatus` within forms).

## Strict TypeScript Usage
- **No `any` types.** Use `unknown` if the type is truly uncertain, and narrow it down.
- Define interfaces for all props and state.
- Use discriminating unions for complex state logic.
- Ensure strict null checks are respected.

## Tailwind Utility Sorting
- Follow a consistent ordering for Tailwind classes.
- Recommended order: Layout -> Sizing -> Spacing -> Typography -> Visuals -> Misc.
- Use `clsx` or `tailwind-merge` for conditional classes to avoid conflicts.
- Group related utilities (e.g., `flex items-center justify-between`).
