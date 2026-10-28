"use client";

import { useRef, type PointerEvent } from "react";

import { FLAVOURS, getFlavour, type FlavourId } from "@/lib/flavours";

const VIEW_HEIGHT = 540;
const BODY_TOP = 78;
const BODY_BOTTOM = 526;
const BAND_HEIGHT = (BODY_BOTTOM - BODY_TOP) / FLAVOURS.length;

const BODY_PATH =
  "M 70 78 C 112 74, 120 118, 116 170 C 111 268, 100 368, 82 448 C 73 488, 56 516, 30 526 C 44 504, 50 478, 50 446 C 44 360, 28 268, 25 172 C 22 118, 30 80, 70 78 Z";
const CALYX_PATH =
  "M 28 98 C 38 66, 102 66, 114 98 C 102 86, 90 94, 82 84 C 74 96, 64 96, 58 84 C 50 94, 40 88, 28 98 Z";

// Heat 0 sits at the tip of the chilli, the hottest flavour up by the stem.
function bandTop(heat: number) {
  return BODY_BOTTOM - (heat + 1) * BAND_HEIGHT;
}

function heatFromY(y: number) {
  const heat = Math.floor((BODY_BOTTOM - y) / BAND_HEIGHT);
  return Math.min(FLAVOURS.length - 1, Math.max(0, heat));
}

type Props = {
  value: FlavourId;
  onChange: (id: FlavourId) => void;
};

export function ChilliSlider({ value, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const selected = getFlavour(value);
  const hottest = FLAVOURS.length - 1;

  function selectFromPointer(event: PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    const flavour = FLAVOURS[heatFromY(y)];
    if (flavour.id !== value) onChange(flavour.id);
  }

  return (
    <fieldset className="flex items-stretch gap-3">
      <legend className="sr-only">Heat level</legend>

      <svg
        ref={svgRef}
        viewBox={`0 0 140 ${VIEW_HEIGHT}`}
        aria-hidden="true"
        className="chilli h-[360px] w-auto shrink-0 cursor-ns-resize touch-none select-none md:h-[500px]"
        data-heat={selected.heat}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          selectFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            selectFromPointer(event);
          }
        }}
      >
        <defs>
          <clipPath id="chilli-body">
            <path d={BODY_PATH} />
          </clipPath>
        </defs>

        <g className="chilli-steam" opacity={selected.heat >= 3 ? 1 : 0}>
          <path d="M 30 52 c -8 -10, 8 -16, 0 -28" />
          <path d="M 116 56 c -8 -10, 8 -16, 0 -28" />
          {selected.heat >= 4 && <path d="M 10 80 c -8 -10, 8 -16, 0 -28" />}
          {selected.heat >= 5 && <path d="M 134 86 c -8 -10, 8 -16, 0 -28" />}
        </g>

        <path
          d="M 70 84 C 70 52, 78 30, 100 14"
          fill="none"
          stroke="#3f7d2c"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <g clipPath="url(#chilli-body)">
          <rect x="0" y="0" width="140" height={VIEW_HEIGHT} fill="var(--chilli-empty)" />
          {FLAVOURS.map((flavour) => (
            <rect
              key={flavour.id}
              x="0"
              y={bandTop(flavour.heat)}
              width="140"
              height={BAND_HEIGHT + 0.5}
              fill={flavour.colour}
              opacity={flavour.heat <= selected.heat ? 1 : 0.16}
              style={{ transition: "opacity 200ms ease" }}
            />
          ))}
          <rect
            x="0"
            y={bandTop(selected.heat)}
            width="140"
            height={BAND_HEIGHT}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.85"
            strokeWidth="5"
            strokeDasharray="8 6"
          />
          <path
            d="M 42 176 C 44 262, 54 352, 64 424"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.35"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        <path d={BODY_PATH} fill="none" stroke="var(--ink)" strokeWidth="3" />
        <path d={CALYX_PATH} fill="#4c9a35" stroke="var(--ink)" strokeWidth="2.5" />
      </svg>

      <div className="relative w-36 shrink-0">
        {[...FLAVOURS].reverse().map((flavour) => {
          const centre = bandTop(flavour.heat) + BAND_HEIGHT / 2;
          const checked = flavour.id === value;
          return (
            <label
              key={flavour.id}
              className="absolute left-0 flex -translate-y-1/2 cursor-pointer items-center gap-2 rounded-full py-1 pr-2 text-sm leading-tight transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ink)]"
              style={{ top: `${(centre / VIEW_HEIGHT) * 100}%` }}
            >
              <input
                type="radio"
                name="heat"
                value={flavour.id}
                checked={checked}
                onChange={() => onChange(flavour.id)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--ink)] transition-transform"
                style={{
                  background: flavour.colour,
                  transform: checked ? "scale(1.35)" : undefined,
                }}
              />
              <span
                className={
                  checked
                    ? "font-display text-base font-extrabold text-[var(--ink)]"
                    : "text-[var(--muted)]"
                }
              >
                {flavour.name}
                {flavour.heat === hottest && checked ? " 🔥" : ""}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
