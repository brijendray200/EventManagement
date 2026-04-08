module.exports = {
  apps: [
    {
      name: "eventsphere-frontend",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 5173",
      cwd: "C:/Users/brije/OneDrive/Documents/EventManagement",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "eventsphere-backend",
      script: "npm",
      args: "run start",
      cwd: "C:/Users/brije/OneDrive/Documents/EventManagement/server",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
