import { useState } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useFabricaMetrics } from '@/hooks/useFabricaMetrics';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Trophy, Target, CheckCircle2, Lock, Sparkles, TrendingUp,
    Video, Image as ImageIcon, Calendar as CalendarIcon, Wand2, Star,
    Users, Globe, Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLevelInfo } from '@/lib/gamification';

export default function Progresso() {
    const { progress, level, levelName, progressPercent, pointsToNext, loading } = useGamification();
    const { totalLeads, newLeadsCount, totalSites, totalArtes } = useFabricaMetrics();

    // Missions/Tips for users
    const missions = [
        {
            id: 1,
            title: 'Publique 1-3 vídeos por dia',
            description: 'Mantenha seu perfil ativo com conteúdo regular',
            icon: Video,
            points: 10,
            type: 'video' as const,
        },
        {
            id: 2,
            title: 'Publique 1-3 stories por dia',
            description: 'Engaje seu público com stories frequentes',
            icon: ImageIcon,
            points: 5,
            type: 'art' as const,
        },
        {
            id: 3,
            title: 'Use artes para promoções',
            description: 'Crie ofertas irresistíveis com nossas artes',
            icon: ImageIcon,
            points: 5,
            type: 'art' as const,
        },
        {
            id: 4,
            title: 'Explore o calendário de conteúdo',
            description: 'Planeje suas postagens com antecedência',
            icon: CalendarIcon,
            points: 15,
            type: 'calendar' as const,
        },
        {
            id: 5,
            title: 'Use ferramentas de IA',
            description: 'Fix Audio, ChatGPT, Headline Generator e mais',
            icon: Wand2,
            points: 20,
            type: 'tool' as const,
        },
        {
            id: 6,
            title: 'Assista a videoaula completa',
            description: 'Aprenda as melhores práticas de criação',
            icon: Star,
            points: 0,
            type: 'video' as const,
        },
    ];

    const levelDetails = [
        {
            level: 1,
            info: getLevelInfo(1),
            color: 'from-blue-500 to-cyan-500',
            description: 'Você está começando sua jornada! Explore as ferramentas e comece a criar.',
        },
        {
            level: 2,
            info: getLevelInfo(2),
            color: 'from-purple-500 to-pink-500',
            description: 'Parabéns! Você está dominando a plataforma. Continue criando conteúdo incrível!',
        },
        {
            level: 3,
            info: getLevelInfo(3),
            color: 'from-orange-500 to-red-500',
            description: 'Você é um Expert! Domine todas as ferramentas e crie conteúdo profissional.',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const currentLevelDetail = levelDetails[level - 1];

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Seu Progresso 🚀
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Acompanhe sua evolução e desbloqueie novos níveis!
                    </p>
                </div>

                {/* Current Level Card */}
                <Card className="mb-8 border-2 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy className={cn('h-12 w-12', `text-${currentLevelDetail.color.split('-')[1]}-500`)} />
                                <div>
                                    <CardTitle className="text-lg md:text-xl">{levelName}</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">{currentLevelDetail.description}</CardDescription>
                                </div>
                            </div>
                            <Badge className={cn('text-sm md:text-base px-3 py-1 bg-gradient-to-r', currentLevelDetail.color)}>
                                {progress?.total_points || 0} pts
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Progresso para próximo nível</span>
                                <span className="text-muted-foreground">
                                    {level === 3 ? 'Nível Máximo!' : `${pointsToNext} pts restantes`}
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-3" />
                            <p className="text-xs text-muted-foreground text-center">
                                {progressPercent}% completo
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <Video className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-xl md:text-2xl font-bold">{progress?.videos_opened || 0}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground">Vídeos Acessados</p>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <ImageIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-xl md:text-2xl font-bold">{progress?.arts_clicked || 0}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground">Artes Usadas</p>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-xl md:text-2xl font-bold">{progress?.calendar_used || 0}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground">Calendário Usado</p>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <Wand2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-xl md:text-2xl font-bold">{progress?.tools_used || 0}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground">Ferramentas Usadas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fábrica Production & CRM Leads Card */}
                <Card className="mb-8 border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-950/20 via-background to-slate-950/30">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <Factory className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                        Desempenho & CRM da Fábrica 🏭
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">
                                        Monitoramento de conversão em tempo real do seu negócio
                                    </CardDescription>
                                </div>
                            </div>
                            {newLeadsCount > 0 ? (
                                <Badge className="bg-red-500 text-white font-extrabold px-3 py-1 animate-pulse shadow-md">
                                    {newLeadsCount} Novo{newLeadsCount > 1 ? 's' : ''} Lead{newLeadsCount > 1 ? 's' : ''}!
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-purple-500/40 text-purple-400">
                                    CRM Ativo
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-950/20 border border-red-500/25 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                {newLeadsCount > 0 && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                                        +{newLeadsCount} novos
                                    </span>
                                )}
                                <Users className="h-7 w-7 text-red-500 mb-2" />
                                <p className="text-3xl md:text-4xl font-black text-red-500">{totalLeads}</p>
                                <p className="text-xs md:text-sm font-bold text-foreground mt-1">Leads Recebidos</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Capturados nos seus formulários e sites</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-950/20 border border-cyan-500/25 flex flex-col items-center justify-center text-center">
                                <Globe className="h-7 w-7 text-cyan-500 mb-2" />
                                <p className="text-3xl md:text-4xl font-black text-cyan-500">{totalSites}</p>
                                <p className="text-xs md:text-sm font-bold text-foreground mt-1">Sites Gerados / Ativos</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Páginas de alta conversão criadas</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-950/20 border border-purple-500/25 flex flex-col items-center justify-center text-center">
                                <Sparkles className="h-7 w-7 text-purple-500 mb-2" />
                                <p className="text-3xl md:text-4xl font-black text-purple-500">{totalArtes}</p>
                                <p className="text-xs md:text-sm font-bold text-foreground mt-1">Artes & Pacotes Gerados</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Anúncios, carrosséis e artes produzidos</p>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <Button 
                                onClick={() => window.location.href = '/fabrica'} 
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
                            >
                                Acessar CRM & Gerenciar Leads na Fábrica →
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Missions/Tips Section */}
                <div className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Missões & Dicas de Sucesso
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {missions.map((mission) => {
                            const Icon = mission.icon;
                            return (
                                <Card key={mission.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base md:text-lg">{mission.title}</CardTitle>
                                                    <CardDescription className="text-xs md:text-sm">
                                                        {mission.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            {mission.points > 0 && (
                                                <Badge variant="secondary" className="ml-2">
                                                    +{mission.points} pts
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* All Levels Overview */}
                <div>
                    <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Todos os Níveis
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {levelDetails.map((detail, index) => {
                            const isUnlocked = level >= detail.level;
                            const Icon = isUnlocked ? CheckCircle2 : Lock;
                            return (
                                <Card
                                    key={detail.level}
                                    className={cn(
                                        'relative overflow-hidden',
                                        isUnlocked ? 'border-2 border-primary' : 'opacity-60'
                                    )}
                                >
                                    <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', detail.color)} />
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl">{detail.info.name}</CardTitle>
                                            <Icon className={cn('h-6 w-6', isUnlocked ? 'text-green-600' : 'text-muted-foreground')} />
                                        </div>
                                        <CardDescription>{detail.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {detail.info.minPoints} - {detail.info.maxPoints === Infinity ? '∞' : detail.info.maxPoints} pontos
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                        <CardContent className="py-8">
                            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                            <h3 className="text-lg md:text-xl font-bold mb-2">Continue criando!</h3>
                            <p className="text-muted-foreground mb-4">
                                Quanto mais você usa a plataforma, mais pontos você ganha!
                            </p>
                            <Button size="lg" asChild>
                                <a href="/">Explorar Ferramentas</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
