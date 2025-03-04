import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, Page, Component, Asset } from '../types';
import { useAuthStore } from './authStore';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string, template?: string) => Promise<string>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setCurrentProject: (projectId: string) => Promise<void>;
  
  addPage: (projectId: string, name: string, path: string) => Promise<string>;
  updatePage: (projectId: string, pageId: string, data: Partial<Page>) => Promise<void>;
  deletePage: (projectId: string, pageId: string) => Promise<void>;
  
  addComponent: (projectId: string, pageId: string, component: Omit<Component, 'id'>, parentId?: string) => Promise<string>;
  updateComponent: (projectId: string, pageId: string, componentId: string, data: Partial<Component>) => Promise<void>;
  deleteComponent: (projectId: string, pageId: string, componentId: string) => Promise<void>;
  moveComponent: (projectId: string, pageId: string, componentId: string, newParentId?: string, newIndex?: number) => Promise<void>;
  
  addAsset: (projectId: string, asset: Omit<Asset, 'id' | 'createdAt'>) => Promise<string>;
  deleteAsset: (projectId: string, assetId: string) => Promise<void>;
  
  publishProject: (projectId: string) => Promise<string>;
  unpublishProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    try {
      set({ loading: true, error: null });
      const projectsQuery = query(collection(db, 'projects'), where('userId', '==', user.id));
      const querySnapshot = await getDocs(projectsQuery);
      
      const projects: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Project, 'id'>;
        projects.push({ ...data, id: doc.id });
      });
      
      set({ projects, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects', 
        loading: false 
      });
    }
  },

  createProject: async (name: string, description = '', template = '') => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      throw new Error('User not authenticated');
    }

    try {
      set({ loading: true, error: null });
      
      const timestamp = Date.now();
      const newProject: Omit<Project, 'id'> = {
        name,
        description,
        createdAt: timestamp,
        updatedAt: timestamp,
        userId: user.id,
        pages: [
          {
            id: uuidv4(),
            name: 'Home',
            path: '/',
            components: [],
            styles: {}
          }
        ],
        assets: [],
        published: false,
        template: template || undefined
      };
      
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const createdProject = { ...newProject, id: docRef.id };
      
      set(state => ({ 
        projects: [...state.projects, createdProject],
        currentProject: createdProject,
        loading: false 
      }));
      
      return docRef.id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project', 
        loading: false 
      });
      throw error;
    }
  },

  updateProject: async (projectId: string, data: Partial<Project>) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...data,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => 
          project.id === projectId ? { ...project, ...data, updatedAt: Date.now() } : project
        );
        
        const updatedCurrentProject = state.currentProject?.id === projectId 
          ? { ...state.currentProject, ...data, updatedAt: Date.now() } 
          : state.currentProject;
        
        return { 
          projects: updatedProjects, 
          currentProject: updatedCurrentProject, 
          loading: false 
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project', 
        loading: false 
      });
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'projects', projectId));
      
      set(state => ({
        projects: state.projects.filter(project => project.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project', 
        loading: false 
      });
    }
  },

  setCurrentProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      // First check if the project is already in the state
      const existingProject = get().projects.find(p => p.id === projectId);
      
      if (existingProject) {
        set({ currentProject: existingProject, loading: false });
        return;
      }
      
      // If not, fetch it from Firestore
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (projectDoc.exists()) {
        const projectData = projectDoc.data() as Omit<Project, 'id'>;
        const project = { ...projectData, id: projectDoc.id };
        
        set({ 
          currentProject: project, 
          projects: [...get().projects.filter(p => p.id !== projectId), project],
          loading: false 
        });
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to set current project', 
        loading: false 
      });
    }
  },

  addPage: async (projectId: string, name: string, path: string) => {
    try {
      set({ loading: true, error: null });
      
      const newPageId = uuidv4();
      const newPage: Page = {
        id: newPageId,
        name,
        path,
        components: [],
        styles: {}
      };
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      const updatedPages = [...currentProject.pages, newPage];
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
      
      return newPageId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add page', 
        loading: false 
      });
      throw error;
    }
  },

  updatePage: async (projectId: string, pageId: string, data: Partial<Page>) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      const updatedPages = currentProject.pages.map(page => 
        page.id === pageId ? { ...page, ...data } : page
      );
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update page', 
        loading: false 
      });
    }
  },

  deletePage: async (projectId: string, pageId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      // Don't allow deleting the last page
      if (currentProject.pages.length <= 1) {
        throw new Error('Cannot delete the last page');
      }
      
      const updatedPages = currentProject.pages.filter(page => page.id !== pageId);
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete page', 
        loading: false 
      });
    }
  },

  addComponent: async (projectId: string, pageId: string, componentData: Omit<Component, 'id'>, parentId?: string) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      const componentId = uuidv4();
      const newComponent: Component = {
        ...componentData,
        id: componentId,
        parentId
      };
      
      const updatedPages = currentProject.pages.map(page => {
        if (page.id === pageId) {
          let updatedComponents = [...page.components];
          
          if (parentId) {
            // Add as a child to the parent component
            updatedComponents = updatedComponents.map(component => {
              if (component.id === parentId) {
                return {
                  ...component,
                  children: [...component.children, newComponent]
                };
              }
              return component;
            });
          } else {
            // Add to the root level
            updatedComponents.push(newComponent);
          }
          
          return { ...page, components: updatedComponents };
        }
        return page;
      });
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
      
      return componentId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add component', 
        loading: false 
      });
      throw error;
    }
  },

  updateComponent: async (projectId: string, pageId: string, componentId: string, data: Partial<Component>) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      // Helper function to update a component in the tree
      const updateComponentInTree = (components: Component[]): Component[] => {
        return components.map(component => {
          if (component.id === componentId) {
            return { ...component, ...data };
          }
          
          if (component.children.length > 0) {
            return {
              ...component,
              children: updateComponentInTree(component.children)
            };
          }
          
          return component;
        });
      };
      
      const updatedPages = currentProject.pages.map(page => {
        if (page.id === pageId) {
          return {
            ...page,
            components: updateComponentInTree(page.components)
          };
        }
        return page;
      });
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update component', 
        loading: false 
      });
    }
  },

  deleteComponent: async (projectId: string, pageId: string, componentId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      // Helper function to remove a component from the tree
      const removeComponentFromTree = (components: Component[]): Component[] => {
        // Filter out the component to delete at the current level
        const filteredComponents = components.filter(component => component.id !== componentId);
        
        // Process children of remaining components
        return filteredComponents.map(component => {
          if (component.children.length > 0) {
            return {
              ...component,
              children: removeComponentFromTree(component.children)
            };
          }
          return component;
        });
      };
      
      const updatedPages = currentProject.pages.map(page => {
        if (page.id === pageId) {
          return {
            ...page,
            components: removeComponentFromTree(page.components)
          };
        }
        return page;
      });
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete component', 
        loading: false 
      });
    }
  },

  moveComponent: async (projectId: string, pageId: string, componentId: string, newParentId?: string, newIndex?: number) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      // First, find the component and remove it from its current position
      let componentToMove: Component | null = null;
      
      // Helper function to find and remove a component from the tree
      const findAndRemoveComponent = (components: Component[]): [Component[], Component | null] => {
        // Check if the component is at the current level
        const componentIndex = components.findIndex(c => c.id === componentId);
        
        if (componentIndex !== -1) {
          // Found the component, remove it and return
          const component = components[componentIndex];
          const updatedComponents = [
            ...components.slice(0, componentIndex),
            ...components.slice(componentIndex + 1)
          ];
          return [updatedComponents, component];
        }
        
        // If not found at this level, check children
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          
          if (component.children.length > 0) {
            const [updatedChildren, found] = findAndRemoveComponent(component.children);
            
            if (found) {
              // Component was found in this branch
              const updatedComponent = {
                ...component,
                children: updatedChildren
              };
              
              const updatedComponents = [
                ...components.slice(0, i),
                updatedComponent,
                ...components.slice(i + 1)
              ];
              
              return [updatedComponents, found];
            }
          }
        }
        
        // Component not found in this branch
        return [components, null];
      };
      
      // Helper function to add a component to a specific parent
      const addComponentToParent = (components: Component[], parentId: string | undefined, component: Component, index?: number): Component[] => {
        if (!parentId) {
          // Add to root level
          const updatedComponents = [...components];
          if (index !== undefined) {
            updatedComponents.splice(index, 0, { ...component, parentId: undefined });
          } else {
            updatedComponents.push({ ...component, parentId: undefined });
          }
          return updatedComponents;
        }
        
        // Add to specified parent
        return components.map(c => {
          if (c.id === parentId) {
            const updatedChildren = [...c.children];
            const updatedComponent = { ...component, parentId };
            
            if (index !== undefined) {
              updatedChildren.splice(index, 0, updatedComponent);
            } else {
              updatedChildren.push(updatedComponent);
            }
            
            return { ...c, children: updatedChildren };
          }
          
          if (c.children.length > 0) {
            return {
              ...c,
              children: addComponentToParent(c.children, parentId, component, index)
            };
          }
          
          return c;
        });
      };
      
      const updatedPages = currentProject.pages.map(page => {
        if (page.id === pageId) {
          // Find and remove the component
          const [componentsAfterRemoval, removedComponent] = findAndRemoveComponent(page.components);
          
          if (!removedComponent) {
            return page; // Component not found
          }
          
          componentToMove = removedComponent;
          
          // Add the component to its new position
          const componentsAfterAddition = addComponentToParent(
            componentsAfterRemoval,
            newParentId,
            removedComponent,
            newIndex
          );
          
          return { ...page, components: componentsAfterAddition };
        }
        return page;
      });
      
      if (!componentToMove) {
        throw new Error('Component not found');
      }
      
      await updateDoc(doc(db, 'projects', projectId), {
        pages: updatedPages,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, pages: updatedPages, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, pages: updatedPages, updatedAt: Date.now() },
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to move component', 
        loading: false 
      });
    }
  },

  addAsset: async (projectId: string, assetData: Omit<Asset, 'id' | 'createdAt'>) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      const assetId = uuidv4();
      const newAsset: Asset = {
        ...assetData,
        id: assetId,
        createdAt: Date.now()
      };
      
      const updatedAssets = [...currentProject.assets, newAsset];
      
      await updateDoc(doc(db, 'projects', projectId), {
        assets: updatedAssets,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, assets: updatedAssets, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, assets: updatedAssets, updatedAt: Date.now() },
          loading: false
        };
      });
      
      return assetId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add asset', 
        loading: false 
      });
      throw error;
    }
  },

  deleteAsset: async (projectId: string, assetId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { currentProject } = get();
      
      if (!currentProject || currentProject.id !== projectId) {
        throw new Error('Project not loaded');
      }
      
      const updatedAssets = currentProject.assets.filter(asset => asset.id !== assetId);
      
      await updateDoc(doc(db, 'projects', projectId), {
        assets: updatedAssets,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, assets: updatedAssets, updatedAt: Date.now() };
          }
          return project;
        });
        
        return {
          projects: updatedProjects,
          currentProject: { ...currentProject, assets: updatedAssets, updatedAt: Date.now() },
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete asset', 
        loading: false 
      });
    }
  },

  publishProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      // In a real implementation, this would handle the actual deployment
      // For now, we'll just update the project status
      
      const publishedUrl = `https://example.com/${projectId}`;
      
      await updateDoc(doc(db, 'projects', projectId), {
        published: true,
        publishedUrl,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { 
              ...project, 
              published: true, 
              publishedUrl, 
              updatedAt: Date.now() 
            };
          }
          return project;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId 
          ? { ...state.currentProject, published: true, publishedUrl, updatedAt: Date.now() } 
          : state.currentProject;
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false
        };
      });
      
      return publishedUrl;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to publish project', 
        loading: false 
      });
      throw error;
    }
  },

  unpublishProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      await updateDoc(doc(db, 'projects', projectId), {
        published: false,
        publishedUrl: null,
        updatedAt: Date.now()
      });
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            const { publishedUrl, ...rest } = project;
            return { 
              ...rest, 
              published: false,
              updatedAt: Date.now() 
            };
          }
          return project;
        });
        
        let updatedCurrentProject = state.currentProject;
        if (updatedCurrentProject?.id === projectId) {
          const { publishedUrl, ...rest } = updatedCurrentProject;
          updatedCurrentProject = { 
            ...rest, 
            published: false,
            updatedAt: Date.now() 
          };
        }
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to unpublish project', 
        loading: false 
      });
    }
  }
}));