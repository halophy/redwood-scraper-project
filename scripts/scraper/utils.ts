import { Page } from 'puppeteer'

export function randomDelay(min = 2000, max = 4000) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomCoord() {
  return Math.floor(Math.random() * 100 + 50) // 模拟坐标
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function simulateHumanActions(page: Page) {
  await sleep(randomDelay())
  await page.mouse.move(randomCoord(), randomCoord())
  await page.keyboard.press('ArrowDown')
  await sleep(randomDelay())
  await autoScroll(page)
}

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0
      const distance = 100
      const timer = setInterval(
        () => {
          window.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        },
        200 + Math.random() * 100
      )
    })
  })
}
