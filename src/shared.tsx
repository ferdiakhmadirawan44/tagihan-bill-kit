// ---------------------------------------------------------------------------
// Shared pieces of the TAGIHAN kit — used by all five outputs so the kit can
// never disagree with itself. Every piece reads the SAME `data` object and
// derives everything from the meter reading and the tariff; nothing is
// re-typed per output.
//
// The bilingual rule: every label is Indonesian first, English second,
// from the same data — the two languages are rendered from one source, so
// they can never drift apart.
// ---------------------------------------------------------------------------

import {
  Button,
  Column,
  Divider,
  Line,
  Link,
  Rect,
  Row,
  Span,
  Svg,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  averageUsage,
  billLines,
  countdownLabel,
  dueDate,
  formatDateEn,
  formatDateId,
  formatKwh,
  formatRupiah,
  paymentLabel,
  peakMonth,
  tariffOf,
  totalBill,
  usageChange,
  usageKwh,
  type PaymentStatus,
  type TagihanData,
} from "./data.js";
import { C, MONO_FONT, STATUS_COLORS } from "./theme.js";

/** Bilingual label: Indonesian line, then the English line, muted. The
 *  signature of this kit — used everywhere a label appears. */
export function Bi({
  id,
  en,
  size = 14,
  bold = false,
  align,
}: {
  id: string;
  en: string;
  size?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
}) {
  return (
    <Column style={{ gap: 0 }}>
      <Text
        style={{
          fontSize: size,
          fontWeight: bold ? 700 : 400,
          textAlign: align,
        }}
      >
        {id}
      </Text>
      <Text
        style={{
          fontSize: Math.max(11, size - 2),
          color: token("colors.muted"),
          textAlign: align,
        }}
      >
        {en}
      </Text>
    </Column>
  );
}

/** Payment status pill — tinted by status, bilingual on one line. */
export function StatusPill({ status }: { status: PaymentStatus }) {
  const c = STATUS_COLORS[status];
  const label = paymentLabel(status);
  return (
    <Column
      style={{
        backgroundColor: c.tint,
        borderRadius: 999,
        padding: [4, 12],
        alignItems: "center",
        width: 210,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: 700, color: c.dark, textAlign: "center" }}>
        {label.id} · {label.en}
      </Text>
    </Column>
  );
}

/** The customer badge: IDPEL over the customer's name. Stacked, not side
 *  by side — DejaVu Bold is wider than it looks, and a side-by-side badge
 *  would wrap the ID. The fixed width only has to fit the longest line. */
export function CustomerBadge({ data }: { data: TagihanData }) {
  return (
    <Column
      style={{
        backgroundColor: "#FFFFFF",
        border: `2px solid ${C.blue}`,
        borderRadius: 14,
        padding: [10, 18],
        gap: 2,
        alignItems: "center",
        justifyContent: "start",
        width: 260,
      }}
    >
      <Text
        style={{
          color: C.navy,
          fontWeight: 800,
          fontSize: 14,
          fontFamily: MONO_FONT,
          textAlign: "center",
        }}
      >
        IDPEL {data.customer.idpel}
      </Text>
      <Text style={{ color: C.navy, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
        {data.customer.fullName}
      </Text>
    </Column>
  );
}

/**
 * The proof strip — IDENTICAL text on the bill email, the receipt, the
 * page, the bill PDF and the reminder. If any output ever shows a
 * different IDPEL or total, the kit is broken; that is the whole point of
 * "one meter reading, one bill".
 */
export function BillProof({ data, dark }: { data: TagihanData; dark?: boolean }) {
  const color = dark ? "#C9D6E8" : token("colors.muted");
  return (
    <Column style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, color, fontFamily: MONO_FONT }}>
        IDPEL {data.customer.idpel} · {data.customer.tariffCode} · Meter {data.customer.meterNo}
      </Text>
      <Text style={{ fontSize: 12, color }}>
        Tariff: {data.source} · {formatRupiah(tariffOf(data).ratePerKwh)}/kWh
      </Text>
      <Text style={{ fontSize: 12, fontWeight: 700, color: dark ? "#FFFFFF" : C.ink }}>
        One meter reading, one bill — this IDPEL is identical on the bill email, the receipt,
        the page, the bill PDF and the reminder.
      </Text>
    </Column>
  );
}

/** The bill breakdown as a table — the same computed lines everywhere. */
export function BillBreakdown({ data, totalBold = true }: { data: TagihanData; totalBold?: boolean }) {
  const lines = billLines(data);
  return (
    <Table
      style={{
        cellPadding: [10, 8],
        rowBorder: { width: 1, style: "solid", color: C.border },
      }}
    >
      <TableRow header>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Rincian / Breakdown</Span>
        </TableCell>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Perhitungan / Calculation</Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontWeight: 700 }}>Jumlah / Amount</Span>
        </TableCell>
      </TableRow>
      {lines.map((line, i) => {
        const isTotal = i === lines.length - 1;
        return (
          <TableRow
            key={line.labelId}
            style={
              isTotal
                ? { backgroundColor: C.navyTint }
                : i % 2 === 1
                  ? { backgroundColor: C.zebra }
                  : undefined
            }
          >
            <TableCell style={{ fontWeight: isTotal && totalBold ? 700 : 400 }}>
              {`${line.labelId} / ${line.labelEn}`}
            </TableCell>
            <TableCell style={{ fontFamily: MONO_FONT, fontSize: 13 }}>{line.detail}</TableCell>
            <TableCell
              style={{
                textAlign: "right",
                fontFamily: MONO_FONT,
                fontSize: isTotal ? 16 : 14,
                fontWeight: isTotal && totalBold ? 800 : 400,
              }}
            >
              {formatRupiah(line.amount)}
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}

/** Meter readings — start, end, usage, computed. */
export function MeterBlock({ data }: { data: TagihanData }) {
  const bill = data.bill;
  return (
    <Row style={{ gap: 24 }}>
      <Column style={{ gap: 2, flex: 1 }}>
        <Bi id="Stand awal" en="Start reading" size={12} />
        <Text style={{ fontFamily: MONO_FONT, fontSize: 20, fontWeight: 700 }}>
          {new Intl.NumberFormat("id-ID").format(bill.meterStart)}
        </Text>
        <Text style={{ fontSize: 13, color: token("colors.muted") }}>kWh · 30 Sep 2026</Text>
      </Column>
      <Column style={{ gap: 2, flex: 1 }}>
        <Bi id="Stand akhir" en="End reading" size={12} />
        <Text style={{ fontFamily: MONO_FONT, fontSize: 20, fontWeight: 700 }}>
          {new Intl.NumberFormat("id-ID").format(bill.meterEnd)}
        </Text>
        <Text style={{ fontSize: 13, color: token("colors.muted") }}>kWh · 31 Okt 2026</Text>
      </Column>
      <Column style={{ gap: 2, flex: 1 }}>
        <Bi id="Pemakaian" en="Usage" size={12} />
        <Text style={{ fontFamily: MONO_FONT, fontSize: 20, fontWeight: 800, color: C.navy }}>
          {formatKwh(usageKwh(data))}
        </Text>
        <Text style={{ fontSize: 13, color: token("colors.muted") }}>
          {bill.usageMonthId} / {bill.usageMonthEn}
        </Text>
      </Column>
    </Row>
  );
}

/** Usage vs last month — computed comparison. */
export function UsageChangeLine({ data }: { data: TagihanData }) {
  const change = usageChange(data);
  const up = change.diffKwh > 0;
  return (
    <Text style={{ fontSize: 14 }}>
      Pemakaian {up ? "naik" : "turun"} / Usage {up ? "up" : "down"}:{" "}
      <Span style={{ fontWeight: 700 }}>
        {up ? "+" : ""}
        {change.diffKwh} kWh ({up ? "+" : ""}
        {change.pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%)
      </Span>{" "}
      vs {formatKwh(data.previousMonthKwh)} bulan lalu / vs {formatKwh(data.previousMonthKwh)}{" "}
      last month
    </Text>
  );
}

/**
 * The 6-month usage chart as an SVG bar chart (Page + Canvas): one bar
 * per month, the current month in navy, the rest in blue, a yellow line
 * for the 6-month average. Values and month labels sit in layout rows
 * underneath the SVG — the same pattern as the TUMBUH timeline — so the
 * numbers are real text, never drawn glyphs.
 */
export function UsageBarsSvg({
  data,
  width = 560,
  height = 132,
}: {
  data: TagihanData;
  width?: number;
  height?: number;
}) {
  const months = data.usageHistory;
  const max = Math.max(...months.map((m) => m.kwh));
  const n = months.length;
  const slot = width / n;
  const barW = Math.min(56, slot * 0.55);
  const topPad = 10;
  const bottomPad = 6;
  const chartH = height - topPad - bottomPad;
  const barH = (kwh: number) => (kwh / max) * chartH;
  const avg = averageUsage(data);
  const avgY = topPad + chartH - (avg / max) * chartH;
  const peak = peakMonth(data);
  return (
    <Column style={{ gap: 6 }}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        title="Electricity usage, last 6 months"
      >
        {/* Average line */}
        <Line
          x1={0}
          y1={avgY}
          x2={width}
          y2={avgY}
          style={{ stroke: C.amber, strokeWidth: 3 }}
        />
        {/* Bars */}
        {months.map((m, i) => {
          const h = barH(m.kwh);
          const x = i * slot + (slot - barW) / 2;
          const y = topPad + chartH - h;
          const isCurrent = i === months.length - 1;
          return (
            <Rect
              key={m.labelId}
              x={x}
              y={y}
              width={barW}
              height={h}
              style={{ fill: isCurrent ? C.navy : C.blue }}
            />
          );
        })}
      </Svg>
      <Row style={{ gap: 0 }}>
        {months.map((m, i) => (
          <Column key={m.labelId} style={{ flex: 1, gap: 2, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: i === months.length - 1 ? C.navy : C.ink,
                fontFamily: MONO_FONT,
                textAlign: "center",
              }}
            >
              {m.kwh}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: token("colors.muted"),
                textAlign: "center",
              }}
            >
              {m.shortId}
            </Text>
          </Column>
        ))}
      </Row>
      <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
        Garis kuning = rata-rata 6 bulan: {avg.toLocaleString("id-ID")} kWh · Puncak / Peak:{" "}
        {peak.labelId} ({peak.kwh} kWh) · Bar biru tua = bulan ini / Dark blue bar = this month
      </Text>
    </Column>
  );
}

/** The usage history as layout rows (Email + Document: no SVG needed). */
export function UsageBars({ data }: { data: TagihanData }) {
  const max = Math.max(...data.usageHistory.map((m) => m.kwh));
  return (
    <Column style={{ gap: 10 }}>
      {data.usageHistory.map((m, i) => {
        const isCurrent = i === data.usageHistory.length - 1;
        return (
          <Row key={m.labelId} style={{ gap: 12, alignItems: "center", justifyContent: "start" }}>
            <Column style={{ gap: 0, width: 170 }}>
              <Text style={{ fontWeight: 700, fontSize: 13 }}>
                {m.shortId} {m.year} · {m.shortEn} {m.year}
              </Text>
              <Text style={{ fontSize: 12, color: token("colors.muted") }}>
                {isCurrent ? "Bulan ini / This month" : ""}
              </Text>
            </Column>
            {/* Bar: a fixed-width track with a filled portion. */}
            <Column
              style={{
                width: 180,
                height: 14,
                backgroundColor: C.track,
                borderRadius: 7,
              }}
            >
              <Column
                style={{
                  width: Math.round((m.kwh / max) * 180),
                  height: 14,
                  backgroundColor: isCurrent ? C.navy : C.blue,
                  borderRadius: 7,
                }}
              />
            </Column>
            <Text
              style={{
                fontFamily: MONO_FONT,
                fontSize: 14,
                fontWeight: isCurrent ? 800 : 400,
                color: isCurrent ? C.navy : C.ink,
              }}
            >
              {m.kwh} kWh
            </Text>
          </Row>
        );
      })}
      <Text style={{ fontSize: 12, color: token("colors.muted") }}>
        Rata-rata 6 bulan / 6-month average: {averageUsage(data).toLocaleString("id-ID")} kWh
      </Text>
    </Column>
  );
}

/**
 * The payment block — due date, countdown, the pay action and the payment
 * status. The pay button links to the payment URL for this IDPEL; the
 * status is a data field the payment side updates after the customer
 * pays, so the status on the bill email, the page, the PDF and the
 * reminder always matches. `withActions` is false on the printed bill: a
 * PDF has no hover and no clickable button, so the bill shows the payment
 * URL as text in its own section instead.
 */
export function PaymentBlock({ data, withActions = true }: { data: TagihanData; withActions?: boolean }) {
  const bill = data.bill;
  const due = dueDate(data);
  const count = countdownLabel(data);
  const label = paymentLabel(bill.status);
  const total = totalBill(data, usageKwh(data));
  return (
    <Column style={{ gap: 12 }}>
      <Row style={{ gap: 24 }}>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Total tagihan" en="Total bill" size={12} />
          <Text style={{ fontFamily: MONO_FONT, fontSize: 24, fontWeight: 800, color: C.navy }}>
            {formatRupiah(total)}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            Tagihan {bill.billingMonthId} · {bill.usageMonthId} / Bill Nov 2026 · Oct 2026 usage
          </Text>
        </Column>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Jatuh tempo" en="Due date" size={12} />
          <Text style={{ fontFamily: MONO_FONT, fontSize: 20, fontWeight: 700 }}>
            {formatDateId(due)}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            {formatDateEn(due)} · {bill.dueTime}
          </Text>
        </Column>
      </Row>
      <Row style={{ gap: 24 }}>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Hitung mundur" en="Countdown" size={12} />
          <Text style={{ fontSize: 20, fontWeight: 800, color: C.amberDark }}>
            {count.id} · {count.en}
          </Text>
        </Column>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Status pembayaran" en="Payment status" size={12} />
          <StatusPill status={bill.status} />
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            {label.id} · {label.en}
          </Text>
        </Column>
      </Row>
      {withActions && (
        <Row style={{ gap: 12, alignItems: "center" }}>
          <Button href={bill.payUrl}>Bayar Sekarang / Pay Now</Button>
          <Link href={bill.checkUrl}>Cek tagihan / Check bill</Link>
        </Row>
      )}
      <Text style={{ fontSize: 13 }}>
        Status ini adalah field data yang diperbarui setelah pelanggan membayar / This status is a
        data field updated once the customer pays — bayar sebelum jatuh tempo agar tidak kena
        denda keterlambatan / pay before the due date to avoid a late fee.
      </Text>
    </Column>
  );
}

/** Small divider + "sample scenario" note used at the foot of every output. */
export function SampleNote() {
  return (
    <Column style={{ gap: 8 }}>
      <Divider style={{ borderTop: { width: 1, style: "solid", color: "#CBD8E6" } }} />
      <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
        SAMPLE SCENARIO — a fictional customer, Budi Santoso, Kebumen, IDPEL 532101234567. Not a
        real bill. The customer, IDPEL, meter readings and payment record are illustrative; the
        tariff rules (ESDM Q4 2026) and the bill arithmetic are real. PPJ 3% is a sample rate —
        PPJ varies by region (perda).
      </Text>
    </Column>
  );
}
