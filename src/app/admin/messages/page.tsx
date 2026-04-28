"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { 
  MessageSquare, Mail, User, Clock, Trash2, 
  CheckCircle2, Circle, Search, Eye, 
  Phone, MapPin, Send, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    window.dispatchEvent(new CustomEvent('api-loading', { detail: true }))
    const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })
    if (data) setContacts(data)
    setLoading(false)
    window.dispatchEvent(new CustomEvent('api-loading', { detail: false }))
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Xóa tin nhắn này?")) return
    window.dispatchEvent(new CustomEvent('api-loading', { detail: true }))
    const { error } = await supabase.from("contacts").delete().eq("id", id)
    if (error) {
      toast.error("Lỗi: " + error.message)
      window.dispatchEvent(new CustomEvent('api-loading', { detail: false }))
    } else {
      toast.success("Đã xóa tin nhắn")
      if (selectedId === id) setSelectedId(null)
      fetchMessages()
    }
  }

  const handleToggleRead = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('api-loading', { detail: true }))
    const { error } = await supabase
      .from("contacts")
      .update({ is_read: !currentStatus })
      .eq("id", id)
    
    if (error) {
      console.error("Supabase Error:", error)
      toast.error("Lỗi: " + error.message)
      window.dispatchEvent(new CustomEvent('api-loading', { detail: false }))
    } else {
      toast.success(currentStatus ? "Đã đánh dấu là chưa đọc" : "Đã đánh dấu là đã đọc")
      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new Event('unread-count-changed'))
      fetchMessages()
    }
  }

  const selectedMessage = contacts.find(c => c.id === selectedId)
  
  const filteredMessages = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Hòm thư tin nhắn</h1>
        <p className="text-slate-500 font-medium">Tin nhắn bạn bè gửi cho bạn qua Portfolio.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Column: 30% */}
        <div className="w-[30%] flex flex-col gap-4 min-h-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Tìm theo tên người gửi hoặc chủ đề..." 
              className="pl-11 h-12 bg-white border-none shadow-sm rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 pb-4">
            {loading ? (
              <div className="text-center py-20 text-slate-400 font-medium text-sm">Đang tải tin nhắn...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center">
                 <p className="text-slate-400 font-medium italic text-xs">Hòm thư hiện đang trống.</p>
              </div>
            ) : (
              filteredMessages.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "group relative bg-white p-5 rounded-xl cursor-pointer transition-all border-l-4",
                    selectedId === c.id 
                      ? (c.is_read ? "border-emerald-500 shadow-md translate-x-1" : "border-blue-500 shadow-md translate-x-1")
                      : "border-transparent shadow-sm hover:border-blue-200",
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                      c.is_read ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {c.is_read ? "ĐÃ ĐỌC" : "CHƯA XEM"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{c.name}</h4>
                  <p className="text-[13px] text-slate-500 line-clamp-1 font-medium italic">
                    {c.name} — {c.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: 70% */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative flex flex-col">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-300">
               {/* Detail Header */}
               <div className="px-10 py-6 border-b border-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedMessage.name}</h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tin nhắn từ Portfolio</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={(e) => handleDelete(e, selectedMessage.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
               </div>

               <div className="flex-1 px-10 py-8 flex flex-col min-h-0">
                  {/* Small Grid Info */}
                  <div className="grid grid-cols-2 gap-y-5 gap-x-12 mb-8">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Người gửi</span>
                      <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                        <User className={cn("w-4 h-4", selectedMessage.is_read ? "text-emerald-500" : "text-blue-500")} /> <span>{selectedMessage.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</span>
                      <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                        <Mail className={cn("w-4 h-4", selectedMessage.is_read ? "text-emerald-500" : "text-blue-500")} /> <span>{selectedMessage.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Large Message Body */}
                  <div className="flex-1 flex flex-col min-h-0 mb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nội dung chi tiết</h3>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-8 border border-slate-100 overflow-y-auto no-scrollbar shadow-inner">
                      <p className="text-lg text-slate-900 leading-relaxed font-bold italic">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-100 transition-all gap-3 border-none"
                      onClick={() => window.location.href = `mailto:${selectedMessage.email}`}
                    >
                      <Mail className="w-5 h-5" /> Trả lời qua Email
                    </Button>
                    <Button 
                      variant="outline"
                      className={cn(
                        "flex-1 h-14 rounded-2xl font-black text-base transition-all border-slate-200 border-2 bg-white text-slate-700 hover:!bg-blue-50 hover:!text-slate-700 gap-3 shadow-sm",
                        selectedMessage.is_read && "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-none hover:!bg-emerald-100 hover:!text-emerald-700"
                      )}
                      onClick={(e) => handleToggleRead(e, selectedMessage.id, selectedMessage.is_read)}
                    >
                      <Check className="w-5 h-5" /> {selectedMessage.is_read ? "Đã đọc" : "Đánh dấu đã đọc"}
                    </Button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
               <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 animate-pulse">
                  <Eye className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-400">Chọn một tin nhắn</h3>
                  <p className="text-slate-300 font-medium max-w-[280px] text-sm">Chọn một phản hồi bên trái để xem chi tiết.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
