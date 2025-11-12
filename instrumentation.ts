export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { seedDB } = await import('./app/data/seed')
    await seedDB();
  }
}
