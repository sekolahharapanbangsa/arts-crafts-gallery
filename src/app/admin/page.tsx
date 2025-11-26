'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Plus, Eye, Palette, Users, Edit, Trash2, BarChart3, Home, Settings, MessageCircle, Grid3X3, UserPlus, Image, TrendingUp, X, ImageIcon, LogOut } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Upload } from 'lucide-react'
import Link from 'next/link'
import ArtworkDetailModal from '@/components/ArtworkDetailModal'
import AdminAuth from '@/components/AdminAuth'

interface Student {
  id: number
  name: string
  nis: string
  class: string
  grade: string
  photoUrl?: string
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
  student: {
    name: string
    nis: string
    class: string
    grade: string
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isAddArtworkOpen, setIsAddArtworkOpen] = useState(false)
  const [isStudentArtworksOpen, setIsStudentArtworksOpen] = useState(false)
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false)
  const [isEditArtworkOpen, setIsEditArtworkOpen] = useState(false)
  const [isArtworkDetailOpen, setIsArtworkDetailOpen] = useState(false)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'student' | 'artwork'
    id: number
    name: string
  } | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleLogout = () => {
    setIsAuthenticated(false)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out of admin panel",
    })
  }

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  const [newStudent, setNewStudent] = useState({
    name: '',
    nis: '',
    class: '',
    grade: '',
    photoUrl: ''
  })

  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    photoUrl: '',
    yearCreated: new Date().getFullYear(),
    subject: 'Art & Craft',
    studentId: 0
  })

  const stats = {
    totalStudents: students.length,
    totalArtworks: artworks.length,
    totalSubjects: new Set(artworks.map(a => a.subject)).size,
    recentArtworks: artworks.filter(a => {
      const artworkDate = new Date(a.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return artworkDate > thirtyDaysAgo
    }).length
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

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
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Student added successfully"
        })
        setNewStudent({ name: '', nis: '', class: '', grade: '', photoUrl: '' })
        setIsAddStudentOpen(false)
        fetchData()
      } else {
        throw new Error('Failed to add student')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive"
      })
    }
  }

  const handleAddArtwork = async () => {
    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArtwork)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Artwork added successfully"
        })
        setNewArtwork({
          title: '',
          description: '',
          photoUrl: '',
          yearCreated: new Date().getFullYear(),
          subject: 'Art & Craft',
          studentId: 0
        })
        setIsAddArtworkOpen(false)
        fetchData()
      } else {
        throw new Error('Failed to add artwork')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add artwork",
        variant: "destructive"
      })
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setNewStudent({
      name: student.name,
      nis: student.nis,
      class: student.class,
      grade: student.grade,
      photoUrl: student.photoUrl || ''
    })
    setIsEditStudentOpen(true)
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudent.id,
          ...newStudent
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Student updated successfully"
        })
        setNewStudent({ name: '', nis: '', class: '', grade: '', photoUrl: '' })
        setEditingStudent(null)
        setIsEditStudentOpen(false)
        fetchData()
      } else {
        throw new Error('Failed to update student')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive"
      })
    }
  }

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork)
    setNewArtwork({
      title: artwork.title,
      description: artwork.description,
      photoUrl: artwork.photoUrl,
      yearCreated: artwork.yearCreated,
      subject: artwork.subject,
      studentId: artwork.studentId
    })
    setIsEditArtworkOpen(true)
  }

  const handleUpdateArtwork = async () => {
    if (!editingArtwork) return

    try {
      const response = await fetch('/api/artworks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingArtwork.id,
          ...newArtwork
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Artwork updated successfully"
        })
        setNewArtwork({
          title: '',
          description: '',
          photoUrl: '',
          yearCreated: new Date().getFullYear(),
          subject: 'Art & Craft',
          studentId: 0
        })
        setEditingArtwork(null)
        setIsEditArtworkOpen(false)
        fetchData()
      } else {
        throw new Error('Failed to update artwork')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update artwork",
        variant: "destructive"
      })
    }
  }

  const handleDeleteStudent = (id: number, name: string) => {
    setDeleteConfirm({
      type: 'student',
      id,
      name
    })
  }

  const handleConfirmDeleteStudent = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/students/${deleteConfirm.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Student "${deleteConfirm.name}" deleted successfully`
        })
        setDeleteConfirm(null)
        fetchData()
      } else {
        throw new Error('Failed to delete student')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      })
    }
  }

  const handleDeleteArtwork = (id: number, title: string) => {
    setDeleteConfirm({
      type: 'artwork',
      id,
      name: title
    })
  }

  const handleConfirmDeleteArtwork = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/artworks/${deleteConfirm.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Artwork "${deleteConfirm.name}" deleted successfully`
        })
        setDeleteConfirm(null)
        fetchData()
      } else {
        throw new Error('Failed to delete artwork')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete artwork",
        variant: "destructive"
      })
    }
  }

  const handleViewStudentArtworks = (student: Student) => {
    setSelectedStudentData(student)
    setIsStudentArtworksOpen(true)
  }

  const handleViewArtworkDetail = (artworkId: string) => {
    setSelectedArtworkId(artworkId)
    setIsArtworkDetailOpen(true)
  }

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        throw new Error('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    } finally {
      setUploadingFile(false)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
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

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Instagram-style Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Admin Panel Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 hidden sm:block">Arts & Crafts Gallery</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative w-full max-w-xs sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students or artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 sm:h-10 text-sm bg-gray-50 border-gray-300 focus:border-primary"
                />
              </div>
              
              {/* Mobile Menu Button - Right Side */}
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Home className="w-5 h-5 text-gray-600" />
              </Link>
              
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                title="Logout from admin panel"
              >
                <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-style Layout */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {/* Instagram-style Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Total Students</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Total Artworks</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalArtworks}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Subjects</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalSubjects}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">New Artworks</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.recentArtworks}</div>
              </CardContent>
            </Card>
          </div>

          {/* Instagram-style Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'students'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('artworks')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'artworks'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Artworks
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>Enter student information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                          placeholder="Enter student name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nis">NIS</Label>
                        <Input
                          id="nis"
                          value={newStudent.nis}
                          onChange={(e) => setNewStudent({...newStudent, nis: e.target.value})}
                          placeholder="Enter NIS (Nomor Induk Siswa)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Select value={newStudent.grade} onValueChange={(value) => setNewStudent({...newStudent, grade: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SMP">SMP</SelectItem>
                            <SelectItem value="SMA">SMA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="class">Class</Label>
                        <Select 
                          value={newStudent.class} 
                          onValueChange={(value) => setNewStudent({...newStudent, class: value})}
                          disabled={!newStudent.grade}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={newStudent.grade ? "Select class" : "Select grade first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {newStudent.grade === 'SMP' && (
                              <>
                                <SelectItem value="7">Class 7</SelectItem>
                                <SelectItem value="8">Class 8</SelectItem>
                                <SelectItem value="9">Class 9</SelectItem>
                              </>
                            )}
                            {newStudent.grade === 'SMA' && (
                              <>
                                <SelectItem value="10">Class 10</SelectItem>
                                <SelectItem value="11">Class 11</SelectItem>
                                <SelectItem value="12">Class 12</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="photo">Photo</Label>
                        <div className="space-y-2">
                          <label 
                            htmlFor="student-photo-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <input
                              id="student-photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  try {
                                    const url = await handleFileUpload(file)
                                    setNewStudent({...newStudent, photoUrl: url})
                                  } catch (error) {
                                    toast({
                                      title: "Upload failed",
                                      description: "Failed to upload student photo",
                                      variant: "destructive"
                                    })
                                  }
                                }
                              }}
                              disabled={uploadingFile}
                            />
                            {newStudent.photoUrl ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={newStudent.photoUrl}
                                  alt="Student photo preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                  <p className="text-white text-sm">Click to change photo</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">Click to upload photo</span>
                                <span className="text-xs text-gray-500">PNG, JPG, GIF max. 5MB</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                      <Button onClick={handleAddStudent} className="w-full">Add Student</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddArtworkOpen} onOpenChange={setIsAddArtworkOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Image className="w-4 h-4 mr-2" alt="Add artwork icon" />
                      Add Artwork
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Artwork</DialogTitle>
                      <DialogDescription>Enter artwork information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newArtwork.title}
                          onChange={(e) => setNewArtwork({...newArtwork, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newArtwork.description}
                          onChange={(e) => setNewArtwork({...newArtwork, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="photoUrl">Photo</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="photoUrl"
                              value={newArtwork.photoUrl}
                              onChange={(e) => setNewArtwork({...newArtwork, photoUrl: e.target.value})}
                              placeholder="Enter photo URL or upload file"
                              className="flex-1"
                            />
                            <div className="text-xs text-gray-500">atau</div>
                          </div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              id="photoFile"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  try {
                                    const url = await handleFileUpload(file)
                                    setNewArtwork({...newArtwork, photoUrl: url})
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to upload photo",
                                      variant: "destructive"
                                    })
                                  }
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="photoFile"
                              className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-4"
                            >
                              {uploadingFile ? (
                                <div className="flex items-center gap-2 text-blue-600">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="text-sm">Mengupload...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                  <span className="text-sm text-gray-600">Klik untuk upload foto</span>
                                  <span className="text-xs text-gray-500">PNG, JPG, GIF maks. 5MB</span>
                                </>
                              )}
                            </label>
                            {newArtwork.photoUrl && (
                              <div className="mt-2">
                                <img
                                  src={newArtwork.photoUrl}
                                  alt="Preview"
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="yearCreated">Year Created</Label>
                        <Input
                          id="yearCreated"
                          type="number"
                          value={newArtwork.yearCreated}
                          onChange={(e) => setNewArtwork({...newArtwork, yearCreated: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={newArtwork.subject} onValueChange={(value) => setNewArtwork({...newArtwork, subject: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Art & Craft">Art & Craft</SelectItem>
                            <SelectItem value="Painting">Painting</SelectItem>
                            <SelectItem value="Drawing">Drawing</SelectItem>
                            <SelectItem value="Sculpture">Sculpture</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="studentId">Student</Label>
                        <Select value={newArtwork.studentId.toString()} onValueChange={(value) => setNewArtwork({...newArtwork, studentId: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.name} ({student.class})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddArtwork} className="w-full">Add Artwork</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Activity</CardTitle>
                  <CardDescription>Latest artworks and students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {artworks.slice(0, 5).map((artwork) => (
                      <div key={artwork.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {artwork.student?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                          <p className="text-xs text-gray-600 truncate">{artwork.student?.name}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="group bg-white border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-0">
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
                      
                      {/* Instagram-style Actions */}
                      <div className="absolute top-2 right-2 opacity-100 transition-opacity duration-300">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditStudent(student)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-700" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-center mb-2 text-gray-900">{student.name}</h3>
                      <div className="text-center text-sm text-gray-600 mb-3">
                        <p>NIS: {student.nis}</p>
                        <p>{student.class} • {student.grade}</p>
                      </div>
                      <div className="text-center mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {student._count?.artworks || 0} artworks
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={() => handleViewStudentArtworks(student)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Gallery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'artworks' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork) => (
                <Card key={artwork.id} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
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
                    
                    {/* Action Icons Below Image */}
                    <div className="flex items-center justify-between p-4 pt-0">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleViewArtworkDetail(artwork.id.toString())}
                          className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="text-sm font-medium">View</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {artwork.student?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{artwork.student?.name}</p>
                            <p className="text-xs text-gray-600">{artwork.student?.class} • {artwork.student?.grade}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{artwork.subject}</Badge>
                      </div>
                      
                      <h3 className="text-sm font-semibold mb-1 text-gray-900 line-clamp-2">{artwork.title}</h3>
                      {artwork.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-3">{artwork.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{artwork.yearCreated}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditArtwork(artwork)}
                            className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <Edit className="w-3 h-3 text-gray-700" />
                          </button>
                          <button 
                            onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                            className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Instagram-style Right Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 min-h-screen">
          <div className="p-6 space-y-6">
            {/* Profile Section */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                A
              </div>
              <h3 className="font-semibold text-gray-900">Admin User</h3>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 text-gray-900 font-medium">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </Link>
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-600 font-medium">
                <Home className="w-5 h-5" />
                View Gallery
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-600 font-medium">
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </nav>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 text-gray-900">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Students</span>
                  <span className="font-semibold text-gray-900">{stats.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Artworks</span>
                  <span className="font-semibold text-gray-900">{stats.totalArtworks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subjects</span>
                  <span className="font-semibold text-gray-900">{stats.totalSubjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Artworks</span>
                  <span className="font-semibold text-gray-900">{stats.recentArtworks}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 text-gray-900">Recent Activity</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {artworks.slice(0, 5).map((artwork) => (
                  <div key={artwork.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {artwork.student?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                      <p className="text-xs text-gray-600 truncate">{artwork.student?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Right Side */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Sidebar Content - Right Side */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6 space-y-6 h-full overflow-y-auto">
              {/* Close Button */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Menu</h3>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Profile Section */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  A
                </div>
                <h3 className="font-semibold text-gray-900">Admin User</h3>
                <p className="text-sm text-gray-600">Administrator</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 text-gray-900 font-medium">
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-600 font-medium">
                  <Home className="w-5 h-5" />
                  View Gallery
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-600 font-medium">
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </nav>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-gray-900">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Students</span>
                    <span className="font-semibold text-gray-900">{stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Artworks</span>
                    <span className="font-semibold text-gray-900">{stats.totalArtworks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subjects</span>
                    <span className="font-semibold text-gray-900">{stats.totalSubjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Artworks</span>
                    <span className="font-semibold text-gray-900">{stats.recentArtworks}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-gray-900">Recent Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {artworks.slice(0, 5).map((artwork) => (
                    <div key={artwork.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {artwork.student?.name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                        <p className="text-xs text-gray-600 truncate">{artwork.student?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-nis">NIS</Label>
              <Input
                id="edit-nis"
                value={newStudent.nis}
                onChange={(e) => setNewStudent({...newStudent, nis: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-class">Class</Label>
              <Input
                id="edit-class"
                value={newStudent.class}
                onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-grade">Grade</Label>
              <Select value={newStudent.grade} onValueChange={(value) => setNewStudent({...newStudent, grade: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMP">SMP</SelectItem>
                  <SelectItem value="SMA">SMA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-photoUrl">Photo</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-photoUrl"
                    value={newStudent.photoUrl || ''}
                    onChange={(e) => setNewStudent({...newStudent, photoUrl: e.target.value})}
                    placeholder="Enter photo URL or upload new file"
                    className="flex-1"
                  />
                  <div className="text-xs text-gray-500">atau</div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="edit-photoFile"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          const url = await handleFileUpload(file)
                          setNewStudent({...newStudent, photoUrl: url})
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to upload photo",
                            variant: "destructive"
                          })
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-photoFile"
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-4"
                  >
                    {uploadingFile ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Mengupload...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Klik untuk upload foto baru</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF maks. 5MB</span>
                      </>
                    )}
                  </label>
                  {newStudent.photoUrl && (
                    <div className="mt-2">
                      <img
                        src={newStudent.photoUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateStudent} className="flex-1">
                Update Student
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingStudent(null)
                setNewStudent({ name: '', nis: '', class: '', grade: '', photoUrl: '' })
                setIsEditStudentOpen(false)
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Artwork Dialog */}
      <Dialog open={isEditArtworkOpen} onOpenChange={setIsEditArtworkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Artwork</DialogTitle>
            <DialogDescription>Update artwork information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={newArtwork.title}
                onChange={(e) => setNewArtwork({...newArtwork, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newArtwork.description}
                onChange={(e) => setNewArtwork({...newArtwork, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-photoUrl">Photo</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-photoUrl"
                    value={newArtwork.photoUrl}
                    onChange={(e) => setNewArtwork({...newArtwork, photoUrl: e.target.value})}
                    placeholder="Enter photo URL or upload new file"
                    className="flex-1"
                  />
                  <div className="text-xs text-gray-500">atau</div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="edit-photoFile"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          const url = await handleFileUpload(file)
                          setNewArtwork({...newArtwork, photoUrl: url})
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to upload photo",
                            variant: "destructive"
                          })
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-photoFile"
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-4"
                  >
                    {uploadingFile ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Mengupload...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Klik untuk upload foto baru</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF maks. 5MB</span>
                      </>
                    )}
                  </label>
                  {newArtwork.photoUrl && (
                    <div className="mt-2">
                      <img
                        src={newArtwork.photoUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-yearCreated">Year Created</Label>
              <Input
                id="edit-yearCreated"
                type="number"
                value={newArtwork.yearCreated}
                onChange={(e) => setNewArtwork({...newArtwork, yearCreated: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">Subject</Label>
              <Select value={newArtwork.subject} onValueChange={(value) => setNewArtwork({...newArtwork, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Art & Craft">Art & Craft</SelectItem>
                  <SelectItem value="Painting">Painting</SelectItem>
                  <SelectItem value="Drawing">Drawing</SelectItem>
                  <SelectItem value="Sculpture">Sculpture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-studentId">Student</Label>
              <Select value={newArtwork.studentId.toString()} onValueChange={(value) => setNewArtwork({...newArtwork, studentId: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateArtwork} className="flex-1">
                Update Artwork
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingArtwork(null)
                setNewArtwork({
                  title: '',
                  description: '',
                  photoUrl: '',
                  yearCreated: new Date().getFullYear(),
                  subject: 'Art & Craft',
                  studentId: 0
                })
                setIsEditArtworkOpen(false)
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instagram-style Student Artworks Dialog */}
      <Dialog open={isStudentArtworksOpen} onOpenChange={setIsStudentArtworksOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedStudentData?.photoUrl ? (
                <img
                  src={selectedStudentData.photoUrl}
                  alt={selectedStudentData?.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold ${selectedStudentData?.photoUrl ? 'hidden' : ''}`}>
                {selectedStudentData?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <DialogTitle className="text-xl text-gray-900">{selectedStudentData?.name}'s Gallery</DialogTitle>
                <DialogDescription className="text-gray-600">
                  NIS: {selectedStudentData?.nis} • {selectedStudentData?.class} • {selectedStudentData?.grade}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artworks.filter(artwork => artwork.studentId === selectedStudentData?.id).map((artwork) => (
              <div key={artwork.id}>
                <div className="bg-white border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
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
                  
                  {/* Action Icons Below Image */}
                  <div className="flex items-center justify-between p-4 pt-0">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleViewArtworkDetail(artwork.id.toString())}
                        className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm font-medium">View</span>
                      </button>
                      <button 
                        onClick={() => handleEditArtwork(artwork)}
                        className="flex items-center gap-1 text-gray-700 hover:text-green-500 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                        className="flex items-center gap-1 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {artwork.student?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{artwork.student?.name}</p>
                          <p className="text-xs text-gray-600">{artwork.student?.class} • {artwork.student?.grade}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{artwork.subject}</Badge>
                    </div>
                    
                    <h3 className="text-sm font-semibold mb-1 text-gray-900 line-clamp-2">{artwork.title}</h3>
                    {artwork.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-3">{artwork.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{artwork.yearCreated}</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditArtwork(artwork)}
                          className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Edit className="w-3 h-3 text-gray-700" />
                        </button>
                        <button 
                          onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                          className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {deleteConfirm?.type === 'student' ? 'siswa' : 'karya seni'} ini?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">
                <strong>{deleteConfirm?.name}</strong>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={deleteConfirm?.type === 'student' ? handleConfirmDeleteStudent : handleConfirmDeleteArtwork}
                className="flex-1"
              >
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        isOpen={isArtworkDetailOpen}
        onClose={() => setIsArtworkDetailOpen(false)}
        artworkId={selectedArtworkId}
      />

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
                      <ImageIcon className="h-4 w-4 text-green-600" />
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
                  {students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.class}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}