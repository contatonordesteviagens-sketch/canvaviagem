import sys
import re

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize newlines
content = content.replace('\r\n', '\n')

# 1. REMOVE duplicated Tracking block inside Vercel section
tracking_old = """            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Meta Pixel ID (Opcional):
                </label>
                <input
                  type="text"
                  value={state.metaPixelId || ""}
                  onChange={(e) => update({ metaPixelId: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Google Analytics ID (Opcional):
                </label>
                <input
                  type="text"
                  value={state.ga4Id || ""}
                  onChange={(e) => update({ ga4Id: e.target.value })}
                  placeholder="Ex: G-XXXXXXXXXX"
                  className="w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                />
              </div>
            </div>"""
if tracking_old in content:
    content = content.replace(tracking_old, "")
    print("SUCCESS: Vercel Tracking block removed")
else:
    print("WARNING: Vercel Tracking block not found")

# 2. FIX Avançar Button background
avancar_old = """            className="flex-[2] py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ 
              background: primaryColor, 
              color: primaryColor === "#000000" ? "#ffffff" : "#000000",
              border: primaryColor === "#000000" ? "1px solid rgba(255,255,255,0.3)" : "none",
              boxShadow: `0 0 20px ${primaryColor}55`
            }}
          >
            Avançar para a próxima fase <Rocket className="w-5 h-5" />
          </button>"""

avancar_new = """            className="flex-[2] py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ 
              background: "#ffffff", 
              color: "#000000",
              border: "none",
              boxShadow: "0 0 20px rgba(255,255,255,0.4)"
            }}
          >
            Avançar para a próxima fase <Rocket className="w-5 h-5" />
          </button>"""
if avancar_old in content:
    content = content.replace(avancar_old, avancar_new)
    print("SUCCESS: Avançar button fixed")
else:
    print("WARNING: Avançar button not found")


# 3. Add Base64 extraction to handleCanvaViagemPublish
canva_publish_old = """    setIsCanvaViagemPublishing(true);
    const toastId = toast.loading("Publicando no link Canva Viagem...");

    try {
      const liveUrl = `${CANVA_VIAGEM_SITE_BASE_URL}/${cleanSlug}`;
      const fileName = `sites/${cleanSlug}.webp`; // bypass RLS"""

canva_publish_new = """    setIsCanvaViagemPublishing(true);
    const toastId = toast.loading("Publicando no link Canva Viagem...");

    try {
      toast.loading("Otimizando imagens do site para o Canva Viagem (isso pode levar alguns segundos)...", { id: toastId });
      let finalHtml = html;
      const base64Regex = /src="(data:image\\/[^;]+;base64,[^"]+)"/g;
      const matches = [...finalHtml.matchAll(base64Regex)];
      
      for (let i = 0; i < matches.length; i++) {
        const fullMatch = matches[i][0];
        const base64Data = matches[i][1];
        
        try {
          const mimeType = base64Data.split(';')[0].split(':')[1];
          const b64Data = base64Data.split(',')[1];
          const byteCharacters = atob(b64Data);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: mimeType });
          
          const ext = mimeType.split('/')[1] || 'webp';
          const filename = `vercel_assets/${user?.id || 'anon'}_${Date.now()}_cv_${i}.${ext}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("thumbnails")
            .upload(filename, blob, { contentType: mimeType, upsert: true });
            
          if (!uploadError && uploadData) {
            const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(filename).data.publicUrl;
            finalHtml = finalHtml.replace(fullMatch, `src="${publicUrl}"`);
          }
        } catch (e) {
          console.warn("Falha ao fazer upload da imagem base64 no Canva Viagem", e);
        }
      }

      toast.loading("Enviando código para o Canva Viagem...", { id: toastId });

      const liveUrl = `${CANVA_VIAGEM_SITE_BASE_URL}/${cleanSlug}`;
      const fileName = `sites/${cleanSlug}.webp`; // bypass RLS"""

if canva_publish_old in content:
    content = content.replace(canva_publish_old, canva_publish_new)
    print("SUCCESS: Canva Viagem Base64 extraction added")
else:
    print("WARNING: Canva publish block not found")

# 4. Use finalHtml instead of html in Canva Viagem blob
blob_old = """      const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });"""
blob_new = """      const blob = new Blob([finalHtml], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });"""

# Need to replace ONLY the one inside handleCanvaViagemPublish!
# So we locate it after the canva_publish_new block
if canva_publish_old in content:  # we already replaced it, so we can't search for it
    pass

# We will just replace all occurences of Blob([html]) that appear AFTER handleCanvaViagemPublish
parts = content.split("const handleCanvaViagemPublish = async () => {")
if len(parts) == 2:
    parts[1] = parts[1].replace(blob_old, blob_new)
    content = "const handleCanvaViagemPublish = async () => {".join(parts)
    print("SUCCESS: Blob uses finalHtml in Canva Publish")
else:
    print("WARNING: handleCanvaViagemPublish split failed")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
