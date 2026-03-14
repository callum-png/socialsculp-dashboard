import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter } as any)
}

export function getDb(): PrismaClient {
  if (globalThis.prisma) return globalThis.prisma
  const client = createPrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client
  }
  return client
}

// Default export for backwards compat — but this is lazy now
export default { getDb }
