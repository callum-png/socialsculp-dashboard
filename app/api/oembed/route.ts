import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ thumbnailUrl: null })

  try {
    if (url.includes('tiktok.com')) {
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        { next: { revalidate: 3600 } }
      )
      if (!res.ok) return NextResponse.json({ thumbnailUrl: null })
      const data = await res.json()
      return NextResponse.json({ thumbnailUrl: (data.thumbnail_url as string) ?? null })
    }
  } catch {
    // fall through to null
  }

  return NextResponse.json({ thumbnailUrl: null })
}
