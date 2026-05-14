"use client"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Pencil, 
  Search, 
  FilterX, 
  Eye,
  Calendar,
  Lock,
  ChevronDown,
  BarChart3,
  Clock
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminMemoriesPage() {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<any>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [postDate, setPostDate] = useState("")
  const [content, setContent] = useState("")
  const [password, setPassword] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Filter/Sort states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedDay, setSelectedDay] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, imageUrl: string }>({
    isOpen: false, id: "", imageUrl: ""
  })

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    setLoading(true)
    window.dispatchEvent(new CustomEvent('api-loading', { detail: true }))
    const { data } = await supabase.from("memories").select("*").order("post_date", { ascending: false })
    if (data) setMemories(data)
    setLoading(false)
    window.dispatchEvent(new CustomEvent('api-loading', { detail: false }))
  }

  const resetForm = () => {
    setEditingMemory(null)
    setTitle("")
    setPostDate(new Date().toISOString().split('T')[0])
    setContent("")
    setPassword("")
    setImageFile(null)
  }

  const handleEditClick = (memory: any) => {
    setEditingMemory(memory)
    setTitle(memory.title || "")
    setPostDate(memory.post_date ? new Date(memory.post_date).toISOString().split('T')[0] : "")
    setContent(memory.content || "")
    setPassword(memory.password || "")
    setImageFile(null)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) {
      toast.error("Vui lòng nhập nội dung kỷ niệm!")
      return
    }

    setIsSubmitting(true)
    window.dispatchEvent(new CustomEvent('api-loading', { detail: true }))
    try {
      let imageUrl = editingMemory ? editingMemory.background_image : ""

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("portfolio-images")
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-images")
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const memoryData = {
        title,
        post_date: postDate,
        content,
        background_image: imageUrl,
        password: password.toLowerCase().trim()
      }

      if (editingMemory) {
        const { error: dbError } = await supabase
          .from("memories")
          .update(memoryData)
          .eq("id", editingMemory.id)
        if (dbError) throw dbError
        toast.success("Cập nhật kỷ niệm thành công!")
      } else {
        const { error: dbError } = await supabase
          .from("memories")
          .insert([memoryData])
        if (dbError) throw dbError
        toast.success("Thêm kỷ niệm thành công!")
      }

      setIsOpen(false)
      resetForm()
      fetchMemories()
    } catch (error: any) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setIsSubmitting(false)
      window.dispatchEvent(new CustomEvent('api-loading', { detail: false }))
    }
  }

  const handleDeleteMemory = async () => {
    const { id, imageUrl } = deleteModal
    window.dispatchEvent(new CustomEvent('api-loading', { detail: true }))
    try {
      const { error: dbError } = await supabase.from("memories").delete().eq("id", id)
      if (dbError) throw dbError

      if (imageUrl && imageUrl.includes('portfolio-images')) {
        const path = imageUrl.split('/').pop()
        if (path) await supabase.storage.from("portfolio-images").remove([path])
      }

      toast.success("Đã xóa kỷ niệm!")
      fetchMemories()
    } catch (error: any) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setDeleteModal({ isOpen: false, id: "", imageUrl: "" })
      window.dispatchEvent(new CustomEvent('api-loading', { detail: false }))
    }
  }

  // --- Filter Logic ---
  const filteredMemories = useMemo(() => {
    let result = [...memories]

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(m => 
        (m.title?.toLowerCase().includes(term)) || 
        (m.content?.toLowerCase().includes(term))
      )
    }

    // Date Filters
    if (selectedYear !== "all") {
      result = result.filter(m => new Date(m.post_date).getFullYear().toString() === selectedYear)
    }
    if (selectedMonth !== "all") {
      result = result.filter(m => (new Date(m.post_date).getMonth() + 1).toString() === selectedMonth)
    }
    if (selectedDay !== "all") {
      result = result.filter(m => new Date(m.post_date).getDate().toString() === selectedDay)
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.post_date).getTime() - new Date(a.post_date).getTime()
      if (sortOrder === "oldest") return new Date(a.post_date).getTime() - new Date(b.post_date).getTime()
      if (sortOrder === "a-z") return (a.title || "").localeCompare(b.title || "")
      if (sortOrder === "z-a") return (b.title || "").localeCompare(a.title || "")
      return 0
    })

    return result
  }, [memories, searchTerm, selectedYear, selectedMonth, selectedDay, sortOrder])

  // --- Derived data ---
  const yearsFromData = useMemo(() => {
    const years = memories.map(m => new Date(m.post_date).getFullYear().toString())
    return Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a))
  }, [memories])

  const monthsFromData = useMemo(() => {
    let filtered = memories
    if (selectedYear !== "all") {
      filtered = filtered.filter(m => new Date(m.post_date).getFullYear().toString() === selectedYear)
    }
    const months = filtered.map(m => (new Date(m.post_date).getMonth() + 1).toString())
    return Array.from(new Set(months)).sort((a, b) => Number(a) - Number(b))
  }, [memories, selectedYear])

  const daysFromData = useMemo(() => {
    let filtered = memories
    if (selectedYear !== "all") {
      filtered = filtered.filter(m => new Date(m.post_date).getFullYear().toString() === selectedYear)
    }
    if (selectedMonth !== "all") {
      filtered = filtered.filter(m => (new Date(m.post_date).getMonth() + 1).toString() === selectedMonth)
    }
    const days = filtered.map(m => new Date(m.post_date).getDate().toString())
    return Array.from(new Set(days)).sort((a, b) => Number(a) - Number(b))
  }, [memories, selectedYear, selectedMonth])

  const stats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    // Format local YYYY-MM-DD for comparison
    const todayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`

    return {
      total: memories.length,
      thisMonth: memories.filter(m => {
        const d = new Date(m.post_date)
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      }).length,
      today: memories.filter(m => {
        // Compare strictly by YYYY-MM-DD
        const d = new Date(m.post_date)
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return dStr === todayStr
      }).length
    }
  }, [memories])

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header & Stats Cards */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 shadow-lg shadow-orange-200 flex items-center justify-center text-white">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Nhật ký</h1>
              <p className="text-slate-500 font-medium text-sm">Nơi lưu giữ linh hồn của những kỷ niệm.</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button
                className="rounded-2xl shadow-xl shadow-orange-100 h-12 px-8 transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base"
              >
                <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> Thêm Kỷ niệm
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] w-[95vw] lg:w-[65vw] p-0 rounded-[32px] overflow-hidden border-none shadow-2xl bg-white max-h-[95dvh] flex flex-col">
              <div className="bg-gradient-to-r from-[#2C1810] to-[#402616] px-8 py-6 text-white shrink-0">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center border border-white/20 shadow-lg">
                      {editingMemory ? <Pencil className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black text-[#FFF4E6] leading-none">
                        {editingMemory ? "Cập nhật Nhật ký" : "Ghi lại Kỷ niệm mới"}
                      </DialogTitle>
                      <p className="text-[#E8D9C8] text-xs font-medium opacity-80 mt-1.5 uppercase tracking-widest">Scrapbook Journal Entry</p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề kỷ niệm</label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Vd: Buổi sáng tại Paris..."
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 text-base focus-visible:ring-orange-500 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ngày kỷ niệm</label>
                    <Input
                      type="date"
                      value={postDate}
                      onChange={e => setPostDate(e.target.value)}
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 text-base focus-visible:ring-orange-500 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Lock className="w-3 h-3" /> Bảo mật (Password)
                    </label>
                    <Input
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu bài viết..."
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 text-base focus-visible:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung chi tiết</label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Ảnh bìa (Cinematic Hero)
                  </label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="group relative h-12">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                        className="h-12 rounded-2xl opacity-0 absolute inset-0 z-10 cursor-pointer"
                      />
                      <div className="h-12 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-between px-6 bg-slate-50 group-hover:border-orange-400 group-hover:bg-orange-50/30 transition-all">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-500 text-sm font-medium truncate">
                            {imageFile ? imageFile.name : "Chọn ảnh từ thiết bị..."}
                          </span>
                        </div>
                        <div className="text-[10px] font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">Browse</div>
                      </div>
                    </div>

                    {(imageFile || (editingMemory && editingMemory.background_image)) && (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : editingMemory.background_image}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white text-[10px] font-bold uppercase tracking-widest">Xem trước ảnh nền</div>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              <DialogFooter className="px-8 py-6 bg-slate-50 border-t flex flex-row gap-4 shrink-0">
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  onClick={(e) => {
                    const form = (e.currentTarget.closest('form') || document.querySelector('form')) as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }}
                  className="flex-1 h-12 rounded-2xl font-black shadow-xl shadow-orange-200 bg-orange-500 text-white hover:opacity-90 active:scale-95"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang lưu...</> : (editingMemory ? "Cập nhật bài viết" : "Lưu vào Nhật ký")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 rounded-[24px] border-none bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center gap-5 group hover:translate-y-[-2px] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng kỷ niệm</p>
              <h4 className="text-2xl font-black text-slate-900">{stats.total}</h4>
            </div>
          </Card>
          <Card className="p-6 rounded-[24px] border-none bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center gap-5 group hover:translate-y-[-2px] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tháng này</p>
              <h4 className="text-2xl font-black text-slate-900">{stats.thisMonth}</h4>
            </div>
          </Card>
          <Card className="p-6 rounded-[24px] border-none bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center gap-5 group hover:translate-y-[-2px] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hôm nay</p>
              <h4 className="text-2xl font-black text-slate-900">{stats.today}</h4>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 rounded-[28px] border-none bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Tìm kỷ niệm theo tiêu đề, nội dung..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 h-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          {/* Year Filter */}
          <Select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setSelectedMonth("all"); setSelectedDay("all"); }}>
            <SelectItem value="all">Tất cả năm</SelectItem>
            {yearsFromData.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </Select>

          {/* Month Filter */}
          <Select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setSelectedDay("all"); }}>
            <SelectItem value="all">Tất cả tháng</SelectItem>
            {monthsFromData.map(m => (
              <SelectItem key={m} value={m}>Tháng {m}</SelectItem>
            ))}
          </Select>

          {/* Day Filter */}
          <Select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
            <SelectItem value="all">Tất cả ngày</SelectItem>
            {daysFromData.map(d => (
              <SelectItem key={d} value={d}>Ngày {d}</SelectItem>
            ))}
          </Select>

          {/* Sort Filter */}
          <Select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="a-z">Tiêu đề A-Z</SelectItem>
            <SelectItem value="z-a">Tiêu đề Z-A</SelectItem>
          </Select>

          {/* Reset button */}
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchTerm(""); setSelectedYear("all"); setSelectedMonth("all"); setSelectedDay("all"); setSortOrder("newest")
            }}
            className="h-11 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold text-xs gap-2"
          >
            <FilterX className="w-4 h-4" /> Xóa lọc
          </Button>
        </div>
      </Card>

      {/* List Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="font-bold text-slate-400 animate-pulse">Đang nạp kỷ niệm...</p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <Search className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900">Không tìm thấy kỷ niệm nào</h4>
              <p className="text-slate-500 font-medium max-w-[300px]">Hãy thử đổi từ khóa hoặc xóa bớt các bộ lọc ngày tháng.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {setSearchTerm(""); setSelectedYear("all"); setSelectedMonth("all")}}
              className="rounded-xl border-slate-200 font-bold"
            >
              Bỏ lọc để xem tất cả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMemories.map(m => {
              const d = new Date(m.post_date)
              const day = d.getDate()
              const month = d.getMonth() + 1
              const year = d.getFullYear()
              
              return (
                <div key={m.id} className="memory-admin-card group hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300">
                  <div className="relative w-24 h-20 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-slate-100">
                    <img 
                      src={m.background_image || "/assets/default-memory.png"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt="thumb" 
                    />
                    {m.password && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white backdrop-blur-sm">
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black text-slate-900 truncate tracking-tight">{m.title || "Không tiêu đề"}</h4>
                      <span className="date-badge shrink-0">
                        {day} • {month} • {year}
                      </span>
                    </div>
                    <div 
                      className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: m.content.replace(/<[^>]*>?/gm, '') }}
                    />
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-slate-50">
                    <Button
                      variant="ghost" size="icon"
                      className="w-10 h-10 rounded-xl text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      onClick={() => window.open(`/memories`, '_blank')}
                      title="Xem trên trang chủ"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="w-10 h-10 rounded-xl text-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      onClick={() => handleEditClick(m)}
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="w-10 h-10 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      onClick={() => setDeleteModal({ isOpen: true, id: m.id, imageUrl: m.background_image })}
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .memory-admin-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          align-items: center;
          padding: 20px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #eef2f7;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.04);
        }
        .date-badge {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fed7aa;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
          .memory-admin-card {
            grid-template-columns: 1fr;
            padding: 16px;
          }
          .memory-admin-card > div:last-child {
            border-left: none;
            border-top: 1px solid #f8fafc;
            padding-left: 0;
            padding-top: 12px;
            justify-content: flex-end;
          }
        }
      `}</style>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteMemory}
        title="Xóa kỷ niệm vĩnh viễn"
        message="Bạn có chắc chắn muốn xóa kỷ niệm này? Tất cả hình ảnh và nội dung sẽ biến mất mãi mãi."
        type="danger"
        icon="delete"
        confirmText="Vâng, xóa nó đi"
        cancelText="Để tôi xem lại"
      />
    </div>
  )
}
