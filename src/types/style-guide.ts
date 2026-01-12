/* ======================================================
   Style Guide Types
====================================================== */

// Color swatch
export interface ColorSwatch {
  name: string;
  hexColor: string;
  description?: string;
}

// Color sections
export interface ColorSection {
  primary: ColorSwatch[];
  secondary: ColorSwatch[];
  accent: ColorSwatch[];
  neutral: ColorSwatch[];
  semantic: ColorSwatch[];
}

// Typography style
export interface TypographyStyle {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

// Typography section
export interface TypographySection {
  title: string;
  description?: string;
  styles: TypographyStyle[];
}

// Complete style guide
export interface StyleGuide {
  theme?: string;
  description?: string;
  colors: ColorSection;
  typography: TypographySection[];
}

// Mood board image - Updated to handle null from Convex
export interface MoodBoardImage {
  id: string;
  storageId?: string;
  url?: string | null;  // ← Changed to accept null
  preview?: string;
  file?: File;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
  isFromServer: boolean;
}