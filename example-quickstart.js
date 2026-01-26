/**
 * Quick Start Example - All Features
 */

const log = require("./index.js");

// Configure once
log.setConfig({
    dev_mode: true,
    log: { path: "/logs/", type: "json" },
    types: {
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",
        security: () => "\x1b[41m🔒 SECURITY\x1b[0m"
    }
});

// 1. Standard levels (global)
log.info("Application started");
log.error("Something went wrong");

// 2. Custom levels (global)
log.log("audit", "User logged in");

// 3. Scoped loggers (organized by category)
const paymentLog = log.log("payment");
paymentLog.warn("High transaction volume");
paymentLog.error("Payment failed", { orderId: 123 });

// 4. One-liner scoped logs
log.log("security").error("Brute force detected", { ip: "192.168.1.1" });

console.log("\n✅ Generated files:");
console.log("  - logs/info.json, logs/error.json");
console.log("  - logs/audit.json");
console.log("  - logs/payment-warn.json, logs/payment-error.json");
console.log("  - logs/security-error.json");
