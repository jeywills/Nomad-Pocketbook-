"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { SHAPES, WORLD_H, WORLD_W } from "@/lib/world-paths";
import { projectPoint } from "@/lib/worldmap";

type View = { k: number; x: number; y: number };
const HOME: View = { k: 1, x: 0, y: 0 };
const MAX_ZOOM = 8;
const DRAG_THRESHOLD = 6;

const clampView = (v: View): View => {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k));
  return {
    k,
    x: Math.min(0, Math.max(WORLD_W - WORLD_W * k, v.x)),
    y: Math.min(0, Math.max(WORLD_H - WORLD_H * k, v.y)),
  };
};

/** Zoom keeping the point (cx, cy), given in map units, fixed on screen. */
const zoomAbout = (v: View, factor: number, cx: number, cy: number): View => {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
  const r = k / v.k;
  return clampView({ k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r });
};

export type MapPin = { id: string; name: string; lat: number; lon: number };

type Props = {
  visited: ReadonlySet<string>;
  /** Countries on the wish list, shown in blue. */
  wished: ReadonlySet<string>;
  pins: MapPin[];
  /** Wish-list cities, shown as blue pins. */
  wishPins: MapPin[];
  selectedCc: string | null;
  /** Country just scratched off, to play the sparkle on. */
  freshCc: string | null;
  summary: string;
  onPick: (cc: string, name: string) => void;
};

/**
 * A scratch-off world map. Unvisited countries are grey foil; visited ones
 * reveal a sunset gradient underneath. Drag to pan, pinch or use the buttons
 * to zoom, tap a country to open it.
 */
export default function ScratchMap({
  visited,
  wished,
  pins,
  wishPins,
  selectedCc,
  freshCc,
  summary,
  onPick,
}: Props) {
  const [view, setView] = useState<View>(HOME);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const startPoint = useRef({ x: 0, y: 0 });
  const pinchDist = useRef(0);
  const moved = useRef(false);

  /** Convert a screen point to map units. */
  const toMap = (clientX: number, clientY: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: WORLD_W / 2, y: WORLD_H / 2, unit: 1 };
    const unit = WORLD_W / r.width;
    return { x: (clientX - r.left) * unit, y: (clientY - r.top) * unit, unit };
  };

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      startPoint.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      moved.current = true;
    }
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current > 0) {
        const mid = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
        setView((v) => zoomAbout(v, dist / pinchDist.current, mid.x, mid.y));
      }
      pinchDist.current = dist;
      return;
    }

    if (pointers.current.size === 1) {
      if (!moved.current && Math.hypot(cur.x - startPoint.current.x, cur.y - startPoint.current.y) > DRAG_THRESHOLD) {
        moved.current = true;
        // Only capture once it is a real drag, so plain taps still reach the country.
        svgRef.current?.setPointerCapture(e.pointerId);
      }
      if (moved.current) {
        const { unit } = toMap(0, 0);
        setView((v) => clampView({ ...v, x: v.x + (cur.x - prev.x) * unit, y: v.y + (cur.y - prev.y) * unit }));
      }
    }
  }

  function onPointerEnd(e: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = 0;
  }

  const zoomBy = (factor: number) => setView((v) => zoomAbout(v, factor, WORLD_W / 2, WORLD_H / 2));
  const fresh = freshCc ? SHAPES.find((s) => s.cc === freshCc) : undefined;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line" style={{ background: "var(--sea)" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        role="img"
        aria-label={`Scratch map of the world. ${summary} Use the country list to mark countries with a keyboard or screen reader.`}
        className="block h-auto w-full select-none"
        style={{ touchAction: view.k > 1 ? "none" : "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <defs>
          <linearGradient id="scratch-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffc857" />
            <stop offset="1" stopColor="#f26b1d" />
          </linearGradient>
          <linearGradient id="wish-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ec2ff" />
            <stop offset="1" stopColor="#2f6fe0" />
          </linearGradient>
          {/* Stripes so "want to go" is not told apart by colour alone */}
          <pattern id="wish-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
          </pattern>
          <pattern id="foil" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" style={{ fill: "var(--foil)" }} />
            <line x1="0" y1="0" x2="0" y2="5" strokeWidth="1.4" style={{ stroke: "var(--foil-line)" }} />
          </pattern>
        </defs>

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {SHAPES.map((s, i) => {
            const on = !!s.cc && visited.has(s.cc);
            const wish = !on && !!s.cc && wished.has(s.cc);
            return (
              <g
                key={i}
                className={s.cc ? "cursor-pointer" : undefined}
                onClick={() => {
                  if (s.cc && !moved.current) onPick(s.cc, s.name);
                }}
              >
                {/* What lies under the foil */}
                <path d={s.d} fill={wish ? "url(#wish-blue)" : "url(#scratch-gold)"} />
                {wish && <path d={s.d} fill="url(#wish-stripes)" pointerEvents="none" />}
                {/* The foil, scratched away when visited or wished for */}
                <path
                  d={s.d}
                  fill="url(#foil)"
                  strokeWidth="0.7"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    stroke: "var(--foil-edge)",
                    opacity: on || wish ? 0 : 1,
                    transition: "opacity 0.9s ease",
                  }}
                />
                {on && (
                  <path
                    d={s.d}
                    fill="none"
                    stroke="#fff"
                    strokeOpacity="0.55"
                    strokeWidth="0.7"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}

          {selectedCc &&
            SHAPES.filter((s) => s.cc === selectedCc).map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
                style={{ stroke: "var(--accent)" }}
              />
            ))}

          {wishPins.map((p) => {
            const [px, py] = projectPoint(p.lon, p.lat);
            return (
              <circle
                key={`w-${p.id}`}
                cx={px}
                cy={py}
                r={3.4 / view.k}
                strokeWidth={1.6 / view.k}
                pointerEvents="none"
                style={{ fill: "var(--sky)", stroke: "#fff" }}
              >
                <title>{`${p.name} (wish list)`}</title>
              </circle>
            );
          })}

          {pins.map((p) => {
            const [px, py] = projectPoint(p.lon, p.lat);
            return (
              <circle
                key={p.id}
                cx={px}
                cy={py}
                r={3.4 / view.k}
                fill="#fff"
                strokeWidth={1.6 / view.k}
                pointerEvents="none"
                style={{ stroke: "var(--accent)" }}
              >
                <title>{p.name}</title>
              </circle>
            );
          })}

          {fresh && (
            <g transform={`translate(${fresh.cx} ${fresh.cy})`} pointerEvents="none" aria-hidden>
              <circle
                r={6 / view.k}
                fill="none"
                strokeWidth={2 / view.k}
                stroke="#ffc857"
                className="animate-ring"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16 / view.k}
                className="animate-pop"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                ✨
              </text>
            </g>
          )}
        </g>
      </svg>

      <div className="absolute bottom-2 left-2 flex flex-col gap-1.5">
        {(
          [
            ["+", "Zoom in", () => zoomBy(1.6)],
            ["−", "Zoom out", () => zoomBy(1 / 1.6)],
          ] as const
        ).map(([label, name, fn]) => (
          <button
            key={name}
            type="button"
            onClick={fn}
            aria-label={name}
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface/90 text-xl font-bold text-ink shadow"
          >
            {label}
          </button>
        ))}
        {view.k > 1 && (
          <button
            type="button"
            onClick={() => setView(HOME)}
            aria-label="Reset map view"
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface/90 text-lg text-ink shadow"
          >
            ⟲
          </button>
        )}
      </div>
    </div>
  );
}
