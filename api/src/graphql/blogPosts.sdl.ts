export const schema = gql`
  type BlogPost {
    id: Int!
    url: String!
    source: String!
    createdAt: DateTime!
  }

  type BlogPostPage {
    posts: [BlogPost!]!
    totalCount: Int!
  }

  type Query {
    blogPosts(source: String, offset: Int!, limit: Int!): BlogPostPage!
      @skipAuth
  }

  type Mutation {
    scrapeCoinbaseBlog(source: String!, limit: Int): Boolean! @skipAuth
  }
`
