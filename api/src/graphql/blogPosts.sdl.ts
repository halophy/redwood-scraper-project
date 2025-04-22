export const schema = gql`
  type BlogPost {
    id: Int!
    url: String!
    createdAt: DateTime!
  }

  type BlogPostPage {
    posts: [BlogPost!]!
    totalCount: Int!
  }

  type Query {
    blogPosts(offset: Int!, limit: Int!): BlogPostPage! @skipAuth
  }

  type Mutation {
    scrapeCoinbaseBlog(limit: Int): Boolean! @skipAuth
  }
`
