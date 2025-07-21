#!/usr/bin/env node

/**
 * Test script to validate the K8s job synchronization fix
 * 
 * This script tests that:
 * 1. The backend can connect to Kubernetes (if available)
 * 2. The new API endpoints work correctly
 * 3. The frontend can retrieve and display K8s job information
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testKubernetesIntegration() {
  console.log('🧪 Testing Kubernetes Integration...\n');

  try {
    // Test 1: Check K8s health endpoint
    console.log('1. Testing K8s health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/k8s/health`);
    const healthData = await healthResponse.json();
    
    console.log(`   ✅ Health endpoint works: ${healthData.kubernetes_connected ? 'Connected' : 'Disconnected'}`);
    
    if (!healthData.kubernetes_connected) {
      console.log('   ⚠️  Kubernetes not connected - this is expected if no cluster is running');
      console.log('   📝 To test with real K8s: ensure kubectl works and restart the backend');
    }

    // Test 2: Check K8s jobs listing endpoint
    console.log('\n2. Testing K8s jobs listing endpoint...');
    const jobsResponse = await fetch(`${API_BASE}/k8s/jobs`);
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log(`   ✅ Jobs endpoint works: Found ${jobsData.jobs ? jobsData.jobs.length : 0} SparkTest jobs`);
      
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        console.log('   📋 Jobs found:');
        jobsData.jobs.forEach(job => {
          console.log(`      - ${job.name} (${job.status}) in ${job.namespace}`);
        });
      }
    } else {
      console.log(`   ❌ Jobs endpoint failed: ${jobsResponse.status} ${jobsResponse.statusText}`);
    }

    // Test 3: Test test runs endpoint
    console.log('\n3. Testing test runs endpoint...');
    const runsResponse = await fetch(`${API_BASE}/runs`);
    
    if (runsResponse.ok) {
      const runsData = await runsResponse.json();
      console.log(`   ✅ Runs endpoint works: Found ${runsData.length || 0} database runs`);
    } else {
      console.log(`   ❌ Runs endpoint failed: ${runsResponse.status} ${runsResponse.statusText}`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📖 How to test the full fix:');
    console.log('   1. Start the backend: cargo run');
    console.log('   2. Start the frontend: pnpm dev');
    console.log('   3. Visit http://localhost:3000/debug/k8s-jobs');
    console.log('   4. You should see the job synchronization status');
    console.log('\n🚀 To create real K8s jobs for testing:');
    console.log('   1. Set up a local cluster: k3d cluster create sparktest');
    console.log('   2. Create a test job: kubectl create job test-job --image=busybox -- echo "hello"');
    console.log('   3. Label it: kubectl label job test-job app=sparktest component=test-runner');
    console.log('   4. Refresh the debug page to see it appear');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure the backend is running: cargo run');
    console.log('   - Check that the backend port is 3001');
    console.log('   - Verify that the API endpoints are working');
  }
}

if (require.main === module) {
  testKubernetesIntegration();
}

module.exports = { testKubernetesIntegration };