import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zdjtcwtakgizbsbbwtgc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs');

async function run() {
  const { data: videos } = await supabase.from('content_items').select('*').in('type', ['video', 'seasonal']);
  const { data: captions } = await supabase.from('captions').select('*');
  
  let matchCount = 0;
  let unmatchCount = 0;
  
  for (const video of videos) {
    let match = captions.find(c => video.title.toLowerCase().includes(c.destination.toLowerCase().split(' - ')[0].toLowerCase()));
    if (!match) {
      match = captions.find(c => c.destination.toLowerCase().includes(video.title.toLowerCase().split(' ')[0].toLowerCase()));
    }
    if (match) {
      matchCount++;
    } else {
      unmatchCount++;
      console.log('Unmatched video:', video.title);
    }
  }
  console.log(`Matched: ${matchCount}, Unmatched: ${unmatchCount}`);
}
run();
