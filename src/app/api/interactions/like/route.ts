import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { artworkId, sessionId } = await request.json()

    if (!artworkId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        artworkId_sessionId: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: {
          id: existingLike.id
        }
      })

      // Update artwork like count
      const currentArtwork = await db.artwork.findUnique({
        where: { id: parseInt(artworkId) },
        select: { likeCount: true }
      })

      const artwork = await db.artwork.update({
        where: { id: parseInt(artworkId) },
        data: {
          likeCount: (currentArtwork?.likeCount ?? 0) + (existingLike ? -1 : 1)
        }
      })

      return NextResponse.json({ 
        liked: !existingLike, 
        likeCount: artwork.likeCount ?? 0
      })
    } else {
      // Like
      await db.like.create({
        data: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      })

      // Update artwork like count
      const currentArtwork = await db.artwork.findUnique({
        where: { id: parseInt(artworkId) },
        select: { likeCount: true }
      })

      const artwork = await db.artwork.update({
        where: { id: parseInt(artworkId) },
        data: {
          likeCount: (currentArtwork?.likeCount ?? 0) + 1
        }
      })

      return NextResponse.json({ 
        liked: true, 
        likeCount: artwork.likeCount ?? 0
      })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Failed to process like' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const sessionId = searchParams.get('sessionId')

    if (!artworkId || !sessionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const like = await db.like.findUnique({
      where: {
        artworkId_sessionId: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      }
    })

    const artwork = await db.artwork.findUnique({
      where: { id: parseInt(artworkId) },
      select: { likeCount: true }
    })

    return NextResponse.json({ 
      liked: !!like, 
      likeCount: artwork?.likeCount || 0 
    })
  } catch (error) {
    console.error('Get like status error:', error)
    return NextResponse.json({ error: 'Failed to get like status' }, { status: 500 })
  }
}