import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Sugestoes() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: user?.email || '',
        suggestion: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.suggestion.trim()) {
            toast.error('Por favor, escreva sua sugestão!');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Por favor, informe seu email!');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from('user_suggestions').insert({
                user_id: user?.id || null,
                user_name: formData.name || null,
                user_email: formData.email,
                suggestion_text: formData.suggestion,
                status: 'pending',
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success('Sugestão enviada com sucesso! Obrigado pelo feedback! 🎉');

            // Reset form
            setFormData({
                name: '',
                email: user?.email || '',
                suggestion: '',
            });

            // Show success state for 3 seconds then reset
            setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (error) {
            console.error('Error submitting suggestion:', error);
            toast.error('Erro ao enviar sugestão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Lightbulb className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Suas Ideias Importam! 💡
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Ajude-nos a melhorar o Canva Viagem com suas sugestões
                    </p>
                </div>

                {submitted ? (
                    /* Success State */
                    <Card className="border-2 border-green-500 shadow-lg">
                        <CardContent className="py-12 text-center">
                            <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-600" />
                            <h2 className="text-2xl font-bold mb-2">Sugestão Enviada!</h2>
                            <p className="text-muted-foreground mb-6">
                                Obrigado pelo seu feedback. Analisaremos sua sugestão com carinho! ❤️
                            </p>
                            <Button onClick={() => setSubmitted(false)}>
                                Enviar Outra Sugestão
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    /* Form */
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Envie sua Sugestão</CardTitle>
                            <CardDescription>
                                Quer ver uma nova funcionalidade? Tem ideia de melhoria? Conte pra gente!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome (opcional)</Label>
                                    <Input
                                        id="name"
                                        placeholder="Seu nome"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Usaremos apenas para responder sua sugestão
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="suggestion">Sua Sugestão *</Label>
                                    <Textarea
                                        id="suggestion"
                                        placeholder="Descreva sua ideia ou sugestão de melhoria..."
                                        value={formData.suggestion}
                                        onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                                        rows={6}
                                        required
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Seja o mais detalhado possível para nos ajudar a entender sua necessidade
                                    </p>
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>Enviando...</>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Enviar Sugestão
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mt-8">
                    <Card className="bg-accent/5">
                        <CardHeader>
                            <CardTitle className="text-lg">✅ O que sugerir?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p>• Novas funcionalidades</p>
                            <p>• Melhorias de design</p>
                            <p>• Novos templates</p>
                            <p>• Integrações com outras ferramentas</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-accent/5">
                        <CardHeader>
                            <CardTitle className="text-lg">🚀 Próximos Passos</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p>1. Recebemos sua sugestão</p>
                            <p>2. Nossa equipe analisa</p>
                            <p>3. Priorizamos as melhores ideias</p>
                            <p>4. Você recebe atualizações por email</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
