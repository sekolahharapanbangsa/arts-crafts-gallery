import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET() {
  try {
    const artworks = await db.artwork.findMany({
      include: {
        student: {
          select: {
            name: true,
            nis: true,
            class: true,
            grade: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Ensure all artworks have count fields (for backward compatibility)
    const artworksWithCounts = artworks.map(artwork => ({
      ...artwork,
      likeCount: artwork.likeCount ?? 0,
      saveCount: artwork.saveCount ?? 0,
      viewCount: artwork.viewCount ?? 0
    }))

    return NextResponse.json(artworksWithCounts)
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, photoUrl, yearCreated, subject, studentId } = body

    if (!title || !photoUrl || !studentId) {
      return NextResponse.json(
        { error: 'Title, photo URL, and student ID are required' },
        { status: 400 }
      )
    }

    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    const artwork = await db.artwork.create({
      data: {
        title,
        description,
        photoUrl,
        yearCreated: yearCreated || new Date().getFullYear(),
        subject: subject || 'Art & Craft',
        studentId,
        likeCount: 0,
        saveCount: 0,
        viewCount: 0
      },
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const qrCodeUrl = `${baseUrl}/artwork/${artwork.id}`
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    const updatedArtwork = await db.artwork.update({
      where: { id: artwork.id },
      data: {
        qrCodeUrl: qrCodeDataUrl
      },
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

    return NextResponse.json(updatedArtwork, { status: 201 })
  } catch (error) {
    console.error('Error creating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, photoUrl, yearCreated, subject, studentId } = body

    if (!id || !title || !studentId) {
      return NextResponse.json(
        { error: 'ID, title, and student ID are required' },
        { status: 400 }
      )
    }

    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    const artwork = await db.artwork.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        photoUrl,
        yearCreated: yearCreated || new Date().getFullYear(),
        subject: subject || 'Art & Craft',
        studentId
      },
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

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error updating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}