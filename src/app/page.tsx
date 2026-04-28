"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Mail, ChevronRight, ExternalLink, Code } from "lucide-react";
import "./simple-ui.css";

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchProjects();
    incrementVisitor();
    const onScroll = () => {
      const el = document.querySelector(".back-to-top") as HTMLElement | null;
      if (!el) return;
      if (window.scrollY > 400) el.classList.add("show");
      else el.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  };

  const incrementVisitor = async () => {
    if (sessionStorage.getItem("visited")) return;
    sessionStorage.setItem("visited", "true");
    const { data } = await supabase.from("visitors").select("count").eq("id", 1).single();
    if (data) {
      await supabase.from("visitors").update({ count: data.count + 1 }).eq("id", 1);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    const { error } = await supabase.from("contacts").insert([{ name, email, message }]);
    if (error) {
      toast.error("Lỗi khi gửi: " + error.message);
    } else {
      toast.success("Cảm ơn bạn! Tin nhắn đã được gửi tới An Đức Anh.");
      setName("");
      setEmail("");
      setMessage("");
    }
    setIsSending(false);
  };

  return (
    <>
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
      </div>

      <div className="portfolio-theme min-h-dvh flex flex-col bg-slate-950 text-slate-100 font-sans scroll-smooth selection:bg-blue-500/30 relative z-10 overflow-x-hidden">
        
        {/* Navigation */}
        <nav className="site-menu container" aria-label="Primary">
          <a href="#AboutSection" className="menu-link active" data-section="AboutSection">Giới thiệu</a>
          <a href="#SkillsSection" className="menu-link" data-section="SkillsSection">Kỹ năng</a>
          <a href="#ProjectContainer" className="menu-link" data-section="ProjectContainer">Dự án</a>
          <a href="#ContactSection" className="menu-link" data-section="ContactSection">Liên hệ</a>
        </nav>

        <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-6 pt-10 md:pt-12">
          
          {/* Hero Section */}
          <section id="AboutSection" className="min-h-[calc(100dvh-120px)] flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-10 md:py-20">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Available for work
              </div>
              <h2 className="font-extrabold tracking-tight leading-[1.1] text-slate-100">
                <span className="text-3xl md:text-4xl">Xin chào, mình là</span>
                <br />
                <span className="text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                  An Đức Anh
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Sinh năm 2004, hiện là sinh viên năm cuối chuyên ngành Công nghệ Phần mềm. Mình mong muốn trở thành{" "}
                <strong className="text-slate-200 font-semibold">Fullstack Developer</strong>
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 justify-center md:justify-start">
                <a href="#ProjectContainer">
                  <Button size="lg" className="rounded-full px-8 bg-white text-slate-950 hover:bg-slate-200 font-bold w-full sm:w-auto h-14 text-base shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Xem dự án <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </a>
                <a href="/CV_AnDucAnh.pdf" target="_blank">
                  <Button variant="outline" size="lg" className="rounded-full px-8 border-slate-700 hover:bg-slate-900 text-slate-100 w-full sm:w-auto h-14 text-base">
                    Tải CV <Download className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="w-64 h-64 md:w-80 md:h-80 relative group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl group-hover:bg-blue-500/30 transition-colors" />
              <div className="relative w-full h-full rounded-3xl border border-slate-800 overflow-hidden bg-slate-900 shadow-2xl">
                <img src="/avatar.jpg" alt="An Đức Anh" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section id="SkillsSection" className="py-24 space-y-12">
            <div className="text-center space-y-4">
              <h3 className="text-3xl md:text-5xl font-black text-slate-100 uppercase tracking-tight">Kỹ năng</h3>
              <p className="text-slate-400 text-lg">Các công nghệ mình thường xuyên sử dụng</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { name: "Frontend", items: ["React.js", "Next.js", "Tailwind CSS", "TypeScript"], color: "blue" },
                { name: "Backend", items: ["Node.js", "Express", "Supabase", "PostgreSQL"], color: "emerald" },
                { name: "Languages", items: ["JavaScript", "C#", "SQL", "HTML/CSS"], color: "amber" },
                { name: "Tools", items: ["Git", "Docker", "VS Code", "Postman"], color: "rose" },
              ].map((skill) => (
                <div key={skill.name} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors space-y-4">
                  <h4 className="font-bold text-slate-200">{skill.name}</h4>
                  <ul className="space-y-2">
                    {skill.items.map((item) => (
                      <li key={item} className="text-slate-400 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section id="ProjectContainer" className="py-24 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-5xl font-black text-slate-100 uppercase tracking-tight">Dự án</h3>
                <p className="text-slate-400 text-lg">Những sản phẩm mình đã hoàn thiện</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full">
                  <div className="aspect-video overflow-hidden">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Code className="w-10 h-10 text-slate-700" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4 flex flex-col flex-1">
                    <div className="space-y-2 flex-1">
                      <h4 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                        {project.title}
                      </h4>
                      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/50">
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors">
                          Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors">
                          Code <Code className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section id="ContactSection" className="max-w-4xl mx-auto w-full pt-24 pb-12">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight">Liên hệ</h3>
                    <p className="text-slate-400 leading-relaxed">Sẵn sàng hợp tác và cùng tạo nên những sản phẩm chất lượng.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Email</p>
                        <p className="text-slate-200 font-bold">anducanh125@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleContact} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 ml-1">Họ tên của bạn</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nguyễn Văn A" className="bg-slate-950/50 border-slate-800 h-14 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 text-base rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 ml-1">Email liên hệ</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="bg-slate-950/50 border-slate-800 h-14 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 text-base rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Lời nhắn</label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Chào Đức Anh, tôi muốn trao đổi về..." rows={6} className="bg-slate-950/50 border-slate-800 resize-none text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 text-base rounded-xl p-4" />
                  </div>
                  <Button type="submit" className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 font-bold text-lg rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]" disabled={isSending}>
                    {isSending ? "Đang gửi..." : "Gửi tin nhắn ngay"} <Mail className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-10 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} An Đức Anh. All rights reserved.</div>
            <div className="flex gap-6 text-slate-400">
              <a href="https://github.com/AnAnh2k" className="hover:text-white transition-colors bg-slate-900 p-3 rounded-full">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
            <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              Designed & Built with Next.js & Supabase
            </div>
          </div>
        </footer>
      </div>

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        Lên đầu
      </button>
    </>
  );
}
