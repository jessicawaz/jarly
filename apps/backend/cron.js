const cron = require('node-cron');

cron.schedule("0 9 1 * *", async () => {
  await fetch("https://jarly-production.up.railway.app/api/v1/monthly-recap", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  });
});
