# Migration Guide: CSV → CS445K Real Data

## 📋 Overview

This guide explains how to migrate from CSV test data to real production data from CS445K_Restaurant MongoDB database.

## ✅ What Was Done

### 1. Created New Connection Config

**File**: `server/config/connectCS445KDB.js`

-   Creates separate MongoDB connection to CS445K database
-   Uses `CS445K_MONGODB_URL` environment variable

### 2. Created CS445K Source Models

**Folder**: `server/models/cs445k-source/`

-   `user.source.model.js` - Read users from CS445K
-   `product.source.model.js` - Read products from CS445K
-   `order.source.model.js` - Read orders from CS445K

### 3. Created New Producers

-   `producer_user_cs445k.js` - Replaces CSV user producer
-   `producer_product_cs445k.js` - Replaces CSV product producer
-   `producer_order_cs445k.js` - Replaces CSV order producer

## 🔧 Setup Instructions

### Step 1: Add CS445K Connection String to .env

Add this line to `server/.env`:

```env
# CS445K Restaurant Production Database
CS445K_MONGODB_URL=mongodb+srv://your-username:your-password@cluster.mongodb.net/cs445k_restaurant_db
```

**Replace with your actual CS445K MongoDB connection string!**

### Step 2: Test Connection

```bash
cd server
node -e "import('./config/connectCS445KDB.js').then(() => console.log('✅ Connected!'))"
```

### Step 3: Run New Producers

**OLD WAY (CSV)**:

```bash
# ❌ Don't use these anymore
node producer_user.js
node producer_product.js
node producer_order.js
```

**NEW WAY (CS445K Real Data)**:

```bash
# ✅ Use these instead
node producer_user_cs445k.js
node producer_product_cs445k.js
node producer_order_cs445k.js
```

### Step 4: Run Full Pipeline

```bash
# Terminal 1: Consumer
node consumers/index.js

# Terminal 2: Producers
node producer_user_cs445k.js
node producer_product_cs445k.js
node producer_order_cs445k.js
node producer_wh_import.js  # Warehouse (unchanged)

# Terminal 3: Transform & Load
node scripts/transform_load.js
```

## 📊 Schema Mapping

### User Mapping

| CS445K Field | SE445AA Field | Notes             |
| ------------ | ------------- | ----------------- |
| `_id`        | `customer_id` | ObjectId → String |
| `name`       | `name`        | Direct copy       |
| `email`      | `email`       | Direct copy       |
| `mobile`     | `phone`       | Direct copy       |
| `status`     | `status`      | Direct copy       |
| `createdAt`  | `created_at`  | Date → ISO String |
| N/A          | `tier`        | Default: "BRONZE" |

### Product Mapping

| CS445K Field     | SE445AA Field     | Notes                        |
| ---------------- | ----------------- | ---------------------------- |
| `_id`            | `product_id`      | ObjectId → String            |
| `name`           | `name`            | Direct copy                  |
| `price`          | `price`           | Direct copy                  |
| `discount`       | `discount`        | Direct copy                  |
| `publish`        | `publish`         | Direct copy                  |
| `category`       | `category_ids`    | Array of ObjectIds → Strings |
| `subCategory[0]` | `sub_category_id` | First subCategory            |
| `createdAt`      | `created_at`      | Date → ISO String            |

### Order Mapping

| CS445K Field                | SE445AA Field    | Notes             |
| --------------------------- | ---------------- | ----------------- |
| `orderId`                   | `order_id`       | Direct copy       |
| `userId`                    | `customer_id`    | ObjectId → String |
| `product_details.productId` | `product_id`     | ObjectId → String |
| `product_details.name`      | `product_name`   | Direct copy       |
| `product_details.quantity`  | `quantity`       | Direct copy       |
| `product_details.price`     | `unit_price`     | Direct copy       |
| `subTotalAmt`               | `subtotal`       | Direct copy       |
| `totalAmt`                  | `total`          | Direct copy       |
| `payment_status`            | `payment_status` | Direct copy       |
| `createdAt`                 | `ordered_at`     | Date → ISO String |
| `updatedAt`                 | `completed_at`   | Date → ISO String |

## 🎯 Benefits

### Before (CSV):

-   ❌ Fake test data
-   ❌ Limited records (7 users, 6 products)
-   ❌ Manual data creation
-   ❌ Not realistic

### After (CS445K Real Data):

-   ✅ Real production data
-   ✅ Hundreds/thousands of records
-   ✅ Actual customer behavior
-   ✅ Realistic for demo

## 🔍 Verification

### Check Data Count

```javascript
// MongoDB Shell - CS445K DB
use cs445k_restaurant_db
db.users.countDocuments()
db.products.countDocuments()
db.orders.countDocuments()
```

### Check Staging After ETL

```javascript
// MongoDB Shell - SE445AA DB
use se445aa_restaurant_dev
db.staging_users.countDocuments()
db.staging_products.countDocuments()
db.staging_order_items.countDocuments()
```

Should match CS445K counts!

## 🐛 Troubleshooting

### Issue: Connection Error

**Error**: `CS445K_MONGODB_URL not found`
**Solution**: Add connection string to `.env` file

### Issue: No data in staging

**Solution**:

1. Check CS445K database has data
2. Verify connection string is correct
3. Check producer logs for errors

### Issue: Schema mismatch

**Solution**: Check CS445K schema hasn't changed. Update source models if needed.

## 📝 Files Changed

### New Files (7)

1. `server/config/connectCS445KDB.js`
2. `server/models/cs445k-source/user.source.model.js`
3. `server/models/cs445k-source/product.source.model.js`
4. `server/models/cs445k-source/order.source.model.js`
5. `server/producer_user_cs445k.js`
6. `server/producer_product_cs445k.js`
7. `server/producer_order_cs445k.js`

### Files to Keep (for reference)

-   `server/producer_user.js` (CSV - keep for backup)
-   `server/producer_product.js` (CSV - keep for backup)
-   `server/data/*.csv` (keep for reference)

### Files Unchanged

-   All validation, consumer, transform logic stays the same!
-   Data cleaning still works
-   Deduplication still works
-   Merge logic still works

## ✅ Success Criteria

-   [ ] CS445K connection string added to `.env`
-   [ ] New producers run without errors
-   [ ] Staging collections populated with CS445K data
-   [ ] Data cleaning applied to real data
-   [ ] DW has merged warehouse + CS445K data
-   [ ] Logs viewer shows real errors (if any)

**Migration complete = Real production data in your ETL system!** 🎉
