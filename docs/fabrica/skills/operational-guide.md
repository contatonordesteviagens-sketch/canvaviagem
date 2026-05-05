# Skill: Operational Guide & Deployment

## Accessing the Tool
- **URL**: `https://canvaviagem.com/fabrica`
- **Internal Password**: `rickbread`

## Deployment Flow (Manual)
The project uses a standard Vite build process. To deploy changes manually from the local terminal:

```powershell
# 1. Build validation
npm run build

# 2. Deploy to Production (GitHub -> Lovable)
git add .
git commit -m "Your descriptive message"
git push origin main
```

## Troubleshooting Component Errors
If you encounter a `ReferenceError` like "Cannot access Te before initialization":
- **Cause**: Usually a Temporal Dead Zone (TDZ) issue where a function uses a state variable defined later in the component.
- **Fix**: Move all `useState` and `useEffect` hooks to the very top of the React component, above any helper functions.

## Local Development
Run `npm run dev` and access `http://localhost:8080/fabrica`. Ensure your `.env` file has the necessary Supabase credentials to test AI features.
