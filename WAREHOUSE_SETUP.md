# Warehouse Management - Setup & Usage Guide

## ✅ Implementation Complete!

Warehouse management UI is now live! No more hardcoded data!

---

## 🚀 Quick Start

### 1. Migrate Existing Data

```bash
cd server
node scripts/migrate_warehouse_data.js
```

**This will:**

-   Copy data from `staging_wh_imports` → `warehouse_imports`
-   You can now manage via UI

---

### 2. Access Warehouse UI

```
URL: http://localhost:5173/admin/warehouse
```

**Features:**

-   ✅ View all warehouse imports
-   ✅ Add new imports
-   ✅ Edit existing imports
-   ✅ Delete imports
-   ✅ No more hardcode!

---

### 3. Run ETL

```bash
cd server
run_etl_v2.bat
```

**Producer will now:**

-   Read from `warehouse_imports` collection (not hardcoded!)
-   Pull real data from UI-managed warehouse

---

## 📊 How It Works

### Before (Hardcoded):

```javascript
// seed_cs445k_warehouse.js
const data = [
    { product_id: "RICE01", cost: 35000 }, // ← HARDCODE
];
await StagingWhImport.insertMany(data);
```

### After (UI-Managed):

```
1. Open http://localhost:5173/admin/warehouse
2. Click "New Import"
3. Fill form:
   - Product ID: RICE01
   - Product Name: Rice New
   - Quantity: 200
   - Unit Cost: 35000
   - Supplier: Rice Supplier A
4. Click "Create"
5. Data saved to warehouse_imports
6. ETL reads from warehouse_imports
7. Analytics uses real data!
```

---

## 🎯 UI Features

### Warehouse Imports Page

**Table View:**

-   Product ID
-   Product Name
-   Quantity
-   Unit Cost
-   Total Cost (auto-calculated)
-   Supplier
-   Import Date
-   Actions (Edit/Delete)

**Form:**

-   Product ID (required)
-   Product Name (required)
-   Quantity (required)
-   Unit Cost (required)
-   Supplier (optional)
-   Warehouse Location (dropdown)
-   Notes (optional)

**Actions:**

-   ✅ Add new import
-   ✅ Edit existing import
-   ✅ Delete import
-   ✅ Auto-calculate total cost

---

## 🔄 Data Flow

```
┌──────────────────────────────────────┐
│  Warehouse UI                        │
│  /admin/warehouse                    │
│  - Add/Edit/Delete imports           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  warehouse_imports Collection        │
│  - Real data from UI                 │
│  - No hardcode!                      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  producer_wh_import_v2.js            │
│  - Read from warehouse_imports       │
│  - Publish to queue                  │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  ETL Pipeline                        │
│  - Transform & Load                  │
│  - Merge with CS445K data            │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Analytics Dashboard                 │
│  - Profit analysis with real costs   │
└──────────────────────────────────────┘
```

---

## 🎓 Demo Script

### Show Warehouse Management:

**Step 1: Show UI**

```
Open: http://localhost:5173/admin/warehouse
```

> "Đây là warehouse management UI. Em có thể quản lý warehouse imports qua UI này thay vì hardcode."

**Step 2: Add New Import**

```
Click "New Import"
Fill form:
  - Product ID: TEST01
  - Product Name: Test Product
  - Quantity: 100
  - Unit Cost: 50000
Click "Create"
```

> "Warehouse staff có thể nhập kho mới trực tiếp qua UI. Data sẽ được save vào database."

**Step 3: Show in Table**

```
New import appears in table
Total cost auto-calculated: 5,000,000 VND
```

> "Total cost được tính tự động. Data này sẽ được ETL pipeline sử dụng để tính profit."

**Step 4: Run ETL**

```
cd server
run_etl_v2.bat
```

> "ETL giờ pull data từ warehouse_imports collection - không còn hardcode nữa!"

---

## ✅ Benefits

### Before:

-   ❌ Hardcoded data in seed scripts
-   ❌ Need to edit code to change data
-   ❌ Not realistic for demo

### After:

-   ✅ UI-managed data
-   ✅ Add/edit/delete via web interface
-   ✅ Realistic warehouse system
-   ✅ No code changes needed
-   ✅ Production-ready approach

---

## 🎯 API Endpoints

All endpoints under `/api/warehouse`:

```
GET    /api/warehouse/imports       - List all imports
POST   /api/warehouse/imports       - Create new import
GET    /api/warehouse/imports/:id   - Get single import
PUT    /api/warehouse/imports/:id   - Update import
DELETE /api/warehouse/imports/:id   - Delete import
GET    /api/warehouse/summary       - Get summary stats
```

---

## 📝 Testing Checklist

-   [ ] Run migration: `node scripts/migrate_warehouse_data.js`
-   [ ] Access UI: http://localhost:5173/admin/warehouse
-   [ ] Verify existing data shows in table
-   [ ] Add new import via form
-   [ ] Edit existing import
-   [ ] Delete import
-   [ ] Run ETL: `run_etl_v2.bat`
-   [ ] Verify analytics dashboard shows correct data

---

## 🎉 Success!

**You now have:**

-   ✅ Full warehouse management UI
-   ✅ CRUD operations for imports
-   ✅ No more hardcoded data
-   ✅ Production-ready warehouse system
-   ✅ Integration with ETL pipeline

**Demo ready!** 🚀
