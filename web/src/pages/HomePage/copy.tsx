import { useEffect, useRef, useState } from 'react'

import { formatDistanceToNow } from 'date-fns'
import gql from 'graphql-tag'

import { useQuery, useMutation } from '@redwoodjs/web'

const SCRAPE_BLOG_POSTS = gql`
  mutation scrapeBlogSaveLinks($source: String!, $limit: Int) {
    scrapeBlogSaveLinks(source: $source, limit: $limit)
  }
`

const GET_BLOG_POSTS = gql`
  query BlogPosts($source: String, $offset: Int!, $limit: Int!) {
    blogPosts(source: $source, offset: $offset, limit: $limit) {
      posts {
        id
        url
        source
        createdAt
      }
      totalCount
    }
  }
`

const LIMIT = 10
const SOURCES = ['All', 'coinbase']
const SOURCE_LABELS = { coinbase: 'Coinbase' }

const HomePage = () => {
  const [activeSource, setActiveSource] = useState('All')
  const [offset, setOffset] = useState(0)
  const [scrapeLimit, setScrapeLimit] = useState(20)
  // const [loadingScrape, setLoadingScrape] = useState(false)
  const [posts, setPosts] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const isScrapingRef = useRef(false)
  const observerRef = useRef<HTMLDivElement | null>(null)

  const sourceParam = activeSource === 'All' ? undefined : activeSource

  const { data, fetchMore, refetch } = useQuery(GET_BLOG_POSTS, {
    variables: { source: sourceParam, offset: 0, limit: LIMIT },
    notifyOnNetworkStatusChange: true,
  })

  const [scrapeBlogPosts] = useMutation(SCRAPE_BLOG_POSTS)

  const totalCount = data?.blogPosts?.totalCount || 0

  const loadMore = async () => {
    if (isFetching || !hasMore) return
    setIsFetching(true)

    const newOffset = offset + LIMIT
    const res = await fetchMore({
      variables: { source: sourceParam, offset: newOffset, limit: LIMIT },
    })

    const newPosts = res.data?.blogPosts?.posts || []
    const updatedTotal = res.data?.blogPosts?.totalCount || 0

    setOffset(newOffset)
    setPosts((prev) => [...prev, ...newPosts])
    const currentTotal = posts.length + newPosts.length
    setHasMore(currentTotal < updatedTotal)

    if (currentTotal >= updatedTotal && !isScrapingRef.current) {
      const newLimit = scrapeLimit + 10
      setScrapeLimit(newLimit)
      isScrapingRef.current = true
      try {
        await scrapeBlogPosts({
          variables: { source: sourceParam, limit: newLimit },
        })
        await refetch()
      } catch (e) {
        console.error('Scrape failed:', e)
      } finally {
        isScrapingRef.current = false
      }
    }

    setIsFetching(false)
  }

  useEffect(() => {
    if (!observerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, offset, scrapeLimit, posts])

  useEffect(() => {
    if (data?.blogPosts?.posts) {
      setPosts(data.blogPosts.posts)
    }
  }, [data])

  // const handleRefresh = async () => {
  //   setLoadingScrape(true)
  //   try {
  //     await scrapeBlogPosts({
  //       variables: { source: sourceParam, limit: scrapeLimit },
  //     })
  //     await refetch()
  //   } catch (e) {
  //     console.error('Error scraping:', e)
  //   } finally {
  //     setLoadingScrape(false)
  //   }
  // }

  const handleTabChange = (source: string) => {
    setActiveSource(source)
    setOffset(0)
    setHasMore(true)
    setPosts([])
    refetch({
      source: source === 'All' ? undefined : source,
      offset: 0,
      limit: LIMIT,
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Total Links: {totalCount}</h2>
      </div>

      {/* Source Tabs */}
      <div className="mb-6 flex space-x-4 border-b">
        {SOURCES.map((source) => (
          <button
            key={source}
            onClick={() => handleTabChange(source)}
            className={`py-2 px-4 -mb-px border-b-2 font-medium ${
              activeSource === source
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
          >
            {source}
          </button>
        ))}
      </div>

      {/* Blog List */}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="bg-white p-4 rounded shadow hover:shadow-md transition"
          >
            <div className="text-xs text-gray-400 uppercase mb-1">
              {SOURCE_LABELS[post.source] || post.source}
            </div>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium break-words"
            >
              {post.url}
            </a>
            <div className="text-sm text-gray-500 mt-1">
              Added {formatDistanceToNow(new Date(post.createdAt))} ago
            </div>
          </li>
        ))}
      </ul>

      {/* Infinite Scroll Loader / End Indicator */}
      <div
        ref={observerRef}
        className="h-12 flex justify-center items-center mt-4"
      >
        {isFetching ? (
          <div className="animate-pulse text-gray-500">Loading...</div>
        ) : !hasMore ? (
          <div className="text-gray-400 text-sm">No more blog posts.</div>
        ) : null}
      </div>
    </div>
  )
}

export default HomePage
