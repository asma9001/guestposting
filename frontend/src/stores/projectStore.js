import { create } from 'zustand';
import api from '@/lib/api';

// Helper function to guarantee all required UI fields exist
const sanitizeProject = (project) => ({
  ...project,
  spent: project.spent ?? 0,
  ordersCount: project.ordersCount ?? 0,
  activeOrders: project.activeOrders ?? 0,
  completedOrders: project.completedOrders ?? 0,
  startDate: project.startDate || new Date().toISOString(),
  status: project.status || 'active',
});

export const useProjectStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  // 1. Fetch all projects from database
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/projects');
      if (response.data.success) {
        // FIX: Sanitize all fetched projects
        const sanitizedData = Array.isArray(response.data.data) 
          ? response.data.data.map(sanitizeProject) 
          : [];
          
        set({ projects: sanitizedData, isLoading: false });
      }
    } catch (error) {
      console.error("❌ Fetching projects failed:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to load projects', 
        isLoading: false 
      });
    }
  },

  // 2. Get a single project from state
  getProject: (id) => {
    return get().projects.find((p) => (p._id === id || p.id === id));
  },
 
  // 3. Add a new project to database
  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/projects', projectData); 
      
      if (response.data.success) {
        // FIX: Sanitize the newly created project
        const newProject = sanitizeProject(response.data.data);

        set((state) => ({
          projects: [newProject, ...state.projects],
          isLoading: false
        }));
        return true;
      }
    } catch (error) {
      console.error("❌ Failed to save project:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to create project', 
        isLoading: false 
      });
      return false;
    }
  },
 updateProject: async (projectId, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Raw fetch hata kar custom api config use karein taake sahi port (backend) hit ho
      const response = await api.put(`/api/projects/${projectId}`, updatedData);

      if (response.data.success) {
        // 2. Response data ko sanitize karein jaisa baaki functions mein kiya hai
        const sanitizedProject = sanitizeProject(response.data.data);

        // 3. State local array update karte waqt MongoDB ki id (_id ya id) dono match karein
        set((state) => ({
          projects: state.projects.map((project) =>
            (project._id === projectId || project.id === projectId) 
              ? sanitizedProject 
              : project
          ),
          isLoading: false,
        }));
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update project');
      }
    } catch (err) {
      console.error("❌ Updating project failed:", err);
      set({ 
        error: err.response?.data?.message || err.message || 'Failed to update project', 
        isLoading: false 
      });
      return { success: false, message: err.message };
    }
  },
  // 4. Delete project from database & state
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/api/projects/${id}`);
      if (response.data.success) {
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== id && p.id !== id)
        }));
      }
    } catch (error) {
      console.error("❌ Failed to delete project:", error);
    }
  }
}));