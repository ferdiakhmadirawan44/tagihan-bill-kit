// ---------------------------------------------------------------------------
// TAGIHAN — PLN Electricity Bill Kit: data model + derived values.
//
// ONE SOURCE OF TRUTH: one customer + one meter reading drives all five
// outputs — bill email, payment receipt email, usage page, bill PDF and
// payment reminder card. Everything downstream of the meter reading (the
// kWh used, the energy charge, the street-lighting tax, the total, the
// comparison with last month, the payment countdown, the IDPEL) is
// COMPUTED by the code below, never hard-coded per output. Change the
// meter reading and every output changes with it — that is the point of
// the kit: "one meter reading, one bill, zero contradictions."
//
// THE SEVEN DIFFERENCES (why this kit is unlike the other 43 entries):
//  1. BILINGUAL — every label is Indonesian + English from the same data,
//     so the two languages can never drift apart.
//  2. MONEY IS COMPUTED — the bill is arithmetic on the meter reading
//     (kWh x the flat PLN tariff + PPJ), never typed in.
//  3. REAL RULES — the tariff is the real ESDM Q4 2026 PLN tariff for
//     R-1/TR 1.300 VA (see below); the due date is the real PLN postpaid
//     due date (the 20th).
//  4. A PAYMENT COUNTDOWN — "due tomorrow" is derived from the due date
//     and the reference date, never typed in.
//  5. A RESPONSE LOOP — the bill carries a "Pay now" action and a
//     payment status as a data field, so PLN (or the payment app) can
//     tell a paid bill from a waiting one — on every output.
//  6. PROOF — one IDPEL (customer ID), identical on every output.
//  7. A HUMAN STORY — one family's monthly electricity bill, not an
//     administrative form.
//
// SOURCES (all real, cited in the README):
// - Tariff: ESDM (Ministry of Energy and Mineral Resources) Q4 2026
//   (Oct–Dec 2026) PLN tariff — UNCHANGED from Q3 2026. Household flat
//   rates per kWh by power class (NOT tiered by usage blocks):
//   R-1/TR 450 VA subsidised Rp415; R-1/TR 900 VA subsidised Rp605;
//   R-1/TR 900 VA RTM Rp1.352; R-1/TR 1.300 VA Rp1.444,70;
//   R-1/TR 2.200 VA Rp1.444,70; R-2/TR 3.500–5.500 VA Rp1.699,53;
//   R-3/TR 6.600 VA and above Rp1.699,53.
// - PPJ (Pajak Penerangan Jalan / street-lighting tax) is a percentage of
//   the energy charge set by each regional government (perda) — it varies
//   by region. This sample uses 3% as a DATA FIELD; the README and the
//   templates say so explicitly, so no reader mistakes it for a fixed
//   national rate.
// - Postpaid billing: the bill for October usage is issued in November
//   and falls due on the 20th — the real PLN postpaid rhythm.
// - Sample customer: ILLUSTRATIVE (a fictional family). The customer,
//   the IDPEL, the meter readings and the payment record are sample
//   values; the tariff rules and the bill arithmetic are real.
// ---------------------------------------------------------------------------

/** Parse an ISO date as UTC noon — noon is safely inside the same
 *  calendar day in every timezone, so no date ever slips a day when the
 *  VM's local zone differs from WIB (the bug that once rendered every due
 *  date one day early in the TUMBUH kit). All date math here is UTC-based. */
export function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** Whole days between two dates (UTC date parts — timezone-safe). */
export function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const utc = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((utc(b) - utc(a)) / ms);
}

/** "20 November 2026" in Indonesian. */
export function formatDateId(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** "Thursday, 20 November 2026" in English. */
export function formatDateEn(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** "Kamis, 20 November 2026" in Indonesian. */
export function formatDateIdLong(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Whole rupiah — Indonesian grouping, e.g. 260408 -> "Rp260.408". */
export function formatRupiah(n: number): string {
  return `Rp${new Intl.NumberFormat("id-ID").format(n)}`;
}

/** kWh with Indonesian grouping, e.g. 175 -> "175 kWh". */
export function formatKwh(n: number): string {
  return `${new Intl.NumberFormat("id-ID").format(n)} kWh`;
}

/** One tariff class — the real ESDM Q4 2026 PLN household tariff. The
 *  household tariff is FLAT per kWh within a power class: the same rate
 *  applies to every kWh, so the energy charge is simply usage x rate. */
export interface TariffClass {
  /** e.g. "R-1/TR 1.300 VA" */
  code: string;
  /** e.g. "Rumah Tangga 1.300 VA" */
  nameId: string;
  /** e.g. "Household 1,300 VA" */
  nameEn: string;
  /** Rupiah per kWh, e.g. 1444.70. */
  ratePerKwh: number;
  /** True for the subsidised classes (450 VA, 900 VA subsidi). */
  subsidised: boolean;
}

/** The full Q4 2026 household tariff table (ESDM, unchanged from Q3). */
export const TARIFF_TABLE: TariffClass[] = [
  { code: "R-1/TR 450 VA", nameId: "Rumah Tangga 450 VA", nameEn: "Household 450 VA", ratePerKwh: 415, subsidised: true },
  { code: "R-1/TR 900 VA", nameId: "Rumah Tangga 900 VA (subsidi)", nameEn: "Household 900 VA (subsidised)", ratePerKwh: 605, subsidised: true },
  { code: "R-1/TR 900 VA RTM", nameId: "Rumah Tangga 900 VA RTM", nameEn: "Household 900 VA RTM", ratePerKwh: 1352, subsidised: false },
  { code: "R-1/TR 1.300 VA", nameId: "Rumah Tangga 1.300 VA", nameEn: "Household 1,300 VA", ratePerKwh: 1444.7, subsidised: false },
  { code: "R-1/TR 2.200 VA", nameId: "Rumah Tangga 2.200 VA", nameEn: "Household 2,200 VA", ratePerKwh: 1444.7, subsidised: false },
  { code: "R-2/TR 3.500–5.500 VA", nameId: "Rumah Tangga 3.500–5.500 VA", nameEn: "Household 3,500–5,500 VA", ratePerKwh: 1699.53, subsidised: false },
  { code: "R-3/TR 6.600 VA ke atas", nameId: "Rumah Tangga 6.600 VA ke atas", nameEn: "Household 6,600 VA and above", ratePerKwh: 1699.53, subsidised: false },
];

/** Payment status — a DATA field the payment side updates. A static
 *  template cannot change state itself, but the pay action and the status
 *  travel together on every output, so the customer always sees the same
 *  status PLN sees. */
export type PaymentStatus = "unpaid" | "paid" | "overdue";

/** One monthly usage bar (the 6-month history on the page). */
export interface UsageMonth {
  /** e.g. "Mei 2026" */
  labelId: string;
  /** e.g. "May 2026" */
  labelEn: string;
  /** Short label for the chart, e.g. "Mei". */
  shortId: string;
  /** Short label for the chart, English, e.g. "May". */
  shortEn: string;
  /** Year, e.g. "2026" — chart labels use the short form. */
  year: string;
  kwh: number;
}

/** One line of the bill breakdown. */
export interface BillLine {
  /** e.g. "Biaya energi" */
  labelId: string;
  /** e.g. "Energy charge" */
  labelEn: string;
  /** Detail line, e.g. "175 kWh × Rp1.444,70". */
  detail: string;
  /** Amount in whole rupiah. */
  amount: number;
}

export interface Customer {
  /** Full name (sample). */
  fullName: string;
  /** First name, for greetings. */
  firstName: string;
  /** 12-digit PLN customer ID (sample, fictional). */
  idpel: string;
  /** e.g. "R-1/TR 1.300 VA" — must match a TARIFF_TABLE code. */
  tariffCode: string;
  /** Meter number (sample). */
  meterNo: string;
  address: string;
  city: string;
  /** PLN service unit, e.g. "PLN ULP Kebumen". */
  serviceUnit: string;
}

/** The current (unpaid) bill: October usage, billed November 2026. */
export interface CurrentBill {
  /** Billing month label — Indonesian, e.g. "November 2026". */
  billingMonthId: string;
  /** Billing month label — English, e.g. "November 2026". */
  billingMonthEn: string;
  /** Usage month label — Indonesian, e.g. "Oktober 2026". */
  usageMonthId: string;
  /** Usage month label — English, e.g. "October 2026". */
  usageMonthEn: string;
  /** Meter reading at the start of the usage month (kWh). */
  meterStart: number;
  /** Meter reading at the end of the usage month (kWh). */
  meterEnd: number;
  /** ISO date of the end reading, e.g. "2026-10-31". */
  meterEndDateIso: string;
  /** Due date ISO — PLN postpaid due date is the 20th. */
  dueDateIso: string;
  /** Due time, e.g. "23:59 WIB". */
  dueTime: string;
  /** PPJ rate as a fraction (0.03 = 3%) — a DATA FIELD; PPJ varies by
   *  region (perda), it is not a fixed national rate. */
  ppjRate: number;
  /** PPJ label with the rate, e.g. "PPJ 3% (contoh / sample rate)". */
  ppjLabelId: string;
  ppjLabelEn: string;
  status: PaymentStatus;
  payUrl: string;
  /** URL where the bill can be checked, e.g. PLN Mobile deep link. */
  checkUrl: string;
}

/** The previous bill, already paid — the receipt email renders this one.
 *  Keeping the receipt on the previous month (not the current bill) is
 *  deliberate: the current bill is unpaid, so a receipt for it would
 *  contradict the bill. Real billing systems work the same way: the
 *  receipt in your inbox is for the bill you already paid. */
export interface PaidBill {
  billingMonthId: string;
  billingMonthEn: string;
  usageMonthId: string;
  usageMonthEn: string;
  kwh: number;
  /** Meter reading at the start of that usage month (kWh) — the chain is
   *  continuous: September starts where August ended (8.260) and ends
   *  where October starts (8.412). */
  meterStart: number;
  /** Meter reading at the end of that usage month (kWh). */
  meterEnd: number;
  /** ISO date the payment was made, e.g. "2026-10-18". */
  paidOnIso: string;
  /** Display form — Indonesian, e.g. "18 Oktober 2026". */
  paidOnLabelId: string;
  /** Display form — English, e.g. "18 October 2026". */
  paidOnLabelEn: string;
  /** Payment channel, e.g. "PLN Mobile". */
  channel: string;
}

export interface TagihanData {
  customer: Customer;
  /** The "today" the template renders as of — explicit in the data so the
   *  countdown is deterministic and reproducible. */
  referenceDateIso: string;
  /** Display form — Indonesian, e.g. "Kamis, 19 November 2026". */
  referenceDateLabelId: string;
  /** Display form — English, e.g. "Thursday, 19 November 2026". */
  referenceDateLabelEn: string;
  bill: CurrentBill;
  previousBill: PaidBill;
  /** 6 months of usage, oldest first, ending with the current bill's month. */
  usageHistory: UsageMonth[];
  /** kWh used in the month before the current bill's usage month. */
  previousMonthKwh: number;
  source: string;
  /** The customer, IDPEL and meter readings in this sample are illustrative. */
  sampleNote: string;
}

/** The tariff class of the sample customer (looked up, never typed twice). */
export function tariffOf(data: TagihanData): TariffClass {
  const t = TARIFF_TABLE.find((x) => x.code === data.customer.tariffCode);
  if (!t) throw new Error(`Unknown tariff code ${data.customer.tariffCode}`);
  return t;
}

/** kWh used in the current bill = end reading − start reading (computed). */
export function usageKwh(data: TagihanData): number {
  return data.bill.meterEnd - data.bill.meterStart;
}

/** Energy charge = usage x the flat tariff, rounded to whole rupiah. */
export function energyCharge(data: TagihanData, kwh: number): number {
  return Math.round(kwh * tariffOf(data).ratePerKwh);
}

/** PPJ = PPJ rate x energy charge, rounded to whole rupiah. */
export function ppjAmount(data: TagihanData, energy: number): number {
  return Math.round(energy * data.bill.ppjRate);
}

/** Total bill = energy charge + PPJ. (No admin fee in this sample — the
 *  templates say so; a real bill may add a bank/admin fee.) */
export function totalBill(data: TagihanData, kwh: number): number {
  const energy = energyCharge(data, kwh);
  return energy + ppjAmount(data, energy);
}

/** The bill breakdown for a given kWh, computed — the same lines on the
 *  email, the page, the PDF and the reminder. */
export function billLinesForKwh(data: TagihanData, kwh: number): BillLine[] {
  const rate = tariffOf(data).ratePerKwh;
  const energy = energyCharge(data, kwh);
  const ppj = ppjAmount(data, energy);
  return [
    {
      labelId: "Biaya energi",
      labelEn: "Energy charge",
      detail: `${formatKwh(kwh)} × ${formatRupiah(rate)}`,
      amount: energy,
    },
    {
      labelId: data.bill.ppjLabelId,
      labelEn: data.bill.ppjLabelEn,
      detail: `${(data.bill.ppjRate * 100).toLocaleString("id-ID")}% × ${formatRupiah(energy)}`,
      amount: ppj,
    },
    {
      labelId: "Total tagihan",
      labelEn: "Total bill",
      detail: "Biaya energi + PPJ / Energy charge + PPJ",
      amount: energy + ppj,
    },
  ];
}

/** The bill breakdown for the current bill's usage. */
export function billLines(data: TagihanData): BillLine[] {
  return billLinesForKwh(data, usageKwh(data));
}

/** Total of the previous (paid) bill — computed the same way. */
export function previousBillTotal(data: TagihanData): number {
  return totalBill(data, data.previousBill.kwh);
}

/** Payment reference for the receipt — derived from the paid date and the
 *  IDPEL, so the receipt can never cite a different customer. */
export function paymentRef(data: TagihanData): string {
  const d = parseDate(data.previousBill.paidOnIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `INV-${y}${m}${day}-${data.customer.idpel.slice(-4)}`;
}

/** Reference ("today") date of the data. */
export function referenceDate(data: TagihanData): Date {
  return parseDate(data.referenceDateIso);
}

/** Due date of the current bill. */
export function dueDate(data: TagihanData): Date {
  return parseDate(data.bill.dueDateIso);
}

/** Days from the reference date to the due date (negative = overdue). */
export function daysUntilDue(data: TagihanData): number {
  return daysBetween(referenceDate(data), dueDate(data));
}

/** Countdown label for the due date — Indonesian + English. */
export function countdownLabel(data: TagihanData): { id: string; en: string } {
  const days = daysUntilDue(data);
  if (days === 0) return { id: "Hari ini", en: "Today" };
  if (days === 1) return { id: "Besok", en: "Tomorrow" };
  if (days > 1) return { id: `Dalam ${days} hari`, en: `In ${days} days` };
  return { id: `${-days} hari terlambat`, en: `${-days} days overdue` };
}

/** Payment status label — bilingual. */
export function paymentLabel(status: PaymentStatus): { id: string; en: string } {
  switch (status) {
    case "unpaid":
      return { id: "Belum dibayar", en: "Unpaid" };
    case "paid":
      return { id: "Lunas", en: "Paid" };
    case "overdue":
      return { id: "Terlambat", en: "Overdue" };
  }
}

/** kWh change vs the previous month, and the percentage (computed). */
export function usageChange(data: TagihanData): { diffKwh: number; pct: number } {
  const diff = usageKwh(data) - data.previousMonthKwh;
  return { diffKwh: diff, pct: (diff / data.previousMonthKwh) * 100 };
}

/** Average monthly usage over the 6-month history (computed). */
export function averageUsage(data: TagihanData): number {
  const sum = data.usageHistory.reduce((n, m) => n + m.kwh, 0);
  return sum / data.usageHistory.length;
}

/** Highest usage month in the history (computed). */
export function peakMonth(data: TagihanData): UsageMonth {
  return data.usageHistory.reduce((a, b) => (b.kwh > a.kwh ? b : a));
}

// ---------------------------------------------------------------------------
// Sample scenario — a fictional family, real tariff, real bill arithmetic.
//
// Budi Santoso, R-1/TR 1.300 VA, Kebumen. The template renders as of
// Thursday 19 November 2026. The November 2026 bill covers October 2026
// usage: meter 8.412 → 8.587 = 175 kWh. At Rp1.444,70/kWh the energy
// charge is Rp252.823; PPJ 3% is Rp7.585; the total is Rp260.408 — due
// Friday 20 November 2026, tomorrow, in 1 day. Last month (September
// usage) was 152 kWh, so usage is up 23 kWh (+15,1%). The September bill
// (Rp226.182) was paid on 18 October 2026 via PLN Mobile — that is the
// receipt email. A live deployment replaces `sampleData` with a real
// customer's record and the whole kit re-derives itself: kWh, charges,
// total, comparison, countdown and IDPEL.
// ---------------------------------------------------------------------------

export const sampleData: TagihanData = {
  customer: {
    fullName: "Budi Santoso",
    firstName: "Budi",
    idpel: "532101234567",
    tariffCode: "R-1/TR 1.300 VA",
    meterNo: "0038123456",
    address: "Jl. Merdeka No. 12, Kebumen",
    city: "Kebumen, Jawa Tengah 54311",
    serviceUnit: "PLN ULP Kebumen",
  },
  referenceDateIso: "2026-11-19",
  referenceDateLabelId: "Kamis, 19 November 2026",
  referenceDateLabelEn: "Thursday, 19 November 2026",
  bill: {
    billingMonthId: "November 2026",
    billingMonthEn: "November 2026",
    usageMonthId: "Oktober 2026",
    usageMonthEn: "October 2026",
    meterStart: 8412,
    meterEnd: 8587,
    meterEndDateIso: "2026-10-31",
    dueDateIso: "2026-11-20",
    dueTime: "23:59 WIB",
    ppjRate: 0.03,
    ppjLabelId: "PPJ 3% (Pajak Penerangan Jalan)",
    ppjLabelEn: "PPJ 3% (street-lighting tax)",
    status: "unpaid",
    payUrl: "https://example.com/tagihan/532101234567/bayar",
    checkUrl: "https://example.com/tagihan/532101234567",
  },
  previousBill: {
    billingMonthId: "Oktober 2026",
    billingMonthEn: "October 2026",
    usageMonthId: "September 2026",
    usageMonthEn: "September 2026",
    kwh: 152,
    meterStart: 8260,
    meterEnd: 8412,
    paidOnIso: "2026-10-18",
    paidOnLabelId: "18 Oktober 2026",
    paidOnLabelEn: "18 October 2026",
    channel: "PLN Mobile",
  },
  usageHistory: [
    { labelId: "Mei 2026", labelEn: "May 2026", shortId: "Mei", shortEn: "May", year: "2026", kwh: 148 },
    { labelId: "Juni 2026", labelEn: "June 2026", shortId: "Jun", shortEn: "Jun", year: "2026", kwh: 161 },
    { labelId: "Juli 2026", labelEn: "July 2026", shortId: "Jul", shortEn: "Jul", year: "2026", kwh: 139 },
    { labelId: "Agustus 2026", labelEn: "August 2026", shortId: "Agu", shortEn: "Aug", year: "2026", kwh: 158 },
    { labelId: "September 2026", labelEn: "September 2026", shortId: "Sep", shortEn: "Sep", year: "2026", kwh: 152 },
    { labelId: "Oktober 2026", labelEn: "October 2026", shortId: "Okt", shortEn: "Oct", year: "2026", kwh: 175 },
  ],
  previousMonthKwh: 152,
  source: "Tarif PLN Triwulan IV 2026 (ESDM, tidak naik)",
  sampleNote:
    "The customer, IDPEL, meter readings and payment record in this sample are illustrative; the tariff rules (ESDM Q4 2026) and the bill arithmetic are real.",
};

/** The data the templates render when no `data` prop is passed. */
export const defaultData = sampleData;
