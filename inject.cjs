const fs = require('fs');
const path = require('path');

const indexPath = 'C:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\public\\canva-viagem\\index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// First, let's remove any previous injected script to avoid duplicates
html = html.replace(/<script id="canva-viagem-injector">[\s\S]*?<\/script>/, '');

const injection = `
<script id="canva-viagem-injector">
  // Aggressive override script for React Hydration
  
  // Create a minimal footer style
  const style = document.createElement('style');
  style.innerHTML = \`
    .cv-minimal-footer {
      text-align: center;
      padding: 40px 20px;
      background: #fff;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #eaeaea;
    }
    .cv-minimal-footer img {
      height: 32px;
      margin-bottom: 12px;
      filter: grayscale(100%) opacity(50%);
    }
  \`;
  document.head.appendChild(style);

  setInterval(() => {
    // 1. Replace Hero Image
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Find the main hero image which is usually large
      if (img.src && img.src.includes('content-management-files') && img.clientWidth > 300 && img.getBoundingClientRect().top < 600) {
        if (!img.src.includes('hero-image.webp')) {
          img.src = '/hero-image.webp';
          img.srcset = '';
        }
      }
    });

    // 2. Replace Canva Logos with Official Logo
    // Canva usually uses inline SVGs for their logo.
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      // The Canva logo SVG usually has a specific width or viewbox. Let's just look at SVGs near the top left
      const rect = svg.getBoundingClientRect();
      if (rect.top < 100 && rect.left < 100 && rect.width > 50 && rect.height > 15) {
        // This is likely the header logo
        const parent = svg.parentElement;
        if (parent && !parent.querySelector('.cv-logo')) {
          svg.style.display = 'none';
          const img = document.createElement('img');
          img.src = '/canva-viagem/logo.png';
          img.className = 'cv-logo';
          img.style.height = '28px';
          img.style.objectFit = 'contain';
          parent.appendChild(img);
        }
      }
    });

    // 3. Remove "Canva Grátis"
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const textNodes = [];
    while (node = walker.nextNode()) {
      textNodes.push(node);
      
      // Text replacements
      if (node.nodeValue.includes('Crie designs profissionais')) {
        node.nodeValue = node.nodeValue.replace('Crie designs profissionais', 'Tenha um feed profissional de viagens');
      }
      if (node.nodeValue.includes('Canva Pro')) {
        node.nodeValue = node.nodeValue.replace('Canva Pro', 'Canva Viagem');
      }
      if (node.nodeValue.includes('Mais de 20 milhões')) {
        node.nodeValue = node.nodeValue.replace('Mais de 20 milhões', 'Mais de 187 agências');
      }
      if (node.nodeValue.includes('Perguntas frequentes')) {
        node.nodeValue = node.nodeValue.replace('Perguntas frequentes', 'Perguntas Frequentes');
      }
    }

    // Hide Free Tier Column
    textNodes.forEach(n => {
      if (n.nodeValue.trim() === 'Canva Grátis' || n.nodeValue.trim() === 'Grátis') {
        // Go up a few levels to find the column container
        let parent = n.parentElement;
        let depth = 0;
        // Canva's grid usually has a column width. We just go up until we hit a block element that is a column
        while (parent && depth < 8) {
          if (parent.tagName === 'DIV') {
            const styles = window.getComputedStyle(parent);
            if (parent.clientWidth > 150 && parent.clientWidth < 500 && parent.getBoundingClientRect().height > 200) {
              parent.style.display = 'none';
              break;
            }
          }
          parent = parent.parentElement;
          depth++;
        }
      }
    });

    // 4. Minimalist Footer
    const footers = document.querySelectorAll('footer');
    footers.forEach(footer => {
      if (!footer.classList.contains('cv-minimal-footer-applied')) {
        footer.classList.add('cv-minimal-footer-applied');
        footer.innerHTML = \`
          <div class="cv-minimal-footer">
            <img src="/canva-viagem/logo.png" alt="Canva Viagem" />
            <div>© 2026 Canva Viagem. Todos os direitos reservados.</div>
          </div>
        \`;
      }
    });
    
    // Sometimes Canva doesn't use a <footer> tag, they use a massive nav at the bottom.
    // Let's find massive blocks at the absolute bottom.
    const divs = document.querySelectorAll('body > div, body > div > div > div:last-child');
    divs.forEach(div => {
       const rect = div.getBoundingClientRect();
       // If it's at the very bottom and huge
       if (rect.top > 2000 && rect.height > 400 && div.querySelectorAll('a').length > 20) {
          if (!div.classList.contains('cv-minimal-footer-applied')) {
             div.classList.add('cv-minimal-footer-applied');
             div.innerHTML = \`
               <div class="cv-minimal-footer">
                 <img src="/canva-viagem/logo.png" alt="Canva Viagem" />
                 <div>© 2026 Canva Viagem. Todos os direitos reservados.</div>
               </div>
             \`;
          }
       }
    });

  }, 150);
</script>
`;

html = html.replace('</body>', injection + '</body>');
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Injected super override script for Logo, Free Tier, and Footer.');
