import type { BlogPost } from '@prisma/client'

import {
  blogPosts,
  blogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from './blogPosts'
import type { StandardScenario } from './blogPosts.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('blogPosts', () => {
  scenario('returns all blogPosts', async (scenario: StandardScenario) => {
    const result = await blogPosts()

    expect(result.length).toEqual(Object.keys(scenario.blogPost).length)
  })

  scenario('returns a single blogPost', async (scenario: StandardScenario) => {
    const result = await blogPost({ id: scenario.blogPost.one.id })

    expect(result).toEqual(scenario.blogPost.one)
  })

  scenario('creates a blogPost', async () => {
    const result = await createBlogPost({
      input: { url: 'String9565588' },
    })

    expect(result.url).toEqual('String9565588')
  })

  scenario('updates a blogPost', async (scenario: StandardScenario) => {
    const original = (await blogPost({
      id: scenario.blogPost.one.id,
    })) as BlogPost
    const result = await updateBlogPost({
      id: original.id,
      input: { url: 'String4440112' },
    })

    expect(result.url).toEqual('String4440112')
  })

  scenario('deletes a blogPost', async (scenario: StandardScenario) => {
    const original = (await deleteBlogPost({
      id: scenario.blogPost.one.id,
    })) as BlogPost
    const result = await blogPost({ id: original.id })

    expect(result).toEqual(null)
  })
})
