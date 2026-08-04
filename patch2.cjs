const fs = require('fs');
let code = fs.readFileSync('src/components/fabrica/F1CarouselBuilder.tsx', 'utf8');

const helper = 
  const renderBodyText = (text: string) => {
    if (!text || (!text.includes('R$') && !text.includes('$'))) return text;
    const priceRegex = /(.*?)(R\\$|\\$)\\s*([\\d.,]+)(.*)/i;
    const match = text.match(priceRegex);
    if (!match) return text;
    
    const [, before, symbol, value, after] = match;
    const isRetail = value.includes(',');
    let mainValue = value;
    let cents = '';
    if (isRetail) {
      const parts = value.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        mainValue = parts[0];
        cents = ',' + parts[1];
      }
    }
    
    return (
      <>
        {before}
        <span style={{ fontWeight: 900, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.65em', verticalAlign: 'top', marginRight: '0.1em' }}>{symbol}</span>
          <span style={{ fontSize: '1.15em' }}>{mainValue}</span>
          {cents && <span style={{ fontSize: '0.65em', verticalAlign: 'top' }}>{cents}</span>}
        </span>
        {after}
      </>
    );
  };
;

code = code.replace(/const safeClamp = \(lines: number\): CSSProperties => \(\{/, helper + '\n  const safeClamp = (lines: number): CSSProperties => ({');
code = code.replace(/\{slide\.body\}/g, '{renderBodyText(slide.body)}');
fs.writeFileSync('src/components/fabrica/F1CarouselBuilder.tsx', code);
