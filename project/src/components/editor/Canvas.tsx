import React, { useRef, useEffect } from 'react';
import { useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import ComponentRenderer from './ComponentRenderer';
import { Component } from '../../types';

interface CanvasProps {
  projectId: string;
  pageId: string;
}

const Canvas: React.FC<CanvasProps> = ({ projectId, pageId }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { currentProject } = useProjectStore();
  const { 
    zoom, 
    showGrid, 
    showOutlines, 
    previewMode, 
    responsiveMode,
    selectedComponentId,
    setDragging
  } = useEditorStore();
  
  const page = currentProject?.pages.find(p => p.id === pageId);
  const components = page?.components || [];
  
  // Set up droppable area
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: 'canvas',
    data: {
      type: 'canvas',
      pageId,
      projectId
    }
  });
  
  // Monitor drag events
  useDndMonitor({
    onDragStart: () => {
      setDragging(true);
    },
    onDragEnd: () => {
      setDragging(false);
    },
    onDragCancel: () => {
      setDragging(false);
    }
  });
  
  // Set up responsive container widths
  const getResponsiveWidth = () => {
    switch (responsiveMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };
  
  return (
    <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
      <div 
        ref={setDroppableRef}
        className={`
          relative bg-white shadow-md mx-auto transition-all duration-200
          ${showGrid && !previewMode ? 'bg-grid' : ''}
          ${showOutlines && !previewMode ? 'outline-components' : ''}
        `}
        style={{
          width: getResponsiveWidth(),
          minHeight: '100vh',
          transform: `scale(${zoom})`,
          transformOrigin: 'center top',
        }}
      >
        {components.map(component => (
          <ComponentRenderer
            key={component.id}
            component={component}
            projectId={projectId}
            pageId={pageId}
            isPreview={previewMode}
          />
        ))}
        
        {components.length === 0 && !previewMode && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg">Drag and drop components here</p>
              <p className="text-sm mt-2">or use the AI assistant to generate content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;