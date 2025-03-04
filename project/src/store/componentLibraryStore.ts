import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ComponentLibraryItem, Component } from '../types';

// Define basic components for the library
const createBasicComponents = (): ComponentLibraryItem[] => [
  {
    id: 'text',
    name: 'Text',
    category: 'Basic',
    component: {
      id: uuidv4(),
      type: 'text',
      name: 'Text',
      props: {
        text: 'Text content'
      },
      children: [],
      styles: {
        fontSize: '16px',
        color: '#333333',
        fontWeight: 'normal'
      }
    }
  },
  {
    id: 'heading',
    name: 'Heading',
    category: 'Basic',
    component: {
      id: uuidv4(),
      type: 'heading',
      name: 'Heading',
      props: {
        text: 'Heading',
        level: 'h2'
      },
      children: [],
      styles: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#111111'
      }
    }
  },
  {
    id: 'button',
    name: 'Button',
    category: 'Basic',
    component: {
      id: uuidv4(),
      type: 'button',
      name: 'Button',
      props: {
        text: 'Click me',
        variant: 'primary'
      },
      children: [],
      styles: {
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer'
      }
    }
  },
  {
    id: 'image',
    name: 'Image',
    category: 'Basic',
    component: {
      id: uuidv4(),
      type: 'image',
      name: 'Image',
      props: {
        src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
        alt: 'Placeholder image'
      },
      children: [],
      styles: {
        width: '100%',
        height: 'auto',
        objectFit: 'cover'
      }
    }
  },
  {
    id: 'container',
    name: 'Container',
    category: 'Layout',
    component: {
      id: uuidv4(),
      type: 'container',
      name: 'Container',
      props: {},
      children: [],
      styles: {
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto'
      }
    }
  },
  {
    id: 'row',
    name: 'Row',
    category: 'Layout',
    component: {
      id: uuidv4(),
      type: 'row',
      name: 'Row',
      props: {},
      children: [],
      styles: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: '0 -8px'
      }
    }
  },
  {
    id: 'column',
    name: 'Column',
    category: 'Layout',
    component: {
      id: uuidv4(),
      type: 'column',
      name: 'Column',
      props: {
        width: '50%'
      },
      children: [],
      styles: {
        flex: '0 0 50%',
        padding: '0 8px'
      }
    }
  },
  {
    id: 'card',
    name: 'Card',
    category: 'Components',
    component: {
      id: uuidv4(),
      type: 'card',
      name: 'Card',
      props: {},
      children: [],
      styles: {
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white'
      }
    }
  },
  {
    id: 'navbar',
    name: 'Navigation Bar',
    category: 'Components',
    component: {
      id: uuidv4(),
      type: 'navbar',
      name: 'Navigation Bar',
      props: {
        links: [
          { text: 'Home', url: '#' },
          { text: 'About', url: '#' },
          { text: 'Services', url: '#' },
          { text: 'Contact', url: '#' }
        ]
      },
      children: [],
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f8f9fa'
      }
    }
  },
  {
    id: 'footer',
    name: 'Footer',
    category: 'Components',
    component: {
      id: uuidv4(),
      type: 'footer',
      name: 'Footer',
      props: {
        copyright: '© 2025 Your Company'
      },
      children: [],
      styles: {
        padding: '24px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center',
        marginTop: '32px'
      }
    }
  },
  {
    id: 'form',
    name: 'Form',
    category: 'Forms',
    component: {
      id: uuidv4(),
      type: 'form',
      name: 'Form',
      props: {
        action: '#',
        method: 'post'
      },
      children: [],
      styles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }
    }
  },
  {
    id: 'input',
    name: 'Input',
    category: 'Forms',
    component: {
      id: uuidv4(),
      type: 'input',
      name: 'Input',
      props: {
        type: 'text',
        placeholder: 'Enter text...',
        label: 'Input field'
      },
      children: [],
      styles: {
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #d1d5db'
      }
    }
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'Forms',
    component: {
      id: uuidv4(),
      type: 'textarea',
      name: 'Textarea',
      props: {
        placeholder: 'Enter text...',
        rows: 4,
        label: 'Text area'
      },
      children: [],
      styles: {
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        resize: 'vertical'
      }
    }
  }
];

interface ComponentLibraryState {
  components: ComponentLibraryItem[];
  customComponents: ComponentLibraryItem[];
  
  addCustomComponent: (component: Omit<ComponentLibraryItem, 'id'>) => string;
  updateCustomComponent: (id: string, data: Partial<ComponentLibraryItem>) => void;
  deleteCustomComponent: (id: string) => void;
  getComponentById: (id: string) => ComponentLibraryItem | undefined;
  getComponentsByCategory: (category: string) => ComponentLibraryItem[];
}

export const useComponentLibraryStore = create<ComponentLibraryState>((set, get) => ({
  components: createBasicComponents(),
  customComponents: [],
  
  addCustomComponent: (componentData) => {
    const id = uuidv4();
    const newComponent: ComponentLibraryItem = {
      ...componentData,
      id
    };
    
    set(state => ({
      customComponents: [...state.customComponents, newComponent]
    }));
    
    return id;
  },
  
  updateCustomComponent: (id, data) => {
    set(state => ({
      customComponents: state.customComponents.map(component => 
        component.id === id ? { ...component, ...data } : component
      )
    }));
  },
  
  deleteCustomComponent: (id) => {
    set(state => ({
      customComponents: state.customComponents.filter(component => component.id !== id)
    }));
  },
  
  getComponentById: (id) => {
    const { components, customComponents } = get();
    return [...components, ...customComponents].find(component => component.id === id);
  },
  
  getComponentsByCategory: (category) => {
    const { components, customComponents } = get();
    return [...components, ...customComponents].filter(component => component.category === category);
  }
}));