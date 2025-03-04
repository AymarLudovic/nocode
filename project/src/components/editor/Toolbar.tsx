import React from 'react';
import { 
  Save, 
  Undo, 
  Redo, 
  Eye, 
  Grid, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ZoomIn, 
  ZoomOut, 
  Upload
} from 'lucide-react';
import Button from '../ui/Button';
import { useEditorStore } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';

interface ToolbarProps {
  projectId: string;
  onSave: () => void;
  onPublish: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ projectId, onSave, onPublish }) => {
  const { 
    zoom, 
    setZoom, 
    showGrid, 
    toggleGrid, 
    previewMode, 
    togglePreviewMode, 
    responsiveMode, 
    setResponsiveMode,
    undo,
    redo
  } = useEditorStore();
  
  const { loading } = useProjectStore();
  
  const handleZoomIn = () => {
    setZoom(zoom + 0.1);
  };
  
  const handleZoomOut = () => {
    setZoom(zoom - 0.1);
  };
  
  return (
    <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Save size={16} />}
          onClick={onSave}
          isLoading={loading}
        >
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Upload size={16} />}
          onClick={onPublish}
        >
          Publish
        </Button>
        
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Undo size={16} />}
          onClick={undo}
        />
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Redo size={16} />}
          onClick={redo}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant={responsiveMode === 'mobile' ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Smartphone size={16} />}
          onClick={() => setResponsiveMode('mobile')}
        />
        
        <Button
          variant={responsiveMode === 'tablet' ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Tablet size={16} />}
          onClick={() => setResponsiveMode('tablet')}
        />
        
        <Button
          variant={responsiveMode === 'desktop' ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Monitor size={16} />}
          onClick={() => setResponsiveMode('desktop')}
        />
        
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ZoomOut size={16} />}
          onClick={handleZoomOut}
        />
        
        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ZoomIn size={16} />}
          onClick={handleZoomIn}
        />
        
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        
        <Button
          variant={showGrid ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Grid size={16} />}
          onClick={toggleGrid}
        />
        
        <Button
          variant={previewMode ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Eye size={16} />}
          onClick={togglePreviewMode}
        >
          Preview
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;