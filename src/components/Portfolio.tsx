import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  loadNavDataFromUrl,
  computeReturns,
  generateBenchmarkData,
  type NavDatum,
  type ReturnsDataType,
} from "../data/portfolioData";
import EquityChart from "./Charts/EquityChart";
import DrawdownChart from "./Charts/DrawdownChart";
import "../styles/Portfolio.css";

// Clamp ISO date strings and ensure from <= to
function clampDateRange(
  fromISO: string,
  toISO: string,
  minISO: string,
  maxISO: string
) {
  let from = fromISO < minISO ? minISO : fromISO;
  let to = toISO > maxISO ? maxISO : toISO;
  if (from > to) from = to;
  return { from, to };
}

const Portfolio: React.FC = () => {
  const [nav, setNav] = useState<NavDatum[] | null>(null);
  const [returns, setReturns] = useState<ReturnsDataType | null>(null);

  // Date filters (initialized after data load)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const equityChartRef = useRef<any>(null);
  const drawdownChartRef = useRef<any>(null);

  const handleDownloadCharts = () => {
    // Download Equity Chart
    if (equityChartRef.current) {
      const url = equityChartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "equity_chart.png";
      link.click();
    }
    // Download Drawdown Chart
    if (drawdownChartRef.current) {
      const url = drawdownChartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "drawdown_chart.png";
      link.click();
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const navData = await loadNavDataFromUrl(
          "/Front-end-Assignment-Historical-NAV-Report.xlsx"
        );
        if (cancelled) return;
        if (!navData || navData.length === 0) {
          setNav([]);
          setReturns(null);
          return;
        }
        setNav(navData);
        setReturns(computeReturns(navData));
        const minISO = navData[0]["NAV Date"]; // FIXED: use first element
        const maxISO = navData[navData.length - 1]["NAV Date"]; // FIXED: use last element
        setFromDate(minISO);
        setToDate(maxISO);
      } catch (e) {
        console.error("Failed to load NAV XLSX", e);
        if (!cancelled) {
          setNav([]);
          setReturns(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { filteredNav, bench, filteredReturns, minISO, maxISO } =
    useMemo(() => {
      if (!nav || nav.length === 0) {
        return {
          filteredNav: [] as NavDatum[],
          bench: [] as { date: string; value: number }[],
          filteredReturns: null as ReturnsDataType | null,
          minISO: "",
          maxISO: "",
        };
      }
      const minISO = nav[0]["NAV Date"]; // FIXED: use first element
      const maxISO = nav[nav.length - 1]["NAV Date"]; // FIXED: use last element
      const hasBounds = !!fromDate && !!toDate;
      const { from, to } = hasBounds
        ? clampDateRange(fromDate, toDate, minISO, maxISO)
        : { from: minISO, to: maxISO };
      const filtered = nav.filter(
        (p) => p["NAV Date"] >= from && p["NAV Date"] <= to
      );
      const bench = generateBenchmarkData(filtered);
      const filteredReturns =
        filtered.length > 1 ? computeReturns(filtered) : returns;
      return { filteredNav: filtered, bench, filteredReturns, minISO, maxISO };
    }, [nav, returns, fromDate, toDate]);

  // Loading gate: requires nav and returns, and date bounds initialized
  if (!nav || !nav.length || !returns || !fromDate || !toDate) {
    return (
      <div className="page-content">
        <header className="page-header">
          <h1>Trailing Returns</h1>
          <button className="download-btn">↓</button>
        </header>
        <div className="loading">Loading data…</div>
      </div>
    );
  }

  const tableReturns = filteredReturns ?? returns;

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Trailing Returns</h1>
        <button className="download-btn" onClick={handleDownloadCharts}>↓</button>
      </header>

      {/* Trailing Returns Table */}
      <section className="returns-table-section">
        <div className="table-wrapper">
          <table className="returns-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>YTD</th>
                <th>1D</th>
                <th>1W</th>
                <th>1M</th>
                <th>3M</th>
                <th>6M</th>
                <th>1Y</th>
                <th>3Y</th>
                <th>SI</th>
                <th>DD</th>
                <th>MAXDD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fund-name">Focused</td>
                <td
                  className={
                    tableReturns!.Focused.YTD >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.Focused.YTD}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["1D"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused["1D"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["1W"] >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.Focused["1W"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["1M"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused["1M"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["3M"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused["3M"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["6M"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused["6M"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["1Y"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused["1Y"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused["3Y"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused["3Y"]}%
                </td>
                <td
                  className={
                    tableReturns!.Focused.SI >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused.SI}%
                </td>
                <td
                  className={
                    tableReturns!.Focused.DD >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.Focused.DD}%
                </td>
                <td
                  className={
                    tableReturns!.Focused.MAXDD >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.Focused.MAXDD}%
                </td>
              </tr>
              <tr>
                <td className="fund-name">NIFTY50</td>
                <td
                  className={
                    tableReturns!.NIFTY50.YTD >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50.YTD}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["1D"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50["1D"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["1W"] >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.NIFTY50["1W"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["1M"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50["1M"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["3M"] >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.NIFTY50["3M"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["6M"] >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.NIFTY50["6M"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["1Y"] >= 0 ? "positive" : "negative"
                  }
                  >
                  {tableReturns!.NIFTY50["1Y"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50["3Y"] >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50["3Y"]}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50.SI >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50.SI}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50.DD >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50.DD}%
                </td>
                <td
                  className={
                    tableReturns!.NIFTY50.MAXDD >= 0 ? "positive" : "negative"
                  }
                >
                  {tableReturns!.NIFTY50.MAXDD}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="returns-note">
          Note: Returns above 2 year are annualised
        </p>
      </section>

      {/* Equity Curve Section */}
      <section className="charts-section">
        <div className="chart-header">
          <h2>Equity curve</h2>
          <div className="chart-controls">
            <span className="live-indicator">Live since {minISO}</span>
            <span className="chart-link">🔗 Zerodha</span>
            <div className="date-controls">
              <div className="date-input">
                <label>From date</label>
                {minISO && maxISO ? (
                  <input
                    type="date"
                    value={fromDate || minISO}
                    min={minISO}
                    max={toDate || maxISO}
                    onChange={(e) => {
                      const v = e.target.value;
                      const { from } = clampDateRange(
                        v,
                        toDate || maxISO,
                        minISO,
                        maxISO
                      );
                      setFromDate(from);
                    }}
                  />
                ) : (
                  <input type="date" disabled />
                )}
              </div>
              <div className="date-input">
                <label>To date</label>
                {minISO && maxISO ? (
                  <input
                    type="date"
                    value={toDate || maxISO}
                    min={fromDate || minISO}
                    max={maxISO}
                    onChange={(e) => {
                      const v = e.target.value;
                      const { to } = clampDateRange(
                        fromDate || minISO,
                        v,
                        minISO,
                        maxISO
                      );
                      setToDate(to);
                    }}
                  />
                ) : (
                  <input type="date" disabled />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="charts-container">
          <EquityChart ref={equityChartRef} nav={filteredNav} benchmark={bench} />
          <DrawdownChart ref={drawdownChartRef} nav={filteredNav} />
        </div>
      </section>
    </div>
  );
};

export default Portfolio;

