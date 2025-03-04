import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useTemplateStore } from '../../store/templateStore';
import TemplateCard from './TemplateCard';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, description: string, templateId?: string) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [step, setStep] = useState<'info' | 'template'>('info');
  
  const { templates } = useTemplateStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    onCreateProject(name, description, selectedTemplateId);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedTemplateId(undefined);
    setStep('info');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-medium">Create New Project</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {step === 'info' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('template'); }}>
              <div className="space-y-4">
                <Input
                  label="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Website"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of your project"
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-2"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!name.trim()}
                >
                  Next
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Choose a Template</h3>
                <p className="text-gray-500 text-sm">
                  Select a template to start with or create a blank project.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  className={`
                    border rounded-lg p-4 cursor-pointer
                    ${!selectedTemplateId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                  `}
                  onClick={() => setSelectedTemplateId(undefined)}
                >
                  <div className="h-24 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <span className="text-gray-500">Blank</span>
                  </div>
                  <h4 className="font-medium">Blank Project</h4>
                  <p className="text-sm text-gray-500">Start from scratch</p>
                </div>
                
                {templates.map(template => (
                  <div 
                    key={template.id}
                    className={`
                      border rounded-lg p-4 cursor-pointer
                      ${selectedTemplateId === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                    `}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="h-24 bg-gray-100 rounded mb-2 overflow-hidden">
                      {template.thumbnail && (
                        <img 
                          src={template.thumbnail} 
                          alt={template.name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{template.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('info')}
                >
                  Back
                </Button>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;