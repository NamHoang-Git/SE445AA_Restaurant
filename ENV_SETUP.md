# ⚠️ IMPORTANT: Add CS445K Connection String

Before running the new producers, you MUST add the CS445K database connection string to your `.env` file:

```env
# SE445AA Database (Staging & DW)
MONGODB_URL=your-se445aa-connection-string

# CS445K Restaurant Database (Production Data Source)
CS445K_MONGODB_URL=your-cs445k-connection-string

# Warehouse Database
MONGODB_WAREHOUSE_URL=your-warehouse-connection-string

# RabbitMQ
RABBITMQ_URL=amqp://localhost
```

## How to get CS445K connection string:

1. Open CS445K_Restaurant project
2. Check `CS445K_Restaurant/server/.env`
3. Copy the `MONGODB_URL` value
4. Paste it as `CS445K_MONGODB_URL` in SE445AA `.env`

Example:

```env
CS445K_MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/cs445k_restaurant_db
```

**Without this, the new producers will fail!**
