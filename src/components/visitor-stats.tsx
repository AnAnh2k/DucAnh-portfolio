"use client"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Users, BarChart3, CalendarDays, Globe, ChevronUp, ChevronDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisitorStatsCard({ variant = "inline" }: { variant?: "inline" | "floating" }) {
  const [stats, setStats] = useState({
    online: 1,
    today: 0,
    month: 0,
    total: 0
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!supabase) {
      setError("Supabase client not initialized")
      return
    }

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
          try {
            await channel.track({ online_at: new Date().toISOString() })
          } catch (e) {
            console.error("Presence tracking error:", e)
          }
        }
      })

    // 2. Lấy thống kê từ Database
    const fetchStats = async () => {
      try {
        // Ghi log truy cập mới (chỉ một lần mỗi session)
        if (!sessionStorage.getItem('visited')) {
          const { error: insertError } = await supabase.from('visitor_logs').insert([{}])
          if (insertError) {
            console.error("Insert error:", insertError)
            // Nếu lỗi RLS, chúng ta vẫn tiếp tục để lấy số liệu cũ
          } else {
            sessionStorage.setItem('visited', 'true')
          }
        }

        // Lấy tổng số truy cập
        const { count: total, error: totalError } = await supabase
          .from('visitor_logs')
          .select('*', { count: 'exact', head: true })

        if (totalError) throw totalError

        // Lấy số truy cập hôm nay
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const { count: today } = await supabase
          .from('visitor_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString())

        // Lấy số truy cập tháng này
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
        setError(null)
      } catch (err: any) {
        console.error("Visitor stats fetch error:", err)
        setError(err.message || "Failed to fetch stats")
      }
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
            isExpanded ? "rounded-3xl p-6" : "px-4 h-12 flex items-center gap-3",
            error && "border-red-500/50"
          )}
        >
          {/* Collapsed View */}
          {!isExpanded ? (
            <>
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                error ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              )} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {error ? "Error" : "Online"}
                </span>
                <span className={cn(
                  "text-sm font-black leading-none",
                  error ? "text-red-400" : "text-emerald-400"
                )}>
                  {error ? "!" : stats.online}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
            </>
          ) : (
            /* Expanded View */
            <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", error ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                  <span className="text-xs font-black text-white uppercase tracking-widest italic">
                    {error ? "Lỗi kết nối" : "Thống kê truy cập"}
                  </span>
                </div>
                <ChevronUp className="w-4 h-4 text-white/30" />
              </div>

              {error ? (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-300 leading-relaxed">
                    Không thể lấy dữ liệu từ Supabase. Vui lòng kiểm tra RLS Policies và API Keys.
                    <br/>
                    <span className="opacity-50">Lỗi: {error}</span>
                  </p>
                </div>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
