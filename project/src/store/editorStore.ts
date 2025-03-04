import { create } from 'zustand';
import { Component } from '../types';

interface EditorState {
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  isDragging: boolean;
  zoom: number;
  showGrid: boolean;
  showOutlines: boolean;
  previewMode: boolean;
  responsiveMode: 'desktop' | 'tablet' | 'mobile';
  history: {
    past: any[];
    future: any[];
  };
  
  selectComponent: (componentId: string | null) => void;
  hoverComponent: (componentId: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleOutlines: () => void;
  togglePreviewMode: () => void;
  setResponsiveMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  
  undo: () => void;
  redo: () => void;
  addToHistory: (state: any) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedComponentId: null,
  hoveredComponentId: null,
  isDragging: false,
  zoom: 1,
  showGrid: true,
  showOutlines: true,
  previewMode: false,
  responsiveMode: 'desktop',
  history: {
    past: [],
    future: []
  },
  
  selectComponent: (componentId) => {
    set({ selectedComponentId: componentId });
  },
  
  hoverComponent: (componentId) => {
    set({ hoveredComponentId: componentId });
  },
  
  setDragging: (isDragging) => {
    set({ isDragging });
  },
  
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.25, Math.min(2, zoom)) });
  },
  
  toggleGrid: () => {
    set(state => ({ showGrid: !state.showGrid }));
  },
  
  toggleOutlines: () => {
    set(state => ({ showOutlines: !state.showOutlines }));
  },
  
  togglePreviewMode: () => {
    set(state => ({ 
      previewMode: !state.previewMode,
      // When entering preview mode, deselect any component
      selectedComponentId: !state.previewMode ? null : state.selectedComponentId
    }));
  },
  
  setResponsiveMode: (mode) => {
    set({ responsiveMode: mode });
  },
  
  undo: () => {
    const { history } = get();
    
    if (history.past.length === 0) return;
    
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    
    set(state => ({
      ...previous,
      history: {
        past: newPast,
        future: [state, ...history.future]
      }
    }));
  },
  
  redo: () => {
    const { history } = get();
    
    if (history.future.length === 0) return;
    
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    
    set(state => ({
      ...next,
      history: {
        past: [...history.past, state],
        future: newFuture
      }
    }));
  },
  
  addToHistory: (state) => {
    set(currentState => ({
      history: {
        past: [...currentState.history.past, state],
        future: []
      }
    }));
  }
}));