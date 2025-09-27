import axios, { AxiosResponse } from 'axios';
import { 
  Hospital, 
  StudyDataset, 
  FHIRConnection, 
  ResearchCriteria, 
  AggregateResults,
  ProofGenerationRequest,
  ZKProof,
  APIResponse,
  Cohort,
  StudyOutcomes
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class APIService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Hospital management
  async getHospitals(): Promise<any> {
    const response = await this.api.get('/hospitals');
    return response.data;
  }

  async generateCohort(params: {
    hospitalId: string;
    size?: number;
    condition?: string;
    treatment?: string;
  }): Promise<APIResponse<{ cohort: Cohort; outcomes: StudyOutcomes }>> {
    const response = await this.api.post('/generate-cohort', params);
    return response.data;
  }

  // FHIR operations
  async connectToFHIR(hospitalId: string): Promise<any> {
    const response = await this.api.post('/fhir/connect', { hospitalId });
    return response.data;
  }

  async extractFHIRCohort(criteria: ResearchCriteria): Promise<APIResponse> {
    const response = await this.api.post('/fhir/extract-cohort', criteria);
    return response.data;
  }

  // Zero-knowledge proof operations
  async generateProof(request: ProofGenerationRequest): Promise<any> {
    const response = await this.api.post('/generate-proof', request);
    return response.data;
  }

  // Study management
  async getDemoStudies(): Promise<any> {
    const response = await this.api.get('/demo/studies');
    return response.data;
  }

  async aggregateResults(params: {
    studyType: string;
    condition: string;
    proofs: ZKProof[];
  }): Promise<APIResponse<AggregateResults>> {
    const response = await this.api.post('/aggregate-results', params);
    return response.data;
  }

  // Utility methods
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock blockchain interaction (for demo purposes)
  async submitProofToBlockchain(proofHash: string, studyType: string, hospitalId: string): Promise<APIResponse> {
    // Simulate blockchain transaction
    await this.delay(2000);
    
    return {
      success: true,
      data: {
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        status: 'confirmed'
      },
      timestamp: new Date().toISOString()
    };
  }

  async getBlockchainProofs(studyType?: string): Promise<APIResponse> {
    // Simulate fetching proofs from blockchain
    await this.delay(1000);
    
    const mockProofs = [
      {
        proofHash: '0xabc123...',
        hospital: '0x1234567890123456789012345678901234567890',
        studyType: 'diabetes-treatment',
        condition: 'type-2-diabetes',
        timestamp: Date.now() - 86400000,
        verified: true
      },
      {
        proofHash: '0xdef456...',
        hospital: '0x0987654321098765432109876543210987654321',
        studyType: 'hypertension-management',
        condition: 'hypertension',
        timestamp: Date.now() - 172800000,
        verified: true
      }
    ];

    const filteredProofs = studyType 
      ? mockProofs.filter(proof => proof.studyType === studyType)
      : mockProofs;

    return {
      success: true,
      data: {
        proofs: filteredProofs,
        totalProofs: filteredProofs.length
      },
      timestamp: new Date().toISOString()
    };
  }

  // Error handling helper
  handleError(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;