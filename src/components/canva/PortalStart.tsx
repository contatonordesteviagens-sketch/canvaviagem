import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { JornadaGuia } from "@/components/jornada/JornadaGuia";
import { VoiceOnboarding } from "@/components/fabrica/VoiceOnboarding";
import { FabricaProvider } from "@/hooks/useFabricaContext";

/**
 * Primeira coisa que o assinante vê no portal: o mesmo microfone e as mesmas missões da Fábrica,
 * ligados ao mesmo projeto. O que ele fala aqui já aparece lá.
 */
function PortalStartContent() {
  const navigate = useNavigate();
  const voiceRef = useRef<HTMLDivElement>(null);
  return (
    <div className="mx-auto mb-6 w-full max-w-4xl text-left">
      <div ref={voiceRef} className="mb-3 scroll-mt-24">
        <VoiceOnboarding variant="hero" onSaved={() => navigate("/fabrica/video?gerar=1")} />
      </div>
      <JornadaGuia
        onIr={(m) => {
          if (m.id === "perfil") {
            voiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          navigate(m.caminho + (m.tipo === "confirmar" ? "?missao=" + m.id : ""));
        }}
      />
    </div>
  );
}

export default function PortalStart() {
  return (
    <FabricaProvider>
      <PortalStartContent />
    </FabricaProvider>
  );
}
