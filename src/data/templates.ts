export interface Template {
  title: string;
  url: string;
  type: 'video' | 'feed' | 'story' | 'seasonal';
  category?: string;
}

export const templates: Template[] = [
  { title: "1ª vez no aeroporto", url: "https://www.canva.com/design/DAGkwz6Stn8/5DPMi1DhNpaXJI-J3NKGxw/view?utm_content=DAGkwz6Stn8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "5 motivos stopover", url: "https://www.canva.com/design/DAGgIR03ya4/uIilbTx2KqhMAcvum1zJhA/view?utm_content=DAGgIR03ya4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Bagagem de mãos", url: "https://www.canva.com/design/DAGiIypPPKM/ekpIHP0DECKGnpD8Ab7yfw/view?utm_content=DAGiIypPPKM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Colômbia", url: "https://www.canva.com/design/DAGgIc5rv80/gVw4XEdLKrZwSdcz1yXHug/view?utm_content=DAGgIc5rv80&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Destinos Europa", url: "https://www.canva.com/design/DAGgIUG7euo/Js89o2jxqADTtUSWygOcXQ/view?utm_content=DAGgIUG7euo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Erros Aeroporto", url: "https://www.canva.com/design/DAGh7kfQjS0/hCb2QaCmX653zGW3vXxsXQ/view?utm_content=DAGh7kfQjS0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Eu sei que...", url: "https://www.canva.com/design/DAGgIQOdvZg/1LxyXTMTADzvAoVI2dTXUQ/view?utm_content=DAGgIQOdvZg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Green Island", url: "https://www.canva.com/design/DAGgIbjdtE0/eYVe9FWc-0ZHcOYKLnsi8w/view?utm_content=DAGgIbjdtE0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Itália", url: "https://www.canva.com/design/DAGgIYNbZUY/eqdtdLIqCxdg_LcMsx_Kiw/view?utm_content=DAGgIYNbZUY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Itens Proibidos na Viagem", url: "https://www.canva.com/design/DAGiH3WGzjI/3zoZqBG1jNnHUuyIqka2Tg/view?utm_content=DAGiH3WGzjI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Lugares para conhecer", url: "https://www.canva.com/design/DAGgIVPtLog/cIOBFuXjIwlyjMqFCkZmxg/view?utm_content=DAGgIVPtLog&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Paris", url: "https://www.canva.com/design/DAGgIVn4s4Q/6CSoVcYM3EqimBownlS3Bw/view?utm_content=DAGgIVn4s4Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Passeios vale a pena?", url: "https://www.canva.com/design/DAGkxBw6Vsk/oXeUFCy0U8zvvCxZeIYdQQ/view?utm_content=DAGkxBw6Vsk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Resort All inclusive", url: "https://www.canva.com/design/DAGgITNYaS4/RMeuZ_9Sg776J6t7WpCfiw/view?utm_content=DAGgITNYaS4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Tipos de viajantes", url: "https://www.canva.com/design/DAGiH0U9WOk/qIKJKOYtQr-FJPyq0Bu-Vw/view?utm_content=DAGiH0U9WOk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Vale Sagrado", url: "https://www.canva.com/design/DAGgIaWq6JM/w5oMJAcSAnbT-IdIr4RHhg/view?utm_content=DAGgIaWq6JM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Veneza", url: "https://www.canva.com/design/DAGgIb2XeXY/7fKgFr7W8fFjrsIYVscUsw/view?utm_content=DAGgIb2XeXY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video" },
  { title: "Florianópolis", url: "https://www.canva.com/design/DAGhwSfDeH4/RuNAiv6jYqNO5DgZkingog/view?utm_content=DAGhwSfDeH4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Gramado", url: "https://www.canva.com/design/DAGhwMD4p38/n5PE59SkUst9g6gz9r8TGA/view?utm_content=DAGhwMD4p38&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Jalapão", url: "https://www.canva.com/design/DAGhwEYMGGc/UG3YbQaMWIPKSpohnITB1w/view?utm_content=DAGhwEYMGGc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "João Pessoa", url: "https://www.canva.com/design/DAGhwZzplL0/fEvo_iUeyHONkXVHzfYWJA/view?utm_content=DAGhwZzplL0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Maceió - AL", url: "https://www.canva.com/design/DAGhwnD60oU/drXQPfEBddupMAG1nRFLFw/view?utm_content=DAGhwnD60oU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Maragogi", url: "https://www.canva.com/design/DAGhw_eHvbM/qxWP7WwLFPC7KF7NySVs4g/view?utm_content=DAGhw_eHvbM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Natal", url: "https://www.canva.com/design/DAGhwzeB__g/tzzeNJVuhZ69H9bzdqjyAA/view?utm_content=DAGhwzeB__g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Pantanal", url: "https://www.canva.com/design/DAGhwGGAzDo/k-esCqBx31QG2ZoilCXc_w/view?utm_content=DAGhwGGAzDo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Rio de Janeiro", url: "https://www.canva.com/design/DAGhxyWDmZw/zAtIqQAWopsfzD3XmNoVlQ/view?utm_content=DAGhxyWDmZw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
  { title: "Rota das Emoções", url: "https://www.canva.com/design/DAGhweeLbpA/vjpvI0SswmRQO9eMVodzPw/view?utm_content=DAGhweeLbpA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "video", category: "Nacional" },
];

export const feedTemplates: Template[] = [
  { title: "Feed Arte 1", url: "https://www.canva.com/design/DAGiNV9zcOg/jXSDpSTmksgu1fRODn9e0g/view?utm_content=DAGiNV9zcOg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed" },
  { title: "Feed Arte 2", url: "https://www.canva.com/design/DAGifn0vJ5I/LtyUY9gGlChc-pxvei3bsw/view?utm_content=DAGifn0vJ5I&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed" },
  { title: "Feed Arte 3", url: "https://www.canva.com/design/DAGiOBEVLY8/xT87ZDCn_VKeK6AXMCr0yQ/view?utm_content=DAGiOBEVLY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed" },
  { title: "Feed Arte 4", url: "https://www.canva.com/design/DAGiOHFrGRk/2Wcct2XpSGOdeeBSXaNapQ/view?utm_content=DAGiOHFrGRk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed" },
  { title: "Feed Arte 5", url: "https://www.canva.com/design/DAGiOUhpooE/LmnTreX2G68yNYErZ9mdHw/view?utm_content=DAGiOUhpooE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed" },
];

export const storyTemplates: Template[] = [
  { title: "Story Arte 1", url: "https://www.canva.com/design/DAGiOVX_JZY/F4R-fuuQ7B8DerVl9yH0Jw/view?utm_content=DAGiOVX_JZY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story" },
  { title: "Story Arte 2", url: "https://www.canva.com/design/DAGifzSI834/3aBvmcMoWMa4pfE1vo9PTA/view?utm_content=DAGifzSI834&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story" },
];

export const weeklyStories: Template[] = [
  { title: "Semana 1", url: "https://www.canva.com/design/DAGie5Ni45g/Mp-nIDB59t5TX9aAUFX1mQ/view?utm_content=DAGie5Ni45g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story" },
  { title: "Semana 2", url: "https://www.canva.com/design/DAGifpaTJCg/TXjUXR3HBYiJVU3IpVNurA/view?utm_content=DAGifpaTJCg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story" },
  { title: "Semana 3", url: "https://www.canva.com/design/DAGhttuR8tQ/GlvKUT5ZX5yXcpRAN6AMIw/view?utm_content=DAGhttuR8tQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story" },
  { title: "Semana 4", url: "https://www.canva.com/design/DAGi29_D8kg/JOCZKABeWOkAKZAK3WT0lQ/view?utm_content=DAGi29_D8kg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story" },
];

export const aiTools = [
  { name: "Criador de Títulos de Alto Impacto", url: "https://chatgpt.com/g/g-mXIK1OLtB-headlines-de-alto-impacto", icon: "💡" },
  { name: "Criador de Promessas Únicas", url: "https://chatgpt.com/g/g-pvCUBPOH1-gerador-de-promessas-com-mecanismo-unico", icon: "⭐" },
  { name: "Criador de Quiz 2.0", url: "https://chatgpt.com/g/g-673e0736558881918f8e65ed8c8c5e81-funil-de-quiz-2-0", icon: "❓" },
  { name: "Mapa de Dores e Desejos", url: "https://chatgpt.com/g/g-673e2ac6d1f08191bac9d38be1970598-mapa-de-dores-e-desejos", icon: "🎯" },
  { name: "Criador de Cursos em Vídeo", url: "https://chatgpt.com/g/g-e53YJbtqR-criador-de-cursos-em-video", icon: "🎓" },
  { name: "Criador de BÔNUS e ORDER BUMPS", url: "https://chatgpt.com/g/g-gYZKgxBX6-criador-de-bonus-e-order-bumps", icon: "🎁" },
  { name: "Criador de Anúncios", url: "https://chatgpt.com/g/g-67e9da4bd78881919f6c27aa46c0c076-corpo-de-anuncios", icon: "📢" },
  { name: "9 Ângulos de Hooks", url: "https://chatgpt.com/g/g-67e9d49f4dc88191b0e9e850ef4bb8ed-9-oticas-de-hooks", icon: "🪝" },
];

export const resources = [
  { name: "Baixar PDF dos Produtos", url: "https://bit.ly/150videos-destinos", icon: "📄" },
  { name: "Comunidade Agente Lucrativo", url: "https://hotmart.com/pt-br/club/agente-lucrativo", icon: "👥" },
  { name: "Grupo WhatsApp", url: "https://chat.whatsapp.com/Glq12Ih9jOz5IhtHJ98ud0", icon: "💬" },
  { name: "Calendário Editorial Notion", url: "https://www.notion.so/PLANNER-DE-AG-NCIA-DE-VIAGENS-LUCRATIVA-22ca83fea5d080dc9826fb043d5d000a", icon: "📅" },
];

export const videoDownloads = [
  { name: "Vídeos Internacionais", url: "https://drive.google.com/drive/folders/10LWKcjLVA6L1FLkzRGDpDmCkKlTHoNOu", icon: "🌍" },
  { name: "Vídeos Nacionais", url: "https://drive.google.com/drive/folders/10KCEnIdj6oC8rtOAEl-G0nHtPfC56ln9?usp=drive_link", icon: "🇧🇷" },
  { name: "Vídeos Extras", url: "https://drive.google.com/drive/folders/14uF1au_WY7XI5X2lfkQUKq8LGVl0OHO7", icon: "✨" },
];
