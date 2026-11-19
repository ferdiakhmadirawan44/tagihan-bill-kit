// ---------------------------------------------------------------------------
// TAGIHAN — Usage Page
// The live dashboard for one customer's electricity: the bill total, the
// payment countdown, the 6-month usage chart, the full breakdown, the
// tariff table and the payment status. Everything on this page is derived
// from the same meter reading and tariff as the bill email, the receipt,
// the bill PDF and the reminder — same IDPEL, same total, same countdown.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Grid,
  Heading,
  Page,
  Row,
  Section,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  TARIFF_TABLE,
  countdownLabel,
  defaultData,
  dueDate,
  formatDateId,
  formatKwh,
  formatRupiah,
  tariffOf,
  totalBill,
  usageKwh,
  type PaymentStatus,
  type TagihanData,
} from "./data.js";
import {
  BillBreakdown,
  BillProof,
  CustomerBadge,
  PaymentBlock,
  SampleNote,
  UsageBarsSvg,
  UsageChangeLine,
} from "./shared.js";
import { C, MONO_FONT, STATUS_COLORS, tagihanTheme } from "./theme.js";

export interface UsagePageProps {
  data?: TagihanData;
}

function UsagePage({ data = defaultData }: UsagePageProps) {
  const customer = data.customer;
  const bill = data.bill;
  const count = countdownLabel(data);
  const total = totalBill(data, usageKwh(data));
  return (
    <Page
      theme={tagihanTheme}
      title={`TAGIHAN — Tagihan listrik ${customer.fullName}: ${formatRupiah(total)} jatuh tempo ${count.id.toLowerCase()}`}
      description={`Tagihan listrik ${bill.billingMonthId} ${customer.fullName} — ${formatKwh(usageKwh(data))} pemakaian ${bill.usageMonthId}, total ${formatRupiah(total)}, jatuh tempo ${count.id.toLowerCase()}.`}
      width={1120}
      lang="id"
      style={{ backgroundColor: C.page, gap: 0 }}
    >
      {/* ---- Top bar ---- */}
      <Section style={{ padding: [20, 0, 0, 0], gap: 0 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, flex: 1 }}>TAGIHAN</Text>
          <Text style={{ fontSize: 13, color: token("colors.muted"), fontFamily: MONO_FONT }}>
            IDPEL {customer.idpel}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            {data.referenceDateLabelId}
          </Text>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
      </Section>

      {/* ---- Hero: the total ---- */}
      <Section style={{ padding: [28, 0, 8, 0], gap: 24 }}>
        <Column
          style={{
            backgroundColor: C.navy,
            borderRadius: 16,
            padding: 32,
            gap: 16,
          }}
        >
          <Row style={{ gap: 16, alignItems: "center" }}>
            <CustomerBadge data={data} />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: MONO_FONT }}>
              {customer.tariffCode} · Meter {customer.meterNo} · {customer.serviceUnit}
            </Text>
          </Row>
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            Tagihan {bill.billingMonthId}: {formatRupiah(total)} — jatuh tempo {count.id.toLowerCase()}
          </Heading>
          <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
            Bill {bill.billingMonthEn}: {formatRupiah(total)} — due {count.en.toLowerCase()}.
          </Text>
          <Row style={{ gap: 32 }}>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Total tagihan / Total bill
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {formatRupiah(total)}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                {formatKwh(usageKwh(data))} · {bill.usageMonthId}
              </Text>
            </Column>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Jatuh tempo / Due date
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {formatDateId(dueDate(data))}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                {bill.dueTime} · {count.id} / {count.en}
              </Text>
            </Column>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Pemakaian / Usage
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {usageKwh(data)} kWh
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                Tarif / Tariff {formatRupiah(tariffOf(data).ratePerKwh)}/kWh
              </Text>
            </Column>
          </Row>
        </Column>

        {/* ---- Usage chart + payment ---- */}
        <Grid columns={2} style={{ gap: 16 }}>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Pemakaian 6 bulan terakhir / Usage, last 6 months</Heading>
            <Text style={{ color: token("colors.muted") }}>
              Setiap bar adalah satu bulan pemakaian — bar biru tua adalah bulan ini, garis kuning
              adalah rata-rata. / Every bar is one month of usage — the dark blue bar is this
              month, the yellow line is the average.
            </Text>
            <UsageBarsSvg data={data} width={480} height={132} />
            <UsageChangeLine data={data} />
          </Column>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Pembayaran / Payment</Heading>
            <PaymentBlock data={data} />
          </Column>
        </Grid>

        {/* ---- Full breakdown ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Rincian tagihan / Bill breakdown</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Dihitung dari meteran, bukan diketik: {formatKwh(usageKwh(data))} ×{" "}
            {formatRupiah(tariffOf(data).ratePerKwh)} + PPJ {bill.ppjRate * 100}%. / Computed from
            the meter reading, never typed in: {formatKwh(usageKwh(data))} ×{" "}
            {formatRupiah(tariffOf(data).ratePerKwh)} + PPJ {bill.ppjRate * 100}%.
          </Text>
          <BillBreakdown data={data} />
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            PPJ 3% adalah tarif contoh — PPJ (Pajak Penerangan Jalan) ditetapkan tiap daerah
            (perda) dan berbeda-beda. / PPJ 3% is a sample rate — the street-lighting tax is set
            by each region (perda) and varies.
          </Text>
        </Column>

        {/* ---- Tariff table + status legend ---- */}
        <Grid columns={2} style={{ gap: 16 }}>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Tarif rumah tangga PLN / PLN household tariff</Heading>
            <Text style={{ color: token("colors.muted") }}>
              {data.source} — tarif flat per kWh per golongan daya, bukan bertingkat per blok
              pemakaian. / Flat rate per kWh within a power class, not tiered by usage blocks.
            </Text>
            <Table
              style={{
                cellPadding: [8, 8],
                rowBorder: { width: 1, style: "solid", color: C.border },
              }}
            >
              <TableRow header>
                <TableCell>
                  <Span style={{ fontWeight: 700 }}>Golongan / Class</Span>
                </TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Span style={{ fontWeight: 700 }}>Tarif / Rate</Span>
                </TableCell>
              </TableRow>
              {TARIFF_TABLE.map((t, i) => {
                const isMine = t.code === customer.tariffCode;
                return (
                  <TableRow
                    key={t.code}
                    style={
                      isMine
                        ? { backgroundColor: C.navyTint }
                        : i % 2 === 1
                          ? { backgroundColor: C.zebra }
                          : undefined
                    }
                  >
                    <TableCell style={{ fontWeight: isMine ? 700 : 400 }}>
                      {t.code}
                      {t.subsidised ? " (subsidi)" : ""}
                      {isMine ? " — golongan Anda / your class" : ""}
                    </TableCell>
                    <TableCell
                      style={{
                        textAlign: "right",
                        fontFamily: MONO_FONT,
                        fontWeight: isMine ? 700 : 400,
                      }}
                    >
                      {formatRupiah(t.ratePerKwh)}/kWh
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </Column>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Arti warna / What the colours mean</Heading>
            <Text style={{ color: token("colors.muted") }}>
              Status pembayaran adalah field data yang diperbarui setelah pelanggan membayar. /
              The payment status is a data field updated once the customer pays.
            </Text>
            {(["unpaid", "paid", "overdue"] as PaymentStatus[]).map((s) => {
              const c = STATUS_COLORS[s];
              return (
                <Row key={s} style={{ gap: 12, alignItems: "center" }}>
                  <Column
                    style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.color }}
                  />
                  <Column style={{ gap: 0, flex: 1 }}>
                    <Text style={{ fontWeight: 700, fontSize: 13, color: c.dark }}>
                      {s === "unpaid"
                        ? "Belum dibayar / Unpaid"
                        : s === "paid"
                          ? "Lunas / Paid"
                          : "Terlambat / Overdue"}
                    </Text>
                    <Text style={{ fontSize: 12, color: token("colors.muted") }}>
                      {s === "unpaid"
                        ? "Tagihan sudah terbit dan menunggu pembayaran sebelum jatuh tempo."
                        : s === "paid"
                          ? "Pembayaran sudah diterima — bukti dikirim lewat email."
                          : "Tanggal jatuh tempo sudah lewat — segera bayar agar tidak kena denda."}
                    </Text>
                  </Column>
                </Row>
              );
            })}
            <Text style={{ fontSize: 12, color: token("colors.muted") }}>
              <Span style={{ fontWeight: 700 }}>Catatan / Note:</Span> tagihan pascabayar jatuh
              tempo setiap tanggal 20 — bayar sebelum tanggal itu agar tidak kena denda
              keterlambatan. / Postpaid bills fall due on the 20th of each month — pay before
              then to avoid a late fee.
            </Text>
          </Column>
        </Grid>

        {/* ---- Proof strip ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu meteran, satu tagihan / One meter reading, one bill</Heading>
          <BillProof data={data} />
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 16 }}>
        <Text style={{ fontSize: 13, color: token("colors.muted"), textAlign: "center" }}>
          TAGIHAN — dashboard tagihan listrik · {data.source} · {customer.serviceUnit},{" "}
          {customer.address}, {customer.city}
        </Text>
        <SampleNote />
      </Section>
    </Page>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(UsagePage, { PreviewProps: {} });
