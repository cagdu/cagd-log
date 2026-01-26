# Scoped Logger Feature - Usage Guide

## What is Scoped Logging?

Scoped logging allows you to organize your logs by **category/module** (like "payment", "database", "security") while still using standard **severity levels** (info, warn, error, debug).

## Quick Comparison

### Traditional Way (v1.0.x)
```javascript
log.error("Payment failed");
// Creates: error.json
// Output: [ERROR] Payment failed
```

### New Scoped Way (v1.1.0+)
```javascript
const paymentLog = log.log("payment");
paymentLog.error("Payment failed");
// Creates: payment-error.json
// Output: [PAYMENT] [ERROR] Payment failed
```

## Usage Examples

### 1. Create Scoped Logger Variable

Best for modules that log frequently:

```javascript
const log = require("cagd-log");

// Create dedicated loggers for different modules
const paymentLog = log.log("payment");
const dbLog = log.log("database");
const securityLog = log.log("security");

// Use standard methods within each scope
paymentLog.info("Gateway initialized");
paymentLog.warn("High volume detected");
paymentLog.error("Transaction failed", { orderId: 123 });

dbLog.info("Connected");
dbLog.error("Connection timeout");

securityLog.warn("Failed login attempt");
```

**Generated files:**
- `payment-info.json`, `payment-warn.json`, `payment-error.json`
- `database-info.json`, `database-error.json`
- `security-warn.json`

### 2. One-Liner / Chained Calls

Best for occasional logging:

```javascript
log.log("api").info("Server started");
log.log("api").error("Route not found: /invalid");
log.log("cache").warn("Cache miss rate high");
```

**Generated files:**
- `api-info.json`, `api-error.json`
- `cache-warn.json`

### 3. Custom Levels Within Scopes

You can use custom levels inside scoped loggers:

```javascript
const apiLog = log.log("api");
apiLog.log("request", "GET /users");     // api-request.json
apiLog.log("response", "200 OK");        // api-response.json
```

### 4. Styling Scoped Categories

Add custom colors to your categories:

```javascript
log.setConfig({
    dev_mode: true,
    log: { path: "/logs/", type: "json" },
    types: {
        // Style categories
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",      // Green
        security: () => "\x1b[41m🔒 SECURITY\x1b[0m",   // Red bg
        database: () => "\x1b[36m🗄️  DATABASE\x1b[0m",  // Cyan
        
        // You can also style standard levels
        error: () => "\x1b[31m✗ ERROR\x1b[0m"
    }
});

const paymentLog = log.log("payment");
paymentLog.error("Failed");
// Console: [💳 PAYMENT] [✗ ERROR] Failed
```

## Benefits

✅ **Organization**: Logs grouped by feature/module  
✅ **Separate Files**: Each category-level combo gets its own file  
✅ **Easy Filtering**: JSON logs have `"category"` field  
✅ **Standard Levels**: Use familiar info/warn/error/debug  
✅ **Backward Compatible**: Old `log.error()` still works  
✅ **Custom Colors**: Style categories individually  

## File Naming

| Usage | File Name | JSON Category Field |
|-------|-----------|---------------------|
| `log.error("msg")` | `error.json` | *(none)* |
| `log.log("audit", "msg")` | `audit.json` | *(none)* |
| `log.log("payment").error("msg")` | `payment-error.json` | `"category": "payment"` |
| `log.log("api").log("request", "msg")` | `api-request.json` | `"category": "api"` |

## When to Use Which?

### Use Standard Logging
```javascript
log.info("Application started");
log.error("Fatal error");
```
**When:** General application-level logs

### Use Custom Levels
```javascript
log.log("audit", "User deleted account");
log.log("security", "Brute force detected");
```
**When:** You need a single custom category without multiple severity levels

### Use Scoped Logging
```javascript
const paymentLog = log.log("payment");
paymentLog.warn("High volume");
paymentLog.error("Transaction failed");
```
**When:** You have a module/feature with multiple severity levels

## Real-World Example

```javascript
const log = require("cagd-log");

// Configure
log.setConfig({
    dev_mode: true,
    log: { path: "/logs/", type: "json" },
    types: {
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",
        database: () => "\x1b[36m🗄️  DB\x1b[0m",
        api: () => "\x1b[33m🌐 API\x1b[0m"
    }
});

// In your payment module
const paymentLog = log.log("payment");
paymentLog.info("Processing payment", { amount: 99.99 });
paymentLog.warn("Retry attempt 2 of 3");
paymentLog.error("Payment gateway timeout", { gateway: "stripe" });

// In your database module
const dbLog = log.log("database");
dbLog.info("Connected to PostgreSQL");
dbLog.warn("Query slow: 2.5s", { query: "SELECT * FROM users" });
dbLog.error("Connection pool exhausted");

// In your API routes
log.log("api").info("GET /users - 200 OK");
log.log("api").error("POST /orders - 500 Internal Error");

// General app logs (no scope)
log.info("Application started on port 3000");
log.error("Unhandled exception", error);
```

**Result:**
```
logs/
├── payment-info.json     (1 entry)
├── payment-warn.json     (1 entry)
├── payment-error.json    (1 entry)
├── database-info.json    (1 entry)
├── database-warn.json    (1 entry)
├── database-error.json   (1 entry)
├── api-info.json         (1 entry)
├── api-error.json        (1 entry)
├── info.json             (1 entry - general app logs)
└── error.json            (1 entry - general app errors)
```

## TypeScript Support

Full TypeScript support with `ScopedLogger` interface:

```typescript
import log = require("cagd-log");

const paymentLog: ScopedLogger = log.log("payment");
paymentLog.error("Payment failed"); // ✓ Type-safe
```
