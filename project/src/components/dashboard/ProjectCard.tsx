import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, Copy } from 'lucide-react';
import Button from '../ui/Button';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onDuplicate }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {/* Project preview/thumbnail would go here */}
        <div className="text-gray-400 text-center p-4">
          <div className="text-4xl font-bold">{project.name.charAt(0)}</div>
          <div className="mt-2">Preview</div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
        
        {project.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
        )}
        
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <span>Updated {formatDate(project.updatedAt)}</span>
          <span className="mx-2">•</span>
          <span>{project.pages.length} pages</span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <Link to={`/editor/${project.id}`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
          </Link>
          
          <div className="flex space-x-2">
            {project.published && project.publishedUrl && (
              <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink size={16} />}
                >
                  View
                </Button>
              </a>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Copy size={16} />}
              onClick={() => onDuplicate(project.id)}
            />
            
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={16} className="text-red-500" />}
              className="text-red-500 hover:bg-red-50"
              onClick={() => onDelete(project.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

export default ProjectCard