// ---------------------------------------------------------------------------
// TAGIHAN — Payment Reminder Card (Canvas, 1200 × 630)
// The share card: one glance, one total, one countdown. It is built to be
// forwarded on WhatsApp and social media — the total, when it is due, how
// to pay, and the IDPEL that ties it to the bill email, the receipt, the
// page and the bill PDF. All visuals are drawn in code (SVG bolt, usage
// chart, navy and yellow); there are no image assets. Deep navy and
// electric yellow on purpose — a utility bill, not an emergency and not a
// baby's first year.
// ---------------------------------------------------------------------------

import { Canvas, Column, Path, Row, Svg, Text } from "@hyper-elements/react";
import {
  countdownLabel,
  defaultData,
  dueDate,
  formatDateId,
  formatRupiah,
  totalBill,
  usageKwh,
  type TagihanData,
} from "./data.js";
import { CustomerBadge, UsageBarsSvg } from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, tagihanTheme } from "./theme.js";

export interface ReminderCardProps {
  data?: TagihanData;
}

function ReminderCard({ data = defaultData }: ReminderCardProps) {
  const customer = data.customer;
  const bill = data.bill;
  const count = countdownLabel(data);
  const total = totalBill(data, usageKwh(data));
  return (
    <Canvas
      theme={tagihanTheme}
      fonts={PRINT_FONTS}
      title={`TAGIHAN — Tagihan ${bill.billingMonthId} ${formatRupiah(total)} jatuh tempo ${count.id.toLowerCase()}`}
      width={1200}
      height={630}
      lang="id"
      style={{ backgroundColor: C.page, fontFamily: PRINT_FONT, gap: 0 }}
    >
      {/* ---- Top: brand + customer ---- */}
      <Column style={{ padding: [36, 48, 0, 48], gap: 12 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Svg width={40} height={40} viewBox="0 0 24 24" title="Lightning bolt">
            <Path
              d="M13 2 L4 14 H11 L9 22 L20 9 H13 Z"
              style={{ fill: C.amber }}
            />
          </Svg>
          <Text style={{ color: C.navy, fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>
            TAGIHAN
          </Text>
          <CustomerBadge data={data} />
          <Text
            style={{
              color: C.muted,
              fontSize: 14,
              fontFamily: MONO_FONT,
              flex: 1,
              textAlign: "right",
            }}
          >
            {bill.billingMonthId}
          </Text>
        </Row>

        {/* ---- The total ---- */}
        <Text
          style={{
            color: C.navy,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: 2,
            fontFamily: MONO_FONT,
          }}
        >
          {formatRupiah(total)}
        </Text>
        <Text style={{ color: C.amberDark, fontSize: 30, fontWeight: 800 }}>
          {count.id.toUpperCase()} · {count.en.toUpperCase()}
        </Text>
        <Text style={{ color: C.ink, fontSize: 20, fontWeight: 700 }}>
          Jatuh tempo / Due {formatDateId(dueDate(data))} · {bill.dueTime} ·{" "}
          {usageKwh(data)} kWh · {customer.tariffCode}
        </Text>

        {/* ---- Usage chart strip ---- */}
        <UsageBarsSvg data={data} width={1104} height={84} />
      </Column>

      {/* ---- Bottom band: pay + proof ---- */}
      <Column style={{ backgroundColor: C.navyDeep, padding: [8, 48, 32, 48], gap: 8 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 800 }}>
          Bayar / Pay: {bill.payUrl.replace("https://", "")}
        </Text>
        <Row style={{ gap: 32 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800, flex: 1 }}>
            Status: Belum dibayar / Unpaid
          </Text>
          <Text style={{ color: "#C9D6E8", fontSize: 13, fontFamily: MONO_FONT }}>
            IDPEL {customer.idpel} · {customer.fullName}
          </Text>
        </Row>
        <Text style={{ color: "#C9D6E8", fontSize: 13, fontFamily: MONO_FONT }}>
          Tarif: {data.source}
        </Text>
      </Column>
    </Canvas>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(ReminderCard, { PreviewProps: {} });
