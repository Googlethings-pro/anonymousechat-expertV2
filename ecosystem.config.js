/**
 * PM2 ECOSYSTEM CONFIG — Cluster Mode untuk VPS
 * ══════════════════════════════════════════════
 * Cara pakai di VPS (BUKAN di Replit):
 *
 *   1. Install PM2 global:
 *      npm install -g pm2
 *
 *   2. Pastikan Redis sudah berjalan:
 *      redis-server --daemonize yes
 *
 *   3. Set env REDIS_URL:
 *      export REDIS_URL=redis://127.0.0.1:6379
 *
 *   4. Jalankan bot dengan cluster:
 *      pm2 start ecosystem.config.js
 *
 *   5. Monitor:
 *      pm2 monit
 *      pm2 logs anonymous-chat-expert
 *
 *   6. Auto-start saat VPS reboot:
 *      pm2 startup
 *      pm2 save
 *
 */

module.exports = {
    apps: [{
        name: 'anonymous-chat-expert',
        script: './index.js',
        // PENTING: mode polling Telegram hanya boleh punya SATU consumer.
        // Kalau instances > 1 (cluster), tiap proses punya activeChats/antrean
        // sendiri, sehingga user bisa dapat 2x pesan SEARCHING, masuk 2 sesi,
        // atau "balik" ke sesi lama setelah /stop atau /next.
        instances: 1,
        exec_mode: 'fork',
        max_memory_restart: '512M',
        watch: false,
        ignore_watch: ['node_modules', 'logs', '*.log', 'data'],
        max_restarts: 10,
        min_uptime: '10s',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
        },
        env_development: {
            NODE_ENV: 'development',
            PORT: 3000,
        },

        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        kill_timeout: 5000,
        // wait_ready HARUS false: bot tidak memanggil process.send('ready'),
        // kalau true PM2 akan menunggu 8 detik lalu menganggap gagal & restart loop.
        wait_ready: false,
        listen_timeout: 8000,

        cron_restart: '0 4 * * *',
    }],
};
