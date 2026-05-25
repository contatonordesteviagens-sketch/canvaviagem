import React, { useState, useRef, useEffect } from 'react'
import { 
  Plus, Lightbulb, Paperclip, Image as ImageIcon,
  Check, Sparkles, Zap, Brain, Bolt,
  SendHorizontal, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// UTILS
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CHAT INPUT
export function ChatInput({ onSend, placeholder = "Como posso te ajudar a vender hoje?", isLoading }: {
  onSend?: (message: string, image?: string) => void
  placeholder?: string
  isLoading?: boolean
}) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() || selectedImage) {
      onSend?.(message, selectedImage || undefined)
      setMessage('')
      setSelectedImage(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    setShowAttachMenu(false)
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)]">
        
        {selectedImage && (
          <div className="px-5 pt-4 flex gap-2">
            <div className="relative group">
              <img src={selectedImage} className="h-16 w-auto rounded-lg border border-white/10" alt="Preview" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[200px]"
            style={{ height: '80px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="flex items-center justify-center size-8 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95"
              >
                <Plus className={cn("size-4 transition-transform duration-200", showAttachMenu && "rotate-45")} />
              </button>

              <AnimatePresence>
                {showAttachMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 z-50 bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
                    >
                      <div className="p-1.5 min-w-[180px]">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#a0a0a5] hover:bg-white/5 hover:text-white transition-all duration-150"
                        >
                          <ImageIcon className="size-4" />
                          <span className="text-sm">Adicionar imagem</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={(!message.trim() && !selectedImage) || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(20,136,252,0.3)]"
            >
              <span className="hidden sm:inline">{isLoading ? 'Gerando...' : 'Enviar'}</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Ray Background
export function RayBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-[#0f0f0f]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Animated Scan Line */}
      <motion.div 
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-10"
      />

      <div 
        className="absolute left-1/2 -translate-x-1/2 w-[200%] h-[150%] sm:w-[6000px] sm:h-[1800px] bottom-[-20%] sm:bottom-[-40%]"
        style={{
          background: `radial-gradient(circle at center 800px, rgba(20, 136, 252, 0.6) 0%, rgba(20, 136, 252, 0.3) 14%, rgba(20, 136, 252, 0.15) 18%, rgba(20, 136, 252, 0.05) 22%, transparent 25%)`
        }}
      />
      <div 
        className="absolute bottom-[-10%] left-1/2 w-[120%] aspect-square sm:w-[3043px] sm:h-[2865px] opacity-40 sm:opacity-100"
        style={{ transform: 'translate(-50%) rotate(180deg)' }}
      >
        <div className="absolute w-full h-full rounded-full -mt-[13px]" style={{ background: 'radial-gradient(43.89% 25.74% at 50.02% 97.24%, #111114 0%, #0f0f0f 100%)', border: '16px solid white', transform: 'rotate(180deg)', zIndex: 5 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[11px]" style={{ border: '23px solid #b7d7f6', transform: 'rotate(180deg)', zIndex: 4 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[8px]" style={{ border: '23px solid #8fc1f2', transform: 'rotate(180deg)', zIndex: 3 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[4px]" style={{ border: '23px solid #64acf6', transform: 'rotate(180deg)', zIndex: 2 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f]" style={{ border: '20px solid #1172e2', boxShadow: '0 -15px 24.8px rgba(17, 114, 226, 0.6)', transform: 'rotate(180deg)', zIndex: 1 }} />
      </div>
    </div>
  )
}

// ANNOUNCEMENT BADGE COMPONENT
function AnnouncementBadge({ text, href = "#" }: { text: string; href?: string }) {
  const content = (
    <>
      <span className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none opacity-70 mix-blend-overlay" style={{ background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.15) 0%, transparent 70%)' }} />
      <span className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-[100px] opacity-60" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(37, 119, 255, 0.8) 20%, rgba(126, 93, 225, 0.8) 50%, rgba(59, 130, 246, 0.8) 80%, transparent 100%)', filter: 'blur(0.5px)' }} />
      <Bolt className="size-4 relative z-10 text-white" />
      <span className="relative z-10 text-white font-medium">{text}</span>
    </>
  )

  const className = "relative inline-flex items-center gap-2 px-5 py-2 min-h-[40px] rounded-full text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
  const style = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(20px) saturate(140%)',
    boxShadow: 'inset 0 1px rgba(255,255,255,0.2), inset 0 -1px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.08)'
  }

  return href !== '#' ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{content}</a>
  ) : (
    <button className={className} style={style}>{content}</button>
  )
}

// MAIN BOLT CHAT COMPONENT
interface BoltChatProps {
  title?: string
  subtitle?: string
  announcementText?: string
  announcementHref?: string
  placeholder?: string
  onSend?: (message: string, image?: string) => void
  isLoading?: boolean
}

export function BoltStyleChat({
  title = "Como posso te ajudar a",
  subtitle = "Crie scripts de vendas e estratégias incríveis conversando com a IA.",
  announcementText = "Apresentando Mentor IA V2",
  announcementHref = "#",
  placeholder = "Como posso te ajudar a vender hoje?",
  onSend,
  isLoading
}: BoltChatProps) {
  const suggestions = [
    { icon: <Zap className="size-4 text-blue-400" />, text: "Como contornar objeção de preço?" },
    { icon: <Brain className="size-4 text-purple-400" />, text: "Script para cliente que sumiu" },
    { icon: <Sparkles className="size-4 text-emerald-400" />, text: "Como oferecer um upgrade de hotel?" },
    { icon: <Bolt className="size-4 text-amber-400" />, text: "Fechamento para pacote de luxo" }
  ]

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden bg-[#0f0f0f] px-4 py-12">
      <RayBackground />
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        {/* Announcement badge */}
        <div className="mb-10">
          <AnnouncementBadge text={announcementText} href={announcementHref} />
        </div>

        {/* Title section */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4 leading-tight">
            {title}{' '}
            <span className="bg-gradient-to-b from-[#4da5fc] via-[#4da5fc] to-white bg-clip-text text-transparent italic">
              vender
            </span>
            {' '}hoje?
          </h1>
          <p className="text-sm sm:text-lg text-[#8a8a8f] max-w-xl mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Chat input */}
        <div className="w-full max-w-[720px] mb-8">
          <ChatInput placeholder={placeholder} onSend={onSend} isLoading={isLoading} />
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[720px]">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend?.(s.text)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#a0a0a5] hover:bg-white/10 hover:text-white transition-all text-left group active:scale-[0.98]"
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                {s.icon}
              </div>
              <span className="text-sm font-medium">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
