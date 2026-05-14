"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"

const PAGE_LABELS: Record<string, string> = {
  "/admin": "Tổng Quan",
  "/admin/projects": "Dự Án",
  "/admin/memories": "Nhật Ký",
  "/admin/messages": "Tin Nhắn",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [isApiLoading, setIsApiLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleLoading = (e: any) => setIsApiLoading(e.detail)
    window.addEventListener('api-loading' as any, handleLoading)
    return () => window.removeEventListener('api-loading' as any, handleLoading)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== "/admin/login") router.push("/admin/login")
      else if (session && pathname === "/admin/login") router.push("/admin")
      setLoading(false)
    })
  }, [pathname, router])

  // Override body background + lock page scroll for admin layout
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor
    const prevBgImg = document.body.style.backgroundImage
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow

    document.body.style.backgroundColor = "#f5f6fa"
    document.body.style.backgroundImage = "none"
    document.body.style.overflow = "hidden"
    document.body.style.height = "100%"
    document.documentElement.style.overflow = "hidden"
    document.documentElement.style.height = "100%"

    return () => {
      document.body.style.backgroundColor = prevBg
      document.body.style.backgroundImage = prevBgImg
      document.body.style.overflow = prevBodyOverflow
      document.body.style.height = ""
      document.documentElement.style.overflow = prevHtmlOverflow
      document.documentElement.style.height = ""
    }
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-slate-400 text-sm"
      style={{ background: "#1e3a5f" }}>
      Đang kiểm tra bảo mật…
    </div>
  )

  if (pathname === "/admin/login") return <>{children}</>

  const pageLabel = PAGE_LABELS[pathname] ?? "Trang"

  return (
    <SidebarProvider className="h-dvh overflow-hidden relative">
      {/* API Progress Bar */}
      <div 
        className={`fixed top-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 z-[9999] transition-all duration-500 ease-out ${isApiLoading ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
      />
      <AppSidebar />

      <SidebarInset
        style={{ background: "#f5f6fa" }}
        className="flex h-dvh min-w-0 flex-col overflow-hidden"
      >
        {/* ── MOTIVATIONAL MARQUEE ── */}
        {/* ... (marquee code) ... */}
        <div className="w-full h-7 flex items-center relative z-[60] overflow-hidden whitespace-nowrap bg-transparent shrink-0">
          <div className="animate-marquee inline-block">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mx-4">
              🔥 QUYẾT TÂM 2026: Nghiện học, tham làm, kiếm tiền cưới vợ, mua nhà, mua xe, báo hiếu bố mẹ!
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mx-4">
              🚀 Kỷ luật là sức mạnh - Kiên trì là thành công - Không bao giờ bỏ cuộc!
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 mx-4">
              💪 Mỗi dòng code hôm nay là một bước tiến tới tương lai rực rỡ!
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 mx-4">
              ✨ Thành công không dành cho những kẻ lười biếng - Hãy chiến đấu vì ước mơ của bạn!
            </span>
            {/* Duplicate for seamless loop */}
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mx-4">
              🔥 QUYẾT TÂM 2026: Nghiện học, tham làm, kiếm tiền cưới vợ, mua nhà, mua xe, báo hiếu bố mẹ!
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mx-4">
              🚀 Kỷ luật là sức mạnh - Kiên trì là thành công - Không bao giờ bỏ cuộc!
            </span>
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <header
          className="flex h-12 shrink-0 items-center gap-3 px-6 sticky top-0 z-50 border-b w-full"
          style={{ background: "#ffffff", borderColor: "#e8eaf0" }}
        >
          <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
          <div className="w-px h-5 bg-slate-200 mx-1" />

          <nav className="flex items-center gap-1.5 text-[13px]">
            <span className="text-slate-400 font-medium">Hệ thống</span>
            <span className="text-slate-300 font-bold">›</span>
            <span className="font-bold text-slate-800">{pageLabel}</span>
          </nav>

          <div className="ml-auto flex items-center gap-6">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-[13px] font-bold text-slate-800">
                {new Date().toLocaleDateString("vi-VN")}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                An Đức Anh Portfolio
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              className="text-[13px] font-black uppercase tracking-widest transition-colors"
              style={{ color: "#3b82f6" }}
            >
              XEM WEBSITE →
            </a>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="mx-auto flex-1 min-h-0 w-full max-w-[1440px] min-w-0 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </SidebarInset>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </SidebarProvider>
  )
}
