import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import apiService from '../services/api';
import { Hospital, StudyDataset, ZKProof } from '../types';

interface APIState {
  hospitals: Hospital[];
  studies: StudyDataset[];
  loading: boolean;
  error: string | null;
}

interface APIContextValue extends APIState {
  // Hospital operations
  loadHospitals: () => Promise<void>;
  generateCohort: (hospitalId: string, size?: number, condition?: string) => Promise<any>;
  
  // Study operations
  loadDemoStudies: () => Promise<void>;
  generateProof: (studyData: any, hospitalId: string) => Promise<ZKProof | null>;
  
  // FHIR operations
  connectToFHIR: (hospitalId: string) => Promise<any>;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const APIContext = createContext<APIContextValue | undefined>(undefined);

interface APIProviderProps {
  children: ReactNode;
}

export const APIProvider: React.FC<APIProviderProps> = ({ children }) => {
  const [state, setState] = useState<APIState>({
    hospitals: [],
    studies: [],
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Hospital operations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadHospitals = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await apiService.getHospitals();
      
      // @ts-ignore - Temporary fix for API response structure
      if (response.success && response.hospitals) {
        setState(prev => ({
          ...prev,
          // @ts-ignore - Temporary fix for API response structure
          hospitals: response.hospitals || [],
          loading: false,
        }));
      } else {
        throw new Error(response.error || 'Failed to load hospitals');
      }
    } catch (error: any) {
      setError(apiService.handleError(error));
    }
  }, [setLoading, clearError]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateCohort = useCallback(async (
    hospitalId: string, 
    size: number = 500, 
    condition: string = 'type-2-diabetes'
  ) => {
    try {
      setLoading(true);
      clearError();

      const response = await apiService.generateCohort({
        hospitalId,
        size,
        condition,
      });

      if (response.success) {
        setLoading(false);
        return response;
      } else {
        throw new Error(response.error || 'Failed to generate cohort');
      }
    } catch (error: any) {
      setError(apiService.handleError(error));
      return null;
    }
  }, [setLoading, clearError]);

  // Study operations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadDemoStudies = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await apiService.getDemoStudies();
      
      // @ts-ignore - Temporary fix for API response structure
      if (response.success && response.studies) {
        setState(prev => ({
          ...prev,
          // @ts-ignore - Temporary fix for API response structure  
          studies: response.studies || [],
          loading: false,
        }));
      } else {
        throw new Error(response.error || 'Failed to load demo studies');
      }
    } catch (error: any) {
      setError(apiService.handleError(error));
    }
  }, [setLoading, clearError]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateProof = useCallback(async (studyData: any, hospitalId: string): Promise<ZKProof | null> => {
    try {
      setLoading(true);
      clearError();

      const response = await apiService.generateProof({
        studyData,
        hospitalId,
        studyType: 'treatment-efficacy',
      });

      // @ts-ignore - Temporary fix for API response structure
      if (response.success && response.proof) {
        setLoading(false);
        // @ts-ignore - Temporary fix for API response structure
        return response.proof;
      } else {
        throw new Error(response.error || 'Failed to generate proof');
      }
    } catch (error: any) {
      setError(apiService.handleError(error));
      return null;
    }
  }, [setLoading, clearError]);

  // FHIR operations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connectToFHIR = useCallback(async (hospitalId: string) => {
    try {
      setLoading(true);
      clearError();

      const response = await apiService.connectToFHIR(hospitalId);

      if (response.success) {
        setLoading(false);
        // @ts-ignore - Temporary fix for API response structure
        return response.connection;
      } else {
        throw new Error(response.error || 'Failed to connect to FHIR');
      }
    } catch (error: any) {
      setError(apiService.handleError(error));
      return null;
    }
  }, [setLoading, clearError]);

  const contextValue: APIContextValue = {
    ...state,
    loadHospitals,
    generateCohort,
    loadDemoStudies,
    generateProof,
    connectToFHIR,
    clearError,
    setLoading,
  };

  return (
    <APIContext.Provider value={contextValue}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = (): APIContextValue => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};