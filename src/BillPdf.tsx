// ---------------------------------------------------------------------------
// TAGIHAN — Bill PDF (Document)
// The printable bill for one customer's month: when, how much, how it was
// computed, how to pay — plus the usage history and the tariff table on
// page 2. It is printed from the SAME meter reading as the bill email, the
// receipt, the page and the reminder — the IDPEL on this bill is the IDPEL
// on all of them, so a printed bill can never disagree with the reminder
// on the customer's phone.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Document,
  Heading,
  PageNumber,
  Row,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  TARIFF_TABLE,
  defaultData,
  formatRupiah,
  tariffOf,
  type TagihanData,
} from "./data.js";
import {
  BillBreakdown,
  BillProof,
  CustomerBadge,
  MeterBlock,
  PaymentBlock,
  UsageBars,
} from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, tagihanTheme } from "./theme.js";

export interface BillPdfProps {
  data?: TagihanData;
}

function BillPdf({ data = defaultData }: BillPdfProps) {
  const customer = data.customer;
  const bill = data.bill;
  return (
    <Document
      theme={tagihanTheme}
      fonts={PRINT_FONTS}
      title={`TAGIHAN — Tagihan Listrik ${bill.billingMonthId} (${customer.fullName}, IDPEL ${customer.idpel})`}
      size="A4"
      orientation="portrait"
      lang="id"
      style={{ fontFamily: PRINT_FONT, fontSize: 13 }}
    >
      {/* ================= Page 1: the bill ================= */}
      <Document.Page style={{ gap: 14 }}>
        <Column
          style={{ backgroundColor: C.navy, borderRadius: 10, padding: 20, gap: 8 }}
        >
          <Row style={{ gap: 12, alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
              TAGIHAN
            </Text>
            <CustomerBadge data={data} />
          </Row>
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            Tagihan Listrik / Electricity Bill
          </Heading>
          <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
            {customer.fullName} · {customer.address}, {customer.city} · {customer.tariffCode} ·{" "}
            Meter {customer.meterNo}
          </Text>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Meteran / Meter readings</Heading>
          <MeterBlock data={data} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Pembayaran / Payment</Heading>
          <PaymentBlock data={data} withActions={false} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Rincian tagihan / Bill breakdown</Heading>
          <BillBreakdown data={data} />
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            Tarif flat {customer.tariffCode}: {formatRupiah(tariffOf(data).ratePerKwh)}/kWh — tarif
            rumah tangga PLN itu flat per kWh per golongan daya, bukan bertingkat per blok
            pemakaian. PPJ 3% adalah tarif contoh (PPJ berbeda-beda per daerah). / Flat tariff{" "}
            {customer.tariffCode}: {formatRupiah(tariffOf(data).ratePerKwh)}/kWh — the PLN
            household tariff is flat per kWh within a power class, not tiered by usage blocks.
            PPJ 3% is a sample rate (PPJ varies by region).
          </Text>
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · IDPEL {customer.idpel} · Tagihan{" "}
          {bill.billingMonthId}
        </Text>
      </Document.Page>

      {/* ================= Page 2: how to pay, history, tariff, proof ================= */}
      <Document.Page style={{ gap: 10 }}>
        <Column style={{ gap: 8 }}>
          <Heading level={2}>Cara bayar / How to pay</Heading>
          <Text>
            Bayar lewat PLN Mobile, m-banking, ATM, atau gerai terdekat dengan IDPEL Anda, atau
            buka tautan ini: / Pay via PLN Mobile, mobile banking, ATM, or a nearby payment point
            with your IDPEL, or open this link:
          </Text>
          <Text style={{ fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700 }}>
            {bill.payUrl}
          </Text>
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            Status saat tagihan ini dicetak: Belum dibayar / Unpaid. / Status when printed:
            Unpaid.
          </Text>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Pemakaian 6 bulan terakhir / Usage, last 6 months</Heading>
          <UsageBars data={data} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Tarif rumah tangga PLN / PLN household tariff</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Tarif flat per kWh, bukan bertingkat (ESDM Q4 2026). / Flat rate per kWh, not tiered
            (ESDM Q4 2026).
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

        <Column style={{ gap: 8 }}>
          <Heading level={3}>Satu meteran, satu tagihan / One meter reading, one bill</Heading>
          <BillProof data={data} />
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          SAMPLE — fictional customer; tariff rules (ESDM Q4 2026) and bill arithmetic are real.
        </Text>
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · {data.source} · {customer.serviceUnit},{" "}
          {customer.address}
        </Text>
      </Document.Page>
    </Document>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(BillPdf, { PreviewProps: {} });
