

const BASE_URL = 'http://localhost:5001/api/analytics';

async function verifyAnalytics() {
    console.log('🚀 Starting CRM Analytics Verification...\n');

    const endpoints = ['pipeline', 'revenue', 'lead-sources', 'cases'];

    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Testing /api/analytics/${endpoint}...`);
            const response = await fetch(`${BASE_URL}/${endpoint}`, {
                headers: {
                    'x-tenant-id': 'tenant1',
                    'x-user-id': 'user1',
                    'x-user-role': 'admin'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.error(`❌ Endpoint NOT FOUND (404). Is the server running?`);
                } else {
                    const text = await response.text();
                    console.error(`❌ Failed: ${response.status} - ${text}`);
                }
                continue;
            }

            const data = await response.json();
            console.log(`✅ Success! Received ${Array.isArray(data) ? data.length : 'object'} items.`);
            console.log(JSON.stringify(data, null, 2).slice(0, 200) + '...\n');
        } catch (error: any) {
            console.error(`💥 Error testing ${endpoint}:`, error.message);
        }
    }

    console.log('✨ Verification Complete.');
}

verifyAnalytics();
