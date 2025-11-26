import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const students = await db.student.findMany({
      include: {
        _count: {
          select: {
            artworks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nis, class: className, grade, photoUrl } = body

    if (!name || !nis || !className || !grade) {
      return NextResponse.json(
        { error: 'Name, NIS, class, grade, and photo URL are required' },
        { status: 400 }
      )
    }

    const existingStudent = await db.student.findUnique({
      where: { nis }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this NIS already exists' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      data: {
        name,
        nis,
        class: className,
        grade,
        photoUrl
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, nis, class: className, grade } = body

    if (!id || !name || !nis || !className || !grade) {
      return NextResponse.json(
        { error: 'ID, Name, NIS, class, and grade are required' },
        { status: 400 }
      )
    }

    const student = await db.student.update({
      where: { id: parseInt(id) },
      data: {
        name,
        nis,
        class: className,
        grade
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}