import { useState } from 'react'

import { formatDistanceToNow } from 'date-fns'
import gql from 'graphql-tag'

import { useQuery, useMutation } from '@redwoodjs/web'

const SCRAPE_BLOG_POSTS = gql`
  mutation ScrapeBlogPosts($source: String!, $limit: Int) {
    scrapeCoinbaseBlog(source: $source, limit: $limit)
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

export const HomePage = () => {
  const [activeSource, setActiveSource] = useState('All')
  const [offset, setOffset] = useState(0)
  const [scrapeLimit, setScrapeLimit] = useState(20)
  const [loadingScrape, setLoadingScrape] = useState(false)

  const sourceParam = activeSource === 'All' ? undefined : activeSource

  const { data, loading, fetchMore, refetch } = useQuery(GET_BLOG_POSTS, {
    variables: { source: sourceParam, offset: 0, limit: LIMIT },
    notifyOnNetworkStatusChange: true,
  })

  const [scrapeBlogPosts] = useMutation(SCRAPE_BLOG_POSTS)

  const posts = data?.blogPosts?.posts || []
  const totalCount = data?.blogPosts?.totalCount || 0

  const handleLoadMore = () => {
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

  const handleRefresh = async () => {
    setLoadingScrape(true)
    try {
      await scrapeBlogPosts({
        variables: { source: sourceParam || 'coinbase', limit: scrapeLimit },
      })
      await refetch()
    } catch (e) {
      console.error('Error scraping:', e)
    } finally {
      setLoadingScrape(false)
    }
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Total Links: {totalCount}</h2>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            value={scrapeLimit}
            onChange={(e) => setScrapeLimit(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24"
            placeholder="Max count"
          />
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 text-white rounded ${
              loadingScrape ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={loadingScrape}
          >
            {loadingScrape ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <div className="text-xs text-gray-400 uppercase mb-1">
                  {post.source}
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

          {posts.length < totalCount && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
