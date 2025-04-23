import 'dotenv/config'

import scrapeBlogWithConfig from './scraper'
import coinbase from './sites/coinbase.config'
import { IBlog } from './type'

const configs: IBlog[] = [coinbase]

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

export async function scrapeBlogBySource(source: string, limit: number) {
  let blogLinks = []
  const [config] = configs.filter((item) => item.name === source)
  try {
    console.log(`trying to scrape ${source}, number: ${limit}`)
    blogLinks = await scrapeBlogWithConfig(
      config,
      null,
      limit,
      showMoreCoinbase
    )
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error scraping Coinbase Blog:`,
      err
    )
  }
  return blogLinks
}

console.log(scrapeBlogBySource('coinbase', 20))
