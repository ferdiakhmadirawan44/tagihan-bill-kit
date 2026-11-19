// ---------------------------------------------------------------------------
// TAGIHAN's brand, written once as a Hyper Elements theme and handed to all
// five roots (Email x2, Page, Document, Canvas). One theme, one palette —
// deep PLN navy, electric yellow and a light blue-grey page: a utility
// bill, not an emergency (SIAGA's red) and not a baby's first year
// (TUMBUH's cream and terracotta). The status colour IS the information
// (amber = unpaid, green = paid, red = overdue), so the same three colours
// run through every output and a customer reads the bill at a glance, in
// any format. Headings are a strong grotesque sans on the email and page;
// the PDF and the card use DejaVu, the font the renderers can load.
// ---------------------------------------------------------------------------

import { defineTheme } from "@hyper-elements/react";
import type { PaymentStatus } from "./data.js";

/** Monospace stack for figures (IDPEL, meter readings, rupiah totals). */
export const MONO_FONT = "'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Font stack for the PDF and the reminder card, loaded from assets/fonts. */
export const PRINT_FONT = "'DejaVu Sans', sans-serif";

/** Semantic colours shared by all five outputs. */
export const C = {
  ink: "#1B2A3D",
  page: "#F2F6FB",
  card: "#FFFFFF",
  muted: "#55677B",
  faint: "#A9B8C7",
  border: "#D8E2EC",
  zebra: "#F7FAFD",
  track: "#DCE7F2",
  white: "#FFFFFF",
  navy: "#14315C",
  navyDeep: "#0E2444",
  navyTint: "#E4ECF6",
  blue: "#1B6AC9",
  blueTint: "#E3EEFB",
  amber: "#F5B301",
  amberDark: "#8A6100",
  amberTint: "#FFF6D6",
} as const;

/** Payment status colours — the bill's traffic light, shared by all outputs. */
export const STATUS_COLORS: Record<
  PaymentStatus,
  { color: string; dark: string; tint: string }
> = {
  unpaid: { color: "#D97706", dark: "#92400E", tint: "#FEF3C7" },
  paid: { color: "#2F7A44", dark: "#1F5230", tint: "#E6F0E7" },
  overdue: { color: "#DC2626", dark: "#991B1B", tint: "#FEE2E2" },
};

export const tagihanTheme = defineTheme({
  colors: {
    background: C.page,
    foreground: C.ink,
    primary: C.navy,
    primaryForeground: "#FFFFFF",
    muted: C.muted,
    border: C.border,
  },
  fonts: {
    body: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
    heading: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  fontSizes: { body: 15 },
  lineHeights: { body: 1.6 },
  elements: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 30, lineHeight: 1.2, mobile: { fontSize: 25 } },
          2: { fontSize: 20, lineHeight: 1.25, mobile: { fontSize: 18 } },
          // Section kickers: small, tracked-out, uppercase, muted.
          3: {
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "{colors.muted}",
          },
        },
      },
    },
    Button: {
      borderRadius: 999,
      hover: { backgroundColor: "#0E2444" },
    },
  },
  styles: {
    // The white card every content section lives in.
    card: {
      backgroundColor: "#FFFFFF",
      padding: 28,
      gap: 20,
      borderRadius: 16,
      border: "1px solid #D8E2EC",
    },
  },
});

/** Font files for the Document (PDF) and Canvas (reminder card) roots.
 *  The CLI's `render` loads them from the paths the template names; the
 *  Email and Page roots use the system stack from the theme instead.
 *  DejaVu ships only Regular (400) and Bold (700), but the theme's headings
 *  and badges use weight 800 — so each Bold file is registered for the
 *  whole 700–900 range, and 800 draws as Bold instead of warning about a
 *  missing file. */
export const PRINT_FONTS = [
  {
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans-Bold.ttf",
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    // The renderers register a file per weight: the range string above did
    // not satisfy them, so Bold is registered again at 800 explicitly.
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono-Bold.ttf",
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    // Same as above: Bold registered again at 800 explicitly.
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
];
