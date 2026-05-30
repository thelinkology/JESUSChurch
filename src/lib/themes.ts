export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  fonts: {
    sans: string;
    serif: string;
  };
  styles: {
    backgroundStyle: 'solid' | 'gradient' | 'image';
    buttonStyle: 'rounded' | 'sharp' | 'glow';
    animationIntensity: 'low' | 'medium' | 'high';
  };
}

export const predefinedThemes: Theme[] = [
  {
    id: 'modern-church',
    name: 'Modern Church',
    colors: {
      primary: '#C5A059',
      primaryDark: '#A38040',
      primaryLight: '#DBC18D',
      secondary: '#4A4036',
      background: '#FDFBF7',
      surface: '#FFFFFF',
      text: '#2D2620',
      muted: '#7A6F64',
    },
    fonts: { sans: 'Inter', serif: 'Playfair Display' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'rounded', animationIntensity: 'medium' }
  },
  {
    id: 'luxury-dark',
    name: 'Luxury Dark',
    colors: {
      primary: '#D4AF37',
      primaryDark: '#AA8C2C',
      primaryLight: '#E5C158',
      secondary: '#1A1A1A',
      background: '#0A0A0A',
      surface: '#141414',
      text: '#F5F5F5',
      muted: '#A3A3A3',
    },
    fonts: { sans: 'Inter', serif: 'Cinzel' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'sharp', animationIntensity: 'medium' }
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    colors: {
      primary: '#000000',
      primaryDark: '#333333',
      primaryLight: '#666666',
      secondary: '#F5F5F5',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#111111',
      muted: '#888888',
    },
    fonts: { sans: 'Inter', serif: 'Inter' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'sharp', animationIntensity: 'low' }
  },
  {
    id: 'soft-saas',
    name: 'Soft SaaS Pastel',
    colors: {
      primary: '#6366F1',
      primaryDark: '#4F46E5',
      primaryLight: '#818CF8',
      secondary: '#E0E7FF',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
    },
    fonts: { sans: 'Inter', serif: 'Inter' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'rounded', animationIntensity: 'medium' }
  },
  {
    id: 'neon-tech',
    name: 'Neon Tech',
    colors: {
      primary: '#00FF41',
      primaryDark: '#00CC33',
      primaryLight: '#66FF8C',
      secondary: '#111111',
      background: '#050505',
      surface: '#0A0A0A',
      text: '#FFFFFF',
      muted: '#888888',
    },
    fonts: { sans: 'Space Grotesk', serif: 'Space Grotesk' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'glow', animationIntensity: 'high' }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#0284C7',
      primaryDark: '#0369A1',
      primaryLight: '#38BDF8',
      secondary: '#F0F9FF',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#0F172A',
      muted: '#475569',
    },
    fonts: { sans: 'Inter', serif: 'Inter' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'rounded', animationIntensity: 'low' }
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    colors: {
      primary: '#166534',
      primaryDark: '#14532D',
      primaryLight: '#22C55E',
      secondary: '#F0FDF4',
      background: '#FAFAF9',
      surface: '#FFFFFF',
      text: '#1C1917',
      muted: '#57534E',
    },
    fonts: { sans: 'Inter', serif: 'Playfair Display' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'rounded', animationIntensity: 'medium' }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      primary: '#52525B',
      primaryDark: '#3F3F46',
      primaryLight: '#A1A1AA',
      secondary: '#E4E4E7',
      background: '#FFFFFF',
      surface: '#F4F4F5',
      text: '#18181B',
      muted: '#71717A',
    },
    fonts: { sans: 'Inter', serif: 'Inter' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'sharp', animationIntensity: 'low' }
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    colors: {
      primary: '#8B5CF6',
      primaryDark: '#7C3AED',
      primaryLight: '#A78BFA',
      secondary: '#EDE9FE',
      background: '#F3F4F6',
      surface: 'rgba(255, 255, 255, 0.7)',
      text: '#1F2937',
      muted: '#4B5563',
    },
    fonts: { sans: 'Inter', serif: 'Inter' },
    styles: { backgroundStyle: 'gradient', buttonStyle: 'rounded', animationIntensity: 'high' }
  },
  {
    id: 'warm-beige',
    name: 'Warm Premium Beige',
    colors: {
      primary: '#D97706',
      primaryDark: '#B45309',
      primaryLight: '#F59E0B',
      secondary: '#FEF3C7',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      text: '#451A03',
      muted: '#78350F',
    },
    fonts: { sans: 'Inter', serif: 'Playfair Display' },
    styles: { backgroundStyle: 'solid', buttonStyle: 'rounded', animationIntensity: 'medium' }
  },
  {
    id: 'gradient-modern',
    name: 'Gradient Modern',
    colors: {
      primary: '#EC4899',
      primaryDark: '#BE185D',
      primaryLight: '#F472B6',
      secondary: '#FCE7F3',
      background: '#FFFFFF',
      surface: '#FDF2F8',
      text: '#111827',
      muted: '#6B7280',
    },
    fonts: { sans: 'Inter', serif: 'Inter' },
    styles: { backgroundStyle: 'gradient', buttonStyle: 'glow', animationIntensity: 'high' }
  }
];
