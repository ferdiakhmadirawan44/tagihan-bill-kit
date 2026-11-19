// ---------------------------------------------------------------------------
// TAGIHAN — Bill Email
// The email a customer receives: the November 2026 bill for October usage,
// in Indonesian + English, from the same data. The total, the breakdown,
// the due date, the countdown and the payment status are all derived from
// the meter reading and the tariff — so the email can never disagree with
// the receipt, the page, the bill PDF or the reminder that carry the same
// IDPEL.
// ---------------------------------------------------------------------------

import {
  Button,
  Column,
  Divider,
  Email,
  Heading,
  Menu,
  MergeTag,
  Row,
  Section,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  countdownLabel,
  defaultData,
  dueDate,
  formatDateId,
  formatRupiah,
  parseDate,
  totalBill,
  usageKwh,
  type TagihanData,
} from "./data.js";
import {
  Bi,
  BillBreakdown,
  BillProof,
  CustomerBadge,
  MeterBlock,
  PaymentBlock,
  SampleNote,
  UsageBars,
  UsageChangeLine,
} from "./shared.js";
import { C, MONO_FONT, tagihanTheme } from "./theme.js";

export interface BillEmailProps {
  data?: TagihanData;
}

function BillEmail({ data = defaultData }: BillEmailProps) {
  const customer = data.customer;
  const bill = data.bill;
  const count = countdownLabel(data);
  const total = totalBill(data, usageKwh(data));
  return (
    <Email
      theme={tagihanTheme}
      title={`Tagihan Listrik ${bill.billingMonthId}: ${formatRupiah(total)} — jatuh tempo ${count.id.toLowerCase()} / Electricity Bill ${bill.billingMonthEn}: ${formatRupiah(total)}`}
      previewText={`Tagihan listrik ${bill.billingMonthId} sebesar ${formatRupiah(total)} (${usageKwh(data)} kWh) jatuh tempo ${count.id.toLowerCase()} — ${formatDateId(dueDate(data))}.`}
      lang="id"
      style={{ gap: 0 }}
    >
      {/* ---- Masthead: deep navy band ---- */}
      <Section
        tokens={{ colors: { background: C.navy, foreground: "#FFFFFF" } }}
        style={{ backgroundColor: C.navy, padding: [28, 0, 24, 0], gap: 16 }}
      >
        <Row style={{ gap: 14, alignItems: "center" }}>
          <Column style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: 3,
              }}
            >
              TAGIHAN
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
              Tagihan Listrik · Electricity Bill
            </Text>
          </Column>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: "#FFFFFF" } }} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <CustomerBadge data={data} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontFamily: MONO_FONT, flex: 1 }}>
            {bill.billingMonthId} · Pemakaian / Usage {bill.usageMonthId}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [24, 0, 8, 0], gap: 24 }}>
        {/* Hero: the total */}
        <Column style={{ apply: ["card"] }}>
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: token("colors.muted"),
            }}
          >
            Tagihan bulan ini · This month&apos;s bill
          </Text>
          <Heading level={1}>
            Tagihan {bill.billingMonthId}: {formatRupiah(total)} / Bill {bill.billingMonthEn}:{" "}
            {formatRupiah(total)}
          </Heading>
          <Text>
            Halo, <MergeTag name="first_name" /> — tagihan listrik{" "}
            <Span style={{ fontWeight: 700 }}>{customer.fullName}</Span> untuk pemakaian{" "}
            <Span style={{ fontWeight: 700 }}>{bill.usageMonthId}</Span> sudah terbit:{" "}
            <Span style={{ fontWeight: 700 }}>{usageKwh(data)} kWh</Span>, total{" "}
            <Span style={{ fontWeight: 700 }}>{formatRupiah(total)}</Span>. / Hello,{" "}
            <MergeTag name="first_name" /> — the electricity bill for{" "}
            <Span style={{ fontWeight: 700 }}>{customer.fullName}</Span> for{" "}
            <Span style={{ fontWeight: 700 }}>{bill.usageMonthEn}</Span> usage is out:{" "}
            <Span style={{ fontWeight: 700 }}>{usageKwh(data)} kWh</Span>, total{" "}
            <Span style={{ fontWeight: 700 }}>{formatRupiah(total)}</Span>.
          </Text>
          <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
          <MeterBlock data={data} />
          <UsageChangeLine data={data} />
        </Column>

        {/* Payment: due date, countdown, action, status */}
        <Column style={{ apply: ["card"] }}>
          <Bi id="Pembayaran" en="Payment" size={12} bold />
          <PaymentBlock data={data} />
        </Column>

        {/* Breakdown */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Rincian tagihan / Bill breakdown</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Tarif flat {customer.tariffCode}: {formatRupiah(1444.7)}/kWh — tarif rumah tangga PLN
            itu flat per kWh per golongan daya, bukan bertingkat per blok pemakaian. / Flat
            tariff {customer.tariffCode}: {formatRupiah(1444.7)}/kWh — the PLN household tariff
            is flat per kWh within a power class, not tiered by usage blocks.
          </Text>
          <BillBreakdown data={data} />
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            PPJ 3% adalah tarif contoh — PPJ (Pajak Penerangan Jalan) ditetapkan tiap daerah
            (perda) dan berbeda-beda. / PPJ 3% is a sample rate — the street-lighting tax is set
            by each region (perda) and varies.
          </Text>
        </Column>

        {/* Usage history */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Pemakaian 6 bulan terakhir / Usage, last 6 months</Heading>
          <UsageBars data={data} />
        </Column>

        {/* Proof strip */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu meteran, satu tagihan / One meter reading, one bill</Heading>
          <BillProof data={data} />
          <Button href={bill.payUrl}>Bayar Sekarang / Pay Now</Button>
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 24 }}>
        <Menu
          items={[
            { text: "Cek tagihan / Check bill", href: bill.checkUrl },
            { text: "Riwayat pemakaian / Usage history", href: `https://example.com/tagihan/${data.customer.idpel}/riwayat` },
            { text: "Berhenti berlangganan / Unsubscribe", href: "https://example.com/unsubscribe" },
          ]}
          separator="·"
          style={{ fontSize: 13, color: token("colors.muted") }}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          TAGIHAN — pengingat tagihan listrik, dari {data.source}. Anda menerima email ini karena
          terdaftar sebagai pelanggan {data.customer.serviceUnit}. / TAGIHAN — electricity bill
          reminders, from {data.source}.
        </Text>
        <SampleNote />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          {data.customer.serviceUnit} · {data.customer.address}, {data.customer.city}
        </Text>
      </Section>
    </Email>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(BillEmail, { PreviewProps: {} });
