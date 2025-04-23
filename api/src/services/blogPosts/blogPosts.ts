import { db } from 'src/lib/db'
import { scrapeBlogBySource } from 'src/scraper/run'

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

  // 第一次查询数据库
  let [posts, totalCount] = await Promise.all([
    db.blogPost.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.blogPost.count({ where: whereClause }),
  ])

  // 如果请求超出当前总数，自动触发爬虫
  if (offset + limit > totalCount) {
    console.log(
      `[server] offset(${offset}) + limit(${limit}) 超出总数(${totalCount})，尝试动态爬取`
    )
    try {
      await scrapeBlogSaveLinks(source || 'coinbase', offset + limit) // 默认抓 coinbase
    } catch (e) {
      console.error('自动爬取失败:', e)
    }

    // 等待新数据写入后重新查询
    const updated = await Promise.all([
      db.blogPost.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.blogPost.count({ where: whereClause }),
    ])

    posts = updated[0]
    totalCount = updated[1]
  }

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

export const scrapeBlogSaveLinks = async (source: string, limit: number) => {
  try {
    const blogLinks = await scrapeBlogBySource(source, limit)
    await saveBlogLinks(blogLinks, source)
    return true
  } catch (err) {
    console.error('Scraping error:', err)
    return false
  }
}
