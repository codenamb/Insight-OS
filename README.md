# InsightOS

AI-Powered Business Intelligence Dashboard for Multi-Store Retail Operations.

## Overview

InsightOS is a comprehensive business intelligence platform that helps business owners analyze their POS and inventory data to identify problems, trends, inventory risks, underperforming stores, and growth opportunities. The system uses AI-powered analytics and visualizations to provide actionable insights.

## Features

- **CSV Data Upload**: Upload POS and inventory data in CSV format
- **Automated Analysis**: Detect business problems, inventory risks, and growth opportunities
- **Interactive Dashboard**: View key metrics, KPIs, and business overview
- **Data Visualization**: Charts for trends, store performance, and revenue distribution
- **Location Heatmap**: Geographic visualization of store performance
- **AI Business Assistant**: Chat interface powered by IBM Granite for:
  - Answering business questions
  - Explaining problem root causes
  - Predicting future issues
  - Providing actionable recommendations

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Maps**: Leaflet, React-Leaflet
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **AI**: IBM Granite (placeholder integration)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## CSV Data Format

### POS Data CSV
Required columns:
- `date`: Transaction date (YYYY-MM-DD)
- `storeId`: Unique store identifier
- `storeName`: Store name
- `productId`: Product identifier
- `productName`: Product name
- `quantity`: Quantity sold
- `revenue`: Revenue amount

Optional columns:
- `category`: Product category
- `latitude`: Store latitude for heatmap
- `longitude`: Store longitude for heatmap

### Inventory Data CSV
Required columns:
- `productId`: Product identifier
- `productName`: Product name
- `category`: Product category
- `currentStock`: Current stock quantity
- `reorderLevel`: Reorder threshold
- `unitCost`: Cost per unit

Optional columns:
- `supplier`: Supplier name
- `lastRestocked`: Last restock date

## Usage

1. **Upload Data**: Use the upload section to upload your POS and inventory CSV files
2. **View Dashboard**: Check the dashboard tab for an overview of your business metrics
3. **Analyze Charts**: View trends and performance comparisons in the Charts tab
4. **Explore Heatmap**: See store performance geographically in the Heatmap tab
5. **Ask AI**: Use the AI Assistant tab to ask questions about your business data

## AI Integration

The current implementation uses a simulated AI response system. To integrate IBM Granite:

1. Set up an IBM Cloud account and get access to the Granite API
2. Replace the `simulateGraniteResponse` function in `src/utils/aiService.ts` with actual API calls
3. Add your API credentials to environment variables

## Project Structure

```
src/
├── components/
│   ├── AIChat.tsx          # AI chat interface
│   ├── Charts.tsx          # Data visualization charts
│   ├── CSVUpload.tsx       # File upload component
│   ├── Dashboard.tsx       # Main dashboard
│   └── Heatmap.tsx         # Location heatmap
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   ├── aiService.ts        # AI integration
│   └── dataAnalysis.ts     # Business logic and analysis
├── App.tsx                 # Main application
└── index.css               # Global styles
```

## License

MIT
