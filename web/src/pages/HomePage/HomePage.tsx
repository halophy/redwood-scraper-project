import { useState, useRef, useEffect } from 'react'

import { formatDistanceToNow } from 'date-fns'
import gql from 'graphql-tag'

import {
  useQuery,
  // useMutation,
} from '@redwoodjs/web'

// const SCRAPE_BLOG_POSTS = gql`
//   mutation scrapeBlogSaveLinks($source: String!, $limit: Int) {
//     scrapeBlogSaveLinks(source: $source, limit: $limit)
//   }
// `

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

const LIMIT = 10 // 每次分页查询的数量
const SOURCES = ['All', 'coinbase'] // Tab 标签页，跟 api/src/scraper/sites 中的 name 对应

export const HomePage = () => {
  const [activeSource, setActiveSource] = useState('All')
  const [offset, setOffset] = useState(0)
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const sourceParam = activeSource === 'All' ? undefined : activeSource

  const { data, loading, fetchMore, refetch } = useQuery(GET_BLOG_POSTS, {
    variables: { source: sourceParam, offset: 0, limit: LIMIT },
    notifyOnNetworkStatusChange: true,
  })

  // const [scrapeBlogPosts] = useMutation(SCRAPE_BLOG_POSTS)

  const posts = data?.blogPosts?.posts || []
  const totalCount = data?.blogPosts?.totalCount || 0

  const handleLoadMore = () => {
    if (loading) return // 防抖处理
    const newOffset = offset + LIMIT
    fetchMore({
      variables: { source: sourceParam, offset: newOffset, limit: LIMIT },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prevResult
        return {
          blogPosts: {
            posts: [
              ...prevResult.blogPosts.posts,
              ...fetchMoreResult.blogPosts.posts,
            ],
            totalCount: fetchMoreResult.blogPosts.totalCount,
          },
        }
      },
    })
    setOffset(newOffset)
  }

  const handleTabChange = (source) => {
    setActiveSource(source)
    setOffset(0)
    refetch({
      source: source === 'All' ? undefined : source,
      offset: 0,
      limit: LIMIT,
    })
  }

  useEffect(() => {
    if (!loadMoreTriggerRef.current) return

    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 1.0 }
    )

    observer.current.observe(loadMoreTriggerRef.current)

    return () => observer.current?.disconnect()
  }, [posts, loading])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Total Links in DB: {totalCount}</h2>
      </div>

      {/* Tabs */}
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
        {posts.map((post, index) => (
          <li
            key={post.id}
            className="bg-white p-4 rounded shadow hover:shadow-md transition"
          >
            <div className="text-xs text-gray-400 uppercase mb-1">
              {`NO.${index + 1} FROM ${post.source}`}
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
      <div ref={loadMoreTriggerRef} className="text-center mt-6">
        {loading && <div>Loading more...</div>}
      </div>
    </div>
  )
}

export default HomePage
