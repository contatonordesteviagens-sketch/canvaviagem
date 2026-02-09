

## Fix Build Error in Planos.tsx

There is a syntax error on **line 292** of `src/pages/Planos.tsx`. A JSX comment is missing its closing brace:

**Current (broken):**
```jsx
{/* Headline Principal - Clean */
```

**Fix:**
```jsx
{/* Headline Principal - Clean */}
```

This single missing `}` causes the JSX parser to lose track of the element structure, producing the "must have one parent element" and "'}' expected" errors, which prevents the entire project from building.

### Steps
1. Add the missing `}` at the end of line 292 in `src/pages/Planos.tsx`
2. Verify the preview loads without errors

