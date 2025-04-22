import cron from 'node-cron'

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

async function scrapeCoinbaseBlog() {
  try {
    const links = await scrapeBlog(config, null, 100, showMoreCoinbase)
    console.log(`[${new Date().toISOString()}] Scraped blog links:`, links)
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error scraping Coinbase Blog:`,
      err
    )
  }
}

// 每 10 分钟执行一次
cron.schedule('*/10 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running scheduled scraper...`)
  await scrapeCoinbaseBlog()
})

// 启动脚本时先跑一次
scrapeCoinbaseBlog()
