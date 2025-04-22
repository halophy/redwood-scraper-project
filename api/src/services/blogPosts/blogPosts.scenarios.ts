import type { Prisma, BlogPost } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.BlogPostCreateArgs>({
  blogPost: {
    one: { data: { url: 'String2769289' } },
    two: { data: { url: 'String1926364' } },
  },
})

export type StandardScenario = ScenarioData<BlogPost, 'blogPost'>
