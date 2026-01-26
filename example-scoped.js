/**
 * Example: Scoped/Namespaced Logger Usage
 * 
 * This demonstrates using logger.log("category") to create
 * a scoped logger that can use standard methods like warn, error, info, debug
 */

const logger = require("./index.js");

console.log("\n=== Setup Configuration ===\n");
logger.setConfig({
    dev_mode: true,
    log: {
        path: "/scoped-logs/",
        type: "json",
        merge: false
    },
    time: {
        locales: "tr-TR",
        zone: "Europe/Istanbul"
    },
    types: {
        info: () => "\x1b[32m✓ INFO\x1b[0m",
        warn: () => "\x1b[33m⚠ WARN\x1b[0m",
        error: () => "\x1b[31m✗ ERROR\x1b[0m",
        debug: () => "\x1b[34m🔧 DEBUG\x1b[0m",
        
        // Custom category colors
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",
        security: () => "\x1b[41m🔒 SECURITY\x1b[0m",
        database: () => "\x1b[36m🗄️  DATABASE\x1b[0m"
    }
});

console.log("\n=== Method 1: Create scoped logger variable ===\n");

const paymentLog = logger.log("payment");
paymentLog.info("Payment gateway initialized");
paymentLog.warn("High transaction volume detected");
paymentLog.error("Payment processing failed", { transactionId: "TXN-123", amount: 99.99 });
paymentLog.debug("Payment request details", { method: "credit_card", currency: "USD" });

console.log("\n=== Method 2: Chain directly (one-liner) ===\n");

logger.log("security").warn("Multiple failed login attempts");
logger.log("security").error("Potential security breach detected!", { ip: "192.168.1.100" });
logger.log("security").info("Security scan completed");

console.log("\n=== Method 3: Multiple categories ===\n");

const dbLog = logger.log("database");
dbLog.info("Connected to database");
dbLog.warn("Query took longer than expected", { duration: "2.5s" });
dbLog.error("Connection pool exhausted");

console.log("\n=== Method 4: Custom level with scope ===\n");

const apiLog = logger.log("api");
apiLog.log("request", "GET /users endpoint called");  // Custom level "request" within "api" scope
apiLog.log("response", "Response sent successfully");  // Custom level "response" within "api" scope

console.log("\n=== Traditional usage still works ===\n");

logger.info("This is standard info without scope");
logger.warn("This is standard warn without scope");
logger.error("This is standard error without scope");
logger.log("audit", "This is custom level without scope");  // 2 params = custom level, not scoped

console.log("\n✅ Check the '/scoped-logs/' directory:");
console.log("   Scoped logs: payment-info.json, payment-warn.json, payment-error.json, payment-debug.json");
console.log("   Scoped logs: security-warn.json, security-error.json, security-info.json");
console.log("   Scoped logs: database-info.json, database-warn.json, database-error.json");
console.log("   Scoped logs: api-request.json, api-response.json");
console.log("   Standard logs: info.json, warn.json, error.json, audit.json");
