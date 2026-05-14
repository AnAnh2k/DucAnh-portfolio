"use client"
import * as React from "react"
import {
  LayoutDashboard, FolderKanban, MessageSquare,
  LogOut, Briefcase, ChevronRight, CalendarDays
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar"
import { ConfirmModal } from "@/components/ui/confirm-modal"

/* ── DESIGN TOKENS ─────────────────────────────────────── */
const SIDEBAR_BG  = "#1e293b"
const TEXT_MENU   = "#8c9db5"
const HIGHLIGHT   = "#155dfc"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router   = useRouter()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    const fetchUnread = async () => {
      // Đếm số tin nhắn chưa đọc (is_read = false)
      const { count } = await supabase
        .from("contacts")
        .select("*", { count: 'exact', head: true })
        .eq("is_read", false)
      
      setUnreadCount(count || 0)
    }

    fetchUnread()
    
    // Lắng nghe event tự định nghĩa từ MessagesPage
    const handleManualRefresh = () => fetchUnread()
    window.addEventListener('unread-count-changed', handleManualRefresh)

    // Lắng nghe thay đổi realtime để cập nhật số lượng
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        fetchUnread()
      })
      .subscribe()

    return () => {
      window.removeEventListener('unread-count-changed', handleManualRefresh)
      supabase.removeChannel(channel)
    }
  }, [])

  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const menuItems = [
    { title: "Tổng quan",           icon: LayoutDashboard, url: "/admin" },
    { title: "Dự án cá nhân",       icon: FolderKanban,    url: "/admin/projects" },
    { title: "Nhật ký (Memories)",  icon: CalendarDays,    url: "/admin/memories" },
    { title: "Tin nhắn",            icon: MessageSquare,   url: "/admin/messages", badge: unreadCount },
  ]

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-none"
        style={{ "--sidebar": SIDEBAR_BG } as React.CSSProperties}
        {...props}
      >
        {/* ... (existing Sidebar content) ... */}
        <SidebarHeader
          className="h-16 flex flex-row items-center justify-start p-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 overflow-hidden pl-7">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: HIGHLIGHT }}
            >
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span
              className="group-data-[collapsible=icon]:hidden font-bold text-white uppercase"
              style={{ fontSize: "17px", letterSpacing: "1.5px" }}
            >
              Quản Trị
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-4">
          <SidebarMenu className="space-y-[2px]">
            {menuItems.map((item) => {
              const active = pathname === item.url
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    onClick={() => router.push(item.url)}
                    className="h-11 rounded-lg transition-all duration-150"
                    style={
                      active
                        ? { background: HIGHLIGHT, color: "#ffffff" }
                        : { background: "transparent", color: TEXT_MENU }
                    }
                  >
                    <div className="flex items-center gap-3 w-full px-3 cursor-pointer">
                      <item.icon className="w-[17px] h-[17px] shrink-0" />
                      <span className="flex-1 text-[13.5px] font-bold leading-none truncate">
                        {item.title}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {active && !item.badge && (
                        <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter
          className="p-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[13px]"
                style={{ background: HIGHLIGHT }}
              >
                A
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden truncate">
                <span className="text-[13px] font-semibold text-white truncate">
                  An Đức Anh
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold"
                  style={{ color: TEXT_MENU }}
                >
                  Quản trị viên
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: TEXT_MENU }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MENU)}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <ConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn rời khỏi hệ thống quản trị không?"
        type="info"
        icon="logout"
        confirmText="Đăng xuất ngay"
        cancelText="Ở lại"
      />
    </>
  )
}
