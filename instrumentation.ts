export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await require('pino');
    await require('next-logger');

    const { seedDB } = await import("./app/data/seed");
    const { getInstanceNumber } = await import("./app/utils/get-instance-number");

    await seedDB();

    if (getInstanceNumber() === 0) {
      const cron = await import("node-cron");
      const { backgroundProcessor } = await import("./app/background-processor");
      const { CRON_SCHEDULE } = await import("./app/constants");

      console.log(`Instance 0 - Setting up background job to run ${CRON_SCHEDULE}!`);
      cron.schedule(CRON_SCHEDULE, backgroundProcessor);
    }
  }
}
