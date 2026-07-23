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

    # We need to replace the Mobile Menu buttons too.
    # We can just write a quick script to find F2-F5 mobile buttons and replace them.
    # In Fabrica.tsx:
    
    # 1. Mobile Carrossel (F2) instead of Site (F2)
    # The current F2 is: <button ... setPhase(2) ... <span>📄</span> Site (F2) ... </button>
    content = re.sub(
        r'<button[^>]*onClick=\{\(\) => \{\s*setPhase\(2\).*?<span>.*?</span>.*?(\(F2\))?\s*</button>',
        '''<button
            onClick={() => {
              setPhase(2);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/carrossel" : "/fabrica/carrossel");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 2 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>🖼️</span> Carrossel (F2)
          </button>''',
        content,
        flags=re.DOTALL
    )

    # 2. Mobile Site (F3) instead of CRM (F3)
    content = re.sub(
        r'<button[^>]*onClick=\{\(\) => \{\s*setPhase\(3\).*?<span>.*?</span>.*?(\(F3\))?\s*</button>',
        '''<button
            onClick={() => {
              setPhase(3);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/site" : "/fabrica/site");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 3 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>📄</span> Site (F3)
          </button>''',
        content,
        flags=re.DOTALL
    )

    # 3. Mobile CRM (F4) instead of Checkup (F4) (which is phase 5 currently in the code)
    content = re.sub(
        r'<button[^>]*onClick=\{\(\) => \{\s*setPhase\(5\).*?<span>.*?</span>.*?(\(F4\))?\s*</button>',
        '''<button
            onClick={() => {
              setPhase(4);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/crm" : "/fabrica/crm");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 4 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>👥</span> CRM (F4)
          </button>''',
        content,
        flags=re.DOTALL
    )

    # 4. Mobile Planos (F5) instead of Plano (F5) (which is phase 4 currently in the code)
    content = re.sub(
        r'<button[^>]*onClick=\{\(\) => \{\s*setPhase\(4\).*?<span>.*?</span>.*?(\(F5\))?\s*</button>',
        '''<button
            onClick={() => {
              setPhase(5);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/planos" : "/fabrica/planos");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 5 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>⚙️</span> Planos (F5)
          </button>''',
        content,
        flags=re.DOTALL
    )

    # 5. Fix the bottom render conditionals
    # Currently it has:
    # {state.currentPhase === 1 && <Phase3ArtFactory ... />}
    # {state.currentPhase === 2 && <Phase4LandingBuilder ... />}
    # {state.currentPhase === 3 && <Phase5Dashboard ... />}
    # {state.currentPhase === 4 && <Phase2Ativos ... />}
    # {state.currentPhase === 5 && <Phase1Diagnostico ... />}
    # We want:
    # 1: Phase3ArtFactory initialMode="ad"
    # 2: Phase3ArtFactory initialMode="carousel"
    # 3: Phase4LandingBuilder
    # 4: Phase5Dashboard
    # 5: Phase2Ativos + Phase1Diagnostico merged (we'll do this in a sec)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
print("Mobile menu replaced.")
