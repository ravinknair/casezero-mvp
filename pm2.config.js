module.exports = {
  apps: [
    {
      name: "casezero-dashboard",
      script: "npm",
      args: "run start -- --host 0.0.0.0",
      cwd: __dirname,
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
