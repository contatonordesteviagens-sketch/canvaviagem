const fs = require('fs');

let html = fs.readFileSync('public/canva_inicio.html', 'utf8');

// Replace standard Canva names
html = html.replace(/Canva Pro/g, 'Canva Viagem Elite');

const pricingHTML = `
<style>
  #custom-pricing-wrapper-container {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0e1318;
    position: relative;
    z-index: 999999;
    background: #fff;
  }
  .pricing-header { text-align: center; margin-bottom: 40px; }
  .pricing-header h2 { font-size: 40px; font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
  .pricing-header p { font-size: 16px; color: #405466; max-width: 600px; margin: 0 auto 32px; }
  .toggle-container { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 40px; }
  .toggle-switch { position: relative; width: 52px; height: 28px; background-color: #8b3dff; border-radius: 34px; cursor: pointer; transition: 0.3s; }
  .toggle-switch::after { content: ''; position: absolute; top: 3px; left: 27px; width: 22px; height: 22px; background-color: white; border-radius: 50%; transition: 0.3s; }
  .toggle-switch.monthly::after { left: 3px; }
  .toggle-label { font-size: 16px; font-weight: 600; color: #0e1318; cursor: pointer; }
  .discount-badge { background-color: #8b3dff; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; }
  .pricing-cards { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
  .pricing-card { background: white; border-radius: 16px; padding: 32px; width: 100%; max-width: 380px; border: 1px solid #d4d8db; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; position: relative; }
  .pricing-card.elite { border: 2px solid #8b3dff; }
  .elite-badge { position: absolute; top: -12px; right: 24px; background: #8b3dff; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; }
  .card-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  .card-desc { font-size: 14px; color: #405466; margin-bottom: 24px; min-height: 42px; }
  .price-container { display: flex; align-items: baseline; margin-bottom: 8px; }
  .currency { font-size: 24px; font-weight: 700; margin-right: 4px; }
  .amount { font-size: 48px; font-weight: 700; line-height: 1; }
  .period { font-size: 14px; color: #405466; margin-left: 4px; }
  .action-btn { width: 100%; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; cursor: pointer; border: none; margin-bottom: 12px; text-decoration: none; display: inline-block; }
  .btn-primary { background-color: #8b3dff; color: white; }
  .features-title { font-size: 14px; font-weight: 700; margin-top: 24px; margin-bottom: 16px; }
  .feature-list { list-style: none; padding: 0; margin: 0; }
  .feature-list li { font-size: 14px; color: #0e1318; margin-bottom: 12px; display: flex; align-items: flex-start; line-height: 1.4; }
  .feature-list li::before { content: '✓'; color: #000; font-weight: bold; margin-right: 8px; }
</style>

<div id="custom-pricing-wrapper">
  <div class="pricing-header">
    <h2>Planos do Canva Viagem</h2>
    <p>Tenha acesso às ferramentas profissionais de que você precisa para criar e dar vida às suas ideias de viagens.</p>
    
    <div class="toggle-container">
      <span class="toggle-label" onclick="window.togglePricing()">Mensal</span>
      <div class="toggle-switch" id="pricing-toggle" onclick="window.togglePricing()"></div>
      <span class="toggle-label" onclick="window.togglePricing()">Anual <span class="discount-badge">Economize 45%</span></span>
    </div>
  </div>

  <div class="pricing-cards">
    <div class="pricing-card">
      <div class="card-title">Canva Viagem Start</div>
      <div class="card-desc">Crie conteúdos de turismo rapidamente. Ideal para iniciar e atrair viajantes.</div>
      <div class="price-container">
        <span class="currency">R$</span>
        <span class="amount" id="price-start">16,41</span>
        <span class="period">/mês</span>
      </div>
      <div style="font-size:12px; color:#405466; margin-bottom:24px" id="billing-start">Cobrado R$ 197 por ano</div>
      <a href="/planos" target="_top" class="action-btn btn-primary">Começar com o Start</a>
      <div class="features-title">O plano Start oferece:</div>
      <ul class="feature-list">
        <li>Acesso ilimitado a 400+ mídias de viagens</li>
        <li>Modelos prontos e 100% editáveis</li>
      </ul>
    </div>

    <div class="pricing-card elite">
      <div class="elite-badge">👑 Recomendado</div>
      <div class="card-title">Canva Viagem Elite</div>
      <div class="card-desc">Desbloqueie ferramentas de vendas avançadas e funis de site.</div>
      <div class="price-container">
        <span class="currency">R$</span>
        <span class="amount" id="price-elite">28,91</span>
        <span class="period">/mês</span>
      </div>
      <div style="font-size:12px; color:#405466; margin-bottom:24px" id="billing-elite">Cobrado R$ 347 por ano</div>
      <a href="/planos" target="_top" class="action-btn btn-primary">Assinar o Elite</a>
      <div class="features-title">Tudo do Start, mais:</div>
      <ul class="feature-list">
        <li>Fábrica de Anúncios ILIMITADA</li>
        <li>Criador de Sites de Venda</li>
      </ul>
    </div>
  </div>
</div>
`;

const injectionScript = `
<script>
  window.isAnnual = true;
  window.togglePricing = function() {
    window.isAnnual = !window.isAnnual;
    const toggle = document.getElementById('pricing-toggle');
    if (window.isAnnual) {
      toggle.classList.remove('monthly');
      document.getElementById('price-start').innerText = '16,41';
      document.getElementById('billing-start').innerText = 'Cobrado R$ 197 por ano';
      document.getElementById('price-elite').innerText = '28,91';
      document.getElementById('billing-elite').innerText = 'Cobrado R$ 347 por ano';
    } else {
      toggle.classList.add('monthly');
      document.getElementById('price-start').innerText = '29,90';
      document.getElementById('billing-start').innerText = 'Cobrado R$ 29,90 mensalmente';
      document.getElementById('price-elite').innerText = '97,00';
      document.getElementById('billing-elite').innerText = 'Cobrado R$ 97,00 mensalmente';
    }
  };

  setInterval(() => {
    // Hide standard Canva elements we don't want
    document.querySelectorAll('header').forEach(h => h.style.display = 'none');
    document.querySelectorAll('div, section').forEach(el => {
      if (el.textContent && (el.textContent.includes('Compare o Canva') || el.textContent.includes('O que está incluído no'))) {
        if (el.innerText && el.innerText.length > 500 && el.innerText.length < 5000) {
          el.style.display = 'none';
        }
      }
    });

    if (!document.getElementById('custom-pricing-wrapper-container')) {
      const container = document.createElement('div');
      container.id = 'custom-pricing-wrapper-container';
      container.innerHTML = \`${pricingHTML.replace(/`/g, '\\`')}\`;
      
      let target = null;
      document.querySelectorAll('section').forEach(sec => {
        if (sec.textContent && sec.textContent.includes('Perguntas frequentes')) {
          target = sec;
        }
      });
      
      if (target && target.parentNode) {
        target.parentNode.insertBefore(container, target);
      } else {
        document.body.appendChild(container);
      }
    }
  }, 1000);
</script>
`;

html = html.replace('</body>', injectionScript + '\n</body>');
fs.writeFileSync('public/canva_inicio.html', html);
console.log('Overlay injected!');
