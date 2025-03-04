import { create } from 'zustand';
import { Template } from '../types';

// Define some starter templates
const starterTemplates: Template[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A modern landing page template with hero section, features, and call to action.',
    thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Marketing',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        components: [],
        styles: {}
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'A clean portfolio template to showcase your work and skills.',
    thumbnail: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Personal',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        components: [],
        styles: {}
      },
      {
        id: 'projects',
        name: 'Projects',
        path: '/projects',
        components: [],
        styles: {}
      },
      {
        id: 'about',
        name: 'About',
        path: '/about',
        components: [],
        styles: {}
      },
      {
        id: 'contact',
        name: 'Contact',
        path: '/contact',
        components: [],
        styles: {}
      }
    ]
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'A blog template with homepage, article listing, and article detail pages.',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Content',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        components: [],
        styles: {}
      },
      {
        id: 'blog',
        name: 'Blog',
        path: '/blog',
        components: [],
        styles: {}
      },
      {
        id: 'article',
        name: 'Article',
        path: '/blog/:id',
        components: [],
        styles: {}
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'An e-commerce template with product listings, product details, and cart.',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Business',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        components: [],
        styles: {}
      },
      {
        id: 'products',
        name: 'Products',
        path: '/products',
        components: [],
        styles: {}
      },
      {
        id: 'product',
        name: 'Product',
        path: '/products/:id',
        components: [],
        styles: {}
      },
      {
        id: 'cart',
        name: 'Cart',
        path: '/cart',
        components: [],
        styles: {}
      },
      {
        id: 'checkout',
        name: 'Checkout',
        path: '/checkout',
        components: [],
        styles: {}
      }
    ]
  }
];

interface TemplateState {
  templates: Template[];
  
  getTemplateById: (id: string) => Template | undefined;
  getTemplatesByCategory: (category: string) => Template[];
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: starterTemplates,
  
  getTemplateById: (id) => {
    return get().templates.find(template => template.id === id);
  },
  
  getTemplatesByCategory: (category) => {
    return get().templates.filter(template => template.category === category);
  }
}));