const fs = require('fs');

const content = fs.readFileSync('src/components/SidebarNav.tsx', 'utf-8');

// Remove ProgressBar import
let newContent = content.replace('import { ProgressBar } from "@/components/ProgressBar";\n', '');

const footerStartStr = '        {/* Rodapé do Menu Lateral */}';
const footerEndStr = '      </aside>';

const footerStartIndex = newContent.indexOf(footerStartStr);
const footerEndIndex = newContent.indexOf(footerEndStr);

if (footerStartIndex !== -1 && footerEndIndex !== -1) {
  const compactFooter = `        {/* Rodapé do Menu Lateral */}
        <div className="p-3 border-t border-slate-200 dark:border-white/[0.05] bg-[#F9FAFB] dark:bg-[#18191B] flex flex-col gap-2 shrink-0">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher variant="desktop" />
            </div>
            
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                title={t('header.logout') || "Sair"}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg h-8 px-3 text-xs"
              >
                Login
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="w-full h-8 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5"
          >
            <ChevronDown className="h-3.5 w-3.5 rotate-90" />
            Minimizar Menu
          </Button>
        </div>
`;

  newContent = newContent.substring(0, footerStartIndex) + compactFooter + newContent.substring(footerEndIndex);
  
  fs.writeFileSync('src/components/SidebarNav.tsx', newContent);
  console.log('SidebarNav footer compacted successfully!');
} else {
  console.error('Could not find markers');
}
