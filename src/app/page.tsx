"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Download, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Code, Mail,
  ArrowUp, ArrowDown, Shield, Laptop, Send, Compass, Globe, BarChart3, CalendarDays, Users, Lock,
  Menu, X, TrendingUp
} from "lucide-react";
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

const STATIONS = [
  { id: 'intro', label: 'Giới thiệu', z: 0 },
  { id: 'skills', label: 'Kỹ năng', z: 1600 },
  { id: 'projects', label: 'Dự án', z: 3200 },
  { id: 'contact', label: 'Liên hệ', z: 5000 },
  { id: 'diary', label: 'Nhật ký', z: 6600 },
];

const MAX_Z = STATIONS[STATIONS.length - 1].z;

const SECTION_LABELS: Record<string, string> = {
  AboutSection: "Giới thiệu",
  SkillsSection: "Kỹ năng",
  ProjectContainer: "Dự án",
  ContactSection: "Liên hệ",
  DiarySection: "Nhật ký",
};

const skillColumns = [
  {
    title: "Frontend",
    items: ["HTML", "CSS", "JavaScript", "TypeScript", "ReactJS", "NextJS", "Tailwind CSS", "Bootstrap", "Ant Design"],
  },
  {
    title: "Backend",
    items: ["NodeJS", "ExpressJS", "RESTful API", "JWT Auth", "Next API Routes"],
  },
  {
    title: "Database",
    items: ["MongoDB", "MySQL", "PostgreSQL", "SQL Server", "Supabase", "Prisma ORM"],
  },
  {
    title: "Tools",
    items: ["Git", "GitHub", "Postman", "VS Code", "Vercel"],
  },
];

const renderSkillLogo = (skill: string) => {
  switch (skill) {
    case "HTML":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#E34F26]">
          <path d="M1.5 0h21l-1.91 21.563L12 24l-8.59-2.437L1.5 0zm17.65 6.36h-11.1l.24 2.72h10.62l-.74 8.29-6.17 1.71-6.17-1.71-.4-4.52h2.72l.21 2.37 3.64 1 3.64-1 .39-4.39H4.63l-.72-8.15h15.48l-.24 2.69z"/>
        </svg>
      );
    case "CSS":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1572B6]">
          <path d="M1.5 0h21l-1.91 21.563L12 24l-8.59-2.437L1.5 0zm17.65 6.36h-11.1l.24 2.72h10.62l-.74 8.29-6.17 1.71-6.17-1.71-.4-4.52H14.1l-.21 2.37-1.89.52-1.89-.52-.12-1.37h5.81l.46-5.15H4.17l-.24 2.69h8.84l-.24 2.69H3.45l.4 4.52h14.88l-.58-6.52z"/>
        </svg>
      );
    case "JavaScript":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#F7DF1E]">
          <path d="M0 0h24v24H0V0zm22.034 18.239c-.19-.48-.6-.82-1.14-1.04-.54-.22-1.23-.33-2.07-.33-.82 0-1.44.17-1.85.5-.41.34-.67.82-.78 1.44l-2.43-.5c.21-1.05.74-1.88 1.57-2.49.83-.62 1.99-.92 3.49-.92 1.48 0 2.65.34 3.51 1.01.86.67 1.34 1.62 1.45 2.85v4.22h-2.31v-1.12c-.39.46-.86.8-1.42 1.03-.56.23-1.18.34-1.86.34-1.39 0-2.48-.41-3.26-1.22-.78-.81-1.17-1.85-1.17-3.13 0-1.34.42-2.39 1.25-3.16.83-.77 2.02-1.15 3.56-1.15 1.04 0 1.86.15 2.45.45v-.42c0-.58-.17-1.01-.5-1.3-.33-.29-.85-.43-1.57-.43-.72 0-1.26.16-1.63.49-.37.33-.6.78-.68 1.36l-2.41-.45c.24-1.05.81-1.84 1.7-2.38.89-.54 2.09-.81 3.59-.81 1.64 0 2.87.39 3.69 1.18.82.79 1.23 1.96 1.23 3.51v7.65h-2.3v-1.12zm-2.02 1.62c.5 0 .93-.11 1.29-.33.36-.22.62-.51.77-.87v-1.58c-.46-.22-.97-.33-1.54-.33-.86 0-1.5.21-1.92.62-.42.41-.63.95-.63 1.63 0 .58.17 1.03.5 1.34.33.31.84.47 1.53.47zM6.67 15.35c.19-.48.6-.82 1.14-1.04.54-.22 1.23-.33 2.07-.33.82 0 1.44.17 1.85.5.41.34.67.82.78 1.44l-2.43-.5c.21-1.05.74-1.88 1.57-2.49.83-.62 1.99-.92 3.49-.92 1.48 0 2.65.34 3.51 1.01.86.67 1.34 1.62 1.45 2.85v4.22H16.14v-1.12c-.39.46-.86.8-1.42 1.03-.56.23-1.18.34-1.86.34-1.39 0-2.48-.41-3.26-1.22-.78-.81-1.17-1.85-1.17-3.13 0-1.34.42-2.39 1.25-3.16.83-.77 2.02-1.15 3.56-1.15 1.04 0 1.86.15 2.45.45v-.42c0-.58-.17-1.01-.5-1.3-.33-.29-.85-.43-1.57-.43-.72 0-1.26.16-1.63.49-.37.33-.6.78-.68 1.36l-2.41-.45c.24-1.05.81-1.84 1.7-2.38.89-.54 2.09-.81 3.59-.81 1.64 0 2.87.39 3.69 1.18.82.79 1.23 1.96 1.23 3.51v7.65H18.44v-1.12c.5 0 .93-.11 1.29-.33.36-.22.62-.51.77-.87v-1.58c-.46-.22-.97-.33-1.54-.33-.86 0-1.5.21-1.92.62-.42.41-.63.95-.63 1.63 0 .58.17 1.03.5 1.34.33.31.84.47 1.53.47z"/>
        </svg>
      );
    case "TypeScript":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#3178C6] bg-white rounded">
          <path d="M0 0h24v24H0V0zm20.09 18.69c-.19-.48-.6-.82-1.14-1.04-.54-.22-1.23-.33-2.07-.33-.82 0-1.44.17-1.85.5-.41.34-.67.82-.78 1.44l-2.43-.5c.21-1.05.74-1.88 1.57-2.49.83-.62 1.99-.92 3.49-.92 1.48 0 2.65.34 3.51 1.01.86.67 1.34 1.62 1.45 2.85v4.22h-2.31v-1.12c-.39.46-.86.8-1.42 1.03-.56.23-1.18.34-1.86.34-1.39 0-2.48-.41-3.26-1.22-.78-.81-1.17-1.85-1.17-3.13 0-1.34.42-2.39 1.25-3.16.83-.77 2.02-1.15 3.56-1.15 1.04 0 1.86.15 2.45.45v-.42c0-.58-.17-1.01-.5-1.3-.33-.29-.85-.43-1.57-.43-.72 0-1.26.16-1.63.49-.37.33-.6.78-.68 1.36l-2.41-.45c.24-1.05.81-1.84 1.7-2.38.89-.54 2.09-.81 3.59-.81 1.64 0 2.87.39 3.69 1.18.82.79 1.23 1.96 1.23 3.51v7.65h-2.3v-1.12zm-2.02 1.62c.5 0 .93-.11 1.29-.33.36-.22.62-.51.77-.87v-1.58c-.46-.22-.97-.33-1.54-.33-.86 0-1.5.21-1.92.62-.42.41-.63.95-.63 1.63 0 .58.17 1.03.5 1.34.33.31.84.47 1.53.47zM11.45 11.23h-3.4v8.32H5.4v-8.32H2v-2.35h9.45v2.35z"/>
        </svg>
      );
    case "ReactJS":
      return (
        <svg viewBox="-11.5 -10.23 23 20.46" className="w-5 h-5 fill-none stroke-[#61DAFB] stroke-[1.5]">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
          <g>
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      );
    case "NextJS":
      return (
        <svg viewBox="0 0 180 180" className="w-5 h-5 fill-white bg-black rounded-full p-0.5 border border-slate-700">
          <path d="M127.34 117.8l-52.92-68.51c-2.45-3.18-7.54-1.42-7.54 2.59v60.91c0 3.1 2.51 5.61 5.61 5.61h3.37c3.1 0 5.61-2.51 5.61-5.61v-36.43l40.4 52.41c1.89 2.45 5.48 1.11 5.48-1.98v-52.44c0-3.1-2.51-5.61-5.61-5.61h-3.37c-3.1 0-5.61 2.51-5.61 5.61v33.44z"/>
        </svg>
      );
    case "Tailwind CSS":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#38BDF8]">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C9.664 13.382 8.303 12 5.325 12h-.324z"/>
        </svg>
      );
    case "Bootstrap":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#7952B3]">
          <path d="M0 0h24v24H0V0zm15.75 11.23c.5-.47.8-1.12.8-1.85 0-1.6-1.3-2.88-2.9-2.88H8.5v12h5.1c1.7 0 3-1.28 3-2.88 0-.96-.4-1.76-1.1-2.24l.25-.15zm-4.75-2.7h1.9c.7 0 1.2.48 1.2 1.15 0 .67-.5 1.15-1.2 1.15H11V8.53zm2.4 7H11v-2.3h2.4c.7 0 1.2.48 1.2 1.15 0 .67-.5 1.15-1.2 1.15z"/>
        </svg>
      );
    case "Ant Design":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1890FF]">
          <path d="M12 2L2 7l10 5 10-5-10-5zm-9 6.2v7.6l9 4.2 9-4.2V8.2L12 13 3 8.2z"/>
        </svg>
      );
    case "NodeJS":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#339933]">
          <path d="M12 2.02a.85.85 0 00-.42.11L3.92 6.55a.85.85 0 00-.42.73v8.88c0 .3.17.58.42.73l7.66 4.42c.26.15.58.15.84 0l7.66-4.42a.85.85 0 00.42-.73V7.28a.85.85 0 00-.42-.73L12.42 2.13A.85.85 0 0012 2.02zM7.22 8.67h2v5h-2zm3.3 0a2.3 2.3 0 011.63-.67c1.27 0 2.3 1.03 2.3 2.3v3.37h-2v-3.37c0-.17-.13-.3-.3-.3a.3.3 0 00-.3.3v3.37h-2z"/>
        </svg>
      );
    case "ExpressJS":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <text x="1" y="17" fontSize="13" fontWeight="900" fontFamily="sans-serif">EX</text>
        </svg>
      );
    case "RESTful API":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#009688]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
        </svg>
      );
    case "JWT Auth":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#d63aff]">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
      );
    case "Next API Routes":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#00DC82] stroke-[2]">
          <path d="M4 17l6-6-6-6M12 19h8"/>
        </svg>
      );
    case "MongoDB":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#47A248]">
          <path d="M12 .02a.85.85 0 00-.42.11L3.92 6.55a.85.85 0 00-.42.73v8.88c0 .3.17.58.42.73l7.66 4.42c.26.15.58.15.84 0l7.66-4.42a.85.85 0 00.42-.73V7.28a.85.85 0 00-.42-.73L12.42 2.13A.85.85 0 0012 2.02zm-.87 4.29c1.6 2.1 3.1 4.7 3.1 7.2 0 2.2-1.3 4.2-3.1 5.3v-12.5z"/>
        </svg>
      );
    case "MySQL":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#4479A1]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.25c-.2-.18-.5-.18-.7 0l-2.6 2.35c-.15.15-.35.2-.55.1l-1.35-.6c-.25-.1-.35-.4-.2-.65L9.65 13c.25-.45.05-1-.45-1.25L4.5 9.4c-.25-.1-.35-.4-.2-.65l.65-1.35c.1-.2.3-.3.55-.2L11 9.35c.45.2.95 0 1.15-.45l2.15-5.35c.1-.25.4-.35.65-.2l1.35.65c.25.1.35.4.2.65L14.35 10c-.2.45 0 .95.45 1.15l5.35 2.15c.25.1.35.4.2.65l-.65 1.35c-.1.25-.4.35-.65.2L13.7 13.35c-.45-.2-.95 0-1.15.45l-2.15 5.35c-.1.25-.4.35-.65.2l-1.35-.65c-.25-.1-.35-.4-.2-.65L10.35 13c.2-.45 0-.95-.45-1.15L4.55 9.7c-.25-.1-.35-.4-.2-.65l.65-1.35c.1-.25.4-.35.65-.2l5.35 2.15c.45.2.95 0 1.15-.45l2.15-5.35c.1-.25.4-.35.65-.2l1.35.65c.25.1.35.4.2.65L14.35 10c-.2.45 0 .95.45 1.15l5.35 2.15c.25.1.35.4.2.65l-.65 1.35c-.1.2-.3.3-.55.2L11.5 13c-.2-.45-.7-.45-.9 0z"/>
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#336791]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 12h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3h-2c0 2.76 2.24 5 5 5s5-2.24 5-5zm-5-8c-2.76 0-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5z"/>
        </svg>
      );
    case "SQL Server":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#CC292B]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c2.21 0 4 1.34 4 3s-1.79 3-4 3-4-1.34-4-3 1.79-3 4-3zm0 12c-2.21 0-4-1.34-4-3v-1.5c0-.83.89-1.5 2-1.5h4c1.11 0 2 .67 2 1.5V15c0 1.66-1.79 3-4 3z"/>
        </svg>
      );
    case "Supabase":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#3ECF8E]">
          <path d="M21.36 10.96a1.11 1.11 0 00-.91-.56h-6.73V3.19c0-.62-.51-1.12-1.12-1.12-.22 0-.44.07-.63.2l-9.6 6.84a1.12 1.12 0 00.35 1.98h6.73v7.21c0 .62.51 1.12 1.12 1.12.22 0 .44-.07.63-.2l9.6-6.84a1.12 1.12 0 00.56-1.42z"/>
        </svg>
      );
    case "Prisma ORM":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1A202C] bg-white rounded-full p-0.5 border border-slate-700">
          <path d="M12 2L2 22h20L12 2zm0 4.8l7 14H5l7-14z"/>
        </svg>
      );
    case "Git":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#F05032]">
          <path d="M23.3 10.9L13.1.7C12.7.3 12 .3 11.6.7L8.9 3.4l3.2 3.2c.4-.1.8.0 1.1.3.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0-.3-.3-.4-.7-.3-1.1L8.3 4 1.1 11.2c-.4.4-.4 1.1 0 1.5l10.2 10.2c.4.4 1.1.4 1.5 0L23.3 12.4c.4-.4.4-1.1 0-1.5zM12.4 17.6c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4z"/>
        </svg>
      );
    case "GitHub":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case "Postman":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF6C37]">
          <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 14.5c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-5c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v5zm-.5-7.25c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z"/>
        </svg>
      );
    case "VS Code":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#007ACC]">
          <path d="M23.986 6.568l-3.08-3.08a.952.952 0 00-1.345 0l-5.69 5.69-3.79-3.79a.952.952 0 00-1.345 0l-6.84 6.84a.952.952 0 000 1.345l6.84 6.84a.952.952 0 001.345 0l3.79-3.79 5.69 5.69a.952.952 0 001.345 0l3.08-3.08a.952.952 0 000-1.345L12.59 12l11.396-11.396c.371-.372.371-.973 0-1.345z"/>
        </svg>
      );
    case "Vercel":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white bg-black rounded p-0.5">
          <path d="M12 2L2 22h20L12 2z"/>
        </svg>
      );
    default:
      return (
        <span className="text-[10px] font-black text-white">{skill.substring(0, 2)}</span>
      );
  }
};

export default function Portfolio() {
  // Supabase & Form States
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Live online & traffic stats
  const [stats, setStats] = useState({ online: 1, today: 0, month: 0, total: 0 });
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "flat">("3d");
  const [flatActiveSection, setFlatActiveSection] = useState("AboutSection");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_view_mode");
      if (saved === "3d" || saved === "flat") {
        setViewMode(saved);
      }
    }
  }, []);

  // 3D Corridor States
  const [cameraZ, setCameraZ] = useState(0);
  const [targetZ, setTargetZ] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  
  const lastScrollTimeRef = useRef<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // LERP Camera Z animation (Performance Optimized: only loops during active transition)
  useEffect(() => {
    setMounted(true);
    let animationFrameId: number;
    let currentZ = cameraZ;

    const updateCamera = () => {
      const diff = targetZ - currentZ;
      if (Math.abs(diff) < 0.15) {
        setCameraZ(targetZ);
        currentZ = targetZ;
        return; // Settle reached, stop animation loop
      }

      const nextZ = currentZ + diff * 0.12; // LERP speed
      setCameraZ(nextZ);
      currentZ = nextZ;
      animationFrameId = requestAnimationFrame(updateCamera);
    };

    animationFrameId = requestAnimationFrame(updateCamera);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetZ]);

  // Handle Resize and detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll and Intersection observer for Flat Mode
  useEffect(() => {
    if (viewMode !== "flat") return;

    // Back to top visibility
    const onScroll = () => {
      const el = document.querySelector(".back-to-top") as HTMLElement | null;
      if (!el) return;
      if (window.scrollY > 400) el.classList.add("show");
      else el.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll);

    // Scroll Spy Logic
    const sections = ["AboutSection", "SkillsSection", "ProjectContainer", "ContactSection", "DiarySection"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setFlatActiveSection(entry.target.id);
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
  }, [viewMode]);

  // Update Active Section based on target Z value (performance optimized)
  useEffect(() => {
    if (isMobile) return;
    const closest = STATIONS.find(s => s.z === targetZ) || STATIONS[0];
    setActiveSection(closest.id);
  }, [targetZ, isMobile]);

  // Sync visitor stats & tracking from Supabase
  useEffect(() => {
    if (!supabase) return;

    // 1. Unique Session tab Realtime Presence tracking
    const uniqueId = Math.random().toString(36).substring(7);
    
    // Clear any existing channel with the same name from client to prevent registration errors
    const existing = supabase.getChannels().find(ch => ch.topic === 'realtime:online-users');
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase.channel('online-users', {
      config: { presence: { key: uniqueId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const count = Object.keys(newState).length;
        setStats(prev => ({ ...prev, online: count > 0 ? count : 1 }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // 2. Incremental Database count tracking
    const syncStats = async () => {
      try {
        const { data: current } = await supabase.from('visitors').select('*').eq('id', 1).single();
        if (!current) return;

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMonth = now.getMonth() + 1;

        if (!sessionStorage.getItem('visited_v3')) {
          const newToday = (current.last_updated_day === todayStr) ? (current.today_count || 0) + 1 : 1;
          const newMonth = (current.last_updated_month === currentMonth) ? (current.month_count || 0) + 1 : 1;
          const newTotal = (current.total_count || 0) + 1;

          await supabase.from('visitors').update({
            total_count: newTotal,
            today_count: newToday,
            month_count: newMonth,
            last_updated_day: todayStr,
            last_updated_month: currentMonth
          }).eq('id', 1);
          
          sessionStorage.setItem('visited_v3', 'true');
          setStats(prev => ({ ...prev, total: newTotal, today: newToday, month: newMonth }));
        } else {
          setStats(prev => ({ ...prev, total: current.total_count, today: current.today_count, month: current.month_count }));
        }
      } catch (err) {
        console.error("Stats Sync Error:", err);
      }
    };

    syncStats();
    const timer = setInterval(syncStats, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  // Load projects from database
  useEffect(() => {
    const init = async () => {
      setIsApiLoading(true);
      await fetchProjects();
      
      // Delay for loader animation
      setTimeout(() => {
        setInitialLoading(false);
        setIsApiLoading(false);
      }, 1200);
    };
    init();
  }, []);

  // Keyboard navigation: snappy jumping between stations
  useEffect(() => {
    if (isMobile || viewMode === "flat") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      if (["ArrowUp", "w", "W"].includes(e.key)) {
        e.preventDefault();
        setTargetZ(prev => {
          const closestIndex = getClosestStationIndex(prev);
          const nextIdx = Math.min(STATIONS.length - 1, closestIndex + 1);
          return STATIONS[nextIdx].z;
        });
      } else if (["ArrowDown", "s", "S"].includes(e.key)) {
        e.preventDefault();
        setTargetZ(prev => {
          const closestIndex = getClosestStationIndex(prev);
          const nextIdx = Math.max(0, closestIndex - 1);
          return STATIONS[nextIdx].z;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, viewMode]);

  const getClosestStationIndex = (zVal: number) => {
    let closestIdx = 0;
    let minDiff = Math.abs(zVal - STATIONS[0].z);
    STATIONS.forEach((s, idx) => {
      const diff = Math.abs(zVal - s.z);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  };

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setIsApiLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Định dạng email không hợp lệ!");
      setIsSending(false);
      setIsApiLoading(false);
      return;
    }

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

  // Snappy section-by-section wheel scrolling with scroll locks
  const handleWheel = (e: React.WheelEvent) => {
    if (isMobile || viewMode === "flat") return;
    
    // Ignore wheel events inside scrollable elements like carousels, forms
    const target = e.target as HTMLElement;
    if (
      target.closest('.project-carousel') || 
      target.closest('.custom-hud-scroll') || 
      target.closest('textarea') || 
      target.closest('input')
    ) {
      return;
    }

    e.preventDefault();

    const now = Date.now();
    // 800ms cooldown for smooth transitions
    if (now - lastScrollTimeRef.current < 800) {
      return;
    }

    const delta = e.deltaY;
    if (Math.abs(delta) < 10) {
      return; // ignore minor trackpad scroll ticks
    }

    lastScrollTimeRef.current = now;

    setTargetZ(prev => {
      const closestIndex = getClosestStationIndex(prev);
      if (delta > 0) {
        // Scroll down/forward -> next station
        const nextIdx = Math.min(STATIONS.length - 1, closestIndex + 1);
        return STATIONS[nextIdx].z;
      } else {
        // Scroll up/backward -> prev station
        const nextIdx = Math.max(0, closestIndex - 1);
        return STATIONS[nextIdx].z;
      }
    });
  };

  const goToStation = (zValue: number) => {
    setTargetZ(zValue);
  };

  const scrollCarousel = (direction: "prev" | "next") => {
    if (carouselRef.current) {
      const scrollAmt = direction === "prev" ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => {
      const next = prev === "3d" ? "flat" : "3d";
      if (typeof window !== "undefined") {
        localStorage.setItem("portfolio_view_mode", next);
      }
      return next;
    });
  };

  const renderStatsWidget = () => {
    return (
      <div className="live-widget">
        {!statsExpanded ? (
          <button 
            onClick={() => setStatsExpanded(true)}
            className="live-widget-compact pointer-events-auto"
          >
            <span className="online-dot" />
            <span>ONLINE</span>
            <strong>{stats.online}</strong>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <div className="live-widget-panel pointer-events-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div 
              className="live-widget-header cursor-pointer"
              onClick={() => setStatsExpanded(false)}
            >
              <span>Trình theo dõi</span>
              <ChevronUp className="w-4 h-4 text-slate-400" />
            </div>

            <div className="live-stat-row">
              <span>Đang online</span>
              <strong className="text-emerald-400">{stats.online}</strong>
            </div>

            <div className="live-stat-row">
              <span>Hôm nay</span>
              <strong className="text-blue-400">{stats.today}</strong>
            </div>

            <div className="live-stat-row">
              <span>Tháng này</span>
              <strong className="text-purple-400">{stats.month}</strong>
            </div>

            <div className="live-stat-row">
              <span>Tổng lượt xem</span>
              <strong className="text-orange-400">{stats.total.toLocaleString()}</strong>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        Đang khởi tạo không gian vũ trụ...
      </div>
    );
  }

  // --- RENDERING MOBILE OR FLAT VERSION ---
  if (isMobile || viewMode === "flat") {
    return (
      <>
        {/* View Mode Toggle Button for Desktop when in flat mode */}
        {!isMobile && (
          <button
            onClick={toggleViewMode}
            className="fixed top-6 right-6 z-[9999] pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-[10px] font-black text-slate-300 hover:text-cyan-400 shadow-2xl hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:border-cyan-500/40 backdrop-blur-md active:scale-95 tracking-wider"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>CHUYỂN GIAO DIỆN 3D</span>
          </button>
        )}

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

        <VisitorStatsCard variant="floating" stats={stats} />

        {/* Desktop Navigation */}
        <nav className="site-menu fixed top-6 inset-x-0 mx-auto w-fit z-[100] !hidden md:!flex" aria-label="Primary">
          <a
            href="#AboutSection"
            className={`menu-link ${flatActiveSection === "AboutSection" ? "active" : ""}`}
            data-section="AboutSection"
          >
            Giới thiệu
          </a>
          <a
            href="#SkillsSection"
            className={`menu-link ${flatActiveSection === "SkillsSection" ? "active" : ""}`}
            data-section="SkillsSection"
          >
            Kỹ năng
          </a>
          <a
            href="#ProjectContainer"
            className={`menu-link ${flatActiveSection === "ProjectContainer" ? "active" : ""}`}
            data-section="ProjectContainer"
          >
            Dự án
          </a>
          <a
            href="#ContactSection"
            className={`menu-link ${flatActiveSection === "ContactSection" ? "active" : ""}`}
            data-section="ContactSection"
          >
            Liên hệ
          </a>
          <a
            href="#DiarySection"
            className={`menu-link ${flatActiveSection === "DiarySection" ? "active" : ""}`}
            data-section="DiarySection"
          >
            Nhật ký
          </a>
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden fixed top-6 right-6 z-[100]">
          <Sheet>
            <SheetTrigger className="rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white px-5 h-12 shadow-xl flex items-center gap-3 transition-all active:scale-95 group cursor-pointer outline-none">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors animate-in fade-in slide-in-from-right-2" key={flatActiveSection}>
                {SECTION_LABELS[flatActiveSection] || "MENU"}
              </span>
              <div className="w-px h-4 bg-slate-800 group-hover:bg-blue-500/50 transition-colors" />
              <Menu className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950/95 border-slate-800 p-0 w-80">
              <SheetHeader className="p-8 border-b border-slate-900">
                <SheetTitle className="text-left text-2xl font-black tracking-tighter text-white uppercase italic">
                  Menu <span className="text-blue-500">Điều hướng</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-2">
                {[
                  { id: "AboutSection", label: "Giới thiệu" },
                  { id: "SkillsSection", label: "Kỹ năng" },
                  { id: "ProjectContainer", label: "Dự án" },
                  { id: "ContactSection", label: "Liên hệ" },
                  { id: "DiarySection", label: "Nhật ký" }
                ].map((item) => (
                  <SheetClose
                    key={item.id}
                    render={
                      <a
                        href={`#${item.id}`}
                        className={`flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all ${flatActiveSection === item.id
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                          }`}
                      >
                        <span>{item.label}</span>
                        {flatActiveSection === item.id && (
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
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="portfolio-theme min-h-dvh flex flex-col bg-slate-950 text-slate-100 font-sans scroll-smooth selection:bg-blue-500/30 relative z-10 overflow-x-hidden">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                "name": "An Đức Anh",
                "alternateName": ["ducanhdev", "Đức Anh dev"],
                "url": "https://ducanhdev.io.vn",
                "image": "https://ducanhdev.io.vn/assets/avatar.jpg",
                "description": "An Đức Anh (ducanhdev) là một Fullstack Web Developer, sinh năm 2004, hiện đang là sinh viên tại Trường Đại Học Mở Hà Nội. Chuyên gia phát triển ứng dụng Web với Next.js và React.",
                "jobTitle": "Fullstack Web Developer",
                "alumniOf": {
                  "@type": "CollegeOrUniversity",
                  "name": "Trường Đại học Mở Hà Nội"
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Hà Nội",
                  "addressCountry": "VN"
                },
                "sameAs": [
                  "https://github.com/AnAnh2k",
                  "https://www.facebook.com/anducanh125/"
                ],
                "brand": {
                  "@type": "Brand",
                  "name": "ducanhdev"
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
                        Trường Đại học Mở Hà Nội (2022 - 2026). Kỹ năng mềm nổi bật
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
                  {projects.map((project, index) => (
                    <article key={project.id} className="flex flex-col bg-slate-900/40 border border-slate-800 rounded-[24px] overflow-hidden hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group h-full relative">
                      {/* Badge Thứ tự dự án */}
                      <div className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400 font-black text-lg">
                          #{project.display_order || index + 1}
                        </span>
                      </div>

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
            <section id="ContactSection" className="py-24 border-t border-slate-900 mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto px-6">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 italic tracking-tighter uppercase">Bắt Đầu <span className="text-blue-500">Kết Nối</span></h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                      Đức Anh luôn sẵn sàng lắng nghe những ý tưởng mới và cơ hội hợp tác. Đừng ngần ngại để lại lời nhắn!
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-6 p-6 rounded-[32px] bg-slate-900/40 border border-slate-800 group hover:border-blue-500/30 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Mail className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email của mình</p>
                        <a href="mailto:anducanh125@gmail.com" className="text-lg font-black text-white hover:text-blue-400 transition-colors tracking-tight">anducanh125@gmail.com</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 rounded-[32px] bg-slate-900/40 border border-slate-800 group hover:border-emerald-500/30 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mạng xã hội</p>
                        <div className="flex gap-4">
                          <a href="https://www.facebook.com/anducanh125/" target="_blank" className="text-lg font-black text-white hover:text-emerald-400 transition-colors tracking-tight">Facebook</a>
                          <span className="text-slate-800">/</span>
                          <a href="https://github.com/AnAnh2k" target="_blank" className="text-lg font-black text-white hover:text-emerald-400 transition-colors tracking-tight">GitHub</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12 rounded-[40px] bg-slate-900/60 border border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white mb-8 italic">Gửi lời nhắn cho mình</h3>
                    <form onSubmit={handleContact} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-2">Tên của bạn</label>
                        <Input
                          placeholder="Nguyễn Văn A"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-14 rounded-2xl bg-slate-950 border-slate-800 focus:border-blue-500 text-white transition-all px-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-2">Email liên hệ</label>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-14 rounded-2xl bg-slate-950 border-slate-800 focus:border-blue-500 text-white transition-all px-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-2">Lời nhắn</label>
                        <Textarea
                          placeholder="Hãy nói về dự án của bạn..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          className="min-h-[150px] rounded-[32px] bg-slate-950 border-slate-800 focus:border-blue-500 text-white transition-all p-6 resize-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSending}
                        className="w-full h-16 rounded-[24px] bg-white text-slate-950 hover:bg-slate-200 font-black text-lg transition-all active:scale-[0.98] shadow-xl"
                      >
                        {isSending ? "Đang gửi..." : "Gửi tin nhắn ngay"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </section>

            {/* Diary Section */}
            <section id="DiarySection" className="py-24 border-t border-slate-900 mb-20 text-center">
              <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800 p-12 rounded-[40px] shadow-2xl relative overflow-hidden group flex flex-col items-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[80px]" />
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-4xl relative mb-6">
                  <Lock className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-4 mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Nhật Ký Cá Nhân</h2>
                  <p className="text-slate-400 text-sm font-semibold leading-relaxed max-w-sm mx-auto">
                    Nơi cất giữ những trang nhật ký riêng tư và lưu lại những khoảnh khắc đáng nhớ của An Đức Anh.
                  </p>
                </div>
                <Link
                  href="/memories"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm transition-all active:scale-95 shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] border border-indigo-400/20"
                >
                  Truy cập Nhật ký <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950 py-10 relative z-10">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-slate-500 text-sm font-medium">
                © {new Date().getFullYear()} An Đức Anh. All rights reserved.
              </div>
              <div className="flex gap-4 text-slate-400">
                <a
                  href="https://github.com/AnAnh2k"
                  target="_blank"
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
                <a
                  href="https://www.facebook.com/anducanh125/"
                  target="_blank"
                  className="hover:text-white transition-colors bg-slate-900 p-3 rounded-full"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
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

  // --- RENDERING DESKTOP 3D CORRIDOR VERSION ---
  return (
    <>
      {/* Topmost loading line */}
      <div className={`fixed top-0 left-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 z-[9999] transition-all duration-500 ease-out ${isApiLoading ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />

      {/* Screen Loader */}
      {initialLoading && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl animate-bounce">🛸</div>
            <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Đang tải chiều không gian 3D...</h2>
          <p className="text-slate-400 mb-6 text-sm">Chuẩn bị kết nối máy chủ...</p>
          <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-progress-loading" />
          </div>
        </div>
      )}

      {/* Compact/Expandable Live Statistics Widget */}
      {renderStatsWidget()}

      {/* Main 3D Corridor Wrapper */}
      <div 
        className="corridor-3d-scene"
        onWheel={handleWheel}
      >
        {/* 3D Corridor Space Container */}
        <div 
          className="corridor-container"
          style={{ transform: `translate3d(0, 0, ${cameraZ}px)` }}
        >
          {/* RENDER STATIONS DYNAMICALLY ACCORDING TO STATIONS CONFIG */}
          {STATIONS.map((station) => {
            const dist = Math.abs(cameraZ - station.z);
            const isActive = dist < 400;
            
            // Calculate opacity & blur dynamically based on Z-distance
            let opacity = 0.15;
            let blur = 4;
            if (dist < 800) {
              if (dist <= 200) {
                opacity = 1;
                blur = 0;
              } else {
                opacity = 1 - ((dist - 200) / 600) * 0.85; // scales 1.0 -> 0.15
                blur = ((dist - 200) / 600) * 4; // scales 0.0 -> 4.0
              }
            }

            return (
              <motion.section
                key={station.id}
                className={`corridor-station ${isActive ? 'station-active' : 'station-distant'}`}
                style={{
                  transform: `translate3d(-50%, -50%, ${-station.z}px)`,
                  opacity,
                  filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                {/* STATION CONTENT SWITCHER */}
                {station.id === 'intro' && (
                  <div className="station-panel">
                    <div className="led-line led-top" />
                    <div className="led-line led-right" />
                    <div className="led-line led-bottom" />
                    <div className="led-line led-left" />
                    <div className="led-corner led-tl" />
                    <div className="led-corner led-tr" />
                    <div className="led-corner led-bl" />
                    <div className="led-corner led-br" />
                    <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-10 items-center w-full px-6 py-4">
                      <div className="space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                          ONLINE PORTFOLIO SPACE
                        </div>
                        <h1 className="font-extrabold tracking-tight leading-[1.1] text-slate-100">
                          <span className="text-2xl block mb-2 font-medium text-slate-400">xin chào, mình là <span className="text-blue-400">ducanhdev</span></span>
                          <span className="text-5xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-md">
                            An Đức Anh
                          </span>
                        </h1>
                        <p className="text-base text-slate-400 leading-relaxed font-medium">
                          Mình sinh năm <span className="text-slate-100 font-bold">2004</span>, hiện tại là <span className="text-slate-100 font-bold">sinh viên năm cuối Đại học Mở Hà Nội</span>, định hướng phát triển trở thành một <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-black">Fullstack Web Developer</span> chuyên nghiệp.
                        </p>
                        
                        <div className="pt-4 flex gap-4">
                          <Button
                            size="lg"
                            onClick={() => goToStation(1600)}
                            className="rounded-full px-8 bg-white text-slate-950 hover:bg-slate-200 font-black text-sm h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all pointer-events-auto"
                          >
                            Khám phá Hành lang <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                          <a href="/CV_AnDucAnh.pdf" target="_blank" className="pointer-events-auto">
                            <Button
                              variant="outline"
                              size="lg"
                              className="rounded-full px-6 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 h-12 text-sm flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" /> Tải CV
                            </Button>
                          </a>
                        </div>

                        <div className="pt-6 text-slate-500 text-[10px] font-black tracking-widest uppercase animate-pulse">
                          Cuộn chuột xuống hoặc nhấn [S] để di chuyển dọc hành lang neon
                        </div>
                      </div>

                      <div className="flex justify-center md:justify-end">
                        <div className="relative w-48 h-48 group">
                          <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl group-hover:bg-emerald-400/20 transition-all" />
                          <div className="relative w-full h-full rounded-full border-4 border-slate-800/80 overflow-hidden shadow-2xl p-2 bg-slate-900/40">
                            <img
                              src="/assets/avatar.jpg"
                              alt="An Đức Anh"
                              className="w-full h-full object-cover rounded-full border-2 border-emerald-400/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {station.id === 'skills' && (
                  <div className="station-panel">
                    <div className="led-line led-top" />
                    <div className="led-line led-right" />
                    <div className="led-line led-bottom" />
                    <div className="led-line led-left" />
                    <div className="led-corner led-tl" />
                    <div className="led-corner led-tr" />
                    <div className="led-corner led-bl" />
                    <div className="led-corner led-br" />
                    <div className="w-full px-6 flex flex-col items-center">
                      <div className="section-heading">
                        <span>TECH STACK</span>
                        <h2>Kỹ năng của tôi</h2>
                        <p>Những công nghệ mình đã học và sử dụng trong các dự án.</p>
                      </div>

                      <div className="skills-vertical-board">
                        {skillColumns.map((col) => (
                          <div className="skill-vertical-column" key={col.title}>
                            <div className="skill-column-title">
                              {col.title}
                            </div>
                            
                            <div className="skill-vertical-track-wrapper">
                              <div className="skill-vertical-track">
                                {[...col.items, ...col.items, ...col.items].map((skill, index) => (
                                  <div className="skill-3d-chip" key={`${skill}-${index}`}>
                                    <span className="skill-3d-icon">
                                      {renderSkillLogo(skill)}
                                    </span>
                                    <span className="skill-name">{skill}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {station.id === 'projects' && (
                  <div className="station-panel">
                    <div className="led-line led-top" />
                    <div className="led-line led-right" />
                    <div className="led-line led-bottom" />
                    <div className="led-line led-left" />
                    <div className="led-corner led-tl" />
                    <div className="led-corner led-tr" />
                    <div className="led-corner led-bl" />
                    <div className="led-corner led-br" />
                    <div className="w-full px-6 flex flex-col items-center">
                      <div className="section-heading">
                        <span>PROJECT GALLERY</span>
                        <h2>Dự án nổi bật</h2>
                        <p>Các dự án được sắp xếp theo mức độ ưu tiên.</p>
                      </div>

                      {/* Horizontal Scroll Carousel */}
                      <div className="project-carousel-wrapper">
                        <button 
                          onClick={() => scrollCarousel("prev")} 
                          className="carousel-btn prev"
                          title="Dự án trước"
                        >
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>

                        <div ref={carouselRef} className="project-carousel custom-hud-scroll">
                          {projects.map((project, index) => (
                            <article 
                              key={project.id} 
                              className="project-card flex flex-col justify-between"
                            >
                              <div className="project-rank">
                                #{String(index + 1).padStart(2, '0')}
                              </div>

                              <div>
                                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 mb-4">
                                  {project.image_url ? (
                                    <img
                                      src={project.image_url}
                                      alt={project.title}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                      <Code className="w-8 h-8 text-slate-700" />
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
                                    {project.category || "Personal Project"}
                                  </h4>
                                  <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                                    {project.title}
                                  </h3>
                                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed font-medium">
                                    {project.description}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 space-y-3">
                                {project.tech_stack && (
                                  <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-slate-500">
                                    {project.tech_stack.split(',').map((tag: string) => (
                                      <span key={tag.trim()}>#{tag.trim()}</span>
                                    ))}
                                  </div>
                                )}

                                <div className="flex gap-3 relative z-10">
                                  {project.demo_url && (
                                    <a
                                      href={project.demo_url}
                                      target="_blank"
                                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold hover:opacity-90 transition-all active:scale-95"
                                    >
                                      Demo <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                  {project.repo_url && (
                                    <a
                                      href={project.repo_url}
                                      target="_blank"
                                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold hover:bg-slate-700 transition-all active:scale-95"
                                    >
                                      Source <Code className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>

                        <button 
                          onClick={() => scrollCarousel("next")} 
                          className="carousel-btn next"
                          title="Dự án tiếp theo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {station.id === 'contact' && (
                  <div className="station-panel">
                    <div className="led-line led-top" />
                    <div className="led-line led-right" />
                    <div className="led-line led-bottom" />
                    <div className="led-line led-left" />
                    <div className="led-corner led-tl" />
                    <div className="led-corner led-tr" />
                    <div className="led-corner led-bl" />
                    <div className="led-corner led-br" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl w-full px-6 py-4 items-center relative">
                      {/* Glowing sci-fi portal background */}
                      <div className="contact-portal" />

                      {/* Direct Contact details */}
                      <div className="space-y-6 text-left relative z-10">
                        <div>
                          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Liên <span className="text-blue-500">Hệ</span>
                          </h2>
                          <p className="text-slate-400 text-sm font-semibold leading-relaxed mt-4">
                            Bạn có ý tưởng dự án hoặc cơ hội công việc phù hợp? Hãy gửi tin nhắn ngay tại đây, mình sẽ phản hồi bạn trong thời gian sớm nhất.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Email liên lạc</p>
                              <a href="mailto:anducanh125@gmail.com" className="text-xs font-bold text-white hover:text-blue-400 transition-colors">anducanh125@gmail.com</a>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Social Links</p>
                              <div className="flex gap-3 text-xs font-bold text-slate-300">
                                <a href="https://www.facebook.com/anducanh125/" target="_blank" className="hover:text-emerald-400 transition-colors">Facebook</a>
                                <span>/</span>
                                <a href="https://github.com/AnAnh2k" target="_blank" className="hover:text-emerald-400 transition-colors">GitHub</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form panel */}
                      <div className="p-8 rounded-[2rem] bg-slate-900/75 border border-slate-800/80 shadow-2xl relative z-10 w-full">
                        <h3 className="text-base font-black text-white mb-6 italic flex items-center gap-2">
                          <Send className="w-4.5 h-4.5 text-blue-500" /> Bảng gửi tín hiệu liên hệ
                        </h3>
                        <form onSubmit={handleContact} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider ml-1">Tên của bạn</label>
                            <Input
                              placeholder="Nguyễn Văn A"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="h-11 rounded-xl bg-slate-950 border-slate-800/80 focus:border-blue-500 text-white text-xs px-4"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider ml-1">Email liên hệ</label>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-11 rounded-xl bg-slate-950 border-slate-800/80 focus:border-blue-500 text-white text-xs px-4"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider ml-1">Lời nhắn</label>
                            <Textarea
                              placeholder="Hãy nói về dự án của bạn..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              required
                              className="min-h-[100px] rounded-2xl bg-slate-950 border-slate-800/80 focus:border-blue-500 text-white text-xs p-4 resize-none"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isSending}
                            className="w-full h-11 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-black text-xs transition-all active:scale-[0.98] mt-2 shadow-lg"
                          >
                            {isSending ? "ĐANG GỬI..." : "GỬI TÍN HIỆU"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {station.id === 'diary' && (
                  <div className="station-panel">
                    <div className="led-line led-top" />
                    <div className="led-line led-right" />
                    <div className="led-line led-bottom" />
                    <div className="led-line led-left" />
                    <div className="led-corner led-tl" />
                    <div className="led-corner led-tr" />
                    <div className="led-corner led-bl" />
                    <div className="led-corner led-br" />
                    <div className="max-w-xl w-full px-8 py-10 text-center relative z-10 flex flex-col items-center">
                      
                      {/* Sci-fi vault visual */}
                      <div className="relative mb-8 group cursor-pointer">
                        <Link href="/memories">
                          <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-4xl relative transition-all duration-300 hover:scale-105 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                            <Lock className="w-10 h-10 text-indigo-400 animate-pulse" />
                          </div>
                        </Link>
                        <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/20 blur-xl opacity-50 pointer-events-none" />
                      </div>

                      <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                        KHO LƯU TRỮ <span className="text-indigo-400">KỶ NIỆM</span>
                      </h2>
                      <p className="text-slate-400 text-sm font-semibold leading-relaxed max-w-sm mb-8">
                        Nơi cất giữ những trang nhật ký riêng tư và lưu lại những khoảnh khắc đáng nhớ của An Đức Anh.
                      </p>

                      <Link 
                        href="/memories"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm transition-all active:scale-95 shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] border border-indigo-400/20"
                      >
                        Truy cập Nhật ký <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </motion.section>
            );
          })}
        </div>

        {/* --- GAME HUD OVERLAY CONTAINER --- */}
        <div className="hud-container">
          {/* View Mode Toggle Button for Desktop */}
          <button
            onClick={toggleViewMode}
            className="fixed top-6 right-6 z-[9999] pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-[10px] font-black text-slate-300 hover:text-cyan-400 shadow-2xl hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:border-cyan-500/40 backdrop-blur-md active:scale-95 tracking-wider"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>CHUYỂN GIAO DIỆN FLAT</span>
          </button>

          {/* Top Info Bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-center pointer-events-auto">
            <nav className="site-menu !m-0 !py-1.5 !px-2 shadow-xl !border-slate-800/60" aria-label="HUD Nav">
              {STATIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => goToStation(s.z)}
                  className={`menu-link !text-xs ${activeSection === s.id ? "active" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Left HUD Radar & Mini-map */}
          <div className="absolute left-6 bottom-6 flex flex-col gap-4 items-center bg-slate-900/85 border border-slate-800/80 p-4 rounded-3xl backdrop-blur-md pointer-events-auto">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center mb-1">Checkpoint</p>
            
            <div className="hud-minimap-track">
              <div 
                className="hud-minimap-indicator"
                style={{ 
                  bottom: `${Math.min(100, (cameraZ / MAX_Z) * 100)}%` 
                }}
              />
            </div>
            
            <div className="text-center space-y-0.5">
              <p className="text-[9px] font-black text-cyan-400 uppercase tracking-tight">Vị trí Z</p>
              <p className="text-[10px] font-mono text-slate-300 font-bold">{Math.round(cameraZ)}m</p>
            </div>
          </div>

          {/* Right HUD Game Controller (snappy step navigation) */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-3 bg-slate-900/85 border border-slate-800/80 p-4 rounded-3xl backdrop-blur-md pointer-events-auto items-center">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center mb-1">Di Chuyển</p>
            <button 
              onClick={() => {
                setTargetZ(prev => {
                  const closestIndex = getClosestStationIndex(prev);
                  const nextIdx = Math.min(STATIONS.length - 1, closestIndex + 1);
                  return STATIONS[nextIdx].z;
                });
              }}
              title="Di chuyển lên trước (W)"
              className="hud-button"
            >
              <ArrowUp className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => {
                setTargetZ(prev => {
                  const closestIndex = getClosestStationIndex(prev);
                  const nextIdx = Math.max(0, closestIndex - 1);
                  return STATIONS[nextIdx].z;
                });
              }}
              title="Lùi lại phía sau (S)"
              className="hud-button"
            >
              <ArrowDown className="w-4.5 h-4.5" />
            </button>
            <div className="text-[9px] text-slate-500 font-mono text-center mt-1">W / S KEYS</div>
          </div>
        </div>
      </div>
    </>
  );
}
