async function test() {
  const url = "https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/hotmart-webhook";
  console.log("Testing:", url);
  try {
    const res = await fetch(url, { method: "POST", body: "{}" });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
