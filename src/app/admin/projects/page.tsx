"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { FolderKanban, Plus, ExternalLink, Code, Trash2, Image as ImageIcon, Loader2, Pencil, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isOpen, setIsOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Personal project")
  const [techStack, setTechStack] = useState("")
  const [description, setDescription] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }

  const resetForm = () => {
    setEditingProject(null)
    setTitle("")
    setCategory("Personal project")
    setTechStack("")
    setDescription("")
    setDemoUrl("")
    setRepoUrl("")
    setImageFile(null)
  }

  const handleEditClick = (project: any) => {
    setEditingProject(project)
    setTitle(project.title || "")
    setCategory(project.category || "Personal project")
    setTechStack(project.tech_stack || "")
    setDescription(project.description || "")
    setDemoUrl(project.demo_url || "")
    setRepoUrl(project.repo_url || "")
    setImageFile(null)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = editingProject ? editingProject.image_url : ""

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("portfolio-images")
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-images")
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const projectData = {
        title,
        category,
        tech_stack: techStack,
        description,
        demo_url: demoUrl,
        repo_url: repoUrl,
        image_url: imageUrl
      }

      if (editingProject) {
        const { error: dbError } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id)
        if (dbError) throw dbError
        toast.success("Cập nhật dự án thành công!")
      } else {
        const { error: dbError } = await supabase
          .from("projects")
          .insert([projectData])
        if (dbError) throw dbError
        toast.success("Thêm dự án thành công!")
      }

      setIsOpen(false)
      resetForm()
      fetchProjects()
    } catch (error: any) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (id: string, imageUrl: string) => {
    if (!confirm("Xác nhận xóa dự án này?")) return

    try {
      const { error: dbError } = await supabase.from("projects").delete().eq("id", id)
      if (dbError) throw dbError

      if (imageUrl) {
        const path = imageUrl.split('/').pop()
        if (path) await supabase.storage.from("portfolio-images").remove([path])
      }

      toast.success("Đã xóa dự án!")
      fetchProjects()
    } catch (error: any) {
      toast.error("Lỗi: " + error.message)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Dự án</h1>
            <p className="text-slate-500 text-sm">Thêm mới hoặc chỉnh sửa các dự án trong Portfolio của bạn.</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button
              className="rounded-xl shadow-lg h-11 px-6 transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: "#155dfc", color: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0d4ed8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#155dfc")}
            >
              <Plus className="w-5 h-5 mr-1.5" /> Thêm dự án mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-white max-h-[95dvh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white shrink-0">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    {editingProject ? <Pencil className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-white leading-none">
                      {editingProject ? "Chỉnh sửa dự án" : "Tạo dự án mới"}
                    </DialogTitle>
                    <p className="text-blue-100 text-[10px] opacity-70 mt-1">Vui lòng điền đầy đủ các thông tin bên dưới.</p>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tên dự án</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Vd: Portfolio Website"
                    className="h-10 rounded-xl border-slate-100 bg-slate-50 text-xs text-slate-900 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phân loại</label>
                  <div className="relative">
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-900 ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer pr-8 font-medium"
                    >
                      <option value="Personal project">Personal project</option>
                      <option value="Freelance / Real-world project">Freelance / Real-world project</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Công nghệ (Tech Stack)</label>
                <Input
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                  required
                  placeholder="Vd: React, Node.js, Supabase"
                  className="h-10 rounded-xl border-slate-100 bg-slate-50 text-xs text-slate-900 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mô tả chi tiết</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Mô tả ngắn gọn về dự án..."
                  className="rounded-xl border-slate-100 bg-slate-50 text-xs text-slate-900 focus-visible:ring-blue-500 resize-none p-3"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Ảnh bìa dự án
                </label>
                <div className="space-y-3">
                  <div className="group relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => setImageFile(e.target.files?.[0] || null)}
                      required={!editingProject}
                      className="h-10 rounded-lg opacity-0 absolute inset-0 z-10 cursor-pointer"
                    />
                    <div className="h-10 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-between px-4 bg-slate-50 group-hover:border-blue-400 transition-all">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500 text-[11px] truncate">
                          {imageFile ? imageFile.name : (editingProject ? "Thay đổi ảnh dự án..." : "Tải ảnh lên (PNG, JPG)...")}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-blue-500">BẤM ĐỂ CHỌN</div>
                    </div>
                  </div>

                  {/* Large Image Preview Area */}
                  {(imageFile || (editingProject && editingProject.image_url)) && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group/preview">
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : editingProject.image_url}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-105"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Xem trước ảnh</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Link Demo</label>
                  <Input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://..." className="h-9 rounded-lg border-slate-100 bg-slate-50 text-xs text-slate-900 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Link Source</label>
                  <Input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://..." className="h-10 rounded-lg border-slate-100 bg-slate-50 text-xs text-slate-900 focus-visible:ring-blue-500" />
                </div>
              </div>
            </form>

            <DialogFooter className="px-6 py-4 pb-8 bg-slate-50/50 border-t flex flex-row gap-4 shrink-0">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 h-11 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100 text-sm"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                onClick={(e) => {
                  const form = (e.currentTarget.closest('form') || document.querySelector('form')) as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                className="flex-1 h-11 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all duration-300 hover:opacity-90 active:scale-[0.98] bg-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang lưu...</> : (editingProject ? "Cập nhật" : "Lưu dự án")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[100px] font-bold text-slate-600">Ảnh</TableHead>
              <TableHead className="font-bold text-slate-600">Dự án</TableHead>
              <TableHead className="font-bold text-slate-600">Liên kết</TableHead>
              <TableHead className="text-right font-bold text-slate-600 px-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-400">Đang tải dữ liệu...</TableCell></TableRow>
            ) : projects.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-400">Chưa có dự án nào được đăng.</TableCell></TableRow>
            ) : (
              projects.map(p => (
                <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-100">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase">{p.category || "Project"}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{p.tech_stack}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-4">
                      {p.demo_url && <a href={p.demo_url} target="_blank" className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 text-xs font-bold"><ExternalLink className="w-3.5 h-3.5" /> Demo</a>}
                      {p.repo_url && <a href={p.repo_url} target="_blank" className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-bold"><Code className="w-3.5 h-3.5" /> Code</a>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full w-9 h-9"
                        onClick={() => handleEditClick(p)}
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full w-9 h-9"
                        onClick={() => handleDeleteProject(p.id, p.image_url)}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
