import React, { useState } from 'react';
import { Sparkles, Send, Code, Palette, FileText, LayoutGrid, Loader } from 'lucide-react';
import Button from '../ui/Button';
import { 
  generateCode, 
  generateDesignSuggestions, 
  generateContent, 
  optimizeLayout, 
  convertNaturalLanguageToCode,
  AIResponse
} from '../../lib/ai';
import { useProjectStore } from '../../store/projectStore';
import { v4 as uuidv4 } from 'uuid';

interface AIAssistantProps {
  projectId: string;
  pageId: string;
}

type AIMode = 'code' | 'design' | 'content' | 'layout' | 'convert';

const AIAssistant: React.FC<AIAssistantProps> = ({ projectId, pageId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>('code');
  const [error, setError] = useState<string | null>(null);
  
  const { currentProject, addComponent } = useProjectStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      let aiResponse: AIResponse;
      
      switch (mode) {
        case 'code':
          aiResponse = await generateCode(prompt);
          break;
        case 'design':
          aiResponse = await generateDesignSuggestions(prompt);
          break;
        case 'content':
          aiResponse = await generateContent(prompt);
          break;
        case 'layout':
          aiResponse = await optimizeLayout(prompt);
          break;
        case 'convert':
          aiResponse = await convertNaturalLanguageToCode(prompt);
          break;
        default:
          aiResponse = await generateCode(prompt);
      }
      
      if (aiResponse.error) {
        setError(aiResponse.error);
      } else {
        setResponse(aiResponse.text);
        
        // If in content mode, automatically add the generated content as a text component
        if (mode === 'content' && aiResponse.text) {
          addComponent(projectId, pageId, {
            type: 'text',
            name: 'AI Generated Text',
            props: {
              text: aiResponse.text
            },
            children: [],
            styles: {
              fontSize: '16px',
              color: '#333333',
              lineHeight: '1.5'
            }
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getModeIcon = () => {
    switch (mode) {
      case 'code':
        return <Code size={16} />;
      case 'design':
        return <Palette size={16} />;
      case 'content':
        return <FileText size={16} />;
      case 'layout':
        return <LayoutGrid size={16} />;
      case 'convert':
        return <Sparkles size={16} />;
      default:
        return <Code size={16} />;
    }
  };
  
  const getModePlaceholder = () => {
    switch (mode) {
      case 'code':
        return 'Generate HTML/CSS code for...';
      case 'design':
        return 'Suggest design styles for...';
      case 'content':
        return 'Create content for...';
      case 'layout':
        return 'Optimize layout for...';
      case 'convert':
        return 'Convert this description to code...';
      default:
        return 'Ask AI for help...';
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="absolute bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={20} />
      </Button>
    );
  }
  
  return (
    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border overflow-hidden">
      <div className="p-3 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles size={18} className="mr-2" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <button
          className="text-white hover:text-blue-200"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>
      
      <div className="p-3 border-b">
        <div className="flex space-x-1">
          <Button
            variant={mode === 'code' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-1 py-1 px-2"
            onClick={() => setMode('code')}
          >
            <Code size={14} className="mr-1" />
            Code
          </Button>
          <Button
            variant={mode === 'design' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-1 py-1 px-2"
            onClick={() => setMode('design')}
          >
            <Palette size={14} className="mr-1" />
            Design
          </Button>
          <Button
            variant={mode === 'content' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-1 py-1 px-2"
            onClick={() => setMode('content')}
          >
            <FileText size={14} className="mr-1" />
            Content
          </Button>
        </div>
        <div className="flex space-x-1 mt-1">
          <Button
            variant={mode === 'layout' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-1 py-1 px-2"
            onClick={() => setMode('layout')}
          >
            <LayoutGrid size={14} className="mr-1" />
            Layout
          </Button>
          <Button
            variant={mode === 'convert' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-1 py-1 px-2"
            onClick={() => setMode('convert')}
          >
            <Sparkles size={14} className="mr-1" />
            Convert
          </Button>
        </div>
      </div>
      
      <div className="p-3 max-h-60 overflow-y-auto">
        {error && (
          <div className="p-2 mb-3 text-sm text-red-800 bg-red-100 rounded">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size={24} className="animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Generating response...</span>
          </div>
        ) : response ? (
          <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border">
            {response}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="mx-auto mb-2" size={24} />
            <p>Ask the AI assistant for help with your project</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {getModeIcon()}
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getModePlaceholder()}
              className="w-full border border-gray-300 rounded-l-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="rounded-l-none"
            disabled={isLoading || !prompt.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;