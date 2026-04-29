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
    // 1. Theo dõi Online Realtime bằng Presence
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user',
        },
      },
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

    // 2. Lấy thống kê từ Database
    const fetchStats = async () => {
      if (!sessionStorage.getItem('visited')) {
        await supabase.from('visitor_logs').insert([{}])
        sessionStorage.setItem('visited', 'true')
      }

      const { count: total } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const { count: today } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const { count: month } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())

      setStats(prev => ({
        ...prev,
        today: today || 0,
        month: month || 0,
        total: total || 0
      }))
    }

    fetchStats()

    // Đóng khi click ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (variant === "floating") {
    return (
      <div 
        ref={cardRef}
        className={cn(
          "fixed top-6 left-6 z-[150] transition-all duration-500 ease-out",
          isExpanded ? "w-64" : "w-auto"
        )}
      >
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full cursor-pointer shadow-2xl transition-all duration-300 hover:border-white/20 active:scale-95",
            isExpanded ? "rounded-3xl p-6" : "px-4 h-12 flex items-center gap-3"
          )}
        >
          {/* Collapsed View */}
          {!isExpanded ? (
            <>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Online</span>
                <span className="text-sm font-black text-emerald-400 leading-none">{stats.online}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
            </>
          ) : (
            /* Expanded View */
            <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-widest italic">Thống kê truy cập</span>
                </div>
                <ChevronUp className="w-4 h-4 text-white/30" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Đang Online</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{stats.online}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Hôm nay</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats.today.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Tháng này</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats.month.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Tổng cộng</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* ... (phần inline giữ nguyên) */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Globe className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">Online</span>
        </div>
        <span className="text-2xl font-black text-white leading-none">{stats.online}</span>
      </div>
      
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-blue-400 mb-1">
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Hôm nay</span>
        </div>
        <span className="text-2xl font-black text-white leading-none">{stats.today.toLocaleString()}</span>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-purple-400 mb-1">
          <CalendarDays className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Tháng này</span>
        </div>
        <span className="text-2xl font-black text-white leading-none">{stats.month.toLocaleString()}</span>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-orange-400 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Tổng cộng</span>
        </div>
        <span className="text-2xl font-black text-white leading-none">{stats.total.toLocaleString()}</span>
      </div>
    </div>
  )
}
