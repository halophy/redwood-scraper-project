import 'dotenv/config'
// import { db } from 'src/lib/db'
// import cron from 'node-cron'

import scrapeBlog from './scraper'
import config from './sites/coinbase.config'

async function showMoreCoinbase(page) {
  // 处理点击“Show More”按钮
  // const showMoreButton = await page.$x(
  //   "//button[.//span[contains(text(), 'Show more')]]"
  // )
  await page.evaluate(() => {
    const xpath = "//button[.//span[contains(text(), 'Show more')]]"
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    )
    const button = result.singleNodeValue as HTMLElement | null
    if (button) {
      button.click()
    } else {
      console.log('No more "Show more" button found.')
    }
  })
}

export async function scrapeCoinbaseBlog(limit: number) {
  let blogLinks = []
  try {
    blogLinks = await scrapeBlog(config, null, limit, showMoreCoinbase)
    // for (const url of blogLinks) {
    //   await db.blogPost.upsert({
    //     where: { url },
    //     update: {},
    //     create: { url },
    //   })
    // }
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error scraping Coinbase Blog:`,
      err
    )
  }
  return blogLinks
}

// // 每 10 分钟执行一次
// cron.schedule('*/10 * * * *', async () => {
//   console.log(`[${new Date().toISOString()}] Running scheduled scraper...`)
//   await scrapeCoinbaseBlog(20)
// })

// // 启动脚本时先跑一次
// scrapeCoinbaseBlog(20)
