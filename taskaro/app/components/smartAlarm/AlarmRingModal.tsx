"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BellRing,
  Volume2,
  Clock,
  CheckCircle2,
  Brain,
  Quote,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { AlarmItem } from "./AlarmCard";

interface AlarmRingModalProps {
  alarm: AlarmItem;
  onDismiss: (alarmId: string) => void;
  onSnooze: (alarmId: string, minutes: number) => void;
}

export default function AlarmRingModal({
  alarm,
  onDismiss,
  onSnooze,
}: AlarmRingModalProps) {
  // Challenge State
  const challengeType = alarm.challenge || "none";

  // Math Challenge Setup
  const [mathProblem, setMathProblem] = useState<{ num1: number; num2: number; ans: number; op: string }>({
    num1: 15,
    num2: 27,
    ans: 42,
    op: "+",
  });
  const [userMathAns, setUserMathAns] = useState("");
  const [mathError, setMathError] = useState(false);

  // Quote Challenge Setup
  const sampleQuotes = [
    "I am awake, focused, and ready to dominate today.",
    "Small steps every day lead to massive results.",
    "Discipline is choosing between what you want now and what you want most.",
    "Today is a brand new opportunity to excel.",
  ];
  const selectedQuote = useMemo(() => {
    return sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
  }, []);
  const [userQuoteInput, setUserQuoteInput] = useState("");
  const [quoteError, setQuoteError] = useState(false);

  // Generate random math problem on mount
  useEffect(() => {
    if (challengeType === "math") {
      const ops = ["+", "+", "*"];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let n1 = Math.floor(Math.random() * 40) + 12;
      let n2 = Math.floor(Math.random() * 30) + 7;
      if (op === "*") {
        n1 = Math.floor(Math.random() * 9) + 4;
        n2 = Math.floor(Math.random() * 8) + 3;
      }
      const ans = op === "+" ? n1 + n2 : n1 * n2;
      setMathProblem({ num1: n1, num2: n2, ans, op });
    }
  }, [challengeType]);

  // Handle Math Submit
  const handleVerifyMath = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userMathAns.trim(), 10) === mathProblem.ans) {
      onDismiss(alarm._id);
    } else {
      setMathError(true);
      setTimeout(() => setMathError(false), 2000);
    }
  };

  // Handle Quote Submit
  const handleVerifyQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (userQuoteInput.trim().toLowerCase() === selectedQuote.toLowerCase()) {
      onDismiss(alarm._id);
    } else {
      setQuoteError(true);
      setTimeout(() => setQuoteError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border-2 border-blue-500/50 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
        {/* Glowing Background Radial */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        {/* Pulsing Bell & Ringing Visualizer */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40 animate-bounce">
            <BellRing className="w-10 h-10 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        {/* Time & Title */}
        <div className="space-y-1">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-blue-400">
            {alarm.time}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center justify-center gap-2">
            <span>{alarm.purpose?.emoji || "⏰"}</span>
            <span>{alarm.label || alarm.purpose?.label || "Smart Alarm"}</span>
          </h2>
          {alarm.message && (
            <p className="text-sm text-zinc-400 max-w-md italic mt-1">
              &ldquo;{alarm.message}&rdquo;
            </p>
          )}
        </div>

        {/* Equalizer animation */}
        <div className="flex items-center gap-1.5 h-6">
          <span className="w-1 bg-blue-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
          <span className="w-1 bg-indigo-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-6" />
          <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-4" />
          <span className="w-1 bg-amber-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-5" />
          <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3" />
          <span className="text-xs text-zinc-400 ml-2 font-medium tracking-wider uppercase">
            Ringing • Sound Active
          </span>
        </div>

        {/* CHALLENGE 1: MATH CHALLENGE */}
        {challengeType === "math" && (
          <div className="w-full bg-zinc-800/80 border border-purple-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Brain size={16} />
              <span>Wake-up Math Challenge</span>
            </div>
            <p className="text-xs text-zinc-300">
              Solve this problem to verify you are fully awake and dismiss the alarm:
            </p>
            <div className="text-3xl font-extrabold font-mono tracking-wider text-white py-1">
              {mathProblem.num1} {mathProblem.op} {mathProblem.num2} = ?
            </div>
            <form onSubmit={handleVerifyMath} className="flex gap-2">
              <input
                type="number"
                autoFocus
                placeholder="Enter answer"
                value={userMathAns}
                onChange={(e) => setUserMathAns(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border text-center font-bold text-lg text-white focus:outline-none focus:ring-2 ${
                  mathError
                    ? "border-rose-500 ring-rose-500 animate-shake"
                    : "border-zinc-700 focus:ring-purple-500"
                }`}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-sm text-white transition cursor-pointer"
              >
                Solve & Dismiss
              </button>
            </form>
            {mathError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle size={14} /> Incorrect answer! Try again.
              </p>
            )}
          </div>
        )}

        {/* CHALLENGE 2: QUOTE TYPING CHALLENGE */}
        {challengeType === "quote" && (
          <div className="w-full bg-zinc-800/80 border border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Quote size={16} />
              <span>Morning Affirmation Challenge</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs sm:text-sm font-medium text-amber-200">
              &ldquo;{selectedQuote}&rdquo;
            </div>
            <form onSubmit={handleVerifyQuote} className="space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Type the exact quote above..."
                value={userQuoteInput}
                onChange={(e) => setUserQuoteInput(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-zinc-900 border text-sm text-white focus:outline-none focus:ring-2 ${
                  quoteError
                    ? "border-rose-500 ring-rose-500 animate-shake"
                    : "border-zinc-700 focus:ring-amber-500"
                }`}
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-sm text-white transition cursor-pointer"
              >
                Verify & Turn Off
              </button>
            </form>
            {quoteError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle size={14} /> Text does not match. Keep typing!
              </p>
            )}
          </div>
        )}

        {/* STANDARD DISMISS & SNOOZE */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 pt-2">
          {challengeType === "none" && (
            <button
              onClick={() => onDismiss(alarm._id)}
              className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 size={20} />
              <span>Turn Off Alarm</span>
            </button>
          )}

          <button
            onClick={() => onSnooze(alarm._id, alarm.snoozeDuration || 5)}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Clock size={16} />
            <span>Snooze ({alarm.snoozeDuration || 5} min)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
