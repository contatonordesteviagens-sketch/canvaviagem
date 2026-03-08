import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShoppingBag,
    Plus,
    Link as LinkIcon,
    Settings,
    LineChart,
    Sparkles,
    CheckCircle2,
    ExternalLink,
    Copy,
    Wand2,
    TrendingUp,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HotmartManager() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent uppercase tracking-tight">
                        Hotmart Central
                    </h1>
                    <p className="text-slate-400 mt-1">Gerencie seus produtos e publique novas ofertas na Hotmart.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-xl">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações API
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Produto
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-900/50 border border-slate-800 p-1 rounded-2xl">
                    <TabsTrigger value="overview" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <LineChart className="w-4 h-4 mr-2" />
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="studio" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Hotmart Studio
                    </TabsTrigger>
                    <TabsTrigger value="products" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Meus Produtos
                    </TabsTrigger>
                    <TabsTrigger value="publisher" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Publicador
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Vendas (Hotmart)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-4xl font-black text-white">R$ 0,00</div>
                                    <div className="p-3 bg-green-500/10 rounded-2xl">
                                        <LineChart className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                                    Conecte sua API para ver dados em tempo real
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Conversão Hotmart</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-4xl font-black text-white">0%</div>
                                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                                        <TrendingUp className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 italic">Sem dados de checkout</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Webhook Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-black text-yellow-500 uppercase">Aguardando</div>
                                    <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                        <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin-slow" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4">Nenhum sinal recebido nos últimos 7 dias</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-6 text-primary">
                                <LinkIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Conecte sua conta Developers Hotmart</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-6">
                                Para gerenciar seus produtos e ver vendas aqui, você precisa configurar as chaves de API da Hotmart.
                            </p>
                            <div className="flex gap-4">
                                <Button className="bg-primary text-white font-bold rounded-xl px-8 hover:scale-105 transition-transform" onClick={() => toast.info("Guia de conexão enviado por email!")}>
                                    Ativar Conexão
                                </Button>
                                <a href="https://developers.hotmart.com/" target="_blank" className="bg-slate-800 text-white font-bold rounded-xl px-8 flex items-center hover:bg-slate-700">
                                    Acessar Hotmart Dev <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="studio" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden p-8">
                            <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
                                <Wand2 className="w-6 h-6 text-primary" />
                                Gerador de Oferta Irresistível
                            </h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Crie a copy completa da sua página de vendas na Hotmart usando nossa IA treinada em "Marketing de Premissas".
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">Nome do Produto</label>
                                    <Input placeholder="Ex: Pack 150 Vídeos Luxo" className="bg-slate-950/50 border-slate-800 rounded-xl" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">Público Alvo</label>
                                    <Input placeholder="Ex: Agentes de Viagens autônomos" className="bg-slate-950/50 border-slate-800 rounded-xl" />
                                </div>
                                <Button className="w-full bg-primary font-black rounded-xl py-6 mt-4 shadow-[0_0_20px_rgba(var(--primary),0.31)] hover:scale-[1.02] transition-all">
                                    Gerar Copy Completa
                                </Button>
                            </div>
                        </Card>

                        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden p-8">
                            <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-accent" />
                                Checklist de Publicação
                            </h3>
                            <div className="space-y-4">
                                {[
                                    "Definir Nome e Categoria",
                                    "Configurar Preço e Parcelamento",
                                    "Configurar Página de Vendas (Externa)",
                                    "Configurar Página de Obrigado",
                                    "Ativar Webhook Canva Trip",
                                    "Mandar para Avaliação"
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                                        <span className="text-slate-300 font-medium text-sm">{step}</span>
                                        <Button variant="ghost" size="icon" className="ml-auto text-slate-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <ShoppingBag className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white">Nenhum produto sincronizado</h3>
                        <p className="text-slate-400">
                            Após configurar sua API da Hotmart, seus produtos aparecerão aqui para você gerenciar os ativos digitais.
                        </p>
                        <Button className="bg-slate-800 text-white rounded-xl font-bold px-8 mt-6">
                            Sincronizar Manualmente
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="publisher" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-8">
                                <h3 className="text-xl font-black uppercase text-white mb-6">Criar Novo Produto na Hotmart</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Formato</label>
                                        <select className="w-full bg-slate-950/50 border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                            <option>Arquivo Digital (PDF, Zip)</option>
                                            <option>Curso Online / Área de Membros</option>
                                            <option>Ingresso para Evento</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Nome da Oferta</label>
                                        <Input placeholder="Ex: Pack Verão 2026" className="bg-slate-950/50 border-slate-800 rounded-xl" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Promessa Principal (Headline)</label>
                                        <Input placeholder="A frase que vai fazer o cliente comprar..." className="bg-slate-950/50 border-slate-800 rounded-xl" />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <Button className="bg-primary font-black rounded-xl px-10 py-6 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                        Gerar Assets do Produto
                                    </Button>
                                    <Button variant="outline" className="border-slate-800 rounded-xl px-10 py-6 hover:bg-slate-800">
                                        Salvar Rascunho
                                    </Button>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6 border-l-4 border-l-primary">
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="font-black text-white uppercase text-sm">Copy da Página</h4>
                                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="h-32 bg-slate-950/30 rounded-xl p-4 text-xs text-slate-500 italic">
                                        Aguardando geração de ativos...
                                    </div>
                                </Card>
                                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6 border-l-4 border-l-accent">
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="font-black text-white uppercase text-sm">Banner de Vendas</h4>
                                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="h-32 bg-slate-950/30 rounded-xl flex items-center justify-center text-slate-600">
                                        <ShoppingBag className="w-8 h-8 opacity-20" />
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 rounded-3xl p-6 shadow-2xl">
                                <h4 className="font-black text-white uppercase text-sm mb-6 flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-primary" />
                                    Links Diretos Hotmart
                                </h4>
                                <div className="space-y-3">
                                    <a
                                        href="https://app.hotmart.com/products/create"
                                        target="_blank"
                                        className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group"
                                    >
                                        <span className="text-sm font-bold text-slate-300">Criar Novo Produto</span>
                                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                    </a>
                                    <a
                                        href="https://app.hotmart.com/products/my-products"
                                        target="_blank"
                                        className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group"
                                    >
                                        <span className="text-sm font-bold text-slate-300">Meus Produtos</span>
                                        <ShoppingBag className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                    </a>
                                    <a
                                        href="https://app.hotmart.com/tools/webhook"
                                        target="_blank"
                                        className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group"
                                    >
                                        <span className="text-sm font-bold text-slate-300">Configurar Webhook</span>
                                        <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                    </a>
                                </div>
                            </Card>

                            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl">
                                <h5 className="text-yellow-500 font-bold text-xs uppercase mb-2">💡 Dica do Mentor</h5>
                                <p className="text-yellow-500/80 text-[11px] leading-relaxed">
                                    "Sempre use o checkout limpo da Hotmart para tráfego direto. Isso reduz a fricção e aumenta a conversão em até 12%."
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Add spinning animation if not present
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;
document.head.appendChild(style);
