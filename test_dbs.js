const z_url = 'https://zdjtcwtakgizbsbbwtgc.supabase.co';
const z_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs';

const m_url = 'https://mgdsjxasolxoclchyqdx.supabase.co';
const m_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZHNqeGFzb2x4b2NsY2h5cWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNTA1NTQsImV4cCI6MjA4NDYyNjU1NH0.3EEvDMLjGvcEQKOkB4rfrBzXrCGBnkXKNFT9oYV2H9U';

async function fetchSubs(name, url, key) {
  try {
    const res = await fetch(url + '/rest/v1/subscriptions?select=user_id,status,product_id,stripe_subscription_id,created_at&order=created_at.desc&limit=5', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    });
    const data = await res.json();
    console.log(`\n=== ${name} (${url}) ===`);
    if (data.error) {
      console.log(data);
    } else if (data.length === 0) {
      console.log("No subscriptions found.");
    } else {
      console.log(data.map(d => `${d.created_at} | ${d.status} | ${d.product_id} | ${d.stripe_subscription_id}`).join('\n'));
    }
  } catch (e) {
    console.log(`Error on ${name}:`, e.message);
  }
}

async function run() {
  await fetchSubs('LOVABLE (Frontend)', z_url, z_key);
  await fetchSubs('SUPABASE CLI (My Deploys)', m_url, m_key);
}
run();
