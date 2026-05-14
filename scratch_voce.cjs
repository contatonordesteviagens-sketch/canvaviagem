const fs = require('fs');
const path = require('path');

const p3 = 'c:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\src\\pages\\fabrica\\Phase3ArtFactoryES.tsx';
let content3 = fs.readFileSync(p3, 'utf8');

content3 = content3.replace(/como você nunca viveu/g, "como nunca has vivido");
content3 = content3.replace(/Suas fotos aparecerão aqui automaticamente assim que você subir fotos no Site ou gerar anúncios./g, "Tus fotos aparecerán aquí automáticamente tan pronto como subas fotos al sitio o generes anuncios.");

fs.writeFileSync(p3, content3, 'utf8');

const p4 = 'c:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\src\\pages\\fabrica\\Phase4LandingBuilderES.tsx';
let content4 = fs.readFileSync(p4, 'utf8');
content4 = content4.replace(/Salve aqui as imagens que você gerou na Fase 3 ou cole links externos. Depois é só clicar em "Usar" no pacote./g, "Guarda aquí las imágenes que generaste en la Fase 3 o pega enlaces externos. Luego, solo haz clic en 'Usar' en el paquete.");
fs.writeFileSync(p4, content4, 'utf8');

const p5 = 'c:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\src\\pages\\fabrica\\Phase5DashboardES.tsx';
let content5 = fs.readFileSync(p5, 'utf8');
content5 = content5.replace(/Agora você pode gerar 3 versões das suas artes de uma vez gastando apenas 1 crédito./g, "Ahora puedes generar 3 versiones de tus diseños a la vez gastando solo 1 crédito.");
content5 = content5.replace(/Sim! O sistema apenas \*reserva\* o nome. Para ele funcionar na internet, você \(o dono da plataforma\) precisa apontar o seu domínio principal para o servidor \(Vercel\/Netlify\) usando uma regra de DNS chamada "Wildcard" \(\*\)./g, "¡Sí! El sistema solo *reserva* el nombre. Para que funcione en internet, tú (el dueño de la plataforma) necesitas apuntar tu dominio principal al servidor (Vercel/Netlify) usando una regla DNS llamada 'Wildcard' (*).");
fs.writeFileSync(p5, content5, 'utf8');
console.log("Fixed you");
