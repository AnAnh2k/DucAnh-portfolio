"use client"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Users, BarChart3, CalendarDays, Globe, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisitorStatsCard({ 
  variant = "inline", 
  stats: propStats 
}: { 
  variant?: "inline" | "floating"
  stats?: { online: number; today: number; month: number; total: number } 
}) {
  const [internalStats, setInternalStats] = useState({ online: 1, today: 0, month: 0, total: 0 })
  const stats = propStats || internalStats
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (propStats) return
    if (!supabase) return

    // 1. Theo dõi Online Realtime với ID duy nhất cho mỗi tab/thiết bị
    const uniqueId = Math.random().toString(36).substring(7)
    
    // Xóa bất kỳ channel nào trùng tên đã đăng ký trước đó để tránh lỗi runtime
    const existing = supabase.getChannels().find(ch => ch.topic === 'realtime:online-users')
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase.channel('online-users', {
      config: { presence: { key: uniqueId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        // Đếm tổng số key duy nhất đang online
        const count = Object.keys(newState).length
        setInternalStats(prev => ({ ...prev, online: count > 0 ? count : 1 }))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    // 2. Cập nhật và lấy số liệu cộng dồn (Single Row)
    const syncStats = async () => {
      try {
        const { data: current } = await supabase.from('visitors').select('*').eq('id', 1).single()
        if (!current) return

        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const currentMonth = now.getMonth() + 1

        if (!sessionStorage.getItem('visited_v3')) {
          const newToday = (current.last_updated_day === todayStr) ? (current.today_count || 0) + 1 : 1
          const newMonth = (current.last_updated_month === currentMonth) ? (current.month_count || 0) + 1 : 1
          const newTotal = (current.total_count || 0) + 1

          await supabase.from('visitors').update({
            total_count: newTotal,
            today_count: newToday,
            month_count: newMonth,
            last_updated_day: todayStr,
            last_updated_month: currentMonth
          }).eq('id', 1)
          
          sessionStorage.setItem('visited_v3', 'true')
          setInternalStats(prev => ({ ...prev, total: newTotal, today: newToday, month: newMonth }))
        } else {
          setInternalStats(prev => ({ ...prev, total: current.total_count, today: current.today_count, month: current.month_count }))
        }
      } catch (err) {
        console.error("Stats Sync Error:", err)
      }
    }

    syncStats()
    const timer = setInterval(syncStats, 10000)

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setIsExpanded(false)
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [propStats])

  if (variant === "floating") {
    return (
      <div ref={cardRef} className={cn("fixed top-6 left-6 z-[150] transition-all duration-500", isExpanded ? "w-64" : "w-auto")}>
        <div onClick={() => setIsExpanded(!isExpanded)} className={cn("bg-slate-900/95 backdrop-blur-xl border border-white/10 cursor-pointer shadow-2xl transition-all", isExpanded ? "rounded-3xl p-6" : "px-4 h-12 rounded-full flex items-center gap-3 shadow-lg")}>
          {!isExpanded ? (
            <>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Online</span>
              <span className="text-sm font-black text-emerald-400">{stats.online}</span>
              <ChevronDown className="w-3 h-3 text-white/20" />
            </>
          ) : (
            <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 font-black text-white uppercase text-[10px] tracking-widest italic tracking-tighter">
                <span>Live Traffic</span>
                <ChevronUp className="w-4 h-4 text-white/30" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <StatItem icon={<Globe className="text-emerald-400 w-4 h-4" />} label="Đang Online" value={stats.online} color="text-emerald-400" />
                <StatItem icon={<BarChart3 className="text-blue-400 w-4 h-4" />} label="Hôm nay" value={stats.today} />
                <StatItem icon={<CalendarDays className="text-purple-400 w-4 h-4" />} label="Tháng này" value={stats.month} />
                <StatItem icon={<Users className="text-orange-400 w-4 h-4" />} label="Tổng lượt xem" value={stats.total.toLocaleString()} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatBox icon={<Globe className="w-4 h-4" />} label="Online" value={stats.online} color="text-emerald-400" />
      <StatBox icon={<BarChart3 className="w-4 h-4" />} label="Hôm nay" value={stats.today} color="text-blue-400" />
      <StatBox icon={<CalendarDays className="w-4 h-4" />} label="Tháng này" value={stats.month} color="text-purple-400" />
      <StatBox icon={<Users className="w-4 h-4" />} label="Tổng" value={stats.total.toLocaleString()} color="text-orange-400" />
    </div>
  )
}

function StatItem({ icon, label, value, color = "text-white" }: any) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">{label}</span>
      </div>
      <span className={cn("text-sm font-black", color)}>{value}</span>
    </div>
  )
}

function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
      <div className={cn("flex items-center gap-2 mb-1", color)}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
  )
}
