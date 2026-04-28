"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Users, BarChart3, CalendarDays, Globe } from "lucide-react"

export function VisitorStatsCard({ variant = "inline" }: { variant?: "inline" | "floating" }) {
  const [stats, setStats] = useState({
    online: 1,
    today: 0,
    month: 0,
    total: 0
  })

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
      // Ghi log truy cập mới (chỉ một lần mỗi session)
      if (!sessionStorage.getItem('visited')) {
        await supabase.from('visitor_logs').insert([{}])
        sessionStorage.setItem('visited', 'true')
      }

      // Lấy tổng số truy cập
      const { count: total } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })

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
    }

    fetchStats()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (variant === "floating") {
    return (
      <div className="absolute top-10 right-6 z-[50] group hidden lg:block">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/20 w-44 transition-all duration-500 hover:scale-105 hover:border-white/20 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Live Traffic</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Online</span>
              <span className="text-[13px] font-black text-emerald-400 leading-none">{stats.online}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Today</span>
              <span className="text-[13px] font-black text-white/90 leading-none">{stats.today.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Total</span>
              <span className="text-[13px] font-black text-blue-400 leading-none">{stats.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-center bg-slate-50/30">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thống kê truy cập</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500">ĐANG ONLINE</span>
          </div>
          <span className="text-lg font-black text-slate-900">{stats.online}</span>
        </div>
        <div className="space-y-3 px-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Hôm nay</span>
            <span className="text-sm font-black text-slate-800">{stats.today.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng cộng</span>
            <span className="text-sm font-black text-blue-600">{stats.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
