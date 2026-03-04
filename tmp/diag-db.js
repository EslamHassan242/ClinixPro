const net = require('net');

const hosts = [
  { host: 'aws-1-eu-central-1.pooler.supabase.com', port: 6543 },
  { host: 'aws-1-eu-central-1.pooler.supabase.com', port: 5432 },
  { host: 'db.jxdbbhfspqkxdjvxdvoq.supabase.co', port: 5432 }
];

async function testConnection({ host, port }) {
  return new Promise((resolve) => {
    console.log(`Testing ${host}:${port}...`);
    const socket = new net.Socket();
    const startTime = Date.now();

    socket.setTimeout(5000);

    socket.on('connect', () => {
      console.log(`✅ SUCCESS: Connected to ${host}:${port} in ${Date.now() - startTime}ms`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`❌ TIMEOUT: Failed to reach ${host}:${port} after 5s`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      console.log(`❌ ERROR: ${host}:${port} - ${err.message}`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function run() {
  for (const h of hosts) {
    await testConnection(h);
    console.log('---');
  }
}

run();
