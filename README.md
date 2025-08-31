# Portfolio Management App

A modern React + TypeScript web application for tracking and visualizing portfolio performance, including trailing returns, drawdowns, and benchmark comparisons.

## Features

- **Trailing Returns Table:** View YTD, 1D, 1W, 1M, 3M, 6M, 1Y, 3Y, SI, DD, and MAXDD for Focused and NIFTY50 portfolios.
- **Interactive Charts:** Equity curve and drawdown charts with date filtering and download options.
- **Theme Support:** Light/dark mode toggle.
- **Navigation:** Sidebar for quick access to Home, Portfolios, Experimentals, Slack Archives, Refer a Friend, Gift a Subscription, and Account.
- **Latest Posts:** Display of recent blog posts.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```sh
npm install
```

### Running the App

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
portfolio-management-app/
  ├── public/
  │   └── Front-end-Assignment-Historical-NAV-Report.xlsx
  ├── src/
  │   ├── components/
  │   │   ├── Charts/
  │   │   │   ├── EquityChart.tsx
  │   │   │   └── DrawdownChart.tsx
  │   │   ├── Home.tsx
  │   │   ├── Portfolio.tsx
  │   │   └── Sidebar.tsx
  │   ├── data/
  │   │   ├── blogsData.json
  │   │   └── portfolioData.ts
  │   ├── styles/
  │   │   ├── App.css
  │   │   ├── Portfolio.css
  │   │   └── Sidebar.css
  │   ├── App.tsx
  │   └── main.tsx
  ├── package.json
  ├── tsconfig.json
  ├── vite.config.ts
  └── README.md
```

## Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- [xlsx](https://github.com/SheetJS/sheetjs) (for Excel file parsing)
- [React Router](https://reactrouter.com/)

## Customization

- **Excel Data:** Place your NAV Excel file in `public/` and update the fetch path in [`Portfolio.tsx`](src/components/Portfolio.tsx).
- **Blog Posts:** Edit [`blogsData.json`](src/data/blogsData.json) for latest posts.
- **Styling:** Modify CSS in [`App.css`](src/styles/App.css), [`Portfolio.css`](src/styles/Portfolio.css), and [`Sidebar.css`](src/styles/Sidebar.css).

## License

This project is for educational/demo purposes.

---

For questions or contributions, please open an issue or pull request on the [GitHub repository](https://github.com/yourusername/portfolio-management-app).
