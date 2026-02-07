import { useState } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Trophy, Target, CheckCircle2, Lock, Sparkles, TrendingUp,
    Video, Image as ImageIcon, Calendar as CalendarIcon, Wand2, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLevelInfo } from '@/lib/gamification';

export default function Progresso() {
    const { progress, level, levelName, progressPercent, pointsToNext, loading } = useGamification();

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
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Seu Progresso 🚀
                    </h1>
                    <p className="text-muted-foreground text-lg">
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
                                    <CardTitle className="text-2xl">{levelName}</CardTitle>
                                    <CardDescription>{currentLevelDetail.description}</CardDescription>
                                </div>
                            </div>
                            <Badge className={cn('text-lg px-4 py-2 bg-gradient-to-r', currentLevelDetail.color)}>
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
                                <p className="text-2xl font-bold">{progress?.videos_opened || 0}</p>
                                <p className="text-xs text-muted-foreground">Vídeos Acessados</p>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <ImageIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-2xl font-bold">{progress?.arts_clicked || 0}</p>
                                <p className="text-xs text-muted-foreground">Artes Usadas</p>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-2xl font-bold">{progress?.calendar_used || 0}</p>
                                <p className="text-xs text-muted-foreground">Calendário Usado</p>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <Wand2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-2xl font-bold">{progress?.tools_used || 0}</p>
                                <p className="text-xs text-muted-foreground">Ferramentas Usadas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Missions/Tips Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Target className="h-6 w-6 text-primary" />
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
                                                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                                                    <CardDescription className="text-sm">
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
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
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
                            <h3 className="text-2xl font-bold mb-2">Continue criando!</h3>
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
