export interface Template {
  title: string;
  url: string;
  type: 'video' | 'feed' | 'story' | 'seasonal';
  category?: 'nacional' | 'internacional' | 'geral';
  influencer?: 'Eva' | 'Mel' | 'Bia';
}

// Destinos nacionais
const nacionalDestinos = ['Florianópolis', 'Gramado', 'Jalapão', 'João Pessoa', 'Maceió', 'Maragogi', 'Natal', 'Pantanal', 'Rio de Janeiro', 'Rota das Emoções', 'Salvador', 'Trancoso', 'Foz do Iguaçu', 'Fortaleza', 'Recife', 'Porto de Galinhas', 'Jericoacoara', 'Fernando de Noronha', 'Lençóis Maranhenses', 'Angra dos Reis', 'Arraial do Cabo', 'Bonito', 'Chapada Diamantina', 'Ouro Preto', 'Balneário Camboriú', 'Curitiba', 'São Paulo', 'Belo Horizonte', 'Amazônia', 'Alter do Chão', 'Manaus', 'Genipabu', 'Alagoas', 'Amazonas', '5 Praias Floripa'];

const getCategory = (title: string): 'nacional' | 'internacional' | 'geral' => {
  if (nacionalDestinos.some(d => title.toLowerCase().includes(d.toLowerCase()))) {
    return 'nacional';
  }
  // Títulos gerais (dicas, erros, etc)
  const geralKeywords = ['1ª vez', 'motivos', 'bagagem', 'erros', 'tipos', 'itens proibidos', 'passeios vale', 'lugares para conhecer'];
  if (geralKeywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
    return 'geral';
  }
  return 'internacional';
};

const getInfluencer = (title: string): 'Eva' | 'Mel' | 'Bia' | undefined => {
  if (title.toLowerCase().includes('eva')) return 'Eva';
  if (title.toLowerCase().includes('mel')) return 'Mel';
  if (title.toLowerCase().includes('bia')) return 'Bia';
  return undefined;
};

export const templates: Template[] = [
  { "title": "1ª vez no aeroporto", "url": "https://www.canva.com/design/DAGkwz6Stn8/5DPMi1DhNpaXJI-J3NKGxw/view?utm_content=DAGkwz6Stn8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "5 motivos stopover", "url": "https://www.canva.com/design/DAGgIR03ya4/uIilbTx2KqhMAcvum1zJhA/view?utm_content=DAGgIR03ya4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Bagagem de mãos", "url": "https://www.canva.com/design/DAGiIypPPKM/ekpIHP0DECKGnpD8Ab7yfw/view?utm_content=DAGiIypPPKM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Colômbia", "url": "https://www.canva.com/design/DAGgIc5rv80/gVw4XEdLKrZwSdcz1yXHug/view?utm_content=DAGgIc5rv80&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Destinos Europa", "url": "https://www.canva.com/design/DAGgIUG7euo/Js89o2jxqADTtUSWygOcXQ/view?utm_content=DAGgIUG7euo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Erros Aeroporto", "url": "https://www.canva.com/design/DAGh7kfQjS0/hCb2QaCmX653zGW3vXxsXQ/view?utm_content=DAGh7kfQjS0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Eu sei que...", "url": "https://www.canva.com/design/DAGgIQOdvZg/1LxyXTMTADzvAoVI2dTXUQ/view?utm_content=DAGgIQOdvZg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Green Island", "url": "https://www.canva.com/design/DAGgIbjdtE0/eYVe9FWc-0ZHcOYKLnsi8w/view?utm_content=DAGgIbjdtE0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Itália", "url": "https://www.canva.com/design/DAGgIYNbZUY/eqdtdLIqCxdg_LcMsx_Kiw/view?utm_content=DAGgIYNbZUY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Itens Proibidos na Viagem", "url": "https://www.canva.com/design/DAGiH3WGzjI/3zoZqBG1jNnHUuyIqka2Tg/view?utm_content=DAGiH3WGzjI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Lugares para conhecer", "url": "https://www.canva.com/design/DAGgIVPtLog/cIOBFuXjIwlyjMqFCkZmxg/view?utm_content=DAGgIVPtLog&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Paris", "url": "https://www.canva.com/design/DAGgIVn4s4Q/6CSoVcYM3EqimBownlS3Bw/view?utm_content=DAGgIVn4s4Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Passeios vale a pena?", "url": "https://www.canva.com/design/DAGkxBw6Vsk/oXeUFCy0U8zvvCxZeIYdQQ/view?utm_content=DAGkxBw6Vsk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Resort All inclusive", "url": "https://www.canva.com/design/DAGgITNYaS4/RMeuZ_9Sg776J6t7WpCfiw/view?utm_content=DAGgITNYaS4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Tipos de viajantes", "url": "https://www.canva.com/design/DAGiH0U9WOk/qIKJKOYtQr-FJPyq0Bu-Vw/view?utm_content=DAGiH0U9WOk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "geral" },
  { "title": "Vale Sagrado", "url": "https://www.canva.com/design/DAGgIaWq6JM/w5oMJAcSAnbT-IdIr4RHhg/view?utm_content=DAGgIaWq6JM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Veneza", "url": "https://www.canva.com/design/DAGgIb2XeXY/7fKgFr7W8fFjrsIYVscUsw/view?utm_content=DAGgIb2XeXY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Florianópolis", "url": "https://www.canva.com/design/DAGhwSfDeH4/RuNAiv6jYqNO5DgZkingog/view?utm_content=DAGhwSfDeH4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Gramado", "url": "https://www.canva.com/design/DAGhwMD4p38/n5PE59SkUst9g6gz9r8TGA/view?utm_content=DAGhwMD4p38&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Jalapão", "url": "https://www.canva.com/design/DAGhwEYMGGc/UG3YbQaMWIPKSpohnITB1w/view?utm_content=DAGhwEYMGGc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "João Pessoa", "url": "https://www.canva.com/design/DAGhwZzplL0/fEvo_iUeyHONkXVHzfYWJA/view?utm_content=DAGhwZzplL0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Maceió - AL", "url": "https://www.canva.com/design/DAGhwnD60oU/drXQPfEBddupMAG1nRFLFw/view?utm_content=DAGhwnD60oU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Maragogi", "url": "https://www.canva.com/design/DAGhw_eHvbM/qxWP7WwLFPC7KF7NySVs4g/view?utm_content=DAGhw_eHvbM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Natal - RN", "url": "https://www.canva.com/design/DAGhwzeB__g/tzzeNJVuhZ69H9bzdqjyAA/view?utm_content=DAGhwzeB__g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Pantanal", "url": "https://www.canva.com/design/DAGhwGGAzDo/k-esCqBx31QG2ZoilCXc_w/view?utm_content=DAGhwGGAzDo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Rio de Janeiro", "url": "https://www.canva.com/design/DAGhxyWDmZw/zAtIqQAWopsfzD3XmNoVlQ/view?utm_content=DAGhxyWDmZw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Rota das Emoções", "url": "https://www.canva.com/design/DAGhweeLbpA/vjpvI0SswmRQO9eMVodzPw/view?utm_content=DAGhweeLbpA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Seychelles", "url": "https://www.canva.com/design/DAGgIZTaKmY/p_oJQNqw2lzTi9Iwsn8j2A/view?utm_content=DAGgIZTaKmY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Talin Estônia", "url": "https://www.canva.com/design/DAGgIcMi9Cw/iMTL2rcrMkidPTfF26_wvA/view?utm_content=DAGgIcMi9Cw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Tailândia", "url": "https://www.canva.com/design/DAGgIW08oec/20D9OkJgnfUwUPf7HY5zdw/view?utm_content=DAGgIW08oec&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Bia (Black Friday)", "url": "https://www.canva.com/design/DAG2Tvngdhs/My6C92vRgzpf_z4ibppq5Q/view?utm_content=DAG2Tvngdhs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia (Carnaval Salvador)", "url": "https://www.canva.com/design/DAG2dvQ0Yz8/ihxicpkJls4fNaU7LY4n7g/view?utm_content=DAG2dvQ0Yz8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia (Destino dos sonhos)", "url": "https://www.canva.com/design/DAG2ShXwTgQ/TykqR0LrPfrflxz-arMk2A/view?utm_content=DAG2ShXwTgQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia (Natal em família)", "url": "https://www.canva.com/design/DAG2esOrpvA/dXYNi37HEi9FT98QlBWGrQ/view?utm_content=DAG2esOrpvA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia (Pacote Completo)", "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia (Presente Natal)", "url": "https://www.canva.com/design/DAG2LaxD0w4/sfuP-w_Lqeo2hIn7NhT_6Q/view?utm_content=DAG2LaxD0w4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia (Réveillon Rio)", "url": "https://www.canva.com/design/DAG2esOrpvA/dXYNi37HEi9FT98QlBWGrQ/view?utm_content=DAG2esOrpvA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Bia Black Friday 2", "url": "https://www.canva.com/design/DAG2fD0RJF4/cFRDjOLIAPSHOM-C88saTw/view?utm_content=DAG2fD0RJF4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Bia" },
  { "title": "Black Friday 35% Off", "url": "https://www.canva.com/design/DAG2ewQXkWs/ytL5S0yd5-feIUfWmn9SjA/view?utm_content=DAG2ewQXkWs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Carnaval Nordeste", "url": "https://www.canva.com/design/DAG2NTVWbtU/G1B3M23OhAgpJWIszRqdHw/view?utm_content=DAG2NTVWbtU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Celebre o Natal", "url": "https://www.canva.com/design/DAG2LkHZ4Sk/_yTOsI7028OobGeEPyDGDA/view?utm_content=DAG2LkHZ4Sk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Eva - Black Friday", "url": "https://www.canva.com/design/DAG2fJqDKbI/FT7f4rvEJEpfQI7WT1E46Q/view?utm_content=DAG2fJqDKbI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Eva" },
  { "title": "Eva - Destinos Feriados", "url": "https://www.canva.com/design/DAG2e15f7q4/CwiKH8s1RN4IZDbZvYMsGg/view?utm_content=DAG2e15f7q4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Eva" },
  { "title": "Eva - Feriados Viagens", "url": "https://www.canva.com/design/DAG2fJqDKbI/FT7f4rvEJEpfQI7WT1E46Q/view?utm_content=DAG2fJqDKbI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Eva" },
  { "title": "Frase de Natal", "url": "https://www.canva.com/design/DAG2MP7UnZ8/B3FaakS8WlmUjEVdhGvBhw/view?utm_content=DAG2MP7UnZ8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Frase Réveillon", "url": "https://www.canva.com/design/DAG2MUhlXWc/kBvjZrgkKpeZLDoaipjxjw/view?utm_content=DAG2MUhlXWc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Mel (Black Friday)", "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Mel" },
  { "title": "Mel (Destinos Feriados)", "url": "https://www.canva.com/design/DAG2e15f7q4/CwiKH8s1RN4IZDbZvYMsGg/view?utm_content=DAG2e15f7q4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Mel" },
  { "title": "Mel (Semana Santa)", "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Mel" },
  { "title": "Mel - Black Friday Europa", "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Mel" },
  { "title": "Mel - Feriado Páscoa", "url": "https://www.canva.com/design/DAG2ezMKhPE/l7CGJgr73Nb_sPiQ7SGvTw/view?utm_content=DAG2ezMKhPE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Mel" },
  { "title": "Mel - Viagens Feriados", "url": "https://www.canva.com/design/DAG2ewQXkWs/ytL5S0yd5-feIUfWmn9SjA/view?utm_content=DAG2ewQXkWs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal", "influencer": "Mel" },
  { "title": "Natal dos Sonhos", "url": "https://www.canva.com/design/DAG2LnOTuIA/6CltNCXcbKnxlObEPzB0eg/view?utm_content=DAG2LnOTuIA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Natal Gramado", "url": "https://www.canva.com/design/DAG2N5iiD_g/qSqV4BXxZNT629GfErS42A/view?utm_content=DAG2N5iiD_g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Páscoa Relaxante", "url": "https://www.canva.com/design/DAG2N7dTofI/wJapsS0wfFGkYAVzUSm6hA/view?utm_content=DAG2N7dTofI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Réveillon Nacional", "url": "https://www.canva.com/design/DAG2M7BqCnk/YXHk02BfhrC5HyjO04Ji0w/view?utm_content=DAG2M7BqCnk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Réveillon Rio", "url": "https://www.canva.com/design/DAG2N67Bnf0/k79e-9a0IrLHB5OHKo9JWw/view?utm_content=DAG2N67Bnf0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "Réveillon Viagem", "url": "https://www.canva.com/design/DAG2L3wN6BE/NVmirH2Ki59fgKEWBf0t3Q/view?utm_content=DAG2L3wN6BE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "seasonal" },
  { "title": "África", "url": "https://www.canva.com/design/DAGgIEMmR_M/9f-k7CtYZlHsTYhCHkg/view?utm_content=DAGgIEMmR_M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Aruba", "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Bariloche", "url": "https://www.canva.com/design/DAGgICGduVA/AE_OxvSOWEEtHfPOD_4AWA/view?utm_content=DAGgICGduVA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Boston", "url": "https://www.canva.com/design/DAGgIGMu4RE/Tnp3KV3JhHKDaxuoPwunBQ/view?utm_content=DAGgIGMu4RE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Bruxelas", "url": "https://www.canva.com/design/DAGgIHM3a8A/8sTBGWxCgx5a_V33JtFu_A/view?utm_content=DAGgIHM3a8A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Budapeste", "url": "https://www.canva.com/design/DAGkxkJV9sU/D72AYyJxa27ztlbkzrRHzg/view?utm_content=DAGkxkJV9sU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Cancún", "url": "https://www.canva.com/design/DAGleD4ewV0/h6k2V1slWWhWMjBOb6RqvA/view?utm_content=DAGleD4ewV0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Capadócia", "url": "https://www.canva.com/design/DAGgIMYGeUo/hNOn3acstET00eZMSZevCQ/view?utm_content=DAGgIMYGeUo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Chicago", "url": "https://www.canva.com/design/DAGgIEv81n8/16sFv3o7t2n_95k022u8_A/view?utm_content=DAGgIEv81n8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Cozumel", "url": "https://www.canva.com/design/DAGgIGpU45c/L2mK-u75F_cQ_i-q1R2D6w/view?utm_content=DAGgIGpU45c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Cusco", "url": "https://www.canva.com/design/DAGgIH1_gY8/11l8w_5g_5v_7y_7x_8o_A/view?utm_content=DAGgIH1_gY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "DISNEY", "url": "https://www.canva.com/design/DAG2LCX13mE/xUzLv91eUXUH_vWak40iaA/view?utm_content=DAG2LCX13mE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Dublin", "url": "https://www.canva.com/design/DAGgIAhaqtE/12aTG-FlJoUZgKv6eYjfYQ/view?utm_content=DAGgIAhaqtE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Egito", "url": "https://www.canva.com/design/DAGgIH1_gY8/11l8w_5g_5v_7y_7x_8o_A/view?utm_content=DAGgIH1_gY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Filipinas", "url": "https://www.canva.com/design/DAGgIE0GMEg/nMMdOVIYmO1IUpw4vOLmQg/view?utm_content=DAGgIE0GMEg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Fort Lauderdale", "url": "https://www.canva.com/design/DAGgIAhaqtE/12aTG-FlJoUZgKv6eYjfYQ/view?utm_content=DAGgIAhaqtE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Grécia", "url": "https://www.canva.com/design/DAGgIGpU45c/L2mK-u75F_cQ_i-q1R2D6w/view?utm_content=DAGgIGpU45c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Israel", "url": "https://www.canva.com/design/DAGgIEv81n8/16sFv3o7t2n_95k022u8_A/view?utm_content=DAGgIEv81n8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Jordânia", "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Lima", "url": "https://www.canva.com/design/DAGgIABwarE/NZnn5WxJGQOvbzt2lS70KA/view?utm_content=DAGgIABwarE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Machu Picchu", "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Maldivas", "url": "https://www.canva.com/design/DAGgIDyBNgg/iqZtppBAHjRERXni8aH7Uw/view?utm_content=DAGgIDyBNgg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Montevidéu", "url": "https://www.canva.com/design/DAGgIEv81n8/16sFv3o7t2n_95k022u8_A/view?utm_content=DAGgIEv81n8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Namíbia", "url": "https://www.canva.com/design/DAGkxaKBTk8/vnaegHxIpjNZhs7iXhEyQA/view?utm_content=DAGkxaKBTk8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "New York", "url": "https://www.canva.com/design/DAGgIBHfJ2U/qla_d-c4Ka9R9mknJp9-Qw/view?utm_content=DAGgIBHfJ2U&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Nova Zelândia", "url": "https://www.canva.com/design/DAGgINGc6Z8/OsM-5OopG49o8mN0rd0RMg/view?utm_content=DAGgINGc6Z8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Orlando", "url": "https://www.canva.com/design/DAGgIPVEnEk/wbm0-iA2_9PQ2cCOmJ6bAw/view?utm_content=DAGgIPVEnEk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Phi Phi", "url": "https://www.canva.com/design/DAGgIHM3a8A/8sTBGWxCgx5a_V33JtFu_A/view?utm_content=DAGgIHM3a8A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Pisa", "url": "https://www.canva.com/design/DAGgIEMmR_M/9f-k7CtYZlHsTYhCHkg/view?utm_content=DAGgIEMmR_M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Praga", "url": "https://www.canva.com/design/DAGgIH1_gY8/11l8w_5g_5v_7y_7x_8o_A/view?utm_content=DAGgIH1_gY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Punta Cana", "url": "https://www.canva.com/design/DAGgIKZu79g/cML-09vBKb9uzoxMLro2sA/view?utm_content=DAGgIKZu79g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Salar de Uyuni", "url": "https://www.canva.com/design/DAGgIMYGeUo/hNOn3acstET00eZMSZevCQ/view?utm_content=DAGgIMYGeUo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "São Francisco", "url": "https://www.canva.com/design/DAGgICJnnqQ/bmbU2kAUJFJUYIf2woRW3g/view?utm_content=DAGgICJnnqQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Singapura", "url": "https://www.canva.com/design/DAGgINGc6Z8/OsM-5OopG49o8mN0rd0RMg/view?utm_content=DAGgINGc6Z8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Suíça", "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Taiwan", "url": "https://www.canva.com/design/DAGgICx70m4/6gpner1Xp3SaWs5zhm8fnQ/view?utm_content=DAGgICx70m4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Ushuaia", "url": "https://www.canva.com/design/DAGgIOfB964/Pt9ixDYkUe4pHBxt9U_L8g/view?utm_content=DAGgIOfB964&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Washington", "url": "https://www.canva.com/design/DAGgIDWqY5E/A96uH3kJXwqZiWTr51nXRg/view?utm_content=DAGgIDWqY5E&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Amsterdã", "url": "https://www.canva.com/design/DAGgIR3Uj_s/J7DMRsphXv0alSR7Pdb9eg/view?utm_content=DAGgIR3Uj_s&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Atenas", "url": "https://www.canva.com/design/DAGgIVLFL6c/sN4xUOkZJTbGJ5vZ6kQ18Q/view?utm_content=DAGgIVLFL6c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Bali", "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Bangkok", "url": "https://www.canva.com/design/DAGgIeC0clw/AowfyjEsUwNBiOEGmYqUTw/view?utm_content=DAGgIeC0clw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Barcelona", "url": "https://www.canva.com/design/DAGgIVLFL6c/sN4xUOkZJTbGJ5vZ6kQ18Q/view?utm_content=DAGgIVLFL6c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Berlim", "url": "https://www.canva.com/design/DAGgICa3icM/XUL5DCACv4mYeGq4syIzmw/view?utm_content=DAGgICa3icM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Buenos Aires", "url": "https://www.canva.com/design/DAGgIfy2Ca0/Hr95Q6ST7258CMco-HbxDQ/view?utm_content=DAGgIfy2Ca0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Cartagena", "url": "https://www.canva.com/design/DAGgIaIGeIM/JYgK-PBpXfnIqH0znFw-zw/view?utm_content=DAGgIaIGeIM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Dubai", "url": "https://www.canva.com/design/DAGgIQx3iW8/D8lV3a_3aHeKQ1JI3Pd3OQ/view?utm_content=DAGgIQx3iW8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Florença", "url": "https://www.canva.com/design/DAGgIe1FmSk/bFSgFqaodmrSZsV04AtBhQ/view?utm_content=DAGgIe1FmSk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Frankfurt", "url": "https://www.canva.com/design/DAGgIaE8E9Q/jnbP70f-e2-JTnfHvpFIIw/view?utm_content=DAGgIaE8E9Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Havana", "url": "https://www.canva.com/design/DAGgIIzdW8Q/pCZAay9vuoXa2Xms6_So5w/view?utm_content=DAGgIIzdW8Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Hong Kong", "url": "https://www.canva.com/design/DAGkxrEQhaA/Uxja1UOzzbRORe3gapcq9A/view?utm_content=DAGkxrEQhaA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Ilha de Páscoa", "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Istambul", "url": "https://www.canva.com/design/DAGgIFgynkQ/sTk_DjnzNhbRFLmpJgDAkQ/view?utm_content=DAGgIFgynkQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Las Vegas", "url": "https://www.canva.com/design/DAGgIaE8E9Q/jnbP70f-e2-JTnfHvpFIIw/view?utm_content=DAGgIaE8E9Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Lisboa", "url": "https://www.canva.com/design/DAGgIVf4UOQ/50ss3rLMLZTo86vSgVp1gA/view?utm_content=DAGgIVf4UOQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Londres", "url": "https://www.canva.com/design/DAGkxrEQhaA/Uxja1UOzzbRORe3gapcq9A/view?utm_content=DAGkxrEQhaA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Los Angeles", "url": "https://www.canva.com/design/DAGgIFgynkQ/sTk_DjnzNhbRFLmpJgDAkQ/view?utm_content=DAGgIFgynkQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Madri", "url": "https://www.canva.com/design/DAGgIOg8LZs/ktrot3t27LZWsHrQz6iOHQ/view?utm_content=DAGgIOg8LZs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Miami", "url": "https://www.canva.com/design/DAGgIaIGeIM/JYgK-PBpXfnIqH0znFw-zw/view?utm_content=DAGgIaIGeIM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Milão", "url": "https://www.canva.com/design/DAGgIeC0clw/AowfyjEsUwNBiOEGmYqUTw/view?utm_content=DAGgIeC0clw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Munique", "url": "https://www.canva.com/design/DAGgIWvNtdA/agfWkW39gzVWXYhlPdvOzg/view?utm_content=DAGgIWvNtdA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Phuket", "url": "https://www.canva.com/design/DAGgIe1FmSk/bFSgFqaodmrSZsV04AtBhQ/view?utm_content=DAGgIe1FmSk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Playa Del Carmen", "url": "https://www.canva.com/design/DAGgIU7GrTM/gd3BcmnPgPeSzfxEpgqH3w/view?utm_content=DAGgIU7GrTM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Riviera Maya", "url": "https://www.canva.com/design/DAGgIQX9aoE/NzEO3LVAaZLmNIrFwf0OjA/view?utm_content=DAGgIQX9aoE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Roma", "url": "https://www.canva.com/design/DAGgIU7GrTM/gd3BcmnPgPeSzfxEpgqH3w/view?utm_content=DAGgIU7GrTM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Santiago", "url": "https://www.canva.com/design/DAGgIVEAcbs/CbiYmoUZtQTIGMBt5QLl2w/view?utm_content=DAGgIVEAcbs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Siena", "url": "https://www.canva.com/design/DAGgIVEAcbs/CbiYmoUZtQTIGMBt5QLl2w/view?utm_content=DAGgIVEAcbs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Sydney", "url": "https://www.canva.com/design/DAGgIVXEKro/XqlAf6FYlwxdYIJyOZzZiw/view?utm_content=DAGgIVXEKro&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Tokyo", "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Toronto", "url": "https://www.canva.com/design/DAGgIOg8LZs/ktrot3t27LZWsHrQz6iOHQ/view?utm_content=DAGgIOg8LZs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Tulum", "url": "https://www.canva.com/design/DAGgIVf4UOQ/50ss3rLMLZTo86vSgVp1gA/view?utm_content=DAGgIVf4UOQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "Vancouver", "url": "https://www.canva.com/design/DAGgICa3icM/XUL5DCACv4mYeGq4syIzmw/view?utm_content=DAGgICa3icM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "internacional" },
  { "title": "5 Praias Floripa", "url": "https://www.canva.com/design/DAGhwS47xPc/nB1DGxHhCj4jH1ZATP8xeQ/view?utm_content=DAGhwS47xPc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Alagoas", "url": "https://www.canva.com/design/DAGhw3sD28w/yFm8fW4z_5yXo0Xf_8_p_A/view?utm_content=DAGhw3sD28w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Alter do Chão", "url": "https://www.canva.com/design/DAGhwMPXsXA/RvDv-RPL5DPL73FWyISG_w/view?utm_content=DAGhwMPXsXA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Amazônia", "url": "https://www.canva.com/design/DAGhw828f00/kS69K92z1Zf-c30Hw20DkQ/view?utm_content=DAGhw828f00&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Angra dos Reis", "url": "https://www.canva.com/design/DAGhvTRTvRg/PPKZZv7xizd-XnytywMa7Q/view?utm_content=DAGhvTRTvRg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Arraial do Cabo", "url": "https://www.canva.com/design/DAGhx1FIZ9A/8qF6DjcZAv4_IN_qwJuYMw/view?utm_content=DAGhx1FIZ9A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Balneário Camboriú", "url": "https://www.canva.com/design/DAGkxPpLy4w/HSkS1GTYdNiwDfyG9B1f9g/view?utm_content=DAGkxPpLy4w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Fernando de Noronha", "url": "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view?utm_content=DAGgHZ-fCuI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Foz do Iguaçu", "url": "https://www.canva.com/design/DAGhx1v1w7w/F17wJ25v9l9cQ65F-E_36g/view?utm_content=DAGhx1v1w7w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Fortaleza - CE", "url": "https://www.canva.com/design/DAGhx2zhYTo/TP_AUJzDtnYgSNnPH1pBQQ/view?utm_content=DAGhx2zhYTo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Genipabu", "url": "https://www.canva.com/design/DAGhwaQuLJg/kKB3SFgHCa39cJx01EnpNg/view?utm_content=DAGhwaQuLJg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Jericoacoara - CE", "url": "https://www.canva.com/design/DAGhxtB6T-o/RCEDEQt4lZNBjH4PvtHkag/view?utm_content=DAGhxtB6T-o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Lençóis Maranhenses", "url": "https://www.canva.com/design/DAGhv3tKwjM/hkKEdAi4X4NLB0fkiaIMVw/view?utm_content=DAGhv3tKwjM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Ouro Preto", "url": "https://www.canva.com/design/DAGhyI8YO-s/7t2BK0UOu13ckNb6PEbl6A/view?utm_content=DAGhyI8YO-s&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Porto de Galinhas", "url": "https://www.canva.com/design/DAGhy02WF0E/5h7yrcfYGfX8PH6MvP-U8A/view?utm_content=DAGhy02WF0E&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Recife", "url": "https://www.canva.com/design/DAGhyP1oNXI/QF3sGJxqPwP0o1p2MNPQ5A/view?utm_content=DAGhyP1oNXI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Salvador - BA", "url": "https://www.canva.com/design/DAGhyYM_8Qg/SAbNrTw-Lq0HKhQvBOxSRw/view?utm_content=DAGhyYM_8Qg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
  { "title": "Trancoso - BA", "url": "https://www.canva.com/design/DAGhy5dPKuQ/mN9rP0o1q2wX_3yZ4A5B6C/view?utm_content=DAGhy5dPKuQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "video", "category": "nacional" },
];

export const feedTemplates: Template[] = [
  { title: "Carrossel Destinos", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "feed" },
  { title: "Post Promocional", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "feed" },
  { title: "Dica de Viagem", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "feed" },
  { title: "Depoimento Cliente", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "feed" },
];

export const storyTemplates: Template[] = [
  { title: "Enquete Viagem", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "story" },
  { title: "Countdown Promoção", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "story" },
  { title: "Quiz Destinos", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view", type: "story" },
];

export const weeklyStories = [
  { title: "Segunda - Motivação", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
  { title: "Terça - Dica", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
  { title: "Quarta - Destino", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
  { title: "Quinta - Promo", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
  { title: "Sexta - Inspiração", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
  { title: "Sábado - Bastidores", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
  { title: "Domingo - Recap", url: "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view" },
];

export const narracaoTool = {
  title: "Narração de Ofertas de Viagens",
  url: "https://chatgpt.com/g/g-zuVzD4urh-redador",
  icon: "🎙️",
  description: "Narrar com sua voz"
};

export const aiTools = [
  { title: "Criador de Legendas", url: "https://chatgpt.com/g/g-zuVzD4urh-redador", icon: "✍️" },
  { title: "Gerador de Hashtags", url: "https://chatgpt.com/g/g-zuVzD4urh-redador", icon: "🏷️" },
  { title: "Planejador de Conteúdo", url: "https://chatgpt.com/g/g-zuVzD4urh-redador", icon: "📊" },
  { title: "Roteirista de Reels", url: "https://chatgpt.com/g/g-zuVzD4urh-redador", icon: "🎬" },
];

export const resources = [
  { name: "Comunidade Agências", url: "https://community.example.com", icon: "👥" },
  { name: "Calendário Editorial", url: "/calendar", icon: "📅" },
  { name: "Guia de Vendas", url: "https://guide.example.com", icon: "📖" },
];

export const videoDownloads = [
  { name: "Pack Destinos Nacionais", url: "https://drive.google.com/drive/folders/example1", icon: "🇧🇷" },
  { name: "Pack Destinos Internacionais", url: "https://drive.google.com/drive/folders/example2", icon: "🌎" },
  { name: "Pack Datas Comemorativas", url: "https://drive.google.com/drive/folders/example3", icon: "🎉" },
];
