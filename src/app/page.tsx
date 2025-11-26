'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Heart, MessageCircle, Bookmark, Grid3X3, Users, Home, Settings, Plus, Camera, MoreHorizontal, X, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import ArtworkDetailModal from '@/components/ArtworkDetailModal'

interface Student {
  id: number
  name: string
  nis: string
  class: string
  grade: string
  createdAt: string
  updatedAt: string
  _count?: {
    artworks: number
  }
}

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
  likeCount: number
  saveCount: number
  viewCount: number
  student?: {
    name: string
    nis: string
    class: string
    grade: string
  }
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('artworks')
  const [isStudentArtworksOpen, setIsStudentArtworksOpen] = useState(false)
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null)
  const [isArtworkDetailOpen, setIsArtworkDetailOpen] = useState(false)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const [likedArtworks, setLikedArtworks] = useState<Set<number>>(new Set())
  const [savedArtworks, setSavedArtworks] = useState<Set<number>>(new Set())
  const [viewedArtworks, setViewedArtworks] = useState<Set<number>>(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sessionId] = useState(() => {
    // Generate or get session ID from localStorage
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('sessionId', sessionId)
      }
      return sessionId
    }
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  })

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, artworksRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/artworks')
      ])
      
      if (studentsRes.ok && artworksRes.ok) {
        const studentsData = await studentsRes.json()
        const artworksData = await artworksRes.json()
        setStudents(studentsData)
        setArtworks(artworksData)

        // Load user interaction states
        await Promise.all(artworksData.map(async (artwork: Artwork) => {
          try {
            const [likeRes, saveRes] = await Promise.all([
              fetch(`/api/interactions/like?artworkId=${artwork.id}&sessionId=${sessionId}`),
              fetch(`/api/interactions/save?artworkId=${artwork.id}&sessionId=${sessionId}`)
            ])

            if (likeRes.ok) {
              const likeData = await likeRes.json()
              if (likeData.liked) {
                setLikedArtworks(prev => new Set(prev).add(artwork.id))
              }
            }

            if (saveRes.ok) {
              const saveData = await saveRes.json()
              if (saveData.saved) {
                setSavedArtworks(prev => new Set(prev).add(artwork.id))
              }
            }
          } catch (error) {
            console.error('Error loading interaction states:', error)
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudentArtworks = (student: Student) => {
    setSelectedStudentData(student)
    setIsStudentArtworksOpen(true)
  }

  const handleViewArtworkDetail = async (artworkId: string) => {
    // Record view before opening modal
    await handleView(parseInt(artworkId))
    setSelectedArtworkId(artworkId)
    setIsArtworkDetailOpen(true)
  }

  const handleLike = async (artworkId: number) => {
    try {
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        setLikedArtworks(prev => {
          const newSet = new Set(prev)
          if (data.liked) {
            newSet.add(artworkId)
          } else {
            newSet.delete(artworkId)
          }
          return newSet
        })

        // Update artwork count in local state
        setArtworks(prev => prev.map(artwork => 
          artwork.id === artworkId 
            ? { ...artwork, likeCount: data.likeCount }
            : artwork
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = async (artworkId: number) => {
    try {
      const response = await fetch('/api/interactions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        setSavedArtworks(prev => {
          const newSet = new Set(prev)
          if (data.saved) {
            newSet.add(artworkId)
          } else {
            newSet.delete(artworkId)
          }
          return newSet
        })

        // Update artwork count in local state
        setArtworks(prev => prev.map(artwork => 
          artwork.id === artworkId 
            ? { ...artwork, saveCount: data.saveCount }
            : artwork
        ))
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const handleView = async (artworkId: number) => {
    try {
      const response = await fetch('/api/interactions/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state if this is a new view
        if (data.viewed) {
          setViewedArtworks(prev => new Set(prev).add(artworkId))
          
          // Update artwork count in local state
          setArtworks(prev => prev.map(artwork => 
            artwork.id === artworkId 
              ? { ...artwork, viewCount: data.viewCount }
              : artwork
          ))
        }
      }
    } catch (error) {
      console.error('Error recording view:', error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.grade.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.student?.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.student?.grade.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Instagram-style Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src="/logo.png"
                alt="Arts & Crafts Gallery"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 hidden sm:block">Arts & Crafts Gallery</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative flex-1 max-w-xs sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8 w-full text-sm bg-gray-50 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
              
            {/* Admin Button */}
            <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </div>
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Quick Stats */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">+12%</span>
                    </div>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Camera className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">+8%</span>
                    </div>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-gray-900">{artworks.length}</p>
                      <p className="text-xs text-gray-500">Artworks</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {artworks.slice(0, 3).map((artwork) => (
                    <div key={artwork.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {artwork.student?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                        <p className="text-xs text-gray-500">{artwork.student?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-style Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Instagram-style Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('artworks')}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'artworks'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Artworks
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'students'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Students
            </button>
          </div>
        </div>

        {/* Instagram-style Content */}
        {activeTab === 'artworks' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => (
              <div key={artwork.id} className="max-w-sm">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Instagram-style Image */}
                      <div className="aspect-[4/5] relative bg-gray-100">
                        <img
                          src={artwork.photoUrl || '/placeholder-art.svg'}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-art.svg'
                          }}
                        />
                      </div>
                      
                      {/* Action Icons Below Image */}
                      <div className="flex items-center justify-between p-3 pt-0">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLike(artwork.id)}
                            className="flex items-center gap-1 text-gray-700 hover:text-red-500 transition-colors"
                          >
                            <Heart className={`w-5 h-5 ${likedArtworks.has(artwork.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                            <span className="text-sm font-medium">
                              {likedArtworks.has(artwork.id) ? 'Liked' : 'Like'}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({artwork.likeCount || 0})
                            </span>
                          </button>
                          <button 
                            onClick={() => handleViewArtworkDetail(artwork.id.toString())}
                            className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                            <span className="text-sm font-medium">View</span>
                            <span className="text-xs text-gray-500">
                              ({artwork.viewCount || 0})
                            </span>
                          </button>
                          <button 
                            onClick={() => handleSave(artwork.id)}
                            className="flex items-center gap-1 text-gray-700 hover:text-yellow-500 transition-colors"
                          >
                            <Bookmark className={`w-5 h-5 ${savedArtworks.has(artwork.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'}`} />
                            <span className="text-sm font-medium">
                              {savedArtworks.has(artwork.id) ? 'Saved' : 'Save'}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({artwork.saveCount || 0})
                            </span>
                          </button>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Instagram-style Card Content */}
                      <div className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {artwork.student?.name?.charAt(0) || 'A'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {artwork.student?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {artwork.student?.class} • {artwork.student?.grade}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {artwork.subject}
                          </Badge>
                        </div>
                        
                        <h3 className="text-sm font-semibold mb-1 text-gray-900 line-clamp-2">
                          {artwork.title}
                        </h3>
                        {artwork.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                            {artwork.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {artwork.yearCreated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="max-w-sm">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Instagram-style Profile Picture */}
                      <div className="aspect-square relative bg-gradient-to-br from-purple-100 to-pink-100">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${student.photoUrl ? 'hidden' : ''}`}>
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Instagram-style Profile Info */}
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {student.name}
                        </h3>
                        <div className="text-sm text-gray-600 mb-3">
                          <p>NIS: {student.nis}</p>
                          <p>{student.class} • {student.grade}</p>
                        </div>
                        <div className="text-center mb-3">
                          <Badge variant="outline" className="text-xs">
                            {student._count?.artworks || 0} artworks
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          onClick={() => handleViewStudentArtworks(student)}
                        >
                          View Gallery
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'artworks' && filteredArtworks.length === 0) || 
          (activeTab === 'students' && filteredStudents.length === 0)) && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different content
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instagram-style Student Artworks Dialog */}
      <Dialog open={isStudentArtworksOpen} onOpenChange={setIsStudentArtworksOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              {selectedStudentData?.photoUrl ? (
                <img
                  src={selectedStudentData.photoUrl}
                  alt={selectedStudentData?.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ${selectedStudentData?.photoUrl ? 'hidden' : ''}`}>
                {selectedStudentData?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <DialogTitle className="text-xl text-gray-900">
                  {selectedStudentData?.name}'s Gallery
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  NIS: {selectedStudentData?.nis} • {selectedStudentData?.class} • {selectedStudentData?.grade}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artworks.filter(artwork => artwork.studentId === selectedStudentData?.id).map((artwork) => (
              <div key={artwork.id}>
                <Card className="border-0 shadow-none hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-0">
                    <div className="aspect-[4/5] relative">
                      <img
                        src={artwork.photoUrl || '/placeholder-art.svg'}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-art.svg'
                        }}
                      />
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {artwork.student?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {artwork.student?.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {artwork.student?.class} • {artwork.student?.grade}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {artwork.subject}
                        </Badge>
                      </div>
                      
                      <h3 className="text-sm font-semibold mb-1 text-gray-900 line-clamp-2">
                        {artwork.title}
                      </h3>
                      {artwork.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                          {artwork.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {artwork.yearCreated}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            {artworks.filter(artwork => artwork.studentId === selectedStudentData?.id).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No artworks yet for this student</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        isOpen={isArtworkDetailOpen}
        onClose={() => setIsArtworkDetailOpen(false)}
        artworkId={selectedArtworkId}
      />
    </div>
  )
}