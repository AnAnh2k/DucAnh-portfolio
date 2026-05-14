"use client"
import React, { useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase"
import "react-quill-new/dist/quill.snow.css"
import { toast } from "sonner"

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  const imageHandler = () => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null
      if (!file) return

      const toastId = toast.loading("Đang tải ảnh lên...")
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("portfolio-images")
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-images")
          .getPublicUrl(fileName)

        // Insert the image URL into the editor
        if (quillRef.current) {
          // get Editor instance
          const editor = quillRef.current.getEditor()
          const range = editor.getSelection()
          // if no selection, append to the end
          const cursorPosition = range ? range.index : editor.getLength()
          editor.insertEmbed(cursorPosition, 'image', publicUrl)
          editor.setSelection(cursorPosition + 1)
        }
        toast.success("Tải ảnh lên thành công", { id: toastId })
      } catch (error: any) {
        toast.error("Lỗi khi tải ảnh: " + error.message, { id: toastId })
      }
    }
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'link', 'image'
  ]

  return (
    <div className="bg-white text-slate-900 rounded-xl overflow-hidden border border-slate-200">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Viết nội dung vào đây..."}
        className="h-[300px] mb-12"
      />
    </div>
  )
}
