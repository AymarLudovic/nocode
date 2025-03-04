import React, { useState, useEffect } from 'react';
import { Settings, Palette, Box, Type, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Component } from '../../types';

interface PropertyPanelProps {
  projectId: string;
  pageId: string;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ projectId, pageId }) => {
  const { currentProject, updateComponent, deleteComponent } = useProjectStore();
  const { selectedComponentId, selectComponent } = useEditorStore();
  
  const [activeTab, setActiveTab] = useState<'properties' | 'styles'>('properties');
  const [componentData, setComponentData] = useState<Component | null>(null);
  
  // Find the selected component
  useEffect(() => {
    if (!currentProject || !selectedComponentId) {
      setComponentData(null);
      return;
    }
    
    const page = currentProject.pages.find(p => p.id === pageId);
    if (!page) return;
    
    // Helper function to find component in the tree
    const findComponent = (components: Component[]): Component | null => {
      for (const component of components) {
        if (component.id === selectedComponentId) {
          return component;
        }
        
        if (component.children.length > 0) {
          const found = findComponent(component.children);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    const component = findComponent(page.components);
    setComponentData(component);
  }, [currentProject, selectedComponentId, pageId]);
  
  // Handle property changes
  const handlePropertyChange = (key: string, value: any) => {
    if (!componentData) return;
    
    const updatedProps = {
      ...componentData.props,
      [key]: value
    };
    
    updateComponent(projectId, pageId, componentData.id, {
      props: updatedProps
    });
  };
  
  // Handle style changes
  const handleStyleChange = (key: string, value: string) => {
    if (!componentData) return;
    
    const updatedStyles = {
      ...componentData.styles,
      [key]: value
    };
    
    updateComponent(projectId, pageId, componentData.id, {
      styles: updatedStyles
    });
  };
  
  // Handle component deletion
  const handleDeleteComponent = () => {
    if (!componentData) return;
    
    deleteComponent(projectId, pageId, componentData.id);
    selectComponent(null);
  };
  
  if (!componentData) {
    return (
      <div className="h-full flex flex-col bg-white border-l p-4">
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Box className="mx-auto mb-2" size={24} />
            <p>Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-white border-l">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{componentData.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={16} className="text-red-500" />}
            className="text-red-500 hover:bg-red-50"
            onClick={handleDeleteComponent}
          >
            Delete
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">Type: {componentData.type}</div>
      </div>
      
      <div className="border-b">
        <div className="flex">
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('properties')}
          >
            <div className="flex items-center justify-center">
              <Settings size={16} className="mr-1" />
              Properties
            </div>
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'styles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('styles')}
          >
            <div className="flex items-center justify-center">
              <Palette size={16} className="mr-1" />
              Styles
            </div>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {componentData.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                <textarea
                  value={componentData.props.text || ''}
                  onChange={(e) => handlePropertyChange('text', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>
            )}
            
            {componentData.type === 'heading' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading Text</label>
                  <textarea
                    value={componentData.props.text || ''}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading Level</label>
                  <select
                    value={componentData.props.level || 'h2'}
                    onChange={(e) => handlePropertyChange('level', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                  </select>
                </div>
              </>
            )}
            
            {componentData.type === 'button' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={componentData.props.text || ''}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                  <select
                    value={componentData.props.variant || 'primary'}
                    onChange={(e) => handlePropertyChange('variant', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
              </>
            )}
            
            {componentData.type === 'image' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={componentData.props.src || ''}
                    onChange={(e) => handlePropertyChange('src', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={componentData.props.alt || ''}
                    onChange={(e) => handlePropertyChange('alt', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </>
            )}
            
            {/* Add more component-specific property editors here */}
          </div>
        )}
        
        {activeTab === 'styles' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Typography</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                  <input
                    type="text"
                    value={componentData.styles.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="16px"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
                  <select
                    value={componentData.styles.fontWeight || ''}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                  >
                    <option value="">Default</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                    <option value="bolder">Bolder</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                    <option value="800">800</option>
                    <option value="900">900</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color</label>
                  <div className="flex">
                    <input
                      type="color"
                      value={componentData.styles.color || '#000000'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded-l-md shadow-sm p-0"
                    />
                    <input
                      type="text"
                      value={componentData.styles.color || ''}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="flex-1 border border-gray-300 border-l-0 rounded-r-md shadow-sm p-1 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Line Height</label>
                  <input
                    type="text"
                    value={componentData.styles.lineHeight || ''}
                    onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="1.5"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Spacing</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Margin</label>
                  <input
                    type="text"
                    value={componentData.styles.margin || ''}
                    onChange={(e) => handleStyleChange('margin', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Padding</label>
                  <input
                    type="text"
                    value={componentData.styles.padding || ''}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Layout</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                  <input
                    type="text"
                    value={componentData.styles.width || ''}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                  <input
                    type="text"
                    value={componentData.styles.height || ''}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Display</label>
                  <select
                    value={componentData.styles.display || ''}
                    onChange={(e) => handleStyleChange('display', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                  >
                    <option value="">Default</option>
                    <option value="block">Block</option>
                    <option value="inline">Inline</option>
                    <option value="inline-block">Inline Block</option>
                    <option value="flex">Flex</option>
                    <option value="grid">Grid</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Position</label>
                  <select
                    value={componentData.styles.position || ''}
                    onChange={(e) => handleStyleChange('position', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                  >
                    <option value="">Default</option>
                    <option value="static">Static</option>
                    <option value="relative">Relative</option>
                    <option value="absolute">Absolute</option>
                    <option value="fixed">Fixed</option>
                    <option value="sticky">Sticky</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Background</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                  <div className="flex">
                    <input
                      type="color"
                      value={componentData.styles.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded-l-md shadow-sm p-0"
                    />
                    <input
                      type="text"
                      value={componentData.styles.backgroundColor || ''}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      className="flex-1 border border-gray-300 border-l-0 rounded-r-md shadow-sm p-1 text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Border</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Border Width</label>
                  <input
                    type="text"
                    value={componentData.styles.borderWidth || ''}
                    onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Border Style</label>
                  <select
                    value={componentData.styles.borderStyle || ''}
                    onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                  >
                    <option value="">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Border Color</label>
                  <div className="flex">
                    <input
                      type="color"
                      value={componentData.styles.borderColor || '#000000'}
                      onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded-l-md shadow-sm p-0"
                    />
                    <input
                      type="text"
                      value={componentData.styles.borderColor || ''}
                      onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                      className="flex-1 border border-gray-300 border-l-0 rounded-r-md shadow-sm p-1 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Border Radius</label>
                  <input
                    type="text"
                    value={componentData.styles.borderRadius || ''}
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;

export default PropertyPanel