import type { Prisma } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.BlogPostCreateArgs>({
  blogPost: {
    one: {
      data: {
        url: 'https://example.com/post1',
        source: 'coinbase',
        createdAt: new Date(),
      },
    },
    two: {
      data: {
        url: 'https://example.com/post2',
        source: 'coinbase',
        createdAt: new Date(Date.now() - 100000),
      },
    },
  },
})

export type StandardScenario = ScenarioData<typeof standard>
