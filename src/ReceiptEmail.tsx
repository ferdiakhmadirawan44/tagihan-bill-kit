// ---------------------------------------------------------------------------
// TAGIHAN — Payment Receipt Email (the SECOND Email root)
// The email a customer receives after paying: proof of payment for the
// previous bill (September usage, paid 18 October 2026 via PLN Mobile) —
// in Indonesian + English, from the same data. The receipt deliberately
// covers the PREVIOUS month, not the current bill: the current bill is
// unpaid, so a receipt for it would contradict the bill email. Real
// billing systems work the same way — the receipt in your inbox is for the
// bill you already paid. The reference number is derived from the paid
// date and the IDPEL, so the receipt can never cite a different customer.
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
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  billLinesForKwh,
  countdownLabel,
  defaultData,
  dueDate,
  formatDateEn,
  formatDateId,
  formatKwh,
  formatRupiah,
  parseDate,
  paymentRef,
  previousBillTotal,
  totalBill,
  usageKwh,
  type TagihanData,
} from "./data.js";
import { Bi, BillProof, CustomerBadge, SampleNote } from "./shared.js";
import { C, MONO_FONT, STATUS_COLORS, tagihanTheme } from "./theme.js";

export interface ReceiptEmailProps {
  data?: TagihanData;
}

function ReceiptEmail({ data = defaultData }: ReceiptEmailProps) {
  const customer = data.customer;
  const prev = data.previousBill;
  const total = previousBillTotal(data);
  const lines = billLinesForKwh(data, prev.kwh);
  const paid = STATUS_COLORS.paid;
  return (
    <Email
      theme={tagihanTheme}
      title={`LUNAS — Bukti Pembayaran ${prev.billingMonthId}: ${formatRupiah(total)} / PAID — Payment Receipt ${prev.billingMonthEn}: ${formatRupiah(total)}`}
      previewText={`Pembayaran tagihan ${prev.billingMonthId} sebesar ${formatRupiah(total)} diterima ${prev.paidOnLabelId} via ${prev.channel}. No. referensi ${paymentRef(data)}.`}
      lang="id"
      style={{ gap: 0 }}
    >
      {/* ---- Masthead: green band — paid at a glance ---- */}
      <Section
        tokens={{ colors: { background: paid.dark, foreground: "#FFFFFF" } }}
        style={{ backgroundColor: paid.dark, padding: [28, 0, 24, 0], gap: 16 }}
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
              Bukti Pembayaran · Payment Receipt
            </Text>
          </Column>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: "#FFFFFF" } }} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <CustomerBadge data={data} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontFamily: MONO_FONT, flex: 1 }}>
            LUNAS / PAID · {prev.billingMonthId}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [24, 0, 8, 0], gap: 24 }}>
        {/* Hero: payment received */}
        <Column style={{ apply: ["card"] }}>
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: token("colors.muted"),
            }}
          >
            Pembayaran diterima · Payment received
          </Text>
          <Heading level={1}>
            Lunas — {formatRupiah(total)} / Paid — {formatRupiah(total)}
          </Heading>
          <Text>
            Halo, <MergeTag name="first_name" /> — pembayaran tagihan{" "}
            <Span style={{ fontWeight: 700 }}>{customer.fullName}</Span> untuk pemakaian{" "}
            <Span style={{ fontWeight: 700 }}>{prev.usageMonthId}</Span> sudah kami terima pada{" "}
            <Span style={{ fontWeight: 700 }}>{prev.paidOnLabelId}</Span> via{" "}
            <Span style={{ fontWeight: 700 }}>{prev.channel}</Span>. Terima kasih! / Hello,{" "}
            <MergeTag name="first_name" /> — the payment for{" "}
            <Span style={{ fontWeight: 700 }}>{customer.fullName}</Span> for{" "}
            <Span style={{ fontWeight: 700 }}>{prev.usageMonthEn}</Span> usage was received on{" "}
            <Span style={{ fontWeight: 700 }}>{prev.paidOnLabelEn}</Span> via{" "}
            <Span style={{ fontWeight: 700 }}>{prev.channel}</Span>. Thank you!
          </Text>
          <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
          <Row style={{ gap: 24 }}>
            <Column style={{ gap: 2, flex: 1 }}>
              <Bi id="No. referensi" en="Reference no." size={12} />
              <Text style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 800, color: C.navy }}>
                {paymentRef(data)}
              </Text>
            </Column>
            <Column style={{ gap: 2, flex: 1 }}>
              <Bi id="Tanggal bayar" en="Paid on" size={12} />
              <Text style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 700 }}>
                {formatDateId(parseDate(prev.paidOnIso))}
              </Text>
              <Text style={{ fontSize: 13, color: token("colors.muted") }}>{prev.channel}</Text>
            </Column>
          </Row>
          <Row style={{ gap: 24 }}>
            <Column style={{ gap: 2, flex: 1 }}>
              <Bi id="Pemakaian" en="Usage" size={12} />
              <Text style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 700 }}>
                {formatKwh(prev.kwh)}
              </Text>
              <Text style={{ fontSize: 13, color: token("colors.muted") }}>
                {prev.usageMonthId} · Stand {new Intl.NumberFormat("id-ID").format(prev.meterStart)}{" "}
                → {new Intl.NumberFormat("id-ID").format(prev.meterEnd)} kWh
              </Text>
            </Column>
            <Column style={{ gap: 2, flex: 1 }}>
              <Bi id="Status" en="Status" size={12} />
              <Text style={{ fontSize: 16, fontWeight: 800, color: paid.dark }}>
                Lunas / Paid
              </Text>
              <Text style={{ fontSize: 13, color: token("colors.muted") }}>
                Tagihan {prev.billingMonthId} / Bill {prev.billingMonthEn}
              </Text>
            </Column>
          </Row>
        </Column>

        {/* What was paid */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Yang dibayar / What was paid</Heading>
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
                  <TableCell style={{ fontWeight: isTotal ? 700 : 400 }}>
                    {`${line.labelId} / ${line.labelEn}`}
                  </TableCell>
                  <TableCell style={{ fontFamily: MONO_FONT, fontSize: 13 }}>{line.detail}</TableCell>
                  <TableCell
                    style={{
                      textAlign: "right",
                      fontFamily: MONO_FONT,
                      fontSize: isTotal ? 16 : 14,
                      fontWeight: isTotal ? 800 : 400,
                    }}
                  >
                    {formatRupiah(line.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            Simpan email ini sebagai bukti pembayaran — nomor referensi di atas cocok dengan
            IDPEL Anda. / Keep this email as proof of payment — the reference number above
            matches your IDPEL.
          </Text>
        </Column>

        {/* Next bill */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Tagihan berikutnya / Next bill</Heading>
          <Text>
            Tagihan {data.bill.billingMonthId} (pemakaian {data.bill.usageMonthId}) sudah terbit
            sebesar{" "}
            <Span style={{ fontWeight: 700 }}>
              {formatRupiah(totalBill(data, usageKwh(data)))}
            </Span>{" "}
            dan jatuh tempo {formatDateId(dueDate(data))} — {countdownLabel(data).id.toLowerCase()}.
            / The {data.bill.billingMonthEn} bill (for {data.bill.usageMonthEn} usage) is out at{" "}
            <Span style={{ fontWeight: 700 }}>
              {formatRupiah(totalBill(data, usageKwh(data)))}
            </Span>{" "}
            and falls due {formatDateEn(dueDate(data))} — {countdownLabel(data).en.toLowerCase()}.
          </Text>
          <Button href={data.bill.payUrl}>Bayar Tagihan Berikutnya / Pay the Next Bill</Button>
        </Column>

        {/* Proof strip */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu meteran, satu tagihan / One meter reading, one bill</Heading>
          <BillProof data={data} />
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 24 }}>
        <Menu
          items={[
            { text: "Cek tagihan / Check bill", href: data.bill.checkUrl },
            { text: "Riwayat pembayaran / Payment history", href: `https://example.com/tagihan/${data.customer.idpel}/bayar` },
            { text: "Berhenti berlangganan / Unsubscribe", href: "https://example.com/unsubscribe" },
          ]}
          separator="·"
          style={{ fontSize: 13, color: token("colors.muted") }}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          TAGIHAN — bukti pembayaran listrik, dari {data.source}. / TAGIHAN — electricity
          payment receipts, from {data.source}.
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
export default Object.assign(ReceiptEmail, { PreviewProps: {} });
