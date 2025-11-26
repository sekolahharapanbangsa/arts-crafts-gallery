'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, User, Palette, Download } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Artwork {
  id: number
  title: string
  description: string | null
  photoUrl: string
  qrCodeUrl: string | null
  yearCreated: number
  subject: string
  studentId: number
  createdAt: string
  updatedAt: string
  student: {
    name: string
    nis: string
    class: string
    grade: string
  }
}

export default function ArtworkDetail() {
  const params = useParams()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchArtwork(params.id as string)
    }
  }, [params.id])

  const fetchArtwork = async (id: string) => {
    try {
      const response = await fetch(`/api/artworks/${id}`)
      if (response.ok) {
        const data = await response.json()
        setArtwork(data)
      } else {
        throw new Error('Artwork not found')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Artwork not found",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = () => {
    if (artwork?.qrCodeUrl) {
      const link = document.createElement('a')
      link.href = artwork.qrCodeUrl
      link.download = `qrcode-${artwork.title.replace(/\s+/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Button 
          variant="outline" 
          className="mb-4 sm:mb-6 h-9 sm:h-10"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={artwork.photoUrl || '/placeholder-art.svg'}
                    alt={artwork.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-art.svg'
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {artwork.qrCodeUrl && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    QR Code
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Scan QR code to view this artwork
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={artwork.qrCodeUrl}
                      alt="QR Code"
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                    />
                    <Button onClick={handleDownloadQR} variant="outline" className="w-full sm:w-auto h-9 sm:h-10">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Download QR Code</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl">{artwork.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm sm:text-base">
                      {artwork.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs sm:text-sm self-start sm:self-auto">
                    {artwork.subject}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Student</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artwork.student.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Year Created</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artwork.yearCreated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Class</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artwork.student.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Grade</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artwork.student.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">NIS</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artwork.student.nis}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Artwork Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">Artwork ID</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">#{artwork.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">Created on</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(artwork.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">Last updated</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(artwork.updatedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
}