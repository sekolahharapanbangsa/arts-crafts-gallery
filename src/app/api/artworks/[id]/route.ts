import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const artworkId = parseInt(id)
    
    if (isNaN(artworkId)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      )
    }

    const artwork = await db.artwork.findUnique({
      where: { id: artworkId },
      include: {
        student: {
          select: {
            name: true,
            nis: true,
            class: true,
            grade: true
          }
        }
      }
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const artworkId = parseInt(id)
    
    if (isNaN(artworkId)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      )
    }

    const artwork = await db.artwork.delete({
      where: { id: artworkId }
    })

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}