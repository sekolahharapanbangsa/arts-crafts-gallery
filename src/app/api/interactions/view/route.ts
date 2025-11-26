import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { artworkId, sessionId } = await request.json()

    if (!artworkId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already viewed (unique view per session)
    const existingView = await db.view.findUnique({
      where: {
        artworkId_sessionId: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      }
    })

    if (!existingView) {
      // First time viewing, create view record
      await db.view.create({
        data: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      })

      // Update artwork view count
      const currentArtwork = await db.artwork.findUnique({
        where: { id: parseInt(artworkId) },
        select: { viewCount: true }
      })

      const artwork = await db.artwork.update({
        where: { id: parseInt(artworkId) },
        data: {
          viewCount: (currentArtwork?.viewCount ?? 0) + 1
        }
      })

      return NextResponse.json({ 
        viewed: true, 
        viewCount: artwork.viewCount ?? 0
      })
    } else {
      // Already viewed, just return current count
      const artwork = await db.artwork.findUnique({
        where: { id: parseInt(artworkId) },
        select: { viewCount: true }
      })

      return NextResponse.json({ 
        viewed: false, 
        viewCount: artwork?.viewCount || 0 
      })
    }
  } catch (error) {
    console.error('View error:', error)
    return NextResponse.json({ error: 'Failed to process view' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')

    if (!artworkId) {
      return NextResponse.json({ error: 'Missing artworkId parameter' }, { status: 400 })
    }

    const artwork = await db.artwork.findUnique({
      where: { id: parseInt(artworkId) },
      select: { viewCount: true }
    })

    return NextResponse.json({ 
      viewCount: artwork?.viewCount || 0 
    })
  } catch (error) {
    console.error('Get view count error:', error)
    return NextResponse.json({ error: 'Failed to get view count' }, { status: 500 })
  }
}