import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the props interface for type safety and reusability
interface MinimalistHeroProps {
    logoText: string;
    navLinks: { label: string; href: string }[];
    mainText: string;
    readMoreLink: string;
    imageSrc: string;
    imageAlt: string;
    overlayText: {
        part1: string;
        part2: string;
    };
    socialLinks: { icon: LucideIcon; href: string }[];
    locationText: string;
    className?: string;
}

// Helper component for navigation links
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        className="text-sm font-medium tracking-widest text-black/60 transition-colors hover:text-black"
    >
        {children}
    </a>
);

// Helper component for social media icons
const SocialIcon = ({ href, icon: Icon }: { href: string; icon: LucideIcon }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-black/60 transition-colors hover:text-black">
        <Icon className="h-5 w-5" />
    </a>
);

// The main reusable Hero Section component
export const MinimalistHero = ({
    logoText,
    navLinks,
    mainText,
    readMoreLink,
    imageSrc,
    imageAlt,
    overlayText,
    socialLinks,
    locationText,
    className,
}: MinimalistHeroProps) => {
    return (
        <div
            className={cn(
                'relative flex min-h-screen w-full flex-col items-center bg-white text-black p-6 md:p-12 overflow-x-hidden',
                className
            )}
        >
            {/* Header */}
            <header className="z-30 flex w-full max-w-7xl items-center justify-between mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-bold tracking-wider"
                >
                    {logoText}
                </motion.div>
                <div className="hidden items-center space-x-8 md:flex">
                    {navLinks.map((link) => (
                        <NavLink key={link.label} href={link.href}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col space-y-1.5 md:hidden"
                    aria-label="Open menu"
                >
                    <span className="block h-0.5 w-6 bg-black"></span>
                    <span className="block h-0.5 w-6 bg-black"></span>
                    <span className="block h-0.5 w-5 bg-black"></span>
                </motion.button>
            </header>

            {/* Main Content Area - Vertically Stacked */}
            <div className="relative flex flex-col items-center w-full max-w-2xl text-center space-y-10 pb-32">

                {/* Image Section */}
                <div className="relative flex justify-center items-center w-full min-h-[420px] mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="absolute z-0 h-[180px] w-[180px] rounded-full bg-[#EAB308] md:h-[220px] md:w-[220px] lg:h-[280px] lg:w-[280px] -translate-y-8"
                    ></motion.div>
                    <motion.img
                        src={imageSrc}
                        alt={imageAlt}
                        className="relative z-10 h-auto w-80 object-cover md:w-96 scale-[2.7]"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    />
                </div>

                {/* Paragraph Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="z-20 px-6"
                >
                    <p className="max-w-md text-[1.05rem] leading-relaxed text-black font-medium opacity-80">
                        {mainText}
                    </p>
                </motion.div>

                {/* Saiba Mais Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="z-20 pt-4"
                >
                    <a href={readMoreLink} className="text-[0.65rem] font-black text-black underline decoration-2 underline-offset-4 uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">
                        Saiba Mais
                    </a>
                </motion.div>

                {/* VENDA MAIS Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="z-20 flex flex-col items-center pt-2"
                >
                    <h1 className="text-[140px] md:text-[200px] font-black text-black leading-[0.72] tracking-tighter uppercase whitespace-nowrap">
                        {overlayText.part1}<br />{overlayText.part2}
                    </h1>
                </motion.div>

                {/* Subtitle Line with Instagram Icon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="z-20 flex flex-col items-center space-y-2 pt-4"
                >
                    <span className="text-xs uppercase tracking-[0.6em] text-black font-black opacity-40">
                        viagens
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 border-[2px] border-black/10 rounded-lg">
                            {socialLinks[0] && React.createElement(socialLinks[0].icon, { className: "w-5 h-5 opacity-40" })}
                        </div>
                        <span className="text-[0.7rem] font-black uppercase tracking-[0.25em] text-black opacity-40">
                            {locationText}
                        </span>
                    </div>
                </motion.div>

                {/* Testimonial Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.8 }}
                    className="z-20 w-full max-w-sm mt-16 bg-black text-white p-10 rounded-[2.5rem] text-left shadow-2xl space-y-4"
                >
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-[#EAB308] text-xl">★</span>
                        ))}
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic opacity-90">
                        "Parabéns pelo trabalho, ajudou muito aqui. Tava batendo cabeça pra criar vídeos dos lugares pra postar."
                    </p>
                </motion.div>
            </div>

            {/* Footer Elements */}
            <footer className="z-10 mt-auto py-8">
                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Canva Viagem 2026</p>
            </footer>
        </div>
    );
};
