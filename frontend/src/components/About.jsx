import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiOutlineGlobe,
  HiOutlineChatAlt2,
  HiOutlineStar,
  HiOutlineCode,
  HiOutlineDesktopComputer,
  HiOutlineMap,
  HiOutlineServer,
  HiOutlineDatabase,
  HiOutlineLockClosed,
  HiOutlineCloudUpload,
} from "react-icons/hi";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

const team = [
  {
    name: "Harsh Bhatta",
    role: "Founder & Full-Stack Developer",
    bio: "Built the entire app — frontend, backend, database, routing, and the points system. Dreams of making every neighbourhood feel like family.",
    initials: "HB",
    color: "from-blue-600 to-cyan-500",
    socials: {
      github: "https://github.com/IamHarshhh122",
      linkedin: "https://www.linkedin.com/in/harsh-bhatta-915ab5349/",
      instagram: "https://www.instagram.com/bhatta_harsh",
    },
  },
  {
    name: "Keshav",
    role: "UI/UX Designer",
    bio: "Designed the look and feel of the app — every color, every animation, every smooth transition. Makes sure the app feels alive.",
    initials: "K",
    color: "from-emerald-600 to-teal-500",
    socials: {},
  },
  {
    name: "Bitto",
    role: "Backend & API Engineer",
    bio: "Wired up the APIs, database models, and authentication. Handles the heavy lifting so the app stays fast and reliable.",
    initials: "B",
    color: "from-purple-600 to-pink-500",
    socials: {},
  },
  {
    name: "Rohan",
    role: "Testing & Research",
    bio: "Tested every feature end-to-end, found the bugs, and gave feedback to make the app smoother for real users.",
    initials: "R",
    color: "from-amber-500 to-orange-500",
    socials: {},
  },
];

const steps = [
  {
    icon: <HiOutlineLocationMarker />,
    title: "Someone nearby needs help",
    desc: "A neighbour posts a small task — like picking up a parcel, walking a dog, or getting groceries.",
  },
  {
    icon: <HiOutlineUserGroup />,
    title: "Another neighbour accepts",
    desc: "Someone close by who's free and willing to help accepts the task. No money involved — just good will.",
  },
  {
    icon: <HiOutlineChatAlt2 />,
    title: "They coordinate",
    desc: "Both talk over the app, share details, and the helper heads out to get the job done.",
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Task is completed",
    desc: "Helper uploads a photo proof and marks it done. The poster confirms the work within 24 hours.",
  },
  {
    icon: <HiOutlineStar />,
    title: "Helper earns credits",
    desc: "Based on distance and task type, the helper earns credits. These will be redeemable in the future.",
  },
];

const values = [
  {
    icon: <HiOutlineHeart />,
    title: "Free of cost",
    desc: "Posting and helping is completely free. No hidden fees, no commissions.",
  },
  {
    icon: <HiOutlineSparkles />,
    title: "Earn credits",
    desc: "Helpers earn credits for every completed task — redeemable in the future payment model.",
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Safe & verified",
    desc: "Photo proof, GPS tracking, and trust scores keep everyone safe and honest.",
  },
  {
    icon: <HiOutlineGlobe />,
    title: "Hyper-local",
    desc: "Tasks are listed by distance from you, so you always see what is closest first. Real neighbours, real connections.",
  },
];

const techGroups = [
  {
    icon: <HiOutlineDesktopComputer />,
    title: "Frontend",
    subtitle: "What you see and tap",
    items: [
      { name: "React", desc: "Component-based UI library" },
      { name: "Vite", desc: "Fast build tool and dev server" },
      { name: "Tailwind CSS", desc: "Utility-first styling and responsive design" },
      { name: "React Router", desc: "Client-side page navigation" },
      { name: "Framer Motion", desc: "Smooth animations and transitions" },
      { name: "React Hook Form", desc: "Form handling and validation" },
      { name: "Axios & Fetch", desc: "Requests to the backend API" },
      { name: "React Hot Toast", desc: "Instant feedback notifications" },
      { name: "React Icons", desc: "Icon library" },
    ],
  },
  {
    icon: <HiOutlineMap />,
    title: "Maps & Location",
    subtitle: "Finding and reaching neighbours",
    items: [
      { name: "Leaflet & React-Leaflet", desc: "Interactive maps" },
      { name: "OpenStreetMap", desc: "Free, open map tiles" },
      { name: "Leaflet Routing Machine", desc: "Route drawing and turn-by-turn steps" },
      { name: "OSRM", desc: "Open-source routing engine" },
      { name: "Nominatim", desc: "Address search and geocoding" },
      { name: "Geolocation API", desc: "Live position and distance tracking" },
    ],
  },
  {
    icon: <HiOutlineServer />,
    title: "Backend",
    subtitle: "The engine behind the app",
    items: [
      { name: "Node.js", desc: "JavaScript runtime on the server" },
      { name: "Express", desc: "REST API framework" },
      { name: "Mongoose", desc: "MongoDB data models and queries" },
      { name: "CORS", desc: "Only trusted origins can call the API" },
      { name: "express-session", desc: "Session handling during sign-in" },
      { name: "dotenv", desc: "Secrets kept out of the source code" },
    ],
  },
  {
    icon: <HiOutlineDatabase />,
    title: "Database",
    subtitle: "Where everything is stored",
    items: [
      { name: "MongoDB Atlas", desc: "Managed cloud database" },
      { name: "Users", desc: "Profiles, credits and home location" },
      { name: "Tasks", desc: "Requests, status, proofs and rewards" },
    ],
  },
  {
    icon: <HiOutlineLockClosed />,
    title: "Authentication & Security",
    subtitle: "Keeping accounts safe",
    items: [
      { name: "Google OAuth 2.0", desc: "One-tap sign in with Google" },
      { name: "Passport.js", desc: "Authentication middleware" },
      { name: "Email OTP", desc: "Verification codes sent with Nodemailer" },
      { name: "bcrypt", desc: "Passwords are hashed, never stored as plain text" },
      { name: "Secure cookies", desc: "HttpOnly, SameSite and Secure flags in production" },
      { name: "HTTPS", desc: "All traffic is encrypted end to end" },
    ],
  },
  {
    icon: <HiOutlineCloudUpload />,
    title: "Deployment & DevOps",
    subtitle: "How it reaches the internet",
    items: [
      { name: "GitHub", desc: "Source control; every push triggers a deploy" },
      { name: "Vercel", desc: "Frontend hosting on a global CDN" },
      { name: "Render", desc: "Backend web service hosting" },
      { name: "Google Cloud Console", desc: "OAuth credentials and redirect settings" },
      { name: "Environment variables", desc: "Separate configuration for each service" },
    ],
  },
];

const architecture = [
  {
    title: "Browser",
    desc: "You open NeighbourHelp on your phone or computer.",
  },
  {
    title: "Vercel",
    desc: "Delivers the React app instantly from the nearest edge location.",
  },
  {
    title: "Render",
    desc: "Runs the Express API for sign-in, tasks, rewards and email codes.",
  },
  {
    title: "MongoDB Atlas",
    desc: "Stores users, tasks and credits securely in the cloud.",
  },
];

const googleFlow = [
  "You tap Continue with Google on the website hosted on Vercel.",
  "The browser goes to the Render API, which redirects you to Google.",
  "You choose your account and approve access to your name and email.",
  "Google sends you back to the Render callback with a one-time code.",
  "The API verifies it, then finds or creates your account in MongoDB.",
  "You are redirected to the website, signed in and ready to help.",
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#090d12] text-slate-100 flex flex-col relative">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
        <div className="absolute top-[-15%] left-1/4 w-[50%] h-[45%] bg-emerald-600/[0.08] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-emerald-800/[0.08] rounded-full blur-[140px]" />
      </div>

      <main className="w-full max-w-5xl mx-auto px-5 sm:px-8 pt-14 pb-20 relative z-10 flex-1">
        {/* ─────── HERO ─────── */}
        <header className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400 mb-4">
            About NeighbourHelp
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-5">
            Neighbours helping
            <br />
            <span className="text-emerald-400">neighbours.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A hyper-local community platform where people nearby help each other with small tasks —
            free of cost — and earn credits for their time and effort.
          </p>
        </header>

        {/*THE IDEA*/}
        <section className="mb-16">
          <div className="rounded-3xl border border-emerald-500/[0.15] bg-gradient-to-br from-emerald-900/[0.15] via-[#0d1218] to-[#0d1218] p-7 sm:p-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.12] border border-emerald-500/25 flex items-center justify-center">
                <HiOutlineSparkles className="text-emerald-400 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">The Idea</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                We noticed something simple — when you need help with a small task (like getting a
                parcel, walking a pet, or buying groceries), you're left with two options: do it
                yourself, or pay a stranger on an app like Uber.
              </p>
              <p>
                But what about the{" "}
                <span className="text-emerald-400 font-semibold">neighbour next door</span>? Someone
                who's free, nearby, and happy to help — for free. You just never knew they existed.
              </p>
              <p>
                <span className="text-emerald-400 font-semibold">
                  NeighbourHelp connects you to them.
                </span>{" "}
                It's built on the idea that neighbours should be able to rely on each other — not on
                strangers, not on apps that charge a cut.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS ?*/}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-sm text-slate-400">Five simple steps, zero cost.</p>
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/[0.12] border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-xl shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────── WHAT MAKES US DIFFERENT ─────── */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">What makes us different</h2>
            <p className="text-sm text-slate-400">Built for neighbours, by neighbours.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/20 transition"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/[0.12] border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-xl mb-4">
                  {value.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{value.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CREDITS EXPLAINED*/}
        <section className="mb-16">
          <div className="rounded-3xl border border-amber-500/[0.15] bg-gradient-to-br from-amber-900/[0.1] via-[#0d1218] to-[#0d1218] p-7 sm:p-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/[0.12] border border-amber-500/25 flex items-center justify-center">
                <HiOutlineStar className="text-amber-400 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">How credits work</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                Every time a helper completes a task, they earn{" "}
                <span className="text-amber-400 font-semibold">credits</span>. The amount depends on
                two things:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
                    Distance
                  </p>
                  <p className="text-sm text-slate-300">
                    Farther tasks = more credits. A 500m task gives less than a 5km task.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
                    Task type
                  </p>
                  <p className="text-sm text-slate-300">
                    Quick errands give fewer credits. Complex tasks like repairs give more.
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic pt-2">
                For now, everything is free. Credits are collected and stored. When the paid model
                launches in the future, your credits will be redeemable for real value.
              </p>
            </div>
          </div>
        </section>

        {/* TECH STACK*/}
        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <HiOutlineCode className="text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                Built with
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">The tech behind it, from A to Z</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              From the screen you tap to the servers that answer, here is every tool that powers
              NeighbourHelp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techGroups.map((group, i) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/20 transition flex flex-col"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/[0.12] border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-xl shrink-0">
                    {group.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white leading-tight">{group.title}</h3>
                    <p className="text-[11px] text-slate-500">{group.subtitle}</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.name} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                      <p className="text-sm leading-snug">
                        <span className="font-semibold text-white">{item.name}</span>
                        <span className="text-slate-400"> — {item.desc}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/*HOW IT ALL CONNECTS */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">How it all connects</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Every tap travels through four layers before you see the result.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {architecture.map((node, i) => (
              <motion.div
                key={node.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center"
              >
                <span className="inline-flex w-8 h-8 rounded-full bg-emerald-500/[0.12] border border-emerald-500/25 text-emerald-400 text-xs font-bold items-center justify-center mb-3">
                  {i + 1}
                </span>
                <h3 className="text-base font-bold text-white mb-1.5">{node.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{node.desc}</p>
                {i < architecture.length - 1 && (
                  <span className="hidden lg:block absolute top-1/2 -right-3.5 -translate-y-1/2 text-emerald-500/60 text-lg z-10">
                    →
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-500/[0.15] bg-gradient-to-br from-emerald-900/[0.12] via-[#0d1218] to-[#0d1218] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.12] border border-emerald-500/25 flex items-center justify-center">
                <HiOutlineLockClosed className="text-emerald-400 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Signing in with Google, step by step</h3>
            </div>

            <ol className="space-y-3">
              {googleFlow.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/[0.15] border border-emerald-500/25 text-emerald-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <HiOutlineUserGroup className="text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                The Team
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Four people, one vision</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              We built NeighbourHelp together — designers, developers, and testers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/20 transition flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0`}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{member.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{member.role}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-4">{member.bio}</p>

                {(member.socials.github ||
                  member.socials.linkedin ||
                  member.socials.instagram) && (
                  <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                    {member.socials.github && (
                      <a
                        href={member.socials.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on GitHub`}
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition"
                      >
                        <FaGithub className="text-sm" />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a
                        href={member.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400/40 transition"
                      >
                        <FaLinkedin className="text-sm" />
                      </a>
                    )}
                    {member.socials.instagram && (
                      <a
                        href={member.socials.instagram}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on Instagram`}
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-pink-400/40 transition"
                      >
                        <FaInstagram className="text-sm" />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────── VISION / CLOSING ─────── */}
        <section className="mb-16">
          <div className="rounded-3xl border border-emerald-500/[0.15] bg-gradient-to-br from-emerald-900/[0.15] via-[#0d1218] to-[#0d1218] p-7 sm:p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Our vision</h2>
            <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
              We want to bring back the feeling of a real neighbourhood — where everyone knows each
              other, helps each other, and trusts each other. Not through money, but through{" "}
              <span className="text-emerald-400 font-semibold">goodwill</span>.
            </p>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Starting small. Growing one neighbourhood at a time. If we can make even one street
              feel more connected, we've done our job.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to help your neighbour?</h3>
          <p className="text-sm text-slate-400 mb-6">
            Join free, post a task, or help someone nearby today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/micro-tasks"
              className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04140a] text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <HiOutlineLightningBolt className="text-base" />
              Browse tasks
            </Link>
            <Link
              to="/signup"
              className="h-11 px-6 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-slate-200 text-sm font-medium flex items-center gap-2 transition"
            >
              <HiOutlineUserGroup className="text-base" />
              Join the community
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}