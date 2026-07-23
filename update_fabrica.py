import re
import os

files_to_update = [
    r"C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26\src\pages\Fabrica.tsx",
    r"C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26\src\pages\FabricaES.tsx"
]

for filepath in files_to_update:
    if not os.path.exists(filepath): continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Update useState for activeTab
    content = content.replace(
        'const [activeTab, setActiveTab] = useState<"dashboard" | "phase" | "library">("dashboard");',
        'const [activeTab, setActiveTab] = useState<"dashboard" | "phase">("dashboard");'
    )
    
    # 2. Remove librarySubTab state
    content = re.sub(
        r'const \[librarySubTab.*?;\n',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # 3. Update useEffect path checks for library
    content = re.sub(
        r'\} else if \(path\.includes\("/ofertas"\).*?\}\n',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 4. Update getPhaseName
    content = re.sub(
        r'if \(activeTab === "library"\) \{.*?\}',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Rename F4, F5 in getPhaseName for Fabrica.tsx
    content = content.replace('if (state.currentPhase === 5) return "Checkup (F4)";', '')
    content = content.replace('if (state.currentPhase === 4) return "Plano (F5)";', 'if (state.currentPhase === 4) return "CRM (F4)";\n    if (state.currentPhase === 5) return "Planos (F5)";')
    content = content.replace('if (state.currentPhase === 3) return "CRM (F3)";', 'if (state.currentPhase === 3) return "Site (F3)";')
    content = content.replace('if (state.currentPhase === 2) return "Site (F2)";', 'if (state.currentPhase === 2) return "Carrossel (F2)";')
    
    # For FabricaES.tsx
    content = content.replace('if (state.currentPhase === 5) return "Checkup";', '')
    content = content.replace('if (state.currentPhase === 4) return "Plan";', 'if (state.currentPhase === 4) return "CRM";\n    if (state.currentPhase === 5) return "Planos";')
    content = content.replace('if (state.currentPhase === 3) return "CRM";', 'if (state.currentPhase === 3) return "Sitio";')
    content = content.replace('if (state.currentPhase === 2) return "Sitio";', 'if (state.currentPhase === 2) return "Carrusel";')

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
print("Initial replacements done.")
