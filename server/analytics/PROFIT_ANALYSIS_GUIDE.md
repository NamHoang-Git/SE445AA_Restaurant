# Profit Analysis - Usage Guide

## 📊 Overview

The Profit Analysis module demonstrates the **business value** of data integration by calculating profit margins from merged restaurant and warehouse data.

## 🎯 Key Metrics

### 1. Profit Margin

```
Profit Margin % = ((Selling Price - Import Cost) / Selling Price) × 100
```

### 2. ROI (Return on Investment)

```
ROI % = ((Revenue - Cost) / Cost) × 100
```

### 3. Profit Per Unit

```
Profit Per Unit = Selling Price - Import Cost
```

---

## 🚀 How to Run

### Run Full Analysis

```bash
cd server
node analytics/profit_analysis.js
```

### Expected Output

```
📊 Running Profit Analysis...

════════════════════════════════════════════════════════════
1. PROFIT SUMMARY
════════════════════════════════════════════════════════════
Total Revenue:     1,234,567 VND
Total Cost:        567,890 VND
Total Profit:      666,677 VND
Profit Margin:     54.02%
ROI:               117.38%
Total Orders:      34
Avg Profit/Order:  19,608 VND

════════════════════════════════════════════════════════════
2. TOP 5 HIGHEST MARGIN PRODUCTS
════════════════════════════════════════════════════════════
1. Cafe Sua
   Price: 25,000 VND | Cost: 12,000 VND
   Margin: 52.00%

...
```

---

## 📝 Available Functions

### 1. `getProfitMarginByProduct()`

Returns profit margin for each product with warehouse data.

**Use Case**: Identify which products are most/least profitable

**Sample Code**:

```javascript
import { getProfitMarginByProduct } from './analytics/profit_analysis.js';

const margins = await getProfitMarginByProduct();
console.log(margins);
```

---

### 2. `getTotalProfitByCategory()`

Aggregates profit across product categories.

**Use Case**: Understand which categories drive profit

**Sample Code**:

```javascript
import { getTotalProfitByCategory } from './analytics/profit_analysis.js';

const categoryProfit = await getTotalProfitByCategory();
console.log(categoryProfit);
```

---

### 3. `getROIAnalysis()`

Calculates ROI for each product based on actual sales.

**Use Case**: Identify best-performing products by ROI

**Sample Code**:

```javascript
import { getROIAnalysis } from './analytics/profit_analysis.js';

const roi = await getROIAnalysis();
console.log(roi);
```

---

### 4. `getHighestMarginProducts(limit)`

Returns products with highest profit margins.

**Use Case**: Focus on high-margin products for promotion

**Sample Code**:

```javascript
import { getHighestMarginProducts } from './analytics/profit_analysis.js';

const topProducts = await getHighestMarginProducts(10);
console.log(topProducts);
```

---

### 5. `getLowestMarginProducts(limit)`

Returns products with lowest profit margins.

**Use Case**: Identify products to reprice or discontinue

**Sample Code**:

```javascript
import { getLowestMarginProducts } from './analytics/profit_analysis.js';

const lowMargin = await getLowestMarginProducts(10);
console.log(lowMargin);
```

---

### 6. `getProfitSummary()`

Overall profit metrics for dashboard.

**Use Case**: High-level KPIs for management

**Sample Code**:

```javascript
import { getProfitSummary } from './analytics/profit_analysis.js';

const summary = await getProfitSummary();
console.log(summary);
```

---

## 🎓 Demo Talking Points

When presenting to instructor, emphasize:

### 1. **Data Integration Value** ⭐

> "By integrating restaurant sales data with warehouse import costs, we can calculate actual profit margins. This was impossible before integration because the data was in separate systems."

### 2. **Business Insights**

> "We can now identify which products are most profitable, not just which sell the most. For example, Product A might have high sales but low margins, while Product B has lower sales but much higher profitability."

### 3. **Decision Support**

> "Management can use this to:
>
> - Price products optimally
> - Focus marketing on high-margin items
> - Discontinue low-margin products
> - Negotiate better supplier prices"

### 4. **ROI Calculation**

> "We can calculate actual ROI by comparing revenue to import costs. This shows the true return on inventory investment."

---

## 📊 Sample Queries for Demo

### Query 1: Show Merged Data

```javascript
// Show product with both restaurant and warehouse data
db.dim_menu_item.findOne({ avg_import_cost: { $ne: null } });
```

**Expected**:

```json
{
    "product_id": "691f5e99e100f9644c70b7a4",
    "name": "Cafe Sua",
    "price": 25000, // From restaurant
    "avg_import_cost": 12000, // From warehouse ← KEY!
    "warehouse_location": "WH-A" // From warehouse ← KEY!
}
```

### Query 2: Calculate Profit

```javascript
// Manual calculation to show the logic
const product = await DimMenuItem.findOne({
    product_id: '691f5e99e100f9644c70b7a4',
});

const profitPerUnit = product.price - product.avg_import_cost;
const profitMargin = (profitPerUnit / product.price) * 100;

console.log(`Profit per unit: ${profitPerUnit} VND`);
console.log(`Profit margin: ${profitMargin.toFixed(2)}%`);
```

---

## ✅ Success Criteria

After running profit analysis, you should see:

- [ ] Overall profit summary with realistic numbers
- [ ] Top 5 highest margin products identified
- [ ] Top 5 lowest margin products identified
- [ ] ROI analysis showing return on investment
- [ ] All calculations based on merged data (price + cost)

---

## 🐛 Troubleshooting

### Issue: No results returned

**Cause**: No products have warehouse cost data
**Solution**:

1. Check `dim_menu_item` has `avg_import_cost` populated
2. Run ETL pipeline: `run_etl.bat`
3. Verify warehouse data: `db.staging_wh_imports.countDocuments()`

### Issue: Profit margins seem wrong

**Cause**: Price or cost data incorrect
**Solution**:

1. Check sample product manually
2. Verify warehouse import costs are reasonable
3. Check product mapping is correct

---

## 📈 Next Steps

After Phase 1.3 completion:

1. ✅ Create API endpoint for profit summary
2. ✅ Display profit metrics in dashboard
3. ✅ Add profit charts/visualizations
4. ✅ Include in demo presentation

---

**Phase 1.3 Complete!** 🎉

Ready for Phase 2: Dashboard Integration
