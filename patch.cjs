const fs = require('fs');
let code = fs.readFileSync('src/components/fabrica/F1CarouselBuilder.tsx', 'utf8');
code = code.replace(/textDecoration: titleDecAttr, \.\.\.safeTextWrap/g, 'textDecoration: titleDecAttr, ...safeTextWrap, ...safeClamp(3)');
code = code.replace(/textDecoration: titleDecAttr, textShadow, \.\.\.safeTextWrap/g, 'textDecoration: titleDecAttr, textShadow, ...safeTextWrap, ...safeClamp(3)');
code = code.replace(/\.\.\.safeTextWrap, textShadow \}\}/g, '...safeTextWrap, textShadow, ...safeClamp(3) }}');
fs.writeFileSync('src/components/fabrica/F1CarouselBuilder.tsx', code);
