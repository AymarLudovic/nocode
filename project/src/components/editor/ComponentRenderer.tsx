import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Component } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';

interface ComponentRendererProps {
  component: Component;
  projectId: string;
  pageId: string;
  isPreview?: boolean;
  parentId?: string;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  projectId,
  pageId,
  isPreview = false,
  parentId
}) => {
  const { 
    selectedComponentId, 
    hoveredComponentId,
    selectComponent,
    hoverComponent
  } = useEditorStore();
  
  const isSelected = selectedComponentId === component.id;
  const isHovered = hoveredComponentId === component.id;
  
  // Set up draggable
  const { attributes, listeners, setNodeRef: setDraggableRef } = useDraggable({
    id: component.id,
    data: {
      type: 'component',
      component,
      projectId,
      pageId,
      parentId
    },
    disabled: isPreview
  });
  
  // Set up droppable for container components
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${component.id}`,
    data: {
      type: 'component-container',
      componentId: component.id,
      projectId,
      pageId
    },
    disabled: isPreview || !['container', 'row', 'column', 'card'].includes(component.type)
  });
  
  // Combine refs
  const setRefs = (element: HTMLElement | null) => {
    setDraggableRef(element);
    setDroppableRef(element);
  };
  
  // Handle component selection
  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    
    e.stopPropagation();
    selectComponent(component.id);
  };
  
  // Render the component based on its type
  const renderComponent = () => {
    switch (component.type) {
      case 'text':
        return <p style={component.styles}>{component.props.text}</p>;
        
      case 'heading':
        const HeadingTag = component.props.level || 'h2';
        return <HeadingTag style={component.styles}>{component.props.text}</HeadingTag>;
        
      case 'button':
        return (
          <button 
            style={component.styles}
            className={`${component.props.variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} px-4 py-2 rounded`}
          >
            {component.props.text}
          </button>
        );
        
      case 'image':
        return (
          <img 
            src={component.props.src} 
            alt={component.props.alt} 
            style={component.styles}
          />
        );
        
      case 'container':
      case 'row':
      case 'column':
      case 'card':
        return (
          <div style={component.styles}>
            {component.children.map(child => (
              <ComponentRenderer
                key={child.id}
                component={child}
                projectId={projectId}
                pageId={pageId}
                isPreview={isPreview}
                parentId={component.id}
              />
            ))}
          </div>
        );
        
      case 'navbar':
        return (
          <nav style={component.styles}>
            <div className="flex items-center">
              <div className="text-xl font-bold">Logo</div>
            </div>
            <ul className="flex space-x-4">
              {component.props.links?.map((link: { text: string, url: string }, index: number) => (
                <li key={index}>
                  <a href={link.url} className="hover:text-blue-600">{link.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        );
        
      case 'footer':
        return (
          <footer style={component.styles}>
            <div className="text-center">
              <p>{component.props.copyright}</p>
            </div>
          </footer>
        );
        
      case 'form':
        return (
          <form style={component.styles} action={component.props.action} method={component.props.method}>
            {component.children.map(child => (
              <ComponentRenderer
                key={child.id}
                component={child}
                projectId={projectId}
                pageId={pageId}
                isPreview={isPreview}
                parentId={component.id}
              />
            ))}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Submit</button>
          </form>
        );
        
      case 'input':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{component.props.label}</label>
            <input
              type={component.props.type}
              placeholder={component.props.placeholder}
              style={component.styles}
              className="w-full"
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{component.props.label}</label>
            <textarea
              placeholder={component.props.placeholder}
              rows={component.props.rows}
              style={component.styles}
              className="w-full"
            />
          </div>
        );
        
      default:
        return <div>Unknown component type: {component.type}</div>;
    }
  };
  
  if (isPreview) {
    return renderComponent();
  }
  
  return (
    <div
      ref={setRefs}
      onClick={handleClick}
      onMouseEnter={() => hoverComponent(component.id)}
      onMouseLeave={() => hoverComponent(null)}
      className={`
        relative
        ${isSelected ? 'outline outline-2 outline-blue-500 z-10' : ''}
        ${isHovered && !isSelected ? 'outline outline-1 outline-blue-300' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {renderComponent()}
      
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t">
          {component.name}
        </div>
      )}
    </div>
  );
};

export default ComponentRenderer;