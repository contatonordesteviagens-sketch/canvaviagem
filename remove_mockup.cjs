const fs = require('fs');
const path = 'c:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\src\\pages\\fabrica\\Phase3ArtFactory.tsx';
let content = fs.readFileSync(path, 'utf8');

const toRemove = `{/* ?? PONTO 10: GATILHO DE ESCASSEZ (GAMIFICAO DE SALDO) */}`;
// Let's use an easier target
const targetStart = '        {/* ?? PONTO 10: GATILHO DE ESCASSEZ';
const targetEnd = '</a>\n           </div>\n        </div>';

// Actually, I can just locate the unique substring "Uso Premium IA" and slice the enclosing div.
const searchStr = 'Uso Premium IA';
const index = content.indexOf(searchStr);
if (index !== -1) {
   // Find the nearest <div before it
   const divStart = content.lastIndexOf('<div className="mt-4 bg-indigo-500/5', index);
   // Find the closing </div> after it
   // There are internal divs, so count them
   let divCount = 0;
   let closingIndex = -1;
   for(let i = divStart; i < content.length; i++) {
      if(content.substring(i, i+4) === '<div') divCount++;
      if(content.substring(i, i+5) === '</div') {
         divCount--;
         if(divCount === 0) {
            closingIndex = i + 6; // Include </div>
            break;
         }
      }
   }
   if (divStart !== -1 && closingIndex !== -1) {
      const before = content.substring(0, divStart);
      const after = content.substring(closingIndex);
      // Also strip the comment preceding it if present
      const finalBefore = before.replace(/\{\/\* \?\? PONTO 10\: GATILHO DE ESCASSEZ \(GAMIFICAO DE SALDO\) \*\/\}\s*$/, '');
      fs.writeFileSync(path, finalBefore + after, 'utf8');
      console.log("SUCCESSFULLY REMOVED MOCKUP DIV");
   } else {
      console.log("COULD NOT FIND WRAPPING DIV BOUNDARIES");
   }
} else {
   console.log("SUBSTRING NOT FOUND");
}
