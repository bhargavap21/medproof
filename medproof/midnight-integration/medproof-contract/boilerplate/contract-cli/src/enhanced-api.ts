// Enhanced API wrapper for Medproof Contract
// Generated on: 2025-09-08T19:21:22.805Z
// Auto-generated from medproof.compact

import { type Logger } from 'pino';
import { ContractAnalyzer } from './contract-analyzer.js';
import { DynamicCLIGenerator } from './dynamic-cli-generator.js';
import * as originalApi from './api.js';

// Re-export all original API functions
export * from './api.js';

/**
 * Contract information interface
 */
export interface ContractInfo {
  contractName: string;
  functions: Array<{
    name: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
    readOnly: boolean;
    description: string;
  }>;
  ledgerState: Array<{ name: string; type: string }>;
  witnesses: Array<{
    name: string;
    ledgerType: string;
    privateType: string;
    returns: string[];
  }>;
}

/**
 * Enhanced API with dynamic contract analysis
 */
export class EnhancedContractAPI {
  private analyzer: ContractAnalyzer;
  private cliGenerator: DynamicCLIGenerator;
  private contractInfo: ContractInfo | null;

  constructor(logger: Logger) {
    this.analyzer = new ContractAnalyzer();
    this.cliGenerator = new DynamicCLIGenerator(logger);
    this.contractInfo = null;
  }

  async initialize(): Promise<ContractInfo> {
    try {
      const analysis = await this.analyzer.analyzeContract();
      await this.cliGenerator.initialize();
      
      // Convert ContractAnalysis to ContractInfo format
      this.contractInfo = {
        contractName: analysis.contractName,
        functions: analysis.functions.map(func => ({
          ...func,
          readOnly: this.analyzer.isReadOnlyFunction(func.name),
          description: func.description || `Execute ${func.name} function`
        })),
        ledgerState: Object.entries(analysis.ledgerState).map(([name, type]) => ({ name, type })),
        witnesses: analysis.witnesses.map(witness => ({
          name: witness.name,
          ledgerType: witness.ledgerType,
          privateType: witness.privateType,
          returns: witness.returns
        }))
      };
      
      return this.contractInfo;
    } catch (error) {
      throw new Error(`Failed to initialize enhanced API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getContractInfo(): ContractInfo | null {
    return this.contractInfo;
  }

  generateMenuItems(): any[] {
    return this.cliGenerator.generateMenuItems();
  }

  generateMenuQuestion(menuItems: any[]): string {
    return this.cliGenerator.generateMenuQuestion(menuItems);
  }

  // Dynamic function mapping based on contract analysis
  /**
   * Execute submitMedicalProof function
   */
  async submitMedicalProof(...args: any[]): Promise<any> {
    return await (originalApi as any).submitMedicalProof(...args);
  }
  /**
   * Execute authorizeHospital function
   */
  async authorizeHospital(...args: any[]): Promise<any> {
    return await (originalApi as any).authorizeHospital(...args);
  }
  /**
   * Execute aggregateResults function
   */
  async aggregateResults(...args: any[]): Promise<any> {
    return await (originalApi as any).aggregateResults(...args);
  }
  /**
   * Execute getStudyStatus function
   */
  async getStudyStatus(...args: any[]): Promise<any> {
    return await (originalApi as any).getStudyStatus(...args);
  }
}

// Export contract metadata for reference
export const CONTRACT_METADATA = {
  name: 'Medproof Contract',
  fileName: 'medproof.compact',
  generatedAt: '2025-09-08T19:21:22.805Z',
  functions: [
  {
    "name": "submitMedicalProof",
    "parameters": [
      {
        "name": "// Private inputs - never revealed on-chain\n  secret patientData",
        "type": "MedicalStats"
      },
      {
        "name": "// Public inputs - visible on-chain\n  public studyId",
        "type": "Field"
      },
      {
        "name": "public hospitalId",
        "type": "Field"
      }
    ],
    "returnType": "[]",
    "readOnly": false
  },
  {
    "name": "authorizeHospital",
    "parameters": [
      {
        "name": "public hospitalId",
        "type": "Field"
      },
      {
        "name": "public authorizationProof",
        "type": "Field"
      }
    ],
    "returnType": "[]",
    "readOnly": false
  },
  {
    "name": "aggregateResults",
    "parameters": [
      {
        "name": "secret hospitalProofs",
        "type": "Vector<Field"
      },
      {
        "name": "// Up to 10 hospitals\n  secret hospitalData",
        "type": "Vector<MedicalStats"
      },
      {
        "name": "public studyType",
        "type": "Field"
      }
    ],
    "returnType": "[Field, Field]",
    "readOnly": true
  },
  {
    "name": "getStudyStatus",
    "parameters": [
      {
        "name": "public studyId",
        "type": "Field"
      }
    ],
    "returnType": "[Bool, Field]",
    "readOnly": true
  }
],
  ledgerState: [
  {
    "name": "totalStudies",
    "type": "Counter"
  },
  {
    "name": "verifiedHospitals",
    "type": "Counter"
  },
  {
    "name": "registeredProofs",
    "type": "Map<Field, MedicalProof>"
  }
],
  witnesses: []
} as const;
