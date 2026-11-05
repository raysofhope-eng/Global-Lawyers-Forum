module.exports = {
  apps: [
    {
      name: "globallawyersforum",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      kill_timeout: 10000,
      listen_timeout: 10000,
      env: {
        NODE_ENV: "production",
        PORT: 3005,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
