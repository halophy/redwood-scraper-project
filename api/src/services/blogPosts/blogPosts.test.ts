import { db } from 'src/lib/db'

import { blogPosts, scrapeCoinbaseBlog } from './blogPosts'
import type { StandardScenario } from './blogPosts.scenarios'

describe('blogPosts service', () => {
  scenario(
    'returns posts with pagination and optional source',
    async (scenario: StandardScenario) => {
      const result = await blogPosts({
        source: 'coinbase',
        offset: 0,
        limit: 10,
      })

      expect(result.posts.length).toBe(2)
      expect(result.totalCount).toBe(2)
      expect(result.posts[0]).toHaveProperty('url')
    }
  )
})

describe('scrapeCoinbaseBlog service', () => {
  it('scrapes blog links and stores non-duplicate URLs', async () => {
    // mock scrapeBlog 方法返回模拟链接
    const scrapeMock = vi
      .fn()
      .mockResolvedValue([
        'https://example.com/new1',
        'https://example.com/new2',
      ])

    const original = require('src/scraper/run')
    original.scrapeCoinbaseBlog = scrapeMock

    const result = await scrapeCoinbaseBlog({ source: 'coinbase' })
    expect(result).toBe(true)

    const stored = await db.blogPost.findMany({
      where: { source: 'coinbase' },
    })

    const urls = stored.map((p) => p.url)
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://example.com/new1',
        'https://example.com/new2',
      ])
    )
  })
})
