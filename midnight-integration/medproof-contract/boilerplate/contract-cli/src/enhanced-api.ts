// Enhanced API wrapper for Medproof-mvp Contract
// Generated on: 2025-12-02T06:47:12.138Z
// Auto-generated from medproof-mvp.compact

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
   * Execute getTotalStudies function
   */
  async getTotalStudies(...args: any[]): Promise<any> {
    return await (originalApi as any).getTotalStudies(...args);
  }
}

// Export contract metadata for reference
export const CONTRACT_METADATA = {
  name: 'Medproof-mvp Contract',
  fileName: 'medproof-mvp.compact',
  generatedAt: '2025-12-02T06:47:12.138Z',
  functions: [
  {
    "name": "submitMedicalProof",
    "parameters": [
      {
        "name": "studyId",
        "type": "Bytes<32>"
      },
      {
        "name": "hospitalId",
        "type": "Bytes<32>"
      },
      {
        "name": "privacyLevel",
        "type": "Uint<8>"
      }
    ],
    "returnType": "Bytes<32>",
    "readOnly": true
  },
  {
    "name": "getTotalStudies",
    "parameters": [],
    "returnType": "Uint<64>",
    "readOnly": true
  }
],
  ledgerState: [
  {
    "name": "totalStudies",
    "type": "Counter"
  },
  {
    "name": "registeredProofs",
    "type": "Map<Bytes<32>, MedicalProof>"
  }
],
  witnesses: []
} as const;
