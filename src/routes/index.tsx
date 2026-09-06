import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowUpRight, Check, ChevronRight, Crosshair, Flag, Gauge, Layers3, MapPin, Menu, Radio, Send, ShieldCheck, Sparkles, Target, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createCleanupReport } from "@/lib/eco-spidey.functions";
import heroImage from "@/assets/eco-spidey-hero.png";
import poseSheet from "@/assets/eco-spidey-poses.png";
import emblem from "@/assets/eco-spidey-emblem.png";

type Zone = { id: string; name: string; city: string; status: string; progress: number; latitude: number; longitude: number; color: string };
type Score = { id: string; alias: string; sector: string; recovered_kg: number; missions: number; avatar_key: string };

const fallbackZones: Zone[] = [
  { id: "downtown", name: "Downtown West", city: "New York", status: "alert", progress: 84, latitude: 40.7128, longitude: -74.006, color: "signal" },
  { id: "harbor", name: "Harbor Line", city: "New York", status: "clearing", progress: 51, latitude: 40.7005, longitude: -74.012, color: "blue" },
  { id: "old-town", name: "Old Town", city: "New York", status: "en_route", progress: 12, latitude: 40.7306, longitude: -73.9973, color: "neutral" },
  { id: "river", name: "Riverside South", city: "New York", status: "clearing", progress: 68, latitude: 40.705, longitude: -74.025, color: "blue" },
];

const fallbackScores: Score[] = [
  { id: "1", alias: "Webwright", sector: "Sector 04", recovered_kg: 2410, missions: 38, avatar_key: "swing" },
  { id: "2", alias: "Skyline Scout", sector: "Sector 07", recovered_kg: 1980, missions: 31, avatar_key: "crawl" },
  { id: "3", alias: "Harbor Hand", sector: "Sector 02", recovered_kg: 1540, missions: 26, avatar_key: "landing" },
];

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Eco-Spidey HQ — Cleanup Command Center" },
    { name: "description", content: "Coordinate cleanup missions, report litter hotspots, and track civic impact with Eco-Spidey HQ." },
    { property: "og:title", content: "Eco-Spidey HQ — Cleanup Command Center" },
    { property: "og:description", content: "A live civic command center for cleaner streets and stronger neighborhoods." },
  ] }),
  component: EcoSpideyHQ,
});

function EcoSpideyHQ() {
  const [zones, setZones] = useState<Zone[]>(fallbackZones);
  const [scores, setScores] = useState<Score[]>(fallbackScores);
  const [activeSection, setActiveSection] = useState("command");
  const [showReport, setShowReport] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reportRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void Promise.all([
      supabase.from("cleanup_zones").select("id, name, city, status, progress, latitude, longitude, color").order("progress", { ascending: false }),
      supabase.from("hero_scores").select("id, alias, sector, recovered_kg, missions, avatar_key").order("recovered_kg", { ascending: false }),
    ]).then(([zoneResult, scoreResult]) => {
      if (zoneResult.data?.length) setZones(zoneResult.data as Zone[]);
      if (scoreResult.data?.length) setScores(scoreResult.data as Score[]);
    });
  }, []);

  const averageProgress = useMemo(() => Math.round(zones.reduce((sum, zone) => sum + zone.progress, 0) / zones.length), [zones]);
  const scrollTo = (id: string) => {
    setActiveSection(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setReportError("");
    const form = new FormData(event.currentTarget);
    try {
      await createCleanupReport({ data: {
        location: String(form.get("location") || ""),
        reportType: String(form.get("reportType") || ""),
        severity: (String(form.get("severity") || "amber") as "critical" | "amber" | "clear"),
        note: String(form.get("note") || ""),
      } });
      setReportSent(true);
      event.currentTarget.reset();
    } catch {
      setReportError("Sign in to file a live report, or try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="min-h-screen bg-ink text-paper selection:bg-signal selection:text-paper">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-paper/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
        <button onClick={() => scrollTo("command")} className="flex items-center gap-3" aria-label="Eco-Spidey HQ home">
          <img src={emblem} alt="Eco-Spidey civic emblem" width={44} height={44} className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold uppercase tracking-[0.02em]">Eco-Spidey <span className="text-signal">HQ</span></span>
        </button>
        <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.16em] text-paper/60 md:flex">
          {["command", "map", "board", "report"].map((item) => <button key={item} onClick={() => scrollTo(item)} className={activeSection === item ? "text-paper" : "transition-colors hover:text-paper"}>{item === "command" ? "Command" : item === "map" ? "Live Map" : item === "board" ? "Hero Board" : "Report"}</button>)}
        </nav>
        <button className="border border-paper/20 p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {menuOpen && <nav className="grid gap-1 border-t border-paper/10 bg-ink px-5 py-3 text-sm uppercase tracking-widest md:hidden">{["command", "map", "board", "report"].map((item) => <button key={item} onClick={() => scrollTo(item)} className="py-3 text-left text-paper/70">{item}</button>)}</nav>}
    </header>

    <main>
      <section id="command" className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center overflow-hidden px-5 pb-16 pt-32 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pt-36">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-signal"><span className="h-px w-10 bg-signal" /> LIVE CIVIC RESPONSE NETWORK</div>
          <h1 className="max-w-3xl font-display text-6xl font-black uppercase leading-[.88] tracking-[-.03em] sm:text-8xl lg:text-[8.5rem]">Clean streets.<br /><span className="text-signal">Stronger</span><br />neighborhoods.</h1>
          <p className="mt-8 max-w-xl border-l-2 border-signal pl-5 text-base leading-relaxed text-paper/60">Eco-Spidey HQ turns everyday sightings into coordinated cleanup missions. Find the hotspots, deploy the crew, and make the block better before sunrise.</p>
          <div className="mt-9 flex flex-wrap gap-3"><button onClick={() => scrollTo("map")} className="group inline-flex items-center gap-3 bg-signal px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-paper transition-transform hover:-translate-y-1">View live map <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button><button onClick={() => { setShowReport(true); scrollTo("report"); }} className="inline-flex items-center gap-3 border border-paper/20 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-paper transition-colors hover:border-paper/50"><Flag size={15} /> File a sighting</button></div>
          <div className="mt-14 grid max-w-xl grid-cols-3 gap-5 border-t border-paper/10 pt-5"><Stat label="Active zones" value={String(zones.length).padStart(2, "0")} /><Stat label="Avg. cleared" value={`${averageProgress}%`} /><Stat label="Impact logged" value="18.4T" /></div>
        </div>
        <div className="pointer-events-none relative mt-6 min-h-[480px] lg:mt-0 lg:min-h-[650px]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklab,var(--color-signal)_24%,transparent),transparent_56%)]" /><img src={heroImage} alt="Original masked cleanup hero crouched on a rooftop" width={1024} height={1280} className="absolute right-[-12%] top-1/2 max-h-[720px] w-auto max-w-none -translate-y-1/2 object-contain mix-blend-screen" /></div>
      </section>

      <section id="map" className="scroll-mt-24 border-y border-paper/10 bg-navy/70"><div className="mx-auto max-w-[1440px] px-5 py-20 lg:px-10"><SectionKicker icon={<Crosshair size={15} />} label="01 / Live map" title="See the city. Move with purpose." copy="Real cleanup zones, real coordinates, real momentum. The map connects the report to the response." /><div className="mt-10 grid gap-5 lg:grid-cols-[1fr_320px]"><LiveMap zones={zones} /><div className="grid gap-3 content-start">{zones.map((zone) => <div key={zone.id} className="border border-paper/10 bg-ink/60 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><span className={`h-2 w-2 rounded-full ${zone.status === "alert" ? "bg-signal" : "bg-electric"}`} />{zone.name}</div><span className="font-mono text-xs text-paper/50">{zone.progress}%</span></div><div className="mt-3 h-1 bg-paper/10"><div className={`h-full ${zone.status === "alert" ? "bg-signal" : "bg-electric"}`} style={{ width: `${zone.progress}%` }} /></div><div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-paper/40"><span>{zone.city}</span><span>{zone.status.replace("_", " ")}</span></div></div>)}</div></div></div></section>

      <section id="board" className="scroll-mt-24 mx-auto max-w-[1440px] px-5 py-20 lg:px-10"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><SectionKicker icon={<Gauge size={15} />} label="02 / Hero board" title="Proof beats applause." copy="The people moving the needle, measured in missions and material recovered." /><button onClick={() => scrollTo("report")} className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-signal hover:text-paper">Join the board <ChevronRight size={15} /></button></div><div className="border-t border-paper/15">{scores.map((score, index) => <div key={score.id} className="grid grid-cols-[42px_1fr_auto] items-center gap-4 border-b border-paper/10 py-5"><span className="font-display text-3xl font-black text-paper/30">0{index + 1}</span><div><div className="flex items-center gap-3"><span className="font-display text-xl font-bold uppercase">{score.alias}</span><span className="text-[10px] uppercase tracking-widest text-paper/40">{score.sector}</span></div><div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-widest text-paper/45"><span>{score.missions} missions</span><span className="h-1 w-1 rounded-full bg-signal" /><span>{Number(score.recovered_kg).toLocaleString()} kg recovered</span></div></div><div className="hidden h-10 w-16 overflow-hidden sm:block"><PoseThumb kind={score.avatar_key} /></div></div>)}</div></div><div className="mt-16 grid gap-5 md:grid-cols-3"><ImpactCard icon={<Radio />} title="Signal" body="Spot it. Pin it. Send the coordinates." /><ImpactCard icon={<Target />} title="Deploy" body="Turn a litter sighting into a crew response." /><ImpactCard icon={<ShieldCheck />} title="Clear" body="Close the loop and log the impact." /></div></section>

      <section id="report" ref={reportRef} className="scroll-mt-24 bg-signal px-5 py-20 text-paper lg:px-10"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end"><div><div className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.22em] text-paper/70"><span className="h-px w-10 bg-paper/70" /> 03 / Report garbage</div><h2 className="font-display text-6xl font-black uppercase leading-[.9] tracking-[-.03em] sm:text-8xl">See something?<br /><span className="text-ink">Spin a signal.</span></h2><p className="mt-7 max-w-md text-paper/75">Your report gives the response team a precise starting point. Every pin becomes part of the city’s cleanup record.</p><img src={poseSheet} alt="Four original cleanup hero action poses" width={1600} height={900} loading="lazy" className="mt-10 hidden w-full max-w-xl border border-paper/20 object-cover opacity-70 lg:block" /></div><div className="bg-ink p-6 sm:p-8">{reportSent ? <div className="flex min-h-[390px] flex-col items-center justify-center text-center"><div className="mb-5 flex h-14 w-14 items-center justify-center border border-electric text-electric"><Check /></div><h3 className="font-display text-4xl font-black uppercase">Signal received.</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/55">Thanks for helping the network see the full picture. Your sighting is now in the response queue.</p><button onClick={() => setReportSent(false)} className="mt-8 border border-paper/20 px-5 py-3 text-xs font-black uppercase tracking-widest hover:border-paper/50">File another</button></div> : <form onSubmit={submitReport} className="grid gap-5"><div className="flex items-center justify-between border-b border-paper/10 pb-5"><div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-electric">Open channel</div><h3 className="mt-1 font-display text-3xl font-black uppercase">New sighting</h3></div><Sparkles className="text-signal" size={22} /></div><Field label="Location" name="location" placeholder="Street, block, or landmark" /><div className="grid gap-5 sm:grid-cols-2"><Field label="What did you spot?" name="reportType" placeholder="Overflowing bin, illegal dump..." /><label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-paper/50">Priority<select name="severity" defaultValue="amber" className="border-b border-paper/20 bg-transparent py-3 text-sm text-paper outline-none focus:border-signal"><option className="bg-ink" value="critical">Critical</option><option className="bg-ink" value="amber">Needs attention</option><option className="bg-ink" value="clear">Routine</option></select></label></div><label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-paper/50">Field notes<textarea name="note" rows={3} placeholder="Anything the cleanup crew should know?" className="resize-none border-b border-paper/20 bg-transparent py-3 text-sm text-paper outline-none placeholder:text-paper/25 focus:border-signal" /></label>{reportError && <p className="text-sm text-signal">{reportError}</p>}<button disabled={isSubmitting} className="mt-2 inline-flex items-center justify-center gap-3 bg-signal px-5 py-4 text-xs font-black uppercase tracking-widest text-paper disabled:opacity-50">{isSubmitting ? "Sending..." : "Transmit report"} <Send size={15} /></button><p className="text-center text-[10px] uppercase tracking-widest text-paper/30">Reports are saved to your Eco-Spidey mission log.</p></form>}</div></div></section>
    </main>
    <footer className="border-t border-paper/10 bg-ink"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 text-[10px] uppercase tracking-[.16em] text-paper/35 sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>Eco-Spidey HQ / Civic response network</span><span>Make the block better.</span></div></footer>
  </div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div><div className="font-display text-3xl font-black text-paper">{value}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-paper/40">{label}</div></div>; }
function SectionKicker({ icon, label, title, copy }: { icon: React.ReactNode; label: string; title: string; copy: string }) { return <div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-signal">{icon}{label}</div><h2 className="mt-4 max-w-2xl font-display text-5xl font-black uppercase leading-[.92] tracking-[-.02em] sm:text-6xl">{title}</h2><p className="mt-5 max-w-lg text-sm leading-relaxed text-paper/50">{copy}</p></div>; }
function Field({ label, name, placeholder }: { label: string; name: string; placeholder: string }) { return <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-paper/50">{label}<input required name={name} placeholder={placeholder} className="border-b border-paper/20 bg-transparent py-3 text-sm text-paper outline-none placeholder:text-paper/25 focus:border-signal" /></label>; }
function ImpactCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) { return <div className="border border-paper/10 bg-navy/50 p-5"><div className="text-signal">{icon}</div><h3 className="mt-8 font-display text-2xl font-black uppercase">{title}</h3><p className="mt-2 text-sm leading-relaxed text-paper/45">{body}</p></div>; }
function PoseThumb({ kind }: { kind: string }) { const position = kind === "crawl" ? "0% 0%" : kind === "landing" ? "100% 0%" : kind === "webshot" ? "100% 100%" : "0% 100%"; return <img src={poseSheet} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: position }} />; }
function LiveMap({ zones }: { zones: Zone[] }) { const mapRef = useRef<HTMLDivElement>(null); const [mapState, setMapState] = useState<"loading" | "ready" | "fallback">("loading"); useEffect(() => { let map: import("leaflet").Map | undefined; let cancelled = false; void import("leaflet").then((leaflet) => { if (cancelled || !mapRef.current) return; const L = leaflet.default; map = L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: false }).setView([40.715, -74.008], 13); L.control.zoom({ position: "bottomright" }).addTo(map); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map); zones.forEach((zone) => { const color = zone.status === "alert" ? "#ef3340" : "#49d7ff"; L.circleMarker([zone.latitude, zone.longitude], { radius: zone.status === "alert" ? 11 : 8, color, fillColor: color, fillOpacity: 0.75, weight: 2 }).addTo(map).bindPopup(`<b>${zone.name}</b><br/>${zone.progress}% cleared`); }); setMapState("ready"); }).catch(() => setMapState("fallback")); return () => { cancelled = true; map?.remove(); }; }, [zones]); return <div className="relative min-h-[470px] overflow-hidden border border-paper/10 bg-[#14253a]"><div ref={mapRef} className="absolute inset-0 z-10" />{mapState !== "ready" && <div className="absolute inset-0 z-20 grid place-items-center bg-navy p-6 text-center"><div><MapPin className="mx-auto mb-3 text-signal" /><div className="font-display text-2xl font-black uppercase">{mapState === "loading" ? "Loading live map" : "Map offline"}</div><p className="mt-2 max-w-sm text-sm text-paper/50">{mapState === "loading" ? "Connecting to city coordinates..." : "Zone coordinates are still available in the response list."}</p></div></div>}<div className="pointer-events-none absolute left-4 top-4 z-30 border border-paper/20 bg-ink/80 px-3 py-2 text-[10px] font-bold uppercase tracking-widest">NYC / 13:42 UTC</div></div>; }
