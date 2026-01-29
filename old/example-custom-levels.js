/**
 * Example: Using Custom Log Levels with cagd-log
 * 
 * This example demonstrates:
 * 1. Default config notification on first use
 * 2. Configuring custom log levels with styling
 * 3. Using both standard and custom levels
 */

const log = require("./index.js");

console.log("\n=== Step 1: Using default config (shows notification) ===\n");
log.info("This is an info message with default config");

console.log("\n=== Step 2: Configure custom levels ===\n");
log.setConfig({
    dev_mode: true,
    log: {
        path: "/example-logs/",
        type: "json",
        merge: false
    },
    time: {
        locales: "tr-TR",
        zone: "Europe/Istanbul"
    },
    types: {
        // Standard levels (overriding defaults)
        info: () => "\x1b[32m✓ INFO\x1b[0m",
        warn: () => "\x1b[33m⚠ WARN\x1b[0m",
        error: () => "\x1b[31m✗ ERROR\x1b[0m",
        debug: () => "\x1b[34m🔧 DEBUG\x1b[0m",
        
        // Custom levels with unique styling
        audit: () => "\x1b[35m🔍 AUDIT\x1b[0m",          // Magenta
        security: () => "\x1b[41m🔒 SECURITY\x1b[0m",    // Red background
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",      // Green
        critical: () => "\x1b[31m\x1b[1m⚠️  CRITICAL\x1b[0m", // Bold red
        success: () => "\x1b[42m\x1b[30m✔ SUCCESS\x1b[0m"  // Green background, black text
    }
});

console.log("\n=== Step 3: Using standard levels ===\n");
log.info("Server started on port 3000");
log.warn("Memory usage at 80%");
log.error("Database connection timeout");
log.debug("Request received", { method: "GET", path: "/api/users" });

console.log("\n=== Step 4: Using custom levels ===\n");
log.log("audit", "User profile updated", { userId: 123, field: "email" });
log.log("security", "Failed login attempt detected", { ip: "192.168.1.100", attempts: 5 });
log.log("payment", "Transaction completed", { amount: 150.50, currency: "USD", transactionId: "TXN-123" });
log.log("critical", "Database connection pool exhausted!");
log.log("success", "Backup completed successfully", { size: "2.3GB", duration: "45s" });

console.log("\n=== Step 5: Testing undefined custom level (fallback styling) ===\n");
log.log("custom_level_xyz", "This level has no custom formatter, will use default white styling");

console.log("\n✅ Check the '/example-logs/' directory for generated log files:");
console.log("   - audit.json, security.json, payment.json, critical.json, success.json, custom_level_xyz.json");
console.log("   - info.json, warn.json, error.json, debug.json");
