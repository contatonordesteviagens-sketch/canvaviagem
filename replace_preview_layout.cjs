const fs = require('fs');
const path = require('path');

function processFile(filename, snippetFilename, isSpanish) {
  const filePath = path.join(__dirname, 'src', 'pages', 'fabrica', filename);
  let content = fs.readFileSync(filePath, 'utf8');

  console.log(`Processing ${filename}...`);

  // Locate the return block
  const returnStr = "  return (\n    <div className=\"max-w-3xl mx-auto space-y-6\">";
  const returnStrCRLF = "  return (\r\n    <div className=\"max-w-3xl mx-auto space-y-6\">";
  
  let returnIndex = content.indexOf(returnStr);
  if (returnIndex === -1) {
    returnIndex = content.indexOf(returnStrCRLF);
  }

  if (returnIndex === -1) {
    console.log(`Could not find return statement in ${filename}`);
    return;
  }

  const beforeReturn = content.substring(0, returnIndex);

  let afterModal = "";
  if (isSpanish) {
    // For Spanish, we locate the end of the return statement before subcomponents
    const subCompStr = "/* ───────────── Sub-componentes ───────────── */";
    const subCompIndex = content.indexOf(subCompStr);
    if (subCompIndex === -1) {
      console.log(`Could not find subcomponents in ${filename}`);
      return;
    }
    // We want to keep the closing </div> ); }; before the subcomponents
    afterModal = "    </div>\n  );\n};\n\n" + content.substring(subCompIndex);
  } else {
    // For Portuguese, we split before the global modal block
    const modalStr = "      {/* 🖼️ MODAL GLOBAL DE SELEÇÃO";
    const modalIndex = content.indexOf(modalStr);
    if (modalIndex === -1) {
      console.log(`Could not find modal block in ${filename}`);
      return;
    }
    afterModal = content.substring(modalIndex);
  }

  // Read replacement snippet
  const snippetPath = path.join(__dirname, snippetFilename);
  const snippetContent = fs.readFileSync(snippetPath, 'utf8');

  // Assemble
  const finalContent = beforeReturn + snippetContent + "\n\n" + afterModal;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log(`Successfully completed ${filename}`);
}

processFile('Phase4LandingBuilder.tsx', 'snippet_pt.txt', false);
processFile('Phase4LandingBuilderES.tsx', 'snippet_es.txt', true);
