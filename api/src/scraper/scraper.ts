import * as proxyChain from 'proxy-chain'
import { Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import { getRandomProxy } from './proxyPool'
import { IBlog } from './type'
import { simulateHumanActions } from './utils'
import { randomDelay, sleep } from './utils'

puppeteer.use(StealthPlugin())

export default async function scrapeBlogWithConfig(
  config: IBlog,
  existingPage: Page | null = null,
  limit: number,
  showMoreHandler?: (page: Page) => Promise<void>
) {
  const proxyUrl = await getRandomProxy()

  let launchOptions = {}

  if (proxyUrl) {
    const anonymizedProxy = await proxyChain.anonymizeProxy(proxyUrl)
    launchOptions = {
      args: [`--proxy-server=${anonymizedProxy}`],
    }
  }

  const browser = existingPage ? null : await puppeteer.launch(launchOptions)
  const page = existingPage || (await browser!.newPage())

  await page.setUserAgent(config.userAgent || 'Mozilla/5.0')

  await page.goto(`${config.blogUrl}${config.indexPage}`, {
    waitUntil: 'networkidle2',
  })

  const blogLinksSet = new Set<string>()

  while (blogLinksSet.size < limit) {
    try {
      await simulateHumanActions(page)

      if (showMoreHandler) {
        await showMoreHandler(page)
        await sleep(randomDelay())
      }

      const newLinks: string[] = await page.evaluate((config: IBlog) => {
        return eval(config.articleLinkSelector)
      }, config)

      const prevCount = blogLinksSet.size
      newLinks.forEach((link) => blogLinksSet.add(link))
      const addedCount = blogLinksSet.size - prevCount

      console.log(
        `[INFO] Added ${addedCount} new links. Total: ${blogLinksSet.size}`
      )

      // 如果这轮没有新增内容，说明已经没有更多可以加载的
      if (addedCount === 0) {
        console.log('[INFO] No more content to load.')
        break
      }
    } catch (err) {
      console.error(`[ERROR] Scraping failed:`, err)
      break
    }
  }

  if (!existingPage) {
    await page.close()
    await browser?.close()
  }

  const blogLinks = Array.from(blogLinksSet)
  return limit ? blogLinks.slice(0, limit) : blogLinks
}
