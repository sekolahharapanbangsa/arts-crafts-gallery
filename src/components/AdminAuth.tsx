'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Instagram, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AdminAuthProps {
  onAuthenticated: () => void
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Default password: "admin123" - can be changed via environment variable
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (password === ADMIN_PASSWORD) {
      toast({
        title: "Welcome back! 🎨",
        description: "Successfully logged into admin panel",
      })
      onAuthenticated()
    } else {
      setAttempts(prev => prev + 1)
      const remainingAttempts = 3 - (attempts + 1)
      
      if (remainingAttempts > 0) {
        toast({
          title: "Incorrect password",
          description: `${remainingAttempts} attempts remaining`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Access blocked",
          description: "Too many failed attempts. Please refresh the page.",
          variant: "destructive"
        })
      }
    }
    
    setIsLoading(false)
  }

  const isBlocked = attempts >= 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-orange-300 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Instagram-style Card */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Instagram-style Logo */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Instagram className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter password to access the gallery admin panel
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Admin Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading || isBlocked}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading || isBlocked}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
             
              {/* Attempts Warning */}
              {attempts > 0 && !isBlocked && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-full">
                    <Lock className="w-4 h-4" />
                    <span>{3 - attempts} attempts remaining</span>
                  </div>
                </div>
              )}

              {/* Blocked Message */}
              {isBlocked && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-full">
                    <Lock className="w-4 h-4" />
                    <span>Access blocked. Refresh page to try again.</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-medium shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || isBlocked || !password.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Access Admin Panel</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="text-center text-xs text-gray-500">
                <p>🔒 Secure admin access for Arts & Crafts Gallery</p>
                <p className="mt-1">Contact administrator if you forgot the password</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instagram-style Bottom Card */}
        <Card className="mt-4 bg-white/95 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have admin access?{' '}
              <a 
                href="/" 
                className="text-purple-500 hover:text-purple-600 font-medium hover:underline transition-colors"
              >
                Return to Gallery
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}