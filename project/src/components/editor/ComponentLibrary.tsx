import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, Layers } from 'lucide-react';
import { useComponentLibraryStore } from '../../store/componentLibraryStore';
import Input from '../ui/Input';

interface ComponentLibraryProps {
  projectId: string;
  pageId: string;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ projectId, pageId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { components, customComponents } = useComponentLibraryStore();
  
  // Combine and filter components
  const allComponents = [...components, ...customComponents];
  
  const filteredComponents = allComponents.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? component.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories
  const categories = Array.from(new Set(allComponents.map(component => component.category)));
  
  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium mb-2">Components</h2>
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>
      
      <div className="p-2 border-b">
        <div className="flex flex-wrap gap-1">
          <button
            className={`px-2 py-1 text-xs rounded ${selectedCategory === null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`px-2 py-1 text-xs rounded ${selectedCategory === category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredComponents.map(component => (
            <DraggableComponent
              key={component.id}
              component={component}
              projectId={projectId}
              pageId={pageId}
            />
          ))}
        </div>
        
        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Layers className="mx-auto mb-2" size={24} />
            <p>No components found</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface DraggableComponentProps {
  component: any;
  projectId: string;
  pageId: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, projectId, pageId }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${component.id}`,
    data: {
      type: 'library-component',
      component: component.component,
      projectId,
      pageId
    }
  });
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        p-2 border rounded cursor-grab bg-white hover:border-blue-500 hover:shadow-sm
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="text-xs font-medium truncate">{component.name}</div>
      <div className="text-xs text-gray-500">{component.category}</div>
    </div>
  );
};

export default ComponentLibrary;