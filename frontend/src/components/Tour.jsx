import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiX,
  HiArrowNarrowUp,
  HiArrowNarrowDown,
  HiOutlineArrowRight,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";

const allSteps = [
  {
    emoji: "👋",
    color: "from-blue-500 to-cyan-400",
    target: null,
    title: "Welcome to NeighbourHelp",
    desc: "This app connects you with people nearby for small tasks: picking up a parcel, getting tutoring, or just a helping hand.",
  },
  {
    emoji: "✍️",
    color: "from-cyan-400 to-emerald-400",
    target: "get-started",
    guestOnly: true,
    title: "Create your account",
    desc: "Tap 'Get Started' to sign up. You only need your name, email, and an OTP. It takes about a minute.",
  },
  {
    emoji: "🔑",
    color: "from-emerald-400 to-teal-400",
    target: "sign-in",
    guestOnly: true,
    title: "Already have an account?",
    desc: "Use 'Sign In' to log in with your email and password, or with Google.",
  },
  {
    emoji: "🤝",
    color: "from-amber-400 to-orange-500",
    target: "micro-tasks",
    title: "Post a task or help out",
    desc: "Open Micro-Tasks to post your own task, or accept someone else's task and earn credits.",
  },
  {
    emoji: "ℹ️",
    color: "from-sky-400 to-blue-500",
    target: "about",
    title: "Learn about us",
    desc: "The About page explains who we are and how NeighbourHelp keeps your community safe and trusted.",
  },
  {
    emoji: "👤",
    color: "from-fuchsia-500 to-purple-500",
    target: "profile",
    loggedInOnly: true,
    title: "Your profile",
    desc: "Open your profile to update your photo, add your skills, and check your credits.",
  },
  {
    emoji: "🖇️",
    color: "from-teal-400 to-cyan-500",
    target: "footer-links",
    title: "Quick links & contact",
    desc: "Find About us, Microtasks and Contact here.",
  },
  {
    emoji: "🔗",
    color: "from-pink-500 to-purple-500",
    target: "footer-socials",
    title: "Connect with us",
    desc: "Reach us on Instagram, LinkedIn and GitHub.",
  },
];

const PAD = 8;
const GAP = 40;
const CARD_H = 340;
const MIN_CARD_H = 260;
const TOP_MARGIN = 24;

const findTarget = (name) => {
  if (!name) return null;
  const nodes = document.querySelectorAll(`[data-tour="${name}"]`);
  for (const n of nodes) {
    const r = n.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return n;
  }
  return null;
};

export default function WelcomeTour({ storageKey = "nh_welcome_seen" }) {
  const loggedIn = !!localStorage.getItem("Users");
  const steps = allSteps.filter((s) => {
    if (s.loggedInOnly && !loggedIn) return false;
    if (s.guestOnly && loggedIn) return false;
    return true;
  });

  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => !!localStorage.getItem(storageKey));
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [rect, setRect] = useState(null);
  const [ready, setReady] = useState(false);
  const [navH, setNavH] = useState(0);
  const navigate = useNavigate();

  const step = steps[index] || steps[0];
  const isLast = index === steps.length - 1;

  const startTour = () => {
    setIndex(0);
    setOpen(true);
    setSeen(true);
    localStorage.setItem(storageKey, "1");
  };

  useEffect(() => {
    window.__startNeighbourHelpTour = startTour;
    return () => {
      delete window.__startNeighbourHelpTour;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const block = (e) => e.preventDefault();
    const blockKeys = (e) => {
      const keys = [" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"];
      if (keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);
    return () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let t1 = 0;
    let t2 = 0;
    setReady(false);

    const header = document.querySelector("header");
    const headerH = header ? header.offsetHeight : 0;
    setNavH(headerH);

    const measure = () => {
      const node = findTarget(step.target);
      if (!node) {
        setRect(null);
        return;
      }
      const r = node.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const el = findTarget(step.target);

    if (!el) {
      setRect(null);
      setReady(true);
      return;
    }

    if (header && header.contains(el)) {
      measure();
      setReady(true);
      return;
    }

    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const r0 = el.getBoundingClientRect();
    const targetY = Math.min(
      Math.max(0, window.scrollY + r0.top - (headerH + TOP_MARGIN)),
      Math.max(0, maxY)
    );

    window.scrollTo({ top: targetY, behavior: "smooth" });

    t1 = setTimeout(() => {
      measure();
      setReady(true);
    }, 700);

    t2 = setTimeout(measure, 1100);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [open, index, step.target]);

  const close = () => {
    setOpen(false);
    setSeen(true);
    localStorage.setItem(storageKey, "1");
  };

  const go = (delta) => {
    setLeaving(true);
    setTimeout(() => {
      setIndex((i) => i + delta);
      setLeaving(false);
    }, 150);
  };

  const next = () => (isLast ? close() : go(1));
  const prev = () => index > 0 && go(-1);

  const finish = () => {
    close();
    if (!loggedIn) navigate("/signup");
  };

  if (!open) {
    return (
      <div className="fixed bottom-5 right-5 z-[9997] flex flex-col items-start gap-1.5">
        {!seen && (
          <>
            <div className="px-3 py-2 rounded-xl bg-cyan-500 text-[#021018] text-xs font-bold shadow-xl">
              New here? Start with a quick tour
            </div>
            <HiArrowNarrowDown className="ml-8 text-3xl text-cyan-400 animate-bounce" />
          </>
        )}
        <div className="relative">
          {!seen && (
            <span className="absolute inset-0 rounded-full bg-cyan-400/50 animate-ping" />
          )}
          <button
            type="button"
            onClick={startTour}
            className={`relative h-11 px-4 rounded-full bg-slate-900 border text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${
              seen
                ? "border-cyan-400/30 hover:border-cyan-400/60"
                : "border-cyan-400 ring-2 ring-cyan-400/60"
            }`}
          >
            <HiOutlineQuestionMarkCircle className="text-base" />
            Take a tour
          </button>
        </div>
      </div>
    );
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(320, vw - 24);

  let pointing = false;
  let below = true;
  let cardStyle = {};
  let arrowStyle = {};
  let spotStyle = {};

  if (ready && step.target && rect && rect.height < vh * 0.7) {
    const spotTop = rect.top - PAD;
    const spotBottom = rect.top + rect.height + PAD;
    const roomBelow = vh - spotBottom - GAP - 12;
    const roomAbove = spotTop - navH - GAP - 12;

    if (Math.max(roomBelow, roomAbove) >= MIN_CARD_H) {
      pointing = true;
      below = roomBelow >= CARD_H || roomBelow >= roomAbove;
    }

    if (pointing) {
      const cx = rect.left + rect.width / 2;
      const left = Math.max(12, Math.min(cx - cardW / 2, vw - cardW - 12));
      const maxHeight = below ? roomBelow : roomAbove;

      spotStyle = {
        top: spotTop,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      };

      cardStyle = below
        ? { top: spotBottom + GAP, left, width: cardW, maxHeight, overflowY: "auto" }
        : { bottom: vh - spotTop + GAP, left, width: cardW, maxHeight, overflowY: "auto" };

      const arrowX = Math.max(20, Math.min(cx, vw - 20)) - 14;
      arrowStyle = below
        ? { top: spotBottom + 6, left: arrowX }
        : { bottom: vh - spotTop + 6, left: arrowX };
    }
  }

  const card = (
    <div
      className={`relative rounded-3xl border border-white/10 bg-slate-900 shadow-2xl ${
        pointing ? "" : "w-full max-w-sm overflow-hidden"
      }`}
      style={pointing ? { position: "fixed", ...cardStyle } : undefined}
    >
      <button
        onClick={close}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
      >
        <HiX className="text-base" />
      </button>

      <div
        className={`px-6 pt-8 pb-6 transition-opacity duration-150 ${
          leaving ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl shadow-lg`}
        >
          {step.emoji}
        </div>

        <h2 className="mt-4 text-lg font-black text-white text-center leading-snug">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-slate-300 text-center leading-relaxed">
          {step.desc}
        </p>

        <div className="flex justify-center gap-1.5 mt-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-cyan-400" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          {index > 0 && (
            <button
              onClick={prev}
              className="h-11 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold transition"
            >
              Back
            </button>
          )}

          {isLast ? (
            <button
              onClick={finish}
              className="flex-1 h-11 rounded-xl bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-white/10 transition"
            >
              {loggedIn ? "Done" : "Let's get started"}
              <HiOutlineArrowRight className="text-sm" />
            </button>
          ) : (
            <button
              onClick={next}
              className="flex-1 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#021018] text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              Next
              <HiOutlineArrowRight className="text-sm" />
            </button>
          )}
        </div>

        {!isLast && (
          <button
            onClick={close}
            className="mt-3 w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9998]">
      {!ready ? (
        <div className="absolute inset-0 bg-[#020617]/60" />
      ) : pointing ? (
        <>
          <div className="absolute inset-0" />

          <div
            className="fixed rounded-2xl pointer-events-none ring-2 ring-cyan-400"
            style={{
              ...spotStyle,
              boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.85)",
            }}
          />

          <div
            className="fixed pointer-events-none text-cyan-400 text-3xl animate-bounce"
            style={arrowStyle}
          >
            {below ? <HiArrowNarrowUp /> : <HiArrowNarrowDown />}
          </div>

          {card}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#020617]/90" onClick={close} />
          {card}
        </div>
      )}
    </div>
  );
}