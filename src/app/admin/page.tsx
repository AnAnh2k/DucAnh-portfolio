"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Newspaper, FileText, Image as ImageIcon, MessageSquare,
  Plus, Settings, TrendingUp, Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { VisitorStatsCard } from "@/components/visitor-stats"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ projects: 0, contacts: 0 })
  const [latest, setLatest] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      // Basic counts
      const { count: p } = await supabase.from("projects").select("*", { count: "exact", head: true })
      const { count: c } = await supabase.from("contacts").select("*", { count: "exact", head: true })
      setStats({ projects: p || 0, contacts: c || 0 })
      
      // Latest projects
      const { data } = await supabase.from("projects").select("id,title,created_at,image_url").order("created_at", { ascending: false }).limit(6)
      if (data) setLatest(data)

      // Fetch daily visits for chart
      const { data: logs, error: logError } = await supabase
        .from("visitor_logs")
        .select("created_at")
      
      if (logError) {
        console.error("Error fetching logs:", logError)
        return
      }

      if (logs && logs.length > 0) {
        const counts: Record<string, number> = {}
        
        // Tạo dữ liệu cho 7 ngày gần nhất (bao gồm cả những ngày có 0 lượt truy cập)
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
          counts[dateStr] = 0
        }

        // Đổ dữ liệu thực tế vào
        logs.forEach(log => {
          const date = new Date(log.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
          if (counts[date] !== undefined) {
            counts[date] += 1
          }
        })
        
        const formatted = Object.entries(counts).map(([name, visits]) => ({ name, visits }))
        setChartData(formatted)
      } else {
        // Mặc định 0 cho 7 ngày nếu hoàn toàn chưa có log
        const emptyData = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          emptyData.push({
            name: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            visits: 0
          })
        }
        setChartData(emptyData)
      }
    })()
  }, [])

  const cards = [
    { key: "bv",  label: "BÀI VIẾT",     sub: "Dự án",   num: stats.projects, color: "#2563eb", icon: Newspaper,    trend: `↗ +${stats.projects} tuần này` },
    { key: "vb",  label: "VĂN BẢN",      sub: "Liên hệ", num: stats.contacts, color: "#10b981", icon: FileText,     trend: `↗ +${stats.contacts} hôm nay`  },
    { key: "bda", label: "BĂNG ĐĨA/ẢNH", sub: "Media",   num: stats.projects, color: "#f97316", icon: ImageIcon,    trend: "↗ Ổn định"                       },
    { key: "pf",  label: "PHẢN HỒI",     sub: "Inbox",   num: stats.contacts, color: "#ef4444", icon: MessageSquare,trend: `↗ Cần xử lý: ${stats.contacts}`  },
  ]

  return (
    /* Nền xám nhạt toàn trang */
    <div className="space-y-6 animate-in fade-in duration-300" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── 4 STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.key} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
            {/* icon left  +  labels right */}
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                style={{ background: c.color }}
              >
                <c.icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#9ca3af" }}>{c.label}</p>
                <p className="text-[13px] font-semibold" style={{ color: "#6b7280" }}>{c.sub}</p>
              </div>
            </div>
            {/* number + trend */}
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black leading-none" style={{ color: "#111827" }}>{c.num}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#ecfdf5", color: "#059669" }}>
                {c.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN ROW ── */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* LEFT: CHART & ACTIVITY */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* VISITOR CHART */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Biểu đồ truy cập</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Thống kê 7 ngày gần nhất</p>
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{fontWeight: 800, color: '#1e293b'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVITY LIST */}
          <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Hoạt động mới nhất</span>
              </div>
              <button
                onClick={() => router.push("/admin/projects")}
                className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
              >
                Xem tất cả
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {latest.length === 0 ? (
                <p className="py-20 text-center text-sm font-medium text-slate-400 italic">Chưa có hoạt động nào mới.</p>
              ) : latest.map((item) => (
                <div key={item.id} className="flex items-center gap-6 px-8 py-5 cursor-pointer group hover:bg-slate-50/50 transition-all">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                    {item.image_url
                      ? <img src={item.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><ImageIcon className="w-5 h-5" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 uppercase truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider bg-blue-100 text-blue-600 uppercase">
                        DỰ ÁN MỚI
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <Settings className="w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: STATS & QUICK ACTIONS */}
        <div className="w-full xl:w-[320px] space-y-6 shrink-0">
          
          {/* THE REQUESTED STATS CARD */}
          <VisitorStatsCard />

          {/* Quick Actions — blue */}
          <div className="rounded-[2rem] p-8 shadow-xl shadow-blue-500/10 bg-gradient-to-br from-blue-600 to-indigo-700">
            <p className="text-sm font-black text-white flex items-center gap-2 mb-6 uppercase tracking-widest">
              <Plus className="w-4 h-4" /> Thao tác nhanh
            </p>
            <div className="space-y-3">
              {[
                { label: "Đăng dự án mới",      url: "/admin/projects", icon: Plus },
                { label: "Xem tin nhắn khách",   url: "/admin/messages", icon: MessageSquare },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => router.push(btn.url)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left font-black text-xs text-white bg-white/10 hover:bg-white/20 border border-white/5 active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-lg">
                    <btn.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  {btn.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines — white */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4 text-slate-400">Hướng Dẫn</p>
            <p className="text-sm italic leading-relaxed text-slate-500 font-medium">
              "Hãy thường xuyên kiểm tra hòm thư để không bỏ lỡ những cơ hội hợp tác quan trọng."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
