# Phase 2: Analytics Dashboard - Setup Guide

## ✅ Completed

### Backend (Phase 2.1)

-   [x] Created `server/controllers/analytics.controller.js` with 8 endpoints
-   [x] Created `server/routes/analytics.route.js`
-   [x] Registered analytics routes in `server/index.js`

### Frontend (Phase 2.2)

-   [x] Created `client/src/pages/AnalyticsTab.jsx`
-   [x] Created `client/src/common/analytics_api.js`
-   [x] Integrated Analytics tab into `EtlMonitorPage.tsx`

---

## 🚀 Setup Instructions

### 1. Install Frontend Dependencies

```bash
cd client
npm install recharts
```

### 2. Start Backend Server

```bash
cd server
node index.js
```

### 3. Start Frontend

```bash
cd client
npm run dev
```

### 4. Access Dashboard

Navigate to: `http://localhost:5173/admin/reports`

Click on **"Analytics"** tab

---

## 📊 Features

### Analytics Tab Includes:

#### Summary Cards

-   **Products Analyzed**: Count of products with warehouse cost data
-   **Profit Margin**: Average profit margin percentage
-   **Data Quality**: Overall data quality score
-   **Integration Rate**: Percentage of products with warehouse data

#### Charts

1. **Profit Margin Bar Chart**: Top 5 products by profit margin
2. **Integration Status Pie Chart**: Products with vs without warehouse data

#### Metrics

-   **Data Quality Metrics**: Total records, errors, error rate, cleaned records
-   **Integration Statistics**: DW record counts (customers, menu items, orders)

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api/analytics`

### Profit Analytics

-   `GET /profit/summary` - Overall profit summary
-   `GET /profit/margins` - Profit margins for all products
-   `GET /profit/top-products?limit=10` - Highest margin products
-   `GET /profit/low-margin?limit=10` - Lowest margin products
-   `GET /profit/roi` - ROI analysis
-   `GET /profit/by-category` - Profit by category

### Integration & Quality

-   `GET /integration/status` - Data integration status
-   `GET /quality/metrics` - Data quality metrics

---

## 🎨 UI Components

### AnalyticsTab.jsx Structure

```
AnalyticsTab
├── Summary Cards (4 cards)
│   ├── Products Analyzed
│   ├── Profit Margin
│   ├── Data Quality
│   └── Integration Rate
├── Charts Row
│   ├── Profit Margin Bar Chart
│   └── Integration Status Pie Chart
├── Data Quality Details Card
└── Integration Statistics Card
```

---

## 🧪 Testing

### 1. Test API Endpoints

```bash
# Test profit summary
curl http://localhost:8080/api/analytics/profit/summary

# Test top products
curl http://localhost:8080/api/analytics/profit/top-products?limit=5

# Test integration status
curl http://localhost:8080/api/analytics/integration/status
```

### 2. Test Frontend

1. Open `http://localhost:5173/admin/reports`
2. Click "Analytics" tab
3. Verify:
    - ✅ Summary cards show correct numbers
    - ✅ Profit margin chart displays top 5 products
    - ✅ Integration pie chart shows distribution
    - ✅ Data quality metrics display
    - ✅ No console errors

---

## 📈 Expected Results

With current data (5 products with warehouse cost):

### Summary Cards

-   Products Analyzed: **5**
-   Profit Margin: **~53-54%**
-   Data Quality: **~95-100%**
-   Integration Rate: **~55%** (5/9 products)

### Top Products Chart

1. Com Tam: 55.56%
2. Bun Cha: 55.00%
3. Cafe Sua: 52.00%
4. Tra Sua: ~50%
5. Pho Bo: ~48%

---

## 🐛 Troubleshooting

### Issue: Charts not displaying

**Solution**: Install recharts

```bash
cd client
npm install recharts
```

### Issue: API returns 404

**Solution**: Verify server is running and routes are registered

```bash
# Check server logs
# Verify /api/analytics routes are loaded
```

### Issue: No data in charts

**Solution**: Run ETL pipeline first

```bash
cd server
run_etl.bat
```

---

## 🎯 Next Steps (Phase 2.3)

-   [ ] Add data quality trend charts
-   [ ] Add error breakdown visualization
-   [ ] Add real-time refresh for analytics
-   [ ] Export analytics to PDF/Excel

---

## ✅ Phase 2 Status

**Phase 2.1**: ✅ Complete (API Endpoints)
**Phase 2.2**: ✅ Complete (Dashboard UI)
**Phase 2.3**: ⏳ Pending (Data Quality Enhancements)

**Total Time**: ~2-3 hours
**Ready for Demo**: ✅ YES
