import { read, utils } from "xlsx";

// Types
export interface NavDatum {
  "NAV Date": string;
  "NAV (Rs)": number;
  Drawdown: number;
}
export interface ReturnsDatum {
  YTD: number;
  "1D": number;
  "1W": number;
  "1M": number;
  "3M": number;
  "6M": number;
  "1Y": number;
  "3Y": number;
  SI: number;
  DD: number;
  MAXDD: number;
}
export interface ReturnsDataType {
  Focused: ReturnsDatum;
  NIFTY50: ReturnsDatum;
}
export interface BenchmarkDatum {
  date: string;
  value: number;
}

// ---------- helpers ----------
function findHeaderIndex(rows: any[][]) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(String);
    // Match "NAV Date", "NAV DATE", "NAVDATE", etc.
    const hasNavDate = row.some((c: string) => /nav\s*date/i.test(c));
    // Match "NAV (Rs)", "NAV Rs", "NAV (Rs.)", "NAV(Rs)", etc.
    const hasNavRs = row.some((c: string) => /nav\s*\(?rs\.?\)?/i.test(c));
    if (hasNavDate && hasNavRs) return i;
  }
  return -1;
}

function normalizeDate(v: unknown): string | null {
  if (v instanceof Date) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // FIXED: template literal
  }
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-");
    return `${yyyy}-${mm}-${dd}`; // FIXED: template literal
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // FIXED: template literal
  }
  return null;
}

function computeDrawdowns(sorted: { date: string; nav: number }[]) {
  let runMax = -Infinity, currentDD = 0, maxDD = 0;
  const withDD: NavDatum[] = [];
  for (const r of sorted) {
    runMax = Math.max(runMax, r.nav);
    const dd = ((r.nav - runMax) / runMax) * 100;
    currentDD = dd;
    maxDD = Math.min(maxDD, dd);
    withDD.push({
      "NAV Date": r.date,
      "NAV (Rs)": r.nav,
      Drawdown: Number(dd.toFixed(2)),
    });
  }
  return {
    navWithDD: withDD,
    currentDD: Number(currentDD.toFixed(2)),
    maxDD: Number(maxDD.toFixed(2)),
  };
}

function dateIndexMap(dates: string[]) {
  const m = new Map<string, number>();
  dates.forEach((d, i) => m.set(d, i));
  return m;
}

function addDaysISO(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // FIXED: template literal
}

function monthsBetween(d1: string, d2: string) {
  const a = new Date(d1 + "T00:00:00Z");
  const b = new Date(d2 + "T00:00:00Z");
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
}

function yearsBetween(d1: string, d2: string) {
  return monthsBetween(d1, d2) / 12;
}

function findNearestOnOrBefore(
  indexByDate: Map<string, number>,
  dates: string[],
  targetISO: string
): number | null {
  if (indexByDate.has(targetISO)) return indexByDate.get(targetISO)!;
  let lo = 0, hi = dates.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (dates[mid] <= targetISO) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans >= 0 ? ans : null;
}

function simpleReturn(curr: number, prev: number) {
  return prev > 0 ? (curr / prev - 1) * 100 : 0;
}

function annualizedReturn(curr: number, base: number, years: number) {
  return base > 0 && years > 0 ? (Math.pow(curr / base, 1 / years) - 1) * 100 : 0;
}

function computeTrailingReturns(navSeries: NavDatum[]): ReturnsDatum {
  const dates = navSeries.map((d) => d["NAV Date"]);
  const navs = navSeries.map((d) => d["NAV (Rs)"]);
  const indexByDate = dateIndexMap(dates);
  const lastIdx = navSeries.length - 1;
  const lastDate = dates[lastIdx];
  const lastNav = navs[lastIdx];

  const idx1D = lastIdx > 0 ? lastIdx - 1 : lastIdx;
  const r1D = idx1D === lastIdx ? 0 : simpleReturn(lastNav, navs[idx1D]);

  const t1W = addDaysISO(lastDate, -7);
  const idx1W = findNearestOnOrBefore(indexByDate, dates, t1W);
  const r1W = idx1W === null ? 0 : simpleReturn(lastNav, navs[idx1W]);

  const monthBack = (m: number) => {
    const [y, mo, d] = lastDate.split("-").map(Number);
    const dt = new Date(Date.UTC(y, mo - 1 - m, d));
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // FIXED: template literal
  };

  const idx1M = findNearestOnOrBefore(indexByDate, dates, monthBack(1));
  const r1M = idx1M === null ? 0 : simpleReturn(lastNav, navs[idx1M]);

  const idx3M = findNearestOnOrBefore(indexByDate, dates, monthBack(3));
  const r3M = idx3M === null ? 0 : simpleReturn(lastNav, navs[idx3M]);

  const idx6M = findNearestOnOrBefore(indexByDate, dates, monthBack(6));
  const r6M = idx6M === null ? 0 : simpleReturn(lastNav, navs[idx6M]);

  const idx1Y = findNearestOnOrBefore(indexByDate, dates, monthBack(12));
  const r1Y = idx1Y === null ? 0 : simpleReturn(lastNav, navs[idx1Y]);

  const idx3Y = findNearestOnOrBefore(indexByDate, dates, monthBack(36));
  const r3Y =
    idx3Y === null
      ? 0
      : annualizedReturn(
          lastNav,
          navs[idx3Y],
          yearsBetween(dates[idx3Y], lastDate)
        );

  // FIXED: use first date and first nav (not arrays)
  const siYears = yearsBetween(dates[0], lastDate);
  const rSI = annualizedReturn(lastNav, navs[0], siYears);

  const year = lastDate.slice(0, 4);
  const firstSameYearIdx = dates.findIndex((d) => d.startsWith(year));
  const rYTD =
    firstSameYearIdx === -1 ? 0 : simpleReturn(lastNav, navs[firstSameYearIdx]);

  let runMax = -Infinity, currDD = 0, maxDDlocal = 0;
  for (const v of navs) {
    runMax = Math.max(runMax, v);
    const dd = ((v - runMax) / runMax) * 100;
    currDD = dd;
    maxDDlocal = Math.min(maxDDlocal, dd);
  }
  return {
    YTD: Number(rYTD.toFixed(2)),
    "1D": Number(r1D.toFixed(2)),
    "1W": Number(r1W.toFixed(2)),
    "1M": Number(r1M.toFixed(2)),
    "3M": Number(r3M.toFixed(2)),
    "6M": Number(r6M.toFixed(2)),
    "1Y": Number(r1Y.toFixed(2)),
    "3Y": Number(r3Y.toFixed(2)),
    SI: Number(rSI.toFixed(2)),
    DD: Number(currDD.toFixed(2)),
    MAXDD: Number(maxDDlocal.toFixed(2)),
  };
}

export async function loadNavDataFromUrl(
  xlsxUrl: string,
  minYear = 2019
): Promise<NavDatum[]> {
  const res = await fetch(xlsxUrl);
  if (!res.ok)
    throw new Error(`Fetch XLSX failed: ${res.status} ${res.statusText}`); // FIXED: template literal
  const ab = await res.arrayBuffer();
  const wb = read(ab, { type: "array", cellDates: true }); // parse workbook
  const ws = wb.Sheets[wb.SheetNames[0]]; // FIXED: first sheet
  const rows: any[][] = utils.sheet_to_json(ws, {
    header: 1,
    raw: true,
    defval: "",
  });

  const headerIdx = findHeaderIndex(rows);
  if (headerIdx === -1) throw new Error("Header row not found");
  const header = rows[headerIdx].map(String);
  const dateCol = header.findIndex((c: string) => /nav\s*date/i.test(c));
  const navCol = header.findIndex((c: string) => /nav\s*\(?rs\.?\)?/i.test(c));
  if (dateCol === -1 || navCol === -1)
    throw new Error('Could not map "NAV Date" or "NAV (Rs)"');

  const raw: { date: string; nav: number }[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const dateVal = normalizeDate(row[dateCol]);
    const navVal = Number(row[navCol]);
    if (!dateVal || !isFinite(navVal)) continue;
    raw.push({ date: dateVal, nav: navVal });
  }
  const filtered = raw
    .filter((r) => Number(r.date.slice(0, 4)) >= minYear)
    .sort((a, b) => a.date.localeCompare(b.date));
  const { navWithDD } = computeDrawdowns(filtered);
  return navWithDD;
}

export function generateBenchmarkData(
  nav: NavDatum[] | undefined | null,
  opts: { base?: number; sensitivity?: number; floor?: number } = {}
): BenchmarkDatum[] {
  const { base = 100, sensitivity = 0.4, floor = 50 } = opts;
  if (!Array.isArray(nav) || nav.length === 0) return [];
  const startNav = nav[0]["NAV (Rs)"]; // FIXED: first NAV
  return nav.map((item) => {
    const benchmarkValue = base + (item["NAV (Rs)"] - startNav) * sensitivity;
    return {
      date: item["NAV Date"],
      value: Math.max(floor, Number(benchmarkValue.toFixed(2))),
    };
  });
}

export function computeReturns(nav: NavDatum[]): ReturnsDataType {
  const Focused = computeTrailingReturns(nav);
  const niftySeries = generateBenchmarkData(nav);
  const NIFTY50 = computeTrailingReturns(
    niftySeries.map((b) => ({
      "NAV Date": b.date,
      "NAV (Rs)": b.value,
      Drawdown: 0,
    }))
  );
  return { Focused, NIFTY50 };
}