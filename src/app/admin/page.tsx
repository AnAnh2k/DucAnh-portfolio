"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Newspaper, FileText, Image as ImageIcon, MessageSquare,
  Plus, Settings,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ projects: 0, contacts: 0 })
  const [latest, setLatest] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      const { count: p } = await supabase.from("projects").select("*", { count: "exact", head: true })
      const { count: c } = await supabase.from("contacts").select("*", { count: "exact", head: true })
      setStats({ projects: p || 0, contacts: c || 0 })
      const { data } = await supabase.from("projects").select("id,title,created_at,image_url").order("created_at", { ascending: false }).limit(6)
      if (data) setLatest(data)
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
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ACTIVITY LIST */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#f3f4f6" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff" }}>
                <Settings className="w-4 h-4" style={{ color: "#3b82f6" }} />
              </div>
              <span className="text-[15px] font-bold" style={{ color: "#111827" }}>Hoạt động mới nhất</span>
            </div>
            <button
              onClick={() => router.push("/admin/projects")}
              className="text-[13px] font-bold transition-colors hover:opacity-70"
              style={{ color: "#3b82f6" }}
            >
              Xem tất cả
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: "#f9fafb" }}>
            {latest.length === 0 ? (
              <p className="py-14 text-center text-[13px]" style={{ color: "#9ca3af" }}>Chưa có hoạt động nào.</p>
            ) : latest.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 cursor-pointer group hover:bg-[#f9fafb] transition-colors">
                <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: "#e5e7eb" }}>
                  {item.image_url
                    ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-100" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold uppercase truncate group-hover:text-blue-600 transition-colors" style={{ color: "#1f2937" }}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider" style={{ background: "#eff6ff", color: "#3b82f6" }}>
                      DỰ ÁN MỚI
                    </span>
                    <span className="text-[11px]" style={{ color: "#9ca3af" }}>
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <Settings className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-[260px] space-y-4 shrink-0">

          {/* Quick Actions — blue */}
          <div className="rounded-2xl p-5 shadow-md" style={{ background: "#2563eb" }}>
            <p className="text-[14px] font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-white" />
              </span>
              Thao tác nhanh
            </p>
            {[
              { label: "Đăng dự án mới",      url: "/admin/projects", icon: Plus },
              { label: "Xem tin nhắn khách",   url: "/admin/messages", icon: MessageSquare },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => router.push(btn.url)}
                className="w-full flex items-center gap-3 p-3 rounded-xl mb-2 last:mb-0 transition-colors text-left font-semibold text-[13px] text-white"
                style={{ background: "rgba(255,255,255,0.15)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              >
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <btn.icon className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
                </div>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Guidelines — white */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: "#6b7280" }}>Hướng Dẫn</p>
            <p className="text-[13px] italic leading-relaxed" style={{ color: "#6b7280" }}>
              "Để bảo vệ uy tín thương hiệu cá nhân, mọi nội dung dự án cần được kiểm duyệt chính xác trước khi xuất bản."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
