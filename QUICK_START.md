# SE445AA_Restaurant - Quick Start Guide (CS445K Real Data)

## 🚀 Setup & Run Instructions

### Prerequisites

-   MongoDB running (SE445AA DB, CS445K DB, Warehouse DB)
-   RabbitMQ running
-   Node.js installed
-   **CS445K connection string configured** (see ENV_SETUP.md)

### Step-by-Step Execution

#### 1. Configure Environment Variables

**IMPORTANT**: Add CS445K connection string to `.env`:

```env
CS445K_MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/cs445k_restaurant_db
```

See [ENV_SETUP.md](ENV_SETUP.md) for details.

#### 2. Seed Warehouse Data (One-time)

```bash
cd server
node scripts/seed_warehouse.js
```

#### 3. Test Data Cleaning (Optional)

```bash
node scripts/test_data_cleaning.js
```

#### 4. Start Consumer (Keep running)

```bash
# Terminal 1
node consumers/index.js
```

#### 5. Run Producers (CS445K Real Data → RabbitMQ)

```bash
# Terminal 2
node producer_user_cs445k.js      # ← NEW: From CS445K DB
node producer_product_cs445k.js   # ← NEW: From CS445K DB
node producer_order_cs445k.js     # ← NEW: From CS445K DB
node producer_wh_import.js        # Warehouse (unchanged)
```

#### 6. Run Transform & Load (Staging → DW)

```bash
node scripts/transform_load.js
```

#### 7. View Logs (React Frontend)

```bash
# Terminal 3
cd ../client
npm run dev
```

**Then:**

1. Login to the system at `http://localhost:5173/login`
2. Navigate to: `http://localhost:5173/admin/reports`
3. Click on **"Logs"** tab to view error logs

---

## 🔍 Verification Checklist

### Check Staging Collections

```javascript
// MongoDB Shell
use se445aa_restaurant_dev

// Should have real CS445K users
db.staging_users.countDocuments()
// Expected: Same as CS445K users count

// Should have cleaned names from real data
db.staging_users.find().limit(5)

// Should have error records (if any invalid data in CS445K)
db.staging_errors.find({ error_type: 'VALIDATION_FAILED' })

// Should have warehouse data
db.staging_wh_imports.find({ import_id: 'IMP001' })
```

### Check DW Collections

```javascript
// Should have merged real data
db.dim_customer.countDocuments();
// Expected: Valid users from CS445K

db.dim_menu_item.find().limit(5);
// Expected: Products with warehouse data merged
// {
//   product_id: "...",
//   name: "...",
//   price: ...,
//   avg_import_cost: ...,      // ← From warehouse
//   warehouse_location: "..."  // ← From warehouse
// }
```

---

## 🎯 Key Demonstration Points

1. **Real Production Data**: Show actual CS445K users, products, orders
2. **Data Cleaning**: Real names cleaned and standardized
3. **Deduplication**: Duplicate CS445K records handled
4. **Error Handling**: Real validation errors from production data
5. **Schema Difference**: CS445K (production) vs Warehouse (inventory)
6. **Data Merge**: Real restaurant data + warehouse data in DW

---

## 📊 Expected Results

### Staging Users

-   Total: All valid users from CS445K
-   Cleaned: Names normalized, phones standardized
-   Errors: Any invalid emails/phones from CS445K

### Staging Products

-   Total: All valid products from CS445K
-   Cleaned: Product names cleaned
-   Errors: Any invalid prices from CS445K

### Staging Warehouse Imports

-   Total: 6 imports (IMP001-IMP006)
-   All with warehouse_location and product_name_raw

### DW Menu Items

-   Total: Valid products from CS445K
-   All merged with warehouse data (avg_import_cost, warehouse_location)

---

## 🐛 Troubleshooting

### Issue: CS445K connection error

**Solution**: Check `CS445K_MONGODB_URL` in `.env` file

### Issue: No data from CS445K

**Solution**:

1. Verify CS445K database has data
2. Check connection string is correct
3. Run: `node -e "import('./config/connectCS445KDB.js')"`

### Issue: Consumer not receiving messages

**Solution**: Check RabbitMQ is running: `http://localhost:15672`

### Issue: Cannot access logs page

**Solution**:

1. Make sure you're logged in
2. Use correct URL: `http://localhost:5173/admin/reports`
3. Click "Logs" tab

---

## 📝 Migration from CSV

If you were using CSV test data before, see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for:

-   Schema mapping details
-   Comparison of old vs new approach
-   Detailed migration steps

---

## ✅ Success Criteria

-   [ ] CS445K connection string configured
-   [ ] Warehouse data seeded (6 imports)
-   [ ] CS445K producers run successfully
-   [ ] Staging populated with real CS445K data
-   [ ] Data cleaning applied to real data
-   [ ] DW has merged CS445K + warehouse data
-   [ ] Logs viewer accessible at /admin/reports

**All criteria met = Real production data integration system!** 🎉
