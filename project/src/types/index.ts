export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  pages: Page[];
  assets: Asset[];
  published: boolean;
  publishedUrl?: string;
  template?: string;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  components: Component[];
  styles: Record<string, any>;
}

export interface Component {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  children: Component[];
  styles: Record<string, any>;
  parentId?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'font' | 'other';
  url: string;
  size?: number;
  createdAt: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  pages: Page[];
}

export interface AIPrompt {
  id: string;
  prompt: string;
  response: string;
  createdAt: number;
  type: 'code' | 'design' | 'content';
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
}

export interface ComponentLibraryItem {
  id: string;
  name: string;
  category: string;
  component: Component;
  thumbnail?: string;
}

export interface DesignSystem {
  colors: Record<string, string>;
  typography: {
    fontFamilies: string[];
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, string | number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}