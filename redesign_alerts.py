import sys

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Emerald (Vercel online)
content = content.replace("bg-emerald-500/10 border-emerald-500/25", "bg-white/5 border-white/10")
content = content.replace("text-emerald-400 uppercase tracking-wider", "text-white/50 uppercase tracking-wider")
content = content.replace("bg-emerald-500 hover:bg-emerald-600 text-white", "bg-white hover:bg-gray-200 text-black")

# 2. Amber (Vercel token config)
content = content.replace("border-amber-500/30 bg-amber-500/10", "border-white/10 bg-white/[0.02]")
content = content.replace("text-amber-400 uppercase", "text-white/50 uppercase")
content = content.replace("border-amber-500/20", "border-white/10")
content = content.replace("focus:border-amber-400", "focus:border-white/30")
content = content.replace("bg-amber-500 hover:bg-amber-600 text-black", "bg-white hover:bg-gray-200 text-black")
content = content.replace("text-amber-400 hover:underline", "text-white hover:underline")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
