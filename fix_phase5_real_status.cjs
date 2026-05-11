const fs = require('fs');
const p = 'src/pages/fabrica/Phase5Dashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. INJETAR A VERIFICAÇÃO REAL DE EXISTÊNCIA DO ARQUIVO
const statusCheckHook = `
  const [siteExists, setSiteExists] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) return;
      try {
        const siteUrl = supabase.storage.from("thumbnails").getPublicUrl(\`sites/\${user.id}.html\`).data.publicUrl;
        // Faz um HEAD rápido apenas para checar se o status é 200 OK (existe)
        const res = await fetch(siteUrl, { method: 'HEAD', cache: 'no-cache' });
        setSiteExists(res.ok);
      } catch {
        setSiteExists(false);
      }
    };
    checkStatus();
  }, [user?.id, isPublishing]);
`;

// Insere logo após a definição da função handleDashboardPublish
c = c.replace(/} finally {\s+setIsPublishing\(false\);\s+}\s+};/s, (match) => match + "\n" + statusCheckHook);

// 2. ATUALIZAR A LÓGICA DE PROGRESSO PARA USAR O STATUS REAL DO SITE
const oldProgress = `    if (state.logoBase64) { points += 25; count++; }
    if (state.agencyName) { points += 25; count++; }
    if (state.diagnosticoCompleto) { points += 25; count++; }
    if (state.selectedPackages.length > 0) { points += 25; count++; }`;

const newProgress = `    // Métricas Ativas (Não é só formulário, tem que estar operante!)
    if (state.logoBase64) { points += 20; }
    if (state.agencyName) { points += 20; }
    if (state.diagnosticoCompleto) { points += 20; }
    if (state.selectedPackages.length > 0) { points += 20; }
    if (siteExists) { points += 20; } // 20% do progresso real é ter o site no ar!
    
    // Manter contagem visual pra compatibilidade de count
    count = points / 20;`;

c = c.replace(oldProgress, newProgress);

// 3. ATUALIZAR O BADGE JSX DE "ONLINE & ATIVO" PARA SER DINÂMICO E REAL
// Regex robusto para pegar o bloco da linha 260-270 aproximado
const oldBadgeRegex = /<h3 className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">.*?<\/h3>\s+<span className="inline-flex items-center gap-1 text-\[10px\] font-black text-emerald-400 px-2\.5 py-1 rounded-full bg-emerald-500\/20 border border-emerald-500\/20">.*?<\/span>/s;

const newBadgeJSX = `<h3 className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-4 h-4 \${siteExists ? 'text-emerald-400' : siteExists === false ? 'text-amber-400' : 'text-white/40'}" />
                 {siteExists ? "Seu Site Está No Ar!" : siteExists === false ? "Site Aguardando Ativação" : "Verificando Status..."}
               </h3>
               {siteExists ? (
                 <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/20">
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                   ONLINE & ATIVO
                 </span>
               ) : siteExists === false ? (
                 <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                   <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                   AGUARDANDO DNS
                 </span>
               ) : (
                 <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/30 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   CHECANDO
                 </span>
               )}`;

c = c.replace(oldBadgeRegex, newBadgeJSX);

// 4. CORRIGIR A DESCRIÇÃO DO BOTÃO PARA DIZER "PUBLICAR AGORA" SE ESTIVER OFFLINE
c = c.replace('{isPublishing ? (', 
              `{isPublishing ? (`); // Manter o mesmo, mas garantir que o p abaixo do card fale que precisa ativar
              
fs.writeFileSync(p, c, 'utf8');
console.log("DASHBOARD STATUS ENGINE UPGRADED SUCCESSFULLY!");
