import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: ['public.playing_with_neon'],
  },
})
