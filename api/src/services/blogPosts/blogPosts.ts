import { db } from 'src/lib/db'
import { scrapeCoinbaseBlog as scrapeBlog } from 'src/scraper/run'

export const blogPosts = async ({
  offset,
  limit,
}: {
  offset: number
  limit: number
}) => {
  const [posts, totalCount] = await Promise.all([
    db.blogPost.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.blogPost.count(),
  ])

  return { posts, totalCount }
}

// 工具函数：批量写入，避免重复
const saveBlogLinks = async (links: string[]) => {
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
    })),
  })
}

export const scrapeCoinbaseBlog = async ({ limit }: { limit?: number }) => {
  try {
    const blogLinks = await scrapeBlog(limit || 20)
    await saveBlogLinks(blogLinks)
    return true
  } catch (err) {
    console.error('Scraping error:', err)
    return false
  }
}
