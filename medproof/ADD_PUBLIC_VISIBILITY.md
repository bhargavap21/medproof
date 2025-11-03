# Add public_visibility column to hospitals table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add public_visibility column to hospitals table
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS public_visibility BOOLEAN DEFAULT true;

-- Update existing hospitals to be visible by default
UPDATE hospitals SET public_visibility = true WHERE public_visibility IS NULL;
```

This allows hospitals to control whether they appear in the Hospital Network directory for researchers.
