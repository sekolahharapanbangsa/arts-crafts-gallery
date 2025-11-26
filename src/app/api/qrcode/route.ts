import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworkId, baseUrl } = body

    if (!artworkId || !baseUrl) {
      return NextResponse.json(
        { error: 'Artwork ID and base URL are required' },
        { status: 400 }
      )
    }

    const qrCodeUrl = `${baseUrl}/artwork/${artworkId}`
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      qrCodeUrl: qrCodeDataUrl,
      redirectUrl: qrCodeUrl
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}