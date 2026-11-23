
const { createClient } = require("redis");

const client = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

client.on("error", (err) => {
    console.error("[REDIS] Connection error:", err.message);
});

async function main() {
    try {
        await client.connect();

        const response = await client.ping();

        console.log("[SYSTEM] Redis berhasil terhubung.");
        console.log(`[SYSTEM] Redis status: ${response}`);
        console.log("[SYSTEM] Redis server: ONLINE");
    } catch (error) {
        console.error("[SYSTEM] Redis gagal terhubung:", error.message);
        process.exitCode = 1;
    } finally {
        if (client.isOpen) {
            await client.quit();
        }
    }
}

main();
