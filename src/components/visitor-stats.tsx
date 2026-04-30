"use client"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Users, BarChart3, CalendarDays, Globe, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisitorStatsCard({ variant = "inline" }: { variant?: "inline" | "floating" }) {
  const [stats, setStats] = useState({
    online: 1,
    today: 0,
    month: 0,
    total: 0
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!supabase) return

    // 1. Theo dõi Online Realtime
    const channel = supabase.channel('online-users', {
      config: { presence: { key: 'user' } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const count = Object.keys(newState).length
        setStats(prev => ({ ...prev, online: count > 0 ? count : 1 }))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    // 2. Thống kê dữ liệu
    const fetchStats = async () => {
      try {
        // Ghi nhận truy cập mới
        if (!sessionStorage.getItem('visited')) {
          const { error: insErr } = await supabase.from('visitors').insert([{ user_agent: navigator.userAgent }])
          if (!insErr) {
            sessionStorage.setItem('visited', 'true')
          } else {
            console.warn("Insert visitor failed (Check RLS):", insErr.message)
          }
        }

        // Tính toán thời gian theo giờ Việt Nam (GMT+7)
        const now = new Date()
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
        
        // Bắt đầu ngày hôm nay (00:00:00 GMT+7)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        
        // Bắt đầu tháng này
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // Lấy Tổng cộng
        const { count: total } = await supabase.from('visitors').select('*', { count: 'exact', head: true })

        // Lấy Hôm nay
        const { count: today } = await supabase.from('visitors').select('*', { count: 'exact', head: true }).gte('created_at', todayStart)

        // Lấy Tháng này
        const { count: month } = await supabase.from('visitors').select('*', { count: 'exact', head: true }).gte('created_at', monthStart)

        setStats(prev => ({
          ...prev,
          total: total || 0,
          today: today || 0,
          month: month || 0
        }))
      } catch (err) {
        console.error("Stats Error:", err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Cập nhật mỗi 30s

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setIsExpanded(false)
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (variant === "floating") {
    return (
      <div ref={cardRef} className={cn("fixed top-6 left-6 z-[150] transition-all duration-500", isExpanded ? "w-64" : "w-auto")}>
        <div onClick={() => setIsExpanded(!isExpanded)} className={cn("bg-slate-900/90 backdrop-blur-xl border border-white/10 cursor-pointer shadow-2xl transition-all", isExpanded ? "rounded-3xl p-6" : "px-4 h-12 rounded-full flex items-center gap-3")}>
          {!isExpanded ? (
            <>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Online</span>
              <span className="text-sm font-black text-emerald-400">{stats.online}</span>
              <ChevronDown className="w-3 h-3 text-white/20" />
            </>
          ) : (
            <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-widest italic tracking-tighter">Live Traffic</span>
                </div>
                <ChevronUp className="w-4 h-4 text-white/30" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <StatItem icon={<Globe className="text-emerald-400" />} label="Đang Online" value={stats.online} color="text-emerald-400" />
                <StatItem icon={<BarChart3 className="text-blue-400" />} label="Hôm nay" value={stats.today} />
                <StatItem icon={<CalendarDays className="text-purple-400" />} label="Tháng này" value={stats.month} />
                <StatItem icon={<Users className="text-orange-400" />} label="Tổng lượt xem" value={stats.total.toLocaleString()} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">Online</span>
        </div>
        <span className="text-2xl font-black text-white">{stats.online}</span>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
        <div className="flex items-center gap-2 text-blue-400 mb-1">
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">Hôm nay</span>
        </div>
        <span className="text-2xl font-black text-white">{stats.today}</span>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
        <div className="flex items-center gap-2 text-purple-400 mb-1">
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">Tháng này</span>
        </div>
        <span className="text-2xl font-black text-white">{stats.month}</span>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
        <div className="flex items-center gap-2 text-orange-400 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">Tổng cộng</span>
        </div>
        <span className="text-2xl font-black text-white">{stats.total.toLocaleString()}</span>
      </div>
    </div>
  )
}

function StatItem({ icon, label, value, color = "text-white" }: any) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 flex items-center justify-center">{icon}</div>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">{label}</span>
      </div>
      <span className={cn("text-sm font-black", color)}>{value}</span>
    </div>
  )
}
