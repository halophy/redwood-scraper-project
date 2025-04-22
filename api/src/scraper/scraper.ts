import * as proxyChain from 'proxy-chain'
import { Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import { getRandomProxy } from './proxyPool'
import { IBlog } from './type'
import { simulateHumanActions } from './utils'
import { randomDelay, sleep } from './utils'

puppeteer.use(StealthPlugin())

export default async function scrapeBlog(
  config: IBlog,
  existingPage: Page | null = null,
  limit: number | null = null,
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
  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    try {
      await simulateHumanActions(page)

      // 尝试点击“Show More”
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
      console.log(`[INFO] Fetched ${addedCount} new links.`)

      // 达到限制就退出
      if (limit && blogLinksSet.size >= limit) {
        break
      }

      // 如果没新内容，说明没有更多分页
      if (addedCount === 0) {
        console.log(`[INFO] No more new content found, stopping.`)
        break
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error during scraping:`, err)
      attempts++
      if (attempts < maxAttempts) {
        console.log(`[${new Date().toISOString()}] Retrying...`)
        continue
      }
    }
  }

  if (!existingPage) {
    await page.close()
    await browser?.close()
  }

  let blogLinks = Array.from(blogLinksSet)
  if (limit) {
    blogLinks = blogLinks.slice(0, limit)
  }

  return blogLinks
}
