import React from 'react';
import { Template } from '../../types';
import Button from '../ui/Button';

interface TemplateCardProps {
  template: Template;
  onSelect: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gray-100 relative">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl font-bold">{template.name.charAt(0)}</div>
              <div className="mt-2">No Preview</div>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {template.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{template.description}</p>
        
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onSelect(template.id)}
          >
            Use Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;