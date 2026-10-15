'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Edit,
  Heart,
  ShoppingBag,
  MessageCircle,
  Award,
  Loader2
} from 'lucide-react'
import { useGetCurrentUserQuery } from '@/services/redux/api/authApi'

export default function ViewProfile () {
  const router = useRouter()
  const { data, isLoading, isError, refetch } =
    useGetCurrentUserQuery('ecommerce_buyer')
  const user = data?.user

  // Refetch when component mounts to ensure fresh data after navigation
  useEffect(() => {
    refetch()
  }, [refetch])

  // Format join date
  const joinDate = useMemo(() => {
    if (!user || !user.createdAt) return 'Unknown'
    const date = new Date(user.createdAt)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [user])

  // Format location
  const location = useMemo(() => {
    if (!user) return ''
    const parts = [user.city, user.state].filter(Boolean)
    return parts.length > 0
      ? parts.join(', ')
      : user.location || 'Location not set'
  }, [user])

  // Format full name
  const fullName = useMemo(() => {
    if (!user) return 'Your Name'
    return (
      user.name ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      'Your Name'
    )
  }, [user])

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
      </div>
    )
  }

  // Error state
  if (isError || !user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>
            {isError ? 'Failed to load profile' : 'Profile not found'}
          </p>
          <Button 
            className="text-white"
            style={{ backgroundColor: '#ef864c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const avatar =
    user.avatar || user.name?.charAt(0) || user.email?.charAt(0) || 'U'
  const bio = user.bio || 'Add a bio to tell others more about yourself.'
  const rating = user.rating || (user.profiles as { ecommerce_buyer?: { rating?: number } })?.ecommerce_buyer?.rating || 0

  // Mock stats for now (can be replaced with real API calls later)
  const stats = {
    totalOrders: 0, // TODO: Fetch from orders API
    wishlisted: 0, // TODO: Fetch from wishlist API
    activeChats: 0, // TODO: Fetch from messages API
    rating: rating
  }

  return (
    <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div>
            {/* Profile Header Card */}
            <div className='bg-white rounded-2xl border border-border overflow-hidden mb-8 shadow-sm'>
              {/* Banner */}
              <div className='h-32' style={{ backgroundColor: '#0f4656' }}></div>

              {/* Profile Info */}
              <div className='px-6 pb-6 relative'>
                <div className='flex items-start justify-between -mt-16 mb-6'>
                  <div className='flex items-center gap-6'>
                    {user.avatar &&
                    (user.avatar.startsWith('http') ||
                      user.avatar.startsWith('https') ||
                      user.avatar.startsWith('data:')) ? (
                      <div className='w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatar}
                          alt={fullName}
                          className='w-full h-full object-cover'
                          key={user.avatar}
                        />
                      </div>
                    ) : (
                      <div className='w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center text-6xl' style={{ backgroundColor: '#0f4656' }}>
                        <span className='text-white font-bold'>{avatar}</span>
                      </div>
                    )}
                    <div className='pb-4'>
                      <div className="flex items-center gap-2">
                        <h1 className='text-2xl md:text-3xl font-heading font-bold' style={{ color: '#ffffff' }}>
                          {fullName}
                        </h1>
                        {user?.verificationStatus === "approved" && (
                          <span
                            className="inline-flex items-center"
                            title="Verified User"
                          >
                            <svg
                             className="w-6 h-6 text-blue-500 dark:text-blue-400"
                             
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className='text-foreground/60 flex items-center gap-2 mt-2'>
                        <Calendar className='w-4 h-4' style={{ color: '#ef864c' }} />
                        Joined {joinDate}
                      </p>
                    </div>
                  </div>
                  <Button
                    className='gap-2 mt-4 text-white'
                    style={{ backgroundColor: '#ef864c' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                    onClick={() => router.push('/ecommerce/buyer/profile/edit')}
                  >
                    <Edit className='w-4 h-4' />
                    Edit Profile
                  </Button>
                </div>

                {/* Bio */}
                <p className='text-foreground/60 mb-6 max-w-2xl'>{bio}</p>

                {/* Contact Info */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center gap-3 text-sm'>
                    <Mail className='w-5 h-5' style={{ color: '#ef864c' }} />
                    <span className='text-foreground'>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className='flex items-center gap-3 text-sm'>
                      <Phone className='w-5 h-5' style={{ color: '#ef864c' }} />
                      <span className='text-foreground'>{user.phone}</span>
                    </div>
                  )}
                  {location && (
                    <div className='flex items-center gap-3 text-sm col-span-2'>
                      <MapPin className='w-5 h-5' style={{ color: '#ef864c' }} />
                      <span className='text-foreground'>{location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <ShoppingBag className='w-5 h-5' style={{ color: '#0f4656' }} />
                </div>
                <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>
                  Total Orders
                </p>
                <p className='text-3xl font-heading font-bold' style={{ color: '#0f4656' }}>
                  {stats.totalOrders}
                </p>
              </div>

              <div className='bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <Heart className='w-5 h-5' style={{ color: '#ef864c' }} />
                </div>
                <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>Wishlisted</p>
                <p className='text-3xl font-heading font-bold' style={{ color: '#ef864c' }}>
                  {stats.wishlisted}
                </p>
              </div>

              <div className='bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <MessageCircle className='w-5 h-5' style={{ color: '#0f4656' }} />
                </div>
                <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>
                  Active Chats
                </p>
                <p className='text-3xl font-heading font-bold' style={{ color: '#0f4656' }}>
                  {stats.activeChats}
                </p>
              </div>

              <div className='bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <Award className='w-5 h-5' style={{ color: '#ef864c' }} />
                </div>
                <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>Rating</p>
                <div className='flex items-center gap-2'>
                  <Star className='w-5 h-5 fill-current' style={{ color: '#ef864c' }} />
                  <p className='text-3xl font-heading font-bold' style={{ color: '#ef864c' }}>
                    {stats.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
      </div>
    </div>
  )
}
