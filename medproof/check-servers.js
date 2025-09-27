#!/usr/bin/env node

const http = require('http');

function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} (port ${port}): Running - Status ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name} (port ${port}): Not running - ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏱️ ${name} (port ${port}): Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkAllServers() {
  console.log('🌙 MedProof × Midnight Network - Server Status Check\n');
  
  const backendRunning = await checkServer(3001, 'Backend API');
  const frontendRunning = await checkServer(3000, 'Frontend React');
  
  console.log('\n📊 Summary:');
  if (backendRunning && frontendRunning) {
    console.log('🚀 All servers are running! Ready for Midnight Network demo.');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3001');
    console.log('🌙 Midnight Network integration: Active');
  } else {
    console.log('⚠️ Some servers are not running properly.');
  }
}

checkAllServers().catch(console.error); 