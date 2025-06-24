import { useState, useEffect, useRef } from 'react';

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocation: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high';
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>;
}

interface ProjectSession {
  sessionId: string;
  projectData: ProjectFormData;
  currentStep: number;
  completedSteps: number[];
  validationStatus: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export const useProjectSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectFormData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedSessionId = localStorage.getItem('projectSessionId');
        if (storedSessionId) {
          console.log('Found stored session ID:', storedSessionId);
          await loadSession(storedSessionId);
        } else {
          console.log('No stored session found, creating new session');
          await createSession();
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        // Clear invalid session and create new one
        localStorage.removeItem('projectSessionId');
        await createSession();
      }
    };

    initializeSession();
  }, []); // Empty dependency array - only run on mount

  const createSession = async (initialData: Partial<ProjectFormData> = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/project-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: initialData,
          currentStep: 1,
          completedSteps: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }
      
      const { sessionId } = await response.json();
      setSessionId(sessionId);
      setProjectData(initialData as ProjectFormData);
      setCurrentStep(1);
      setCompletedSteps([]);
      
      // Store session ID in localStorage
      localStorage.setItem('projectSessionId', sessionId);
      
      return sessionId;
    } catch (error: any) {
      console.error('Error creating session:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (data: Partial<ProjectFormData>, step?: number) => {
    if (!sessionId) {
      console.warn('No session ID available, creating new session');
      await createSession(data);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedData = { ...projectData, ...data };
      setProjectData(updatedData);
      
      const response = await fetch('/api/project-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          projectData: updatedData,
          currentStep: step || currentStep,
          completedSteps: step ? [...completedSteps, step] : completedSteps
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update session');
      }
      
      if (step) {
        setCurrentStep(step);
        setCompletedSteps(prev => Array.from(new Set([...prev, step])));
      }
    } catch (error: any) {
      console.error('Error updating session:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading session with ID:', id);
      const response = await fetch(`/api/project-session/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Session not found, create new one
          console.log('Session not found, creating new session');
          localStorage.removeItem('projectSessionId');
          await createSession();
          return;
        } else if (response.status === 410) {
          // Session expired, create new one
          console.log('Session expired, creating new session');
          localStorage.removeItem('projectSessionId');
          await createSession();
          return;
        }
        throw new Error(`Failed to load session: ${response.status} ${response.statusText}`);
      }
      
      const session: ProjectSession = await response.json();
      console.log('Loaded session data:', session);
      console.log('Session projectData:', session.projectData);
      console.log('Session uploadedFiles:', session.projectData?.uploadedFiles);
      
      setSessionId(session.sessionId);
      setProjectData(session.projectData);
      setCurrentStep(session.currentStep);
      setCompletedSteps(session.completedSteps);
    } catch (error: any) {
      console.error('Error loading session:', error);
      setError(error.message);
      // Fallback to new session
      localStorage.removeItem('projectSessionId');
      await createSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/project-session/${sessionId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error clearing session:', error);
      }
      localStorage.removeItem('projectSessionId');
      setSessionId(null);
      setProjectData(null);
      setCurrentStep(1);
      setCompletedSteps([]);
      setError(null);
    }
  };

  const autoSave = (data: Partial<ProjectFormData>) => {
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    // Only auto-save if not loading and no error
    if (loading || error) return;

    // Set new timeout for auto-save
    autoSaveTimeout.current = setTimeout(() => {
      if (sessionId && data) {
        updateSession(data, currentStep).catch((err) => {
          setError('Auto-save failed: ' + (err?.message || err));
        });
      }
    }, 1000); // 1 second delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, []);

  return {
    sessionId,
    projectData,
    currentStep,
    completedSteps,
    loading,
    error,
    createSession,
    updateSession,
    loadSession,
    clearSession,
    autoSave,
    setCurrentStep,
    setProjectData
  };
}; 