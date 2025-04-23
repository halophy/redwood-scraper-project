// import { db } from 'src/lib/db'
import cron from 'node-cron'

import { scrapeBlogBySource } from './run'

// 每 10 分钟执行一次
cron.schedule('*/10 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running scheduled scraper...`)
  await scrapeBlogBySource('coinbase', 20)
})
