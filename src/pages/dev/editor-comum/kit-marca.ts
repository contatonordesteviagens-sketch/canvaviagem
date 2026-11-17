// Kit de marca (cores e fontes da agência), usado pelo editor de artes e pelo de vídeo.
// Fica na conta, junto com os dados da agência (FabricaState.kitMarca); o do aparelho é só reserva.
export type KitMarca = { cores: string[]; fonteTitulo: string; fonteTexto: string };
export const KIT = "cv-kit-marca";
export const corHex = (c?: string) => (c && /^#[0-9a-f]{6}$/i.test(c) ? c.toUpperCase() : "");
export const lerKit = (): KitMarca => {
  const vazio: KitMarca = { cores: [], fonteTitulo: "", fonteTexto: "" };
  try { return { ...vazio, ...JSON.parse(localStorage.getItem(KIT) || "{}") }; } catch { return vazio; }
};
