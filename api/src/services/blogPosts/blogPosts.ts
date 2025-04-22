import { db } from 'src/lib/db'
import { scrapeCoinbaseBlog as scrapeBlog } from 'src/scraper/run'

export const blogPosts = async ({
  source,
  offset,
  limit,
}: {
  source?: string
  offset: number
  limit: number
}) => {
  const whereClause = source ? { source } : {}

  const [posts, totalCount] = await Promise.all([
    db.blogPost.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.blogPost.count({ where: whereClause }),
  ])

  return { posts, totalCount }
}

// 工具函数：批量写入，避免重复
const saveBlogLinks = async (links: string[], source: string) => {
  const existing = await db.blogPost.findMany({
    where: {
      url: {
        in: links,
      },
    },
    select: {
      url: true,
    },
  })

  const existingUrls = new Set(existing.map((item) => item.url))

  const newLinks = links.filter((url) => !existingUrls.has(url))

  if (newLinks.length === 0) return

  await db.blogPost.createMany({
    data: newLinks.map((url) => ({
      url,
      source: source,
    })),
  })
}

export const scrapeCoinbaseBlog = async ({
  source,
  limit,
}: {
  source: string
  limit?: number
}) => {
  try {
    const blogLinks = await scrapeBlog(source, limit || 20)
    await saveBlogLinks(blogLinks, source)
    return true
  } catch (err) {
    console.error('Scraping error:', err)
    return false
  }
}
