import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { artworkId, sessionId } = await request.json()

    if (!artworkId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already saved
    const existingSave = await db.save.findUnique({
      where: {
        artworkId_sessionId: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      }
    })

    if (existingSave) {
      // Unsave
      await db.save.delete({
        where: {
          id: existingSave.id
        }
      })

      // Update artwork save count
      const currentArtwork = await db.artwork.findUnique({
        where: { id: parseInt(artworkId) },
        select: { saveCount: true }
      })

      const artwork = await db.artwork.update({
        where: { id: parseInt(artworkId) },
        data: {
          saveCount: (currentArtwork?.saveCount ?? 0) + (existingSave ? -1 : 1)
        }
      })

      return NextResponse.json({ 
        saved: !existingSave, 
        saveCount: artwork.saveCount ?? 0
      })
    } else {
      // Save
      await db.save.create({
        data: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      })

      // Update artwork save count
      const currentArtwork = await db.artwork.findUnique({
        where: { id: parseInt(artworkId) },
        select: { saveCount: true }
      })

      const artwork = await db.artwork.update({
        where: { id: parseInt(artworkId) },
        data: {
          saveCount: (currentArtwork?.saveCount ?? 0) + 1
        }
      })

      return NextResponse.json({ 
        saved: true, 
        saveCount: artwork.saveCount ?? 0
      })
    }
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to process save' }, { status: 500 })
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

    const save = await db.save.findUnique({
      where: {
        artworkId_sessionId: {
          artworkId: parseInt(artworkId),
          sessionId
        }
      }
    })

    const artwork = await db.artwork.findUnique({
      where: { id: parseInt(artworkId) },
      select: { saveCount: true }
    })

    return NextResponse.json({ 
      saved: !!save, 
      saveCount: artwork?.saveCount || 0 
    })
  } catch (error) {
    console.error('Get save status error:', error)
    return NextResponse.json({ error: 'Failed to get save status' }, { status: 500 })
  }
}