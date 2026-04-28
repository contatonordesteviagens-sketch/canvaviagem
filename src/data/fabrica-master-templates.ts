// Registro leve de templates mestres (apenas id + name).
// O prompt completo vive na edge function `fabrica-generate-ad/master-prompts.ts`.

export interface MasterTemplateMeta {
  id: string;
  name: string;
  description: string;
}

export const MASTER_TEMPLATES: MasterTemplateMeta[] = [
  { id: "classic_vertical",   name: "Clássico Vertical",         description: "60% foto + caixa de oferta dividindo a imagem" },
  { id: "cancun_style",       name: "Cancún (azul/roxo)",         description: "Praia + painel roxo/azul vibrante" },
  { id: "gramado_style",      name: "Gramado (cartão amarelo)",   description: "Cartão amarelo com selo PIX serrilhado" },
  { id: "maceio_style",       name: "Maceió (vista aérea)",       description: "Vista aérea + cartão amarelo no topo" },
  { id: "split_yellow_side",  name: "Split lateral amarelo",      description: "Faixa amarela vertical + foto cinematográfica" },
  { id: "iconic_landmark",    name: "Ponto turístico icônico",    description: "Marco famoso com badge de oferta sobreposta" },
  { id: "black_friday_combo", name: "Black Friday combo",         description: "Painel preto/dourado + 4 fotos do destino" },
  { id: "minimalist_top",     name: "Minimalista topo",           description: "Topo creme com info + foto inferior" },
  { id: "elegant_center",     name: "Card central elegante",      description: "Card central com cor primária sobre foto" },
];
