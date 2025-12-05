/**
 * Client for Midnight Proof Service
 * Calls the REAL proof service running on port 3002
 */

const http = require('http');

class ProofServiceClient {
  constructor(config) {
    this.serviceUrl = 'http://localhost:3002';
    this.config = config;
    this.initialized = false;
  }

  async initialize() {
    console.log('\n🌙 Connecting to Midnight Proof Service');
    console.log('═'.repeat(70));
    console.log('📍 Service:', this.serviceUrl);
    console.log('📍 Contract:', this.config.contractAddress);

    // Wait for service to be ready
    for (let i = 0; i < 30; i++) {
      try {
        const health = await this.checkHealth();
        if (health.status === 'ready') {
          console.log('✅ Connected to REAL Midnight proof service');
          console.log('🔗 Contract:', health.contract);
          console.log('═'.repeat(70));
          this.initialized = true;
          return;
        }
      } catch (e) {
        // Service not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (i % 5 === 0) console.log(`⏳ Waiting for proof service... (${i}s)`);
    }

    throw new Error('Proof service not ready after 30s');
  }

  async checkHealth() {
    return new Promise((resolve, reject) => {
      const req = http.get(`${this.serviceUrl}/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.setTimeout(2000, () => req.destroy());
    });
  }

  async submitMedicalProof(privateData, publicMetadata) {
    if (!this.initialized) {
      throw new Error('Proof service not initialized');
    }

    console.log('\n🔒 Submitting REAL proof to Midnight Network via proof service');

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ privateData, publicMetadata });

      const req = http.request({
        hostname: 'localhost',
        port: 3002,
        path: '/submit-proof',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 60000 // 60s for proof generation
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 200) {
              console.log('✅ REAL PROOF GENERATED ON MIDNIGHT NETWORK!');
              console.log('📍 Contract:', result.contractAddress);
              resolve(result);
            } else {
              reject(new Error(result.error || 'Proof generation failed'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  getContractStats() {
    return {
      contractAddress: this.config.contractAddress,
      networkId: this.config.networkId,
      initialized: this.initialized,
      realIntegration: true,
      simulation: false,
      serviceUrl: this.serviceUrl
    };
  }
}

module.exports = { ProofServiceClient };
