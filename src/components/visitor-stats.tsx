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

    // 1. Theo dõi Online Realtime (Presence)
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

    // 2. Logic Cộng dồn số liệu
    const updateAndFetchStats = async () => {
      try {
        // Lấy dữ liệu hiện tại từ hàng ID=1
        const { data: current, error: fetchErr } = await supabase
          .from('visitors')
          .select('*')
          .eq('id', 1)
          .single()

        if (fetchErr || !current) return

        const now = new Date()
        const todayStr = now.toISOString().split('T')[0] // YYYY-MM-DD
        const currentMonth = now.getMonth() + 1

        // Nếu là khách mới trong session này, tiến hành cộng dồn
        if (!sessionStorage.getItem('visited')) {
          let newToday = (current.last_updated_day === todayStr) ? current.today_count + 1 : 1
          let newMonth = (current.last_updated_month === currentMonth) ? current.month_count + 1 : 1
          let newTotal = current.total_count + 1

          await supabase
            .from('visitors')
            .update({
              total_count: newTotal,
              today_count: newToday,
              month_count: newMonth,
              last_updated_day: todayStr,
              last_updated_month: currentMonth
            })
            .eq('id', 1)
          
          sessionStorage.setItem('visited', 'true')
          
          setStats(prev => ({
            ...prev,
            total: newTotal,
            today: newToday,
            month: newMonth
          }))
        } else {
          // Nếu đã đếm rồi, chỉ hiển thị số liệu hiện có
          setStats(prev => ({
            ...prev,
            total: current.total_count,
            today: current.today_count,
            month: current.month_count
          }))
        }
      } catch (err) {
        console.error("Stats Error:", err)
      }
    }

    updateAndFetchStats()
    const interval = setInterval(updateAndFetchStats, 10000) // Cập nhật mỗi 10s

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
        <div onClick={() => setIsExpanded(!isExpanded)} className={cn("bg-slate-900/90 backdrop-blur-xl border border-white/10 cursor-pointer shadow-2xl transition-all", isExpanded ? "rounded-3xl p-6" : "px-4 h-12 rounded-full flex items-center gap-3 shadow-lg")}>
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
        {icon}
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">{label}</span>
      </div>
      <span className={cn("text-sm font-black", color)}>{value}</span>
    </div>
  )
}
