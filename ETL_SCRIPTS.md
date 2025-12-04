# SE445AA Restaurant - ETL Pipeline Scripts

## 🚀 Quick Run ETL

### Option 1: Run Full Pipeline (Recommended)

**Windows:**

```bash
cd server
run_etl.bat
```

**Or using Node:**

```bash
cd server
node scripts/run_full_etl.js
```

This will automatically:

1. ✅ Extract users from CS445K
2. ✅ Extract products from CS445K
3. ✅ Extract orders from CS445K
4. ✅ Extract warehouse imports
5. ✅ Wait for consumer to process
6. ✅ Transform & Load to DW

**Prerequisites:**

-   ✅ Consumer must be running: `node consumers/index.js`
-   ✅ MongoDB running
-   ✅ RabbitMQ running

---

### Option 2: Run Individual Steps

If you need more control:

```bash
# Step 1: Extract (Producers)
node producer_user_cs445k.js
node producer_product_cs445k.js
node producer_order_cs445k.js
node producer_wh_import.js

# Step 2: Consumer processes automatically (if running)

# Step 3: Transform & Load
node scripts/transform_load.js
```

---

## 📊 Verification

After running ETL, verify data:

```javascript
// MongoDB Shell
use se445aa_restaurant_dev

// Check staging
db.staging_users.countDocuments()
db.staging_products.countDocuments()
db.staging_order_items.countDocuments()
db.staging_wh_imports.countDocuments()

// Check DW
db.dim_customer.countDocuments()
db.dim_menu_item.countDocuments()
db.fact_order_item.countDocuments()

// Check errors
db.staging_errors.countDocuments()
```

---

## 🔄 Update Data from CS445K

When CS445K has new data:

```bash
# Quick update - run full pipeline
run_etl.bat

# Or run specific producer
node producer_user_cs445k.js      # If only users changed
node producer_product_cs445k.js   # If only products changed
node producer_order_cs445k.js     # If only orders changed
```

---

## 🐛 Troubleshooting

### Issue: "Consumer not running"

**Solution:** Start consumer first:

```bash
# Terminal 1
node consumers/index.js
```

### Issue: "Connection failed"

**Solution:** Check services:

-   MongoDB: Check connection string in `.env`
-   RabbitMQ: Check `http://localhost:15672`

### Issue: "No data in DW"

**Solution:**

1. Check staging has data
2. Run transform: `node scripts/transform_load.js`

---

## ⏱️ Typical Runtime

-   Extract (Producers): ~10-20 seconds
-   Consumer processing: ~5-10 seconds
-   Transform & Load: ~5-10 seconds
-   **Total: ~20-40 seconds**

---

## 📝 Files

-   `run_etl.bat` - Windows batch script
-   `scripts/run_full_etl.js` - Node.js ETL runner
-   `producer_*_cs445k.js` - CS445K data extractors
-   `producer_wh_import.js` - Warehouse data extractor
-   `consumers/index.js` - Message consumer
-   `scripts/transform_load.js` - Transform & Load to DW
