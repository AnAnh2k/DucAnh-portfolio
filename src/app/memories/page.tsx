"use client"
import { supabase } from "@/lib/supabase"
import { 
  CalendarDays, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Heart, 
  Sparkles, 
  X,
  ArrowLeft,
  Calendar,
  Lock,
  Unlock,
  Key,
  Globe,
  LogOut
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

// --- Animation Variants --------------------------------------------------------
const EASE = [0.22, 1, 0.36, 1] as const

const collapseVariants = {
  open: {
    height: "auto",
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE }
  },
  closed: {
    height: 0,
    opacity: 0,
    y: -8,
    transition: { duration: 0.28, ease: EASE }
  }
}

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: EASE }
  },
  closed: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.22, ease: EASE }
  }
}

// --- Types ---------------------------------------------------------------------
type Memory = {
  id: string
  title: string
  content: string
  post_date: string
  background_image?: string
  password?: string
}

type GroupedMemories = Record<number, Record<number, Record<number, Memory[]>>>

export default function MemoriesPage() {
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>({})
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({})
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({})
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  
  // --- Password Gate States ---
  const [isPageUnlocked, setIsPageUnlocked] = useState(false)
  const [pagePassword, setPagePassword] = useState("")
  const [memoryPasswords, setMemoryPasswords] = useState<Record<string, string>>({})
  const [memoryToUnlock, setMemoryToUnlock] = useState<Memory | null>(null)
  const [tempMemoryPassword, setTempMemoryPassword] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("memories_page_unlocked")
    if (saved === "true") setIsPageUnlocked(true)
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("memories")
      .select("*")
      .order("post_date", { ascending: true })
    if (data) setMemories(data)
    setLoading(false)
  }

  const handleUnlockPage = (e: React.FormEvent) => {
    e.preventDefault()
    if (pagePassword.toLowerCase().trim() === "anducanh") {
      setIsPageUnlocked(true)
      localStorage.setItem("memories_page_unlocked", "true")
      toast.success("Chào mừng bạn quay lại với cuốn nhật ký!")
    } else {
      toast.error("Mật khẩu không đúng. Vui lòng thử lại!")
    }
  }

  const handleOpenMemory = (memory: Memory) => {
    if (memory.password) {
      const savedPass = localStorage.getItem(`memory_unlocked_${memory.id}`)
      if (savedPass === memory.password) {
        setSelectedMemory(memory)
      } else {
        setMemoryToUnlock(memory)
        setTempMemoryPassword("")
      }
    } else {
      setSelectedMemory(memory)
    }
  }

  const handleUnlockMemory = (e: React.FormEvent) => {
    e.preventDefault()
    if (memoryToUnlock && tempMemoryPassword.toLowerCase().trim() === memoryToUnlock.password) {
      localStorage.setItem(`memory_unlocked_${memoryToUnlock.id}`, memoryToUnlock.password)
      setSelectedMemory(memoryToUnlock)
      setMemoryToUnlock(null)
      toast.success("Đã mở khóa kỷ niệm!")
    } else {
      toast.error("Mật khẩu kỷ niệm không chính xác!")
    }
  }

  // Grouping logic
  const grouped: GroupedMemories = memories.reduce((acc, memory) => {
    const d = new Date(memory.post_date)
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate()
    if (!acc[y]) acc[y] = {}
    if (!acc[y][m]) acc[y][m] = {}
    if (!acc[y][m][day]) acc[y][m][day] = []
    acc[y][m][day].push(memory)
    return acc
  }, {} as GroupedMemories)

  const years = Object.keys(grouped).map(Number).sort((a, b) => a - b)
  const toggle = (setter: any, key: string) => setter((prev: any) => ({ ...prev, [key]: !prev[key] }))
  const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                       "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"]

  // --- Password Gate Screen ---
  if (!isPageUnlocked) {
    return (
      <div className="min-h-screen bg-[#2C1810] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/default-memory.png')] bg-cover bg-center opacity-40 blur-sm" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl text-center"
        >
          <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-8 ring-1 ring-orange-500/30">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-[#FFF4E6] mb-4 tracking-tight">Trang Kỷ Niệm</h1>
          <p className="text-[#E8D9C8] mb-8 font-medium leading-relaxed">
            Hãy điền mật khẩu viết liền, chữ viết thường để mở cuốn nhật ký.
          </p>
          
          <form onSubmit={handleUnlockPage} className="space-y-4">
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-orange-500 transition-colors" />
              <Input 
                type="password"
                placeholder="Nhập mật khẩu..."
                value={pagePassword}
                onChange={e => setPagePassword(e.target.value)}
                autoFocus
                className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white text-lg placeholder:text-white/20 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
              />
            </div>
            <Button 
              type="submit"
              className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-xl shadow-orange-500/20 transition-all active:scale-95"
            >
              Mở Khóa Kỷ Niệm
            </Button>
            <Link href="/" className="inline-block pt-4 text-white/40 hover:text-white text-sm font-bold transition-colors">
              <ArrowLeft className="w-4 h-4 inline mr-2" /> Quay lại trang chủ
            </Link>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-200 py-12 md:py-20 relative overflow-hidden font-sans bg-[#2C1810]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gentle-breeze {
          0%   { transform: scale(1.02) translate(0,0) rotate(0deg); }
          33%  { transform: scale(1.04) translate(-0.5%,0.5%) rotate(0.2deg); }
          66%  { transform: scale(1.01) translate(0.5%,-0.5%) rotate(-0.2deg); }
          100% { transform: scale(1.02) translate(0,0) rotate(0deg); }
        }
        .animate-bg { animation: gentle-breeze 40s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2C1810; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E67E22; border-radius: 10px; border: 2px solid #2C1810;
        }
        .scrapbook-content img {
          max-width: 100%;
          max-height: 75vh;
          width: auto;
          height: auto;
          border-radius: 20px;
          margin: 2.5rem auto;
          display: block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.4s ease;
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .scrapbook-content img:hover {
          transform: scale(1.03);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-scrollbar::-webkit-scrollbar { width: 8px; }
        .modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #E8D9C8; border-radius: 10px; border: 2px solid #FDFBF7;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: #D4A373; }
        .collapse-wrapper { overflow: hidden; }
      `}} />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/default-memory.png')] bg-cover bg-center bg-no-repeat opacity-80 animate-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#2C1810]/40 to-[#2C1810]/80 backdrop-blur-[1px]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 text-center space-y-5"
        >
          <div className="inline-flex items-center justify-center p-4 bg-[#E67E22]/20 rounded-3xl mb-4 ring-1 ring-[#E67E22]/40 shadow-2xl backdrop-blur-md">
            <Sparkles className="w-10 h-10 text-[#F4D03F]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-[900] text-[#FFF4E6] tracking-tight"
              style={{ textShadow: "0 4px 18px rgba(0,0,0,0.45)" }}>
            Kỷ Niệm Của Tôi
          </h1>
          <p className="text-[#F6E6D3]/95 max-w-2xl mx-auto text-xl md:text-2xl font-medium leading-relaxed drop-shadow-lg">
            Nơi lưu giữ những khoảnh khắc đẹp, những chuyến đi và những cột mốc đáng nhớ trong cuộc sống.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="rounded-full bg-[#E67E22]/10 hover:bg-[#E67E22]/20 text-[#FFF4E6] border border-[#E67E22]/30 gap-2 px-8 h-12 text-lg font-bold">
                <ArrowLeft className="w-5 h-5" /> Home
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={() => { 
                localStorage.removeItem("memories_page_unlocked"); 
                toast.success("Đăng xuất khỏi trang kỷ niệm thành công!");
                router.push("/");
              }}
              className="rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 gap-2 px-8 h-12 text-lg font-bold"
            >
              <LogOut className="w-5 h-5" /> Đăng xuất
            </Button>
          </div>
        </motion.div>

        {/* --- Timeline --- */}
        <div className="relative pl-4 md:pl-12">
          <div className="absolute left-[27px] md:left-[59px] top-4 bottom-0 w-1.5 bg-gradient-to-b from-[#FFE0B2]/45 via-[#E67E22]/30 to-transparent rounded-full" />

          {loading ? (
            <div className="text-center py-24 text-[#FFE0B2] font-black text-2xl animate-pulse">
              ĐANG MỞ NHẬT KÝ...
            </div>
          ) : (
            <div className="space-y-20">
              {years.map(year => {
                const yKey = `${year}`, yearOpen = !collapsedYears[yKey]
                const months = Object.keys(grouped[year]).map(Number).sort((a,b) => a-b)
                return (
                  <div key={year} className="relative">
                    <button className="flex items-center gap-8 mb-10 w-full text-left group focus:outline-none" onClick={() => toggle(setCollapsedYears, yKey)}>
                      <motion.div animate={{ rotate: yearOpen ? 0 : -90 }} className="relative z-10 w-16 h-16 rounded-[28px] bg-gradient-to-br from-[#E67E22] to-[#C76B1C] flex items-center justify-center shadow-2xl ring-4 ring-[#2C1810] shrink-0">
                        <ChevronDown className="w-8 h-8 text-[#FFF7ED]" />
                      </motion.div>
                      <h2 className="text-6xl md:text-7xl font-[900] text-[#FFE0B2] tracking-tighter" style={{ textShadow: "0 3px 12px rgba(0,0,0,0.4)" }}>{year}</h2>
                    </button>

                    <AnimatePresence initial={false}>
                      {yearOpen && (
                        <motion.div variants={collapseVariants} initial="closed" animate="open" exit="closed" className="collapse-wrapper space-y-14 pl-6 md:pl-24">
                          {months.map(month => {
                            const mKey = `${year}-${month}`, monthOpen = !collapsedMonths[mKey]
                            const days = Object.keys(grouped[year][month]).map(Number).sort((a,b) => a-b)
                            return (
                              <div key={mKey} className="relative">
                                <div className="absolute -left-[50px] top-[24px] w-[34px] h-[2px] bg-[#FFE0B2]/25 rounded-full" />
                                <button className="flex items-center gap-5 mb-8 w-full text-left group focus:outline-none" onClick={() => toggle(setCollapsedMonths, mKey)}>
                                  <motion.div animate={{ rotate: monthOpen ? 0 : -90 }} className="relative z-10 w-11 h-11 rounded-2xl bg-[#371E12] flex items-center justify-center ring-2 ring-[#E67E22]/50 border border-white/10 shadow-lg shrink-0">
                                    <ChevronDown className="w-5 h-5 text-[#FFB74D]" />
                                  </motion.div>
                                  <h3 className="text-3xl md:text-4xl font-black text-[#FFE0B2]">{MONTH_NAMES[month - 1]}</h3>
                                </button>

                                <AnimatePresence initial={false}>
                                  {monthOpen && (
                                    <motion.div variants={collapseVariants} initial="closed" animate="open" exit="closed" className="collapse-wrapper space-y-10 pl-3 md:pl-12">
                                      {days.map(day => {
                                        const dKey = `${year}-${month}-${day}`, dayOpen = !collapsedDays[dKey]
                                        const posts = grouped[year][month][day], dayStr = day < 10 ? `0${day}` : `${day}`
                                        return (
                                          <div key={dKey} className="relative">
                                            <div className="absolute -left-[38px] top-[19px] w-[26px] h-[2px] bg-[#FFE0B2]/15 rounded-full" />
                                            <button className="flex items-center gap-4 mb-5 w-full text-left focus:outline-none" onClick={() => toggle(setCollapsedDays, dKey)}>
                                              <motion.div animate={{ rotate: dayOpen ? 0 : -90 }} className="relative z-10 w-9 h-9 rounded-xl bg-[#2C1810] flex items-center justify-center ring-1 ring-[#FFB74D]/40 border border-white/8 shadow-md">
                                                <ChevronDown className="w-4 h-4 text-[#FFB74D]" />
                                              </motion.div>
                                              <span className="text-xl md:text-2xl font-black text-[#FFF4E6]">{dayStr} tháng {month}</span>
                                            </button>

                                            <AnimatePresence initial={false}>
                                              {dayOpen && (
                                                <motion.div variants={collapseVariants} initial="closed" animate="open" exit="closed" className="collapse-wrapper space-y-[14px] pl-2 md:pl-10">
                                                  {posts.map((post, idx) => (
                                                    <motion.div key={post.id} variants={itemVariants} initial="closed" animate="open" exit="closed" transition={{ delay: idx * 0.04 }} className="relative group" whileHover={{ x: 8 }}>
                                                      <div className="absolute -left-[32px] top-[16px] w-3.5 h-3.5 rounded-full bg-[#FFB74D] border-[3px] border-[#2C1810] z-10 shadow-md" />
                                                      <div className="flex items-center gap-[18px] bg-[#371E12]/72 backdrop-blur-[10px] border border-white/10 rounded-[26px] p-[18px] pr-5 cursor-pointer min-h-[120px] group/card" style={{ maxWidth: "min(100%, 900px)" }} onClick={() => handleOpenMemory(post)}>
                                                        <div className="w-[92px] h-[92px] rounded-[20px] overflow-hidden shrink-0 border border-white/10 relative">
                                                          <img src={post.background_image || "/assets/default-memory.png"} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.06]" alt="Memory" />
                                                          <div className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 ${post.password ? 'bg-orange-500/60' : 'bg-blue-500/60'}`}>
                                                            {post.password ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                                          </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                          <h4 className="text-xl md:text-[22px] font-[800] text-[#FFF4E6] truncate mb-1.5 group-hover/card:text-[#F4D03F]">{post.title || "Kỷ niệm không tên"}</h4>
                                                          <div className="text-[15px] text-[#E8D9C8] font-medium leading-[1.6] opacity-85 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }} />
                                                        </div>
                                                        <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center border shrink-0 transition-all ${post.password ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                                          {post.password ? <Lock className="w-[22px] h-[22px]" /> : <Globe className="w-[22px] h-[22px]" />}
                                                        </div>
                                                      </div>
                                                    </motion.div>
                                                  ))}
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        )
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- Individual Memory Password Unlock Modal --- */}
      <Dialog open={!!memoryToUnlock} onOpenChange={open => !open && setMemoryToUnlock(null)}>
        <DialogContent className="max-w-md w-[90vw] p-10 rounded-[40px] border-none shadow-2xl bg-[#FFF8F0] text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E67E22]/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#E67E22]/10 flex items-center justify-center mx-auto mb-6">
              <Unlock className="w-8 h-8 text-[#E67E22]" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#2C1810] mb-3">Kỷ niệm này đã được khóa</DialogTitle>
            <p className="text-[#3A2A20]/70 mb-8 font-medium leading-relaxed">Vui lòng nhập mật khẩu riêng để mở khóa nội dung chi tiết của kỷ niệm này.</p>
            
            <form onSubmit={handleUnlockMemory} className="space-y-4">
              <Input 
                type="password"
                placeholder="Nhập mật khẩu kỷ niệm..."
                value={tempMemoryPassword}
                onChange={e => setTempMemoryPassword(e.target.value)}
                autoFocus
                className="h-12 rounded-2xl border-[#E67E22]/20 bg-white text-slate-900 focus:ring-[#E67E22] focus:border-[#E67E22] font-bold text-center"
              />
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setMemoryToUnlock(null)} className="flex-1 h-12 rounded-2xl font-bold text-slate-500">Hủy</Button>
                <Button type="submit" className="flex-1 h-12 rounded-2xl bg-[#E67E22] hover:bg-[#C76B1C] text-white font-black shadow-lg">Mở Khóa</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Detail Modal --- */}
      <Dialog open={!!selectedMemory} onOpenChange={open => !open && setSelectedMemory(null)}>
        <DialogContent showCloseButton={false} className="max-w-[1200px] w-[92vw] h-[92vh] p-0 rounded-[40px] overflow-y-auto border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.2)] bg-[#FDFBF7] custom-scrollbar">
          {selectedMemory && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE }} className="flex flex-col min-h-full relative">
              
              <div className="relative h-[400px] md:h-[520px] w-full shrink-0">
                <img src={selectedMemory.background_image || "/assets/default-memory.png"} className="w-full h-full object-cover" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/25" />
                
                {/* Close Button */}
                <button onClick={() => setSelectedMemory(null)} className="absolute top-8 right-8 w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-[#E67E22] z-50 border border-white/30 transition-colors">
                  <X className="w-7 h-7" />
                </button>
                
                <div className="absolute bottom-0 left-0 w-full p-10 md:p-16">
                  <div className="max-w-[900px] mx-auto">
                    <div className="flex items-center gap-4 text-[#E67E22] font-black uppercase tracking-[3px] text-base mb-5 bg-white shadow-xl w-fit px-6 py-2 rounded-full">
                      <CalendarDays className="w-5 h-5" />
                      {new Date(selectedMemory.post_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <DialogTitle className="text-5xl md:text-7xl font-[900] text-[#2C1810] leading-[1.05] tracking-tight">
                      {selectedMemory.title || "Ký ức đáng nhớ"}
                    </DialogTitle>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-8 md:px-16 py-16 md:py-24 bg-[#FDFBF7]">
                <div className="max-w-[850px] mx-auto scrapbook-content">
                  <div className="text-[16px] md:text-[18px] text-[#5A4A40] leading-[1.7] font-medium" dangerouslySetInnerHTML={{ __html: selectedMemory.content }} />
                  
                  <div className="mt-20 pt-10 border-t border-[#8C6B5D]/20 flex flex-col items-center gap-4 opacity-70">
                    <div className="flex gap-3">
                      <Heart className="w-6 h-6 text-[#D4A373] fill-[#D4A373]" />
                      <Sparkles className="w-6 h-6 text-[#D4A373]" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[3px] text-[#8C6B5D]">Lưu Giữ Kỷ Niệm</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
