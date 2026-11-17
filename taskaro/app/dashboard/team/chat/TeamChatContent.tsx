"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Users2,
  Hash,
  User,
  ShieldCheck,
  Crown,
  Search,
  RefreshCw,
  Ticket,
  ChevronLeft,
  Circle,
  Paperclip,
} from "lucide-react";

interface MessageData {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role?: string;
  };
  recipientId?: {
    _id: string;
    name: string;
  };
  content: string;
  attachments?: { url: string; name: string }[];
  createdAt: string;
}

export default function TeamChatContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Active Chat State
  const initialChannelType = (searchParams.get("channelType") as any) || "department";
  const initialTicketId = searchParams.get("ticketId") || null;

  const [activeChannelType, setActiveChannelType] = useState<"department" | "direct" | "ticket">(
    initialTicketId ? "ticket" : initialChannelType
  );
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<any | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(initialTicketId);

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Initial Load
  const init = async () => {
    try {
      setLoading(true);
      const orgRes = await fetch("/api/secure/team/org");
      const orgData = await orgRes.json();

      if (orgRes.ok && orgData.organizations?.length > 0) {
        const currentOrgId = orgData.organizations[0].org._id;
        setOrgId(currentOrgId);

        const detailsRes = await fetch(`/api/secure/team/org/${currentOrgId}`);
        const detailsData = await detailsRes.json();

        if (detailsRes.ok) {
          setDepartments(detailsData.departments || []);
          setMembers(detailsData.members || []);

          if (!initialTicketId && detailsData.departments?.length > 0) {
            setActiveDepartmentId(detailsData.departments[0]._id);
            await fetchMessages(currentOrgId, "department", detailsData.departments[0]._id);
          } else if (initialTicketId) {
            await fetchMessages(currentOrgId, "ticket", undefined, initialTicketId);
          }
        }
      }
    } catch {
      console.error("Failed to load chat channels.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (
    targetOrgId: string,
    channelType: "department" | "direct" | "ticket",
    deptId?: string | null,
    ticketId?: string | null,
    recipientId?: string | null
  ) => {
    try {
      const url = new URL("/api/secure/team/messages", window.location.origin);
      url.searchParams.set("orgId", targetOrgId);
      url.searchParams.set("channelType", channelType);
      if (channelType === "department" && deptId) url.searchParams.set("departmentId", deptId);
      if (channelType === "ticket" && ticketId) url.searchParams.set("ticketId", ticketId);
      if (channelType === "direct" && recipientId) url.searchParams.set("recipientId", recipientId);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch {
      console.error("Error fetching messages.");
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Periodic polling for real-time freshness
  useEffect(() => {
    if (!orgId) return;
    const interval = setInterval(() => {
      fetchMessages(
        orgId,
        activeChannelType,
        activeDepartmentId,
        activeTicketId,
        activeRecipient?.user?._id
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [orgId, activeChannelType, activeDepartmentId, activeTicketId, activeRecipient]);

  // Switch to Department Channel
  const handleSelectDepartment = (dept: any) => {
    setActiveChannelType("department");
    setActiveDepartmentId(dept._id);
    setActiveRecipient(null);
    setActiveTicketId(null);
    if (orgId) fetchMessages(orgId, "department", dept._id);
  };

  // Switch to Direct 1-on-1 Message
  const handleSelectMember = (member: any) => {
    setActiveChannelType("direct");
    setActiveRecipient(member);
    setActiveDepartmentId(null);
    setActiveTicketId(null);
    if (orgId && member.user?._id) fetchMessages(orgId, "direct", undefined, undefined, member.user._id);
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !orgId || sending) return;

    const payload: any = {
      orgId,
      channelType: activeChannelType,
      content: inputText.trim(),
    };

    if (activeChannelType === "department") payload.departmentId = activeDepartmentId;
    if (activeChannelType === "ticket") payload.ticketId = activeTicketId;
    if (activeChannelType === "direct") payload.recipientId = activeRecipient?.user?._id;

    try {
      setSending(true);
      setInputText("");
      const res = await fetch("/api/secure/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      console.error("Error sending message.");
    } finally {
      setSending(false);
    }
  };

  const activeDepartment = departments.find((d) => d._id === activeDepartmentId);
  const currentUserId = (session?.user as any)?.id;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-(--color-primary) animate-spin" />
        <p className="text-sm font-medium text-(--color-desc)">Connecting to team chat hub...</p>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <MessageSquare className="w-12 h-12 text-(--color-desc) mx-auto" />
        <h2 className="text-lg font-bold text-(--color-text)">No Organization Hub Found</h2>
        <p className="text-xs text-(--color-desc)">
          Create an organization first to start communicating with your team.
        </p>
        <Link
          href="/dashboard/team"
          className="inline-flex px-4 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-bold"
        >
          Setup Organization
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] flex flex-col md:flex-row rounded-3xl bg-(--card-bg) border border-(--color-border) overflow-hidden shadow-xs">
      {/* LEFT CHAT SIDEBAR: CHANNELS & DIRECT MESSAGES */}
      <div className="w-full md:w-72 lg:w-80 border-r border-(--color-border) flex flex-col bg-(--card-bg) shrink-0">
        {/* SIDEBAR HEADER */}
        <div className="p-4 border-b border-(--color-border) space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-(--color-text) flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Team Discussions</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-emerald-500" /> LIVE
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-(--color-desc) absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter members or channels..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
            />
          </div>
        </div>

        {/* LIST OF CHANNELS & MEMBERS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* 1. TICKET HUDDLE (IF ACTIVE) */}
          {activeTicketId && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
                Active Ticket Huddle
              </p>
              <button
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center gap-2 text-left"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span className="truncate">Ticket Discussion Room</span>
              </button>
            </div>
          )}

          {/* 2. DEPARTMENT CHANNELS */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
              Department Channels
            </p>
            {departments.map((dept) => {
              const isActive = activeChannelType === "department" && activeDepartmentId === dept._id;
              return (
                <button
                  key={dept._id}
                  onClick={() => handleSelectDepartment(dept)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? "bg-(--color-primary) text-white shadow-xs"
                      : "text-(--color-content) hover:bg-(--hover-card-bg) hover:text-(--color-text)"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dept.name}</span>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: dept.color || "#6366f1" }}
                  />
                </button>
              );
            })}
          </div>

          {/* 3. DIRECT MESSAGES */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
              Direct Messages (1-on-1)
            </p>
            {members
              .filter((m) => m.user._id !== currentUserId)
              .filter((m) =>
                memberSearch.trim()
                  ? m.user.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.user.email?.toLowerCase().includes(memberSearch.toLowerCase())
                  : true
              )
              .map((member) => {
                const isActive =
                  activeChannelType === "direct" && activeRecipient?.user?._id === member.user._id;

                return (
                  <button
                    key={member._id}
                    onClick={() => handleSelectMember(member)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-(--color-content) hover:bg-(--hover-card-bg) hover:text-(--color-text)"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {member.user.name ? member.user.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs truncate">{member.user.name}</p>
                        <p className="text-[10px] text-(--color-desc) truncate">{member.jobTitle}</p>
                      </div>
                    </div>

                    {member.role === "owner" ? (
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    ) : member.role === "lead" ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-(--hover-card-bg)/30">
        {/* CHAT HEADER */}
        <div className="p-4 border-b border-(--color-border) bg-(--card-bg) flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeChannelType === "department" ? (
              <>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: activeDepartment?.color || "#6366f1" }}
                >
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-(--color-text)">
                    #{activeDepartment?.name || "department"}
                  </h3>
                  <p className="text-[11px] text-(--color-desc)">
                    {activeDepartment?.description || "Department discussion & announcements."}
                  </p>
                </div>
              </>
            ) : activeChannelType === "ticket" ? (
              <>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-(--color-text)">Ticket Micro-Huddle</h3>
                  <p className="text-[11px] text-(--color-desc)">Cross-department resolver room</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {activeRecipient?.user?.name ? activeRecipient.user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-(--color-text)">
                    {activeRecipient?.user?.name || "Direct Message"}
                  </h3>
                  <p className="text-[11px] text-(--color-desc)">
                    {activeRecipient?.jobTitle} • {activeRecipient?.user?.email}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MESSAGES THREAD */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-(--color-desc)">
              <MessageSquare className="w-8 h-8 opacity-40" />
              <p className="text-xs">No messages yet. Send the first message to start the discussion!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId?._id === currentUserId;

              return (
                <div
                  key={m._id}
                  className={`flex items-start gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {m.senderId?.name ? m.senderId.name[0].toUpperCase() : "U"}
                  </div>

                  <div className={`space-y-1 max-w-[80%] sm:max-w-md ${isMine ? "items-end text-right" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-(--color-text)">
                        {isMine ? "You" : m.senderId?.name}
                      </span>
                      <span className="text-[10px] text-(--color-desc)">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? "bg-(--color-primary) text-white rounded-tr-none shadow-sm"
                          : "bg-(--card-bg) border border-(--color-border) text-(--color-text) rounded-tl-none shadow-xs"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* MESSAGE COMPOSER */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-(--card-bg) border-t border-(--color-border)">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Message ${
                activeChannelType === "department"
                  ? `#${activeDepartment?.name || "department"}`
                  : activeRecipient?.user?.name || "colleague"
              }...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 rounded-xl bg-(--color-primary) hover:opacity-90 text-white transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
