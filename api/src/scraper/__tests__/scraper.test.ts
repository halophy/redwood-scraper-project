// api/src/scraper/__tests__/scraper.test.ts
import { scrapeBlogBySource } from '../run'

describe('scrapeBlogBySource', () => {
  it('scrapes at least one post from coinbase', async () => {
    const result = await scrapeBlogBySource('coinbase', 5)

    expect(result.length).toBeGreaterThan(0)
    for (const post of result) {
      expect(post.url).toMatch(/^https:\/\/www\.coinbase\.com\/.+/)
      expect(post.source).toBe('coinbase')
    }
  })
})
