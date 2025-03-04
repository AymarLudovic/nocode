import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProjectCard from '../components/dashboard/ProjectCard';
import NewProjectModal from '../components/dashboard/NewProjectModal';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { user, loading: authLoading } = useAuthStore();
  const { 
    projects, 
    loading: projectsLoading, 
    fetchProjects, 
    createProject, 
    deleteProject 
  } = useProjectStore();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (user) {
      fetchProjects();
    }
  }, [user, authLoading, navigate, fetchProjects]);
  
  const handleCreateProject = async (name: string, description: string, templateId?: string) => {
    try {
      const projectId = await createProject(name, description, templateId);
      setIsNewProjectModalOpen(false);
      navigate(`/editor/${projectId}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };
  
  const handleDuplicateProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    try {
      const newProjectId = await createProject(
        `${project.name} (Copy)`,
        project.description,
        project.template
      );
      navigate(`/editor/${newProjectId}`);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    }
  };
  
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and create new website projects
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                New Project
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="w-full sm:w-64 mb-4 sm:mb-0">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter size={16} />}
                className="mr-2"
              >
                Filter
              </Button>
              <div className="flex border rounded overflow-hidden">
                <button
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onDuplicate={handleDuplicateProject}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No projects matching "${searchTerm}"`
                  : "You haven't created any projects yet"}
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                Create your first project
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default DashboardPage;