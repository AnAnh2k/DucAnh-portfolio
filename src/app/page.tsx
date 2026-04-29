"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Mail, ChevronRight, ExternalLink, Code, TrendingUp, Menu, X } from "lucide-react";
import "./simple-ui.css";
import { VisitorStatsCard } from "@/components/visitor-stats";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const SECTION_LABELS: Record<string, string> = {
  AboutSection: "Giới thiệu",
  SkillsSection: "Kỹ năng",
  ProjectContainer: "Dự án",
  ContactSection: "Liên hệ",
};

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeSection, setActiveSection] = useState("AboutSection");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isApiLoading, setIsApiLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsApiLoading(true);
      await fetchProjects();
      await incrementVisitor();
      
      // Artificial delay for better "icon" experience as requested
      setTimeout(() => {
        setInitialLoading(false);
        setIsApiLoading(false);
      }, 1500);
    };

    init();
    
    // Back to top visibility
    const onScroll = () => {
      const el = document.querySelector(".back-to-top") as HTMLElement | null;
      if (!el) return;
      if (window.scrollY > 400) el.classList.add("show");
      else el.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll);

    // Scroll Spy Logic
    const sections = ["AboutSection", "SkillsSection", "ProjectContainer", "ContactSection"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
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
    const { data } = await supabase
      .from("visitors")
      .select("count")
      .eq("id", 1)
      .single();
    if (data) {
      await supabase
        .from("visitors")
        .update({ count: data.count + 1 })
        .eq("id", 1);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setIsApiLoading(true);
    const { error } = await supabase
      .from("contacts")
      .insert([{ name, email, message }]);
    if (error) {
      toast.error("Lỗi khi gửi: " + error.message);
    } else {
      toast.success("Cảm ơn bạn! Tin nhắn đã được gửi tới An Đức Anh.");
      setName("");
      setEmail("");
      setMessage("");
    }
    setIsSending(false);
    setIsApiLoading(false);
  };

  return (
    <>
      {/* API Progress Bar at the very top */}
      <div 
        className={`fixed top-0 left-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 z-[999] transition-all duration-500 ease-out ${isApiLoading ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
      />

      {/* Initial Loading Screen */}
      {initialLoading && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-5xl animate-bounce">
              ✨
            </div>
            <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Đang khởi tạo Portfolio...</h2>
          <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
            Chờ Đức Anh một chút xíu nhé, dữ liệu đang được tải về từ hệ thống. 🚀
          </p>
          
          <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-progress-loading" />
          </div>
        </div>
      )}

      {/* Background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
      </div>

      <div className="portfolio-theme min-h-dvh flex flex-col bg-slate-950 text-slate-100 font-sans scroll-smooth selection:bg-blue-500/30 relative z-10 overflow-x-hidden">
        <VisitorStatsCard variant="floating" />
        {/* Navigation */}
        <nav className="site-menu fixed top-6 left-1/2 -translate-x-1/2 w-fit mx-auto z-[100] !hidden md:!flex" aria-label="Primary">
          <a
            href="#AboutSection"
            className={`menu-link ${activeSection === "AboutSection" ? "active" : ""}`}
            data-section="AboutSection"
          >
            Giới thiệu
          </a>
          <a
            href="#SkillsSection"
            className={`menu-link ${activeSection === "SkillsSection" ? "active" : ""}`}
            data-section="SkillsSection"
          >
            Kỹ năng
          </a>
          <a
            href="#ProjectContainer"
            className={`menu-link ${activeSection === "ProjectContainer" ? "active" : ""}`}
            data-section="ProjectContainer"
          >
            Dự án
          </a>
          <a
            href="#ContactSection"
            className={`menu-link ${activeSection === "ContactSection" ? "active" : ""}`}
            data-section="ContactSection"
          >
            Liên hệ
          </a>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed top-6 right-6 z-[100]">
          <Sheet>
            <SheetTrigger className="rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white px-5 h-12 shadow-xl flex items-center gap-3 transition-all active:scale-95 group cursor-pointer outline-none">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors animate-in fade-in slide-in-from-right-2" key={activeSection}>
                {SECTION_LABELS[activeSection] || "MENU"}
              </span>
              <div className="w-px h-4 bg-slate-800 group-hover:bg-blue-500/50 transition-colors" />
              <Menu className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950/95 border-slate-800 p-0 w-80">
              <SheetHeader className="p-8 border-b border-slate-900">
                <SheetTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-2">
                {[
                  { id: "AboutSection", label: "Giới thiệu" },
                  { id: "SkillsSection", label: "Kỹ năng" },
                  { id: "ProjectContainer", label: "Dự án" },
                  { id: "ContactSection", label: "Liên hệ" }
                ].map((item) => (
                  <SheetClose 
                    key={item.id}
                    render={
                      <a
                        href={`#${item.id}`}
                        className={`flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all ${
                          activeSection === item.id 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                      >
                        <span>{item.label}</span>
                        {activeSection === item.id && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                      </a>
                    }
                  />
                ))}
              </div>
              <div className="mt-auto p-8 border-t border-slate-900">
                <p className="text-slate-500 text-sm mb-4">Kết nối với mình</p>
                <div className="flex gap-4">
                  <a href="https://github.com/AnAnh2k" target="_blank" className="p-3 rounded-full bg-slate-900 text-slate-300 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "An Đức Anh",
              "url": "https://ducanhdev.io.vn",
              "jobTitle": "Fullstack Web Developer",
              "alumniOf": "Đại học Công nghệ Giao thông vận tải",
              "sameAs": [
                "https://github.com/AnAnh2k",
                "https://facebook.com/ducanh.trinh.2108"
              ],
              "brand": {
                "@type": "Brand",
                "name": "Đức Anh Developer"
              }
            })
          }}
        />

        <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-6 pt-10 md:pt-12">
          {/* Hero Section */}
          <section
            id="AboutSection"
            className="min-h-[calc(100dvh-120px)] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24 py-16 md:py-20 max-w-6xl mx-auto"
          >
            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[13px] font-medium mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Available for work
              </div>
              <h1 className="font-extrabold tracking-tight leading-[1.1] text-slate-100">
                <span className="text-xl sm:text-2xl md:text-3xl block mb-3 font-medium text-slate-400">
                  xin chào, mình là <span className="text-blue-400">ducanhdev</span>
                </span>
                <span className="text-4xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  An Đức Anh
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
                Mình sinh năm <span className="text-slate-100 font-bold">2004</span>, 
                hiện tại mình là <span className="text-slate-100 font-bold">sinh viên năm cuối</span> mong muốn 
                trở thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-black">Fullstack Web Developer</span>.
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-6 justify-center md:justify-start">
                <a href="#ProjectContainer" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 bg-white text-slate-950 hover:bg-slate-200 font-bold h-12 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    Xem dự án <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
                <a href="/CV_AnDucAnh.pdf" target="_blank" className="flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-6 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 h-12 text-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Tải CV
                  </Button>
                </a>
                <a href="https://github.com/AnAnh2k" target="_blank" className="sm:block">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex-1 flex justify-center md:justify-end relative">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-[350px] md:h-[350px] group">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-[80px] md:blur-[100px] group-hover:bg-emerald-400/30 transition-colors" />
                <div className="relative w-full h-full rounded-full border-[6px] border-slate-800/50 overflow-hidden shadow-2xl p-3 bg-slate-900/40">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-400/30">
                    <img
                      src="/assets/avatar.jpg"
                      alt="An Đức Anh"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section id="SkillsSection" className="skills__section py-24">
            <div className="container skills__container">
              <div className="section__header">
                <h1 className="section__title">Kỹ năng & Chuyên môn</h1>
                <p className="section__description">
                  Tập trung vào phát triển giao diện web hiện đại, tích hợp API,
                  tối ưu trải nghiệm người dùng và triển khai ứng dụng ở quy mô
                  học tập, cá nhân và dự án thực tế.
                </p>
              </div>

              <div className="skills__grid_container !grid-cols-1 md:!grid-cols-3 gap-4">
                <div className="skills__grid_item hidden md:block" />

                <div className="skills__grid_item">
                  <div className="skills__grid_item_header">
                    <div>
                      <img src="/assets/check-icon.svg" alt="check icon" />
                      <h2>Công cụ & Công nghệ</h2>
                    </div>
                    <div className="skills__tech_lines">
                      <p>
                        Frontend: HTML/CSS, JavaScript, TypeScript, ReactJS,
                        Next.js, Tailwind CSS, Bootstrap, Ant Design.
                      </p>
                      <p>
                        Backend và API: RESTful API, Next.js API Routes, Prisma
                        ORM, JWT Authentication.
                      </p>
                      <p>
                        Database & Triển khai: SQL Server, MySQL, PostgreSQL,
                        MongoDB, Supabase, Vercel, Postman, Git.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="icons-list-wrapper">
                      <div className="icons-list">
                        <div className="icon-badges">
                          <img src="/assets/icons/html.svg" alt="html icon" />
                          <span>HTML</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/css.svg" alt="css icon" />
                          <span>CSS</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/JS.svg" alt="js icon" />
                          <span>JavaScript</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/react.svg" alt="react icon" />
                          <span>ReactJS</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/nextjs.svg"
                            alt="nextjs icon"
                          />
                          <span>Next.js</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/node-js.svg"
                            alt="node js icon"
                          />
                          <span>API Routes</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/postgresql.svg"
                            alt="postgresql icon"
                          />
                          <span>PostgreSQL</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/github.svg"
                            alt="github icon"
                          />
                          <span>GitHub</span>
                        </div>
                      </div>

                      <div className="icons-list">
                        <div className="icon-badges">
                          <img src="/assets/icons/html.svg" alt="html icon" />
                          <span>HTML</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/css.svg" alt="css icon" />
                          <span>CSS</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/JS.svg" alt="js icon" />
                          <span>TypeScript</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/react.svg" alt="react icon" />
                          <span>ReactJS</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/nextjs.svg"
                            alt="nextjs icon"
                          />
                          <span>Next.js</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/node-js.svg"
                            alt="node js icon"
                          />
                          <span>Prisma ORM</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/postgresql.svg"
                            alt="postgresql icon"
                          />
                          <span>Databases</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/github.svg"
                            alt="github icon"
                          />
                          <span>Vercel</span>
                        </div>
                      </div>
                    </div>

                    <div className="icons-list-wrapper">
                      <div className="icons-list">
                        <div className="icon-badges">
                          <img src="/assets/icons/html.svg" alt="html icon" />
                          <span>Tailwind CSS</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/css.svg" alt="css icon" />
                          <span>Bootstrap</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/JS.svg" alt="js icon" />
                          <span>RESTful API</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/react.svg" alt="react icon" />
                          <span>Ant Design</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/nextjs.svg"
                            alt="nextjs icon"
                          />
                          <span>JWT Auth</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/node-js.svg"
                            alt="node js icon"
                          />
                          <span>Supabase</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/postgresql.svg"
                            alt="postgresql icon"
                          />
                          <span>MySQL</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/github.svg"
                            alt="github icon"
                          />
                          <span>Postman</span>
                        </div>
                      </div>

                      <div className="icons-list">
                        <div className="icon-badges">
                          <img src="/assets/icons/html.svg" alt="html icon" />
                          <span>Tailwind CSS</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/css.svg" alt="css icon" />
                          <span>Bootstrap</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/JS.svg" alt="js icon" />
                          <span>RESTful API</span>
                        </div>
                        <div className="icon-badges">
                          <img src="/assets/icons/react.svg" alt="react icon" />
                          <span>MVC Pattern</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/nextjs.svg"
                            alt="nextjs icon"
                          />
                          <span>SQL Server</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/node-js.svg"
                            alt="node js icon"
                          />
                          <span>MongoDB</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/postgresql.svg"
                            alt="postgresql icon"
                          />
                          <span>PostgreSQL</span>
                        </div>
                        <div className="icon-badges">
                          <img
                            src="/assets/icons/github.svg"
                            alt="github icon"
                          />
                          <span>Git</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="skills__grid_item">
                  <div className="skills__grid_item_header">
                    <div>
                      <img src="/assets/check-icon.svg" alt="check icon" />
                      <h2>Học vấn & Kỹ năng mềm</h2>
                    </div>
                    <p>
                      Hanoi Open University (2022 - 2026). Kỹ năng mềm nổi bật
                      gồm thuyết trình, làm việc nhóm, làm việc độc lập và tinh
                      thần chủ động học hỏi. Tiếng Anh: TOEIC 650 (expected).
                    </p>
                  </div>

                  <div className="softSkills__container">
                    <div className="softSkills_badge">
                      <p>Public speaking</p>
                    </div>
                    <div className="softSkills_badge">
                      <p>Teamwork</p>
                    </div>
                    <div className="softSkills_badge">
                      <p>Independent working</p>
                    </div>
                    <div className="softSkills_badge">
                      <p>Detail-oriented</p>
                    </div>
                  </div>
                </div>

                <div className="skills__grid_item hidden md:block" />
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="py-24" id="ProjectContainer">
            <div className="max-w-6xl mx-auto px-6 space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-slate-100 uppercase tracking-tight">Dự Án Nổi Bật</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Các dự án thể hiện rõ định hướng Frontend và Fullstack, khả năng triển
                  khai từ giao diện, tích hợp API và tối ưu trải nghiệm người dùng.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {projects.map((project) => (
                  <article key={project.id} className="flex flex-col bg-slate-900/40 border border-slate-800 rounded-[24px] overflow-hidden hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group h-full">
                    <div className="p-4 bg-slate-800/30">
                      <div className="aspect-video rounded-2xl overflow-hidden border border-slate-700/50 relative">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <Code className="w-10 h-10 text-slate-700" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 space-y-4">
                      <div className="space-y-2 flex-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                          {project.category || "Personal Project"}
                        </h4>
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">{project.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Project Stack from DB */}
                      {project.tech_stack && (
                        <div className="pt-4 border-t border-slate-800/50 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                          {project.tech_stack.split(',').map((tag: string) => (
                            <span key={tag.trim()}>#{tag.trim()}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                          >
                            Xem Demo <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {project.repo_url && (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all active:scale-95"
                          >
                            Mã nguồn <Code className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section
            id="ContactSection"
            className="max-w-4xl mx-auto w-full pt-24 pb-12 px-6"
          >
            <div className="rounded-[32px] bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight">
                      Liên hệ
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      Sẵn sàng hợp tác và cùng tạo nên những sản phẩm chất
                      lượng.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                          Email
                        </p>
                        <p className="text-slate-200 font-bold">
                          anducanh125@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleContact} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 ml-1">
                        Họ tên của bạn
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nguyễn Văn A"
                        className="bg-slate-950/50 border-slate-800 h-14 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 text-base rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 ml-1">
                        Email liên hệ
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                        className="bg-slate-950/50 border-slate-800 h-14 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 text-base rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300 ml-1">
                      Lời nhắn
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Chào Đức Anh, tôi muốn trao đổi về..."
                      rows={6}
                      className="bg-slate-950/50 border-slate-800 resize-none text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 text-base rounded-xl p-4"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 font-bold text-lg rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    disabled={isSending}
                  >
                    {isSending ? "Đang gửi..." : "Gửi tin nhắn ngay"}{" "}
                    <Mail className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-10 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-500 text-sm font-medium">
              © {new Date().getFullYear()} An Đức Anh. All rights reserved.
            </div>
            <div className="flex gap-6 text-slate-400">
              <a
                href="https://github.com/AnAnh2k"
                className="hover:text-white transition-colors bg-slate-900 p-3 rounded-full"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
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

      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Lên đầu
      </button>
    </>
  );
}
