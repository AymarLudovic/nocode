import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { Loader } from 'lucide-react';
import Toolbar from '../components/editor/Toolbar';
import Canvas from '../components/editor/Canvas';
import ComponentLibrary from '../components/editor/ComponentLibrary';
import PropertyPanel from '../components/editor/PropertyPanel';
import AIAssistant from '../components/editor/AIAssistant';
import Terminal from '../components/editor/Terminal';
import { useProjectStore } from '../store/projectStore';
import { useEditorStore } from '../store/editorStore';
import { useComponentLibraryStore } from '../store/componentLibraryStore';
import { useAuthStore } from '../store/authStore';
import { v4 as uuidv4 } from 'uuid';

const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuthStore();
  const { 
    currentProject, 
    loading: projectLoading, 
    error: projectError,
    setCurrentProject,
    updateProject,
    addComponent,
    moveComponent,
    publishProject
  } = useProjectStore();
  
  const { 
    setDragging,
    selectedComponentId
  } = useEditorStore();
  
  const { getComponentById } = useComponentLibraryStore();
  
  // Check authentication and load project
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (projectId && user) {
      setCurrentProject(projectId);
    }
  }, [projectId, user, authLoading, navigate, setCurrentProject]);
  
  // Set active page to first page when project loads
  useEffect(() => {
    if (currentProject && currentProject.pages.length > 0 && !activePageId) {
      setActivePageId(currentProject.pages[0].id);
    }
  }, [currentProject, activePageId]);
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setDragging(true);
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(false);
    
    const { active, over } = event;
    
    if (!over) return;
    
    // Handle dropping a component from the library onto the canvas
    if (
      active.data.current?.type === 'library-component' &&
      over.data.current?.type === 'canvas' &&
      activePageId
    ) {
      const componentData = active.data.current.component;
      const newComponent = {
        ...componentData,
        id: uuidv4()
      };
      
      addComponent(projectId!, activePageId, newComponent);
    }
    
    // Handle dropping a component from the library into a container component
    if (
      active.data.current?.type === 'library-component' &&
      over.data.current?.type === 'component-container' &&
      activePageId
    ) {
      const componentData = active.data.current.component;
      const containerId = over.data.current.componentId;
      
      const newComponent = {
        ...componentData,
        id: uuidv4(),
        parentId: containerId
      };
      
      addComponent(projectId!, activePageId, newComponent, containerId);
    }
    
    // Handle moving a component to a new parent
    if (
      active.data.current?.type === 'component' &&
      over.data.current?.type === 'component-container' &&
      activePageId
    ) {
      const componentId = active.id as string;
      const newParentId = over.data.current.componentId;
      
      // Don't allow dropping a component into itself or its children
      if (componentId !== newParentId) {
        moveComponent(projectId!, activePageId, componentId, newParentId);
      }
    }
    
    // Handle moving a component to the canvas (root level)
    if (
      active.data.current?.type === 'component' &&
      over.data.current?.type === 'canvas' &&
      activePageId
    ) {
      const componentId = active.id as string;
      
      moveComponent(projectId!, activePageId, componentId);
    }
  };
  
  // Handle saving the project
  const handleSaveProject = async () => {
    if (!currentProject) return;
    
    try {
      await updateProject(currentProject.id, {
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };
  
  // Handle publishing the project
  const handlePublishProject = async () => {
    if (!currentProject) return;
    
    try {
      const publishedUrl = await publishProject(currentProject.id);
      alert(`Project published successfully! View it at: ${publishedUrl}`);
    } catch (error) {
      console.error('Failed to publish project:', error);
      alert('Failed to publish project. Please try again.');
    }
  };
  
  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader size={32} className="animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }
  
  if (projectError || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-4">{projectError || 'Project not found'}</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!activePageId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col">
        <Toolbar 
          projectId={projectId!} 
          onSave={handleSaveProject}
          onPublish={handlePublishProject}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 flex-shrink-0">
            <ComponentLibrary projectId={projectId!} pageId={activePageId} />
          </div>
          
          <Canvas projectId={projectId!} pageId={activePageId} />
          
          <div className="w-80 flex-shrink-0">
            <PropertyPanel projectId={projectId!} pageId={activePageId} />
          </div>
        </div>
        
        <AIAssistant projectId={projectId!} pageId={activePageId} />
        
        <Terminal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          onMinimize={() => setIsTerminalOpen(false)}
          onMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
          isMaximized={isTerminalMaximized}
        />
      </div>
    </DndContext>
  );
};

export default EditorPage;