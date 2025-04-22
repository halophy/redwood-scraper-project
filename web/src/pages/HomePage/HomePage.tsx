import { useState } from 'react'

import { formatDistanceToNow } from 'date-fns'
import gql from 'graphql-tag'

import { useQuery, useMutation } from '@redwoodjs/web'

const GET_BLOG_POSTS = gql`
  query BlogPosts($offset: Int!, $limit: Int!) {
    blogPosts(offset: $offset, limit: $limit) {
      posts {
        id
        url
        createdAt
      }
      totalCount
    }
  }
`

const SCRAPE_BLOG_POSTS = gql`
  mutation ScrapeBlogPosts($limit: Int) {
    scrapeCoinbaseBlog(limit: $limit)
  }
`

const LIMIT = 10

export const HomePage = () => {
  const [offset, setOffset] = useState(0)
  const [scrapeLimit, setScrapeLimit] = useState(20)
  const [loadingScrape, setLoadingScrape] = useState(false)

  const { data, fetchMore, refetch } = useQuery(GET_BLOG_POSTS, {
    variables: { offset: 0, limit: LIMIT },
    notifyOnNetworkStatusChange: true,
  })

  const [scrapeBlogPosts] = useMutation(SCRAPE_BLOG_POSTS)

  const posts = data?.blogPosts?.posts || []
  const totalCount = data?.blogPosts?.totalCount || 0

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT
    fetchMore({
      variables: { offset: newOffset, limit: LIMIT },
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
      await scrapeBlogPosts({ variables: { limit: scrapeLimit } })
      await refetch()
    } catch (e) {
      console.error('Error scraping:', e)
    } finally {
      setLoadingScrape(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Total Links: {totalCount}</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
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

      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="bg-white p-4 rounded shadow hover:shadow-md transition"
          >
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
    </div>
  )
}

export default HomePage
