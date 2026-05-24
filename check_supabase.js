const url = "https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/webinar_leads?whatsapp=eq.global_live_settings&select=source";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

fetch(url, {
  headers: {
    "apikey": apiKey,
    "Authorization": "Bearer " + apiKey
  }
})
.then(res => res.json())
.then(data => {
  if (data && data[0] && data[0].source) {
    const sourceObj = typeof data[0].source === "string" ? JSON.parse(data[0].source) : data[0].source;
    console.log("=== NOVA VERIFICAÇÃO SUPABASE ===");
    console.log("Última Atualização:", sourceObj.updatedAt ? new Date(sourceObj.updatedAt).toLocaleString("pt-BR") : "N/A");
    console.log("Total de Comentários Agendados:", sourceObj.scheduledComments ? sourceObj.scheduledComments.length : 0);
    
    if (sourceObj.scheduledComments && Array.isArray(sourceObj.scheduledComments)) {
      // Vamos filtrar comentários que tenham tempo >= 02:30
      const parseTimeToSeconds = (t) => {
        if (!t || typeof t !== "string" || !t.includes(":")) return 0;
        const parts = t.split(":");
        return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
      };
      
      const minSeconds = 2 * 60 + 30; // 02:30
      
      const filtered = sourceObj.scheduledComments.filter(c => {
        const secs = parseTimeToSeconds(c.time);
        return secs >= minSeconds && secs <= (10 * 60); // entre 2:30 e 10:00
      });
      
      console.log(`\nComentários agendados entre 02:30 e 10:00 (${filtered.length} encontrados):`);
      filtered.forEach((c, idx) => {
        console.log(`[${idx + 1}] Tempo: ${c.time} | Usuário: @${c.username} | Mensagem: "${c.message}"`);
      });
      
      console.log("\nTodos os comentários salvos na nuvem (últimos 15):");
      sourceObj.scheduledComments.slice(-15).forEach((c, idx) => {
        console.log(`[T-${idx + 1}] Tempo: ${c.time} | Usuário: @${c.username} | Mensagem: "${c.message}"`);
      });
    }
  } else {
    console.log("Nenhum dado encontrado.");
  }
})
.catch(err => console.error(err));
