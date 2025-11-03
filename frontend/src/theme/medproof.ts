/**
 * MedProof Design System - Dark Theme
 * Consistent design tokens extracted from the landing page
 */

export const medproofTheme = {
  // Core Colors
  colors: {
    // Backgrounds
    primary: '#0d1117',           // Main page background
    secondary: '#161b22',         // Card backgrounds
    tertiary: '#1d222a',          // Elevated surfaces

    // Borders & Dividers
    border: '#30363d',            // Primary border color
    divider: '#21262d',           // Subtle dividers

    // Accent Colors
    accent: '#58a6ff',            // Primary blue accent
    accentHover: '#4c94ff',       // Hover state for accent
    success: '#238636',           // Success/green states
    warning: '#fb8500',           // Warning states
    error: '#da3633',             // Error states

    // Text Colors
    text: {
      primary: '#f0f6fc',         // Main text
      secondary: '#8b949e',       // Secondary text
      muted: '#6e7681',           // Muted text
      inverse: '#24292f',         // Dark text on light backgrounds
    },

    // Interactive States
    hover: 'rgba(88, 166, 255, 0.1)',      // Hover overlay
    active: 'rgba(88, 166, 255, 0.2)',     // Active overlay
    focus: 'rgba(88, 166, 255, 0.3)',      // Focus overlay
  },

  // Typography Scale
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyDisplay: 'Playfair Display, serif',

    // Font Sizes
    size: {
      xs: '0.75rem',              // 12px
      sm: '0.875rem',             // 14px
      base: '1rem',               // 16px
      lg: '1.125rem',             // 18px
      xl: '1.25rem',              // 20px
      '2xl': '1.5rem',            // 24px
      '3xl': '2rem',              // 32px
      '4xl': '2.5rem',            // 40px
      '5xl': '3rem',              // 48px
    },

    // Font Weights
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Heights
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.6,
    },
  },

  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',                 // 4px
    2: '0.5rem',                  // 8px
    3: '0.75rem',                 // 12px
    4: '1rem',                    // 16px
    5: '1.25rem',                 // 20px
    6: '1.5rem',                  // 24px
    8: '2rem',                    // 32px
    10: '2.5rem',                 // 40px
    12: '3rem',                   // 48px
    16: '4rem',                   // 64px
    20: '5rem',                   // 80px
    24: '6rem',                   // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',                // 4px
    base: '0.5rem',               // 8px
    md: '0.75rem',                // 12px
    lg: '1rem',                   // 16px
    xl: '1.5rem',                 // 24px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    base: '0 4px 8px rgba(0, 0, 0, 0.15)',
    md: '0 8px 16px rgba(0, 0, 0, 0.2)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.25)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },

  // Effects
  effects: {
    backdropBlur: 'blur(8px)',
    gradient: {
      radial: 'radial-gradient(circle at center, rgba(26,37,111,0.4) 0%, transparent 50%)',
      radialSubtle: 'radial-gradient(circle at 60% 80%, #1e3a5f 0%, transparent 40%)',
      divider: 'linear-gradient(to right, transparent, #30363d, transparent)',
    },
    transition: {
      fast: '0.15s ease',
      base: '0.2s ease',
      slow: '0.3s ease',
    },
  },

  // Component Patterns
  components: {
    card: {
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
    },

    button: {
      primary: {
        background: '#58a6ff',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        hover: {
          background: '#4c94ff',
          transform: 'translateY(-1px)',
        },
      },

      secondary: {
        background: 'transparent',
        color: '#58a6ff',
        border: '1px solid #58a6ff',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        hover: {
          background: 'rgba(88, 166, 255, 0.1)',
        },
      },
    },

    chip: {
      background: '#161b22',
      border: '1px solid #30363d',
      color: '#8b949e',
      borderRadius: '1rem',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
  },
} as const;

export type MedproofTheme = typeof medproofTheme;

// Helper function to create sx props with theme values
export const createSx = (styles: any) => styles;

// Common component styles following the design system
export const commonStyles = {
  pageContainer: {
    minHeight: '100vh',
    background: medproofTheme.colors.primary,
    color: medproofTheme.colors.text.primary,
    fontFamily: medproofTheme.typography.fontFamily,
  },

  card: {
    background: medproofTheme.colors.secondary,
    border: `1px solid ${medproofTheme.colors.border}`,
    borderRadius: medproofTheme.borderRadius.md,
    transition: medproofTheme.effects.transition.base,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: medproofTheme.boxShadow.md,
    },
  },

  cardContent: {
    color: medproofTheme.colors.text.primary,
    '& .MuiTypography-root': {
      color: 'inherit',
    },
  },

  primaryButton: {
    background: medproofTheme.colors.accent,
    color: '#ffffff',
    borderRadius: medproofTheme.borderRadius.base,
    textTransform: 'none',
    fontWeight: medproofTheme.typography.weight.semibold,
    transition: medproofTheme.effects.transition.base,
    '&:hover': {
      background: medproofTheme.colors.accentHover,
      transform: 'translateY(-1px)',
    },
  },

  secondaryButton: {
    background: 'transparent',
    color: medproofTheme.colors.accent,
    border: `1px solid ${medproofTheme.colors.accent}`,
    borderRadius: medproofTheme.borderRadius.base,
    textTransform: 'none',
    fontWeight: medproofTheme.typography.weight.semibold,
    transition: medproofTheme.effects.transition.base,
    '&:hover': {
      background: medproofTheme.colors.hover,
    },
  },

  chip: {
    background: medproofTheme.colors.secondary,
    border: `1px solid ${medproofTheme.colors.border}`,
    color: medproofTheme.colors.text.secondary,
    fontSize: medproofTheme.typography.size.xs,
    fontWeight: medproofTheme.typography.weight.semibold,
  },
};