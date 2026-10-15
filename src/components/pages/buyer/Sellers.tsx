'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Search,
  Star,
  MapPin,
  Users,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useGetBuyerStoresQuery } from '@/services/redux/api/storeApi'
import type { BuyerStore } from '@/services/redux/api/storeApi'

type LocationFilter = 'all' | 'karachi' | 'lahore' | 'islamabad' | 'other'
type RatingFilter = 'all' | 4.5 | 4.0 | 3.5

export default function Sellers () {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'popular' | 'rating'>('popular')

  // Build API query params
  const apiParams = useMemo(() => {
    const params: {
      searchTerm?: string
      location?: string
      sortBy?: string
      order?: 'asc' | 'desc'
    } = {}

    if (searchQuery) {
      params.searchTerm = searchQuery
    }

    if (locationFilter !== 'all') {
      // Map filter to location search term
      if (locationFilter === 'karachi') params.location = 'Karachi'
      else if (locationFilter === 'lahore') params.location = 'Lahore'
      else if (locationFilter === 'islamabad') params.location = 'Islamabad'
    }

    // Map sortBy to API sortBy
    if (sortBy === 'popular') {
      params.sortBy = 'followers'
      params.order = 'desc'
    } else if (sortBy === 'rating') {
      params.sortBy = 'rating'
      params.order = 'desc'
    }

    return params
  }, [searchQuery, locationFilter, sortBy])

  // Fetch stores from API
  const {
    data: storesData,
    isLoading,
    isError,
    error
  } = useGetBuyerStoresQuery(apiParams)

  // Filter stores by rating (client-side since API doesn't support rating filter)
  const filteredStores = useMemo(() => {
    if (!storesData?.stores) return []

    let filtered = [...storesData.stores]

    // Apply rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(store => {
        const storeRating = store.rating || store.seller?.rating || 0
        return storeRating >= ratingFilter
      })
    }

    return filtered
  }, [storesData, ratingFilter])

  const getBadgeText = (rating: number) => {
    if (rating >= 4.8) return 'premium'
    if (rating >= 4.5) return 'trusted'
    if (rating >= 4.0) return 'new'
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
            <p className='text-foreground/60'>Loading stores...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <p className='text-red-500 mb-4'>
              {error && 'data' in error
                ? (error.data as { message?: string })?.message ||
                  'Failed to load stores'
                : 'Failed to load stores'}
            </p>
            <Button 
              className="text-white"
              style={{ backgroundColor: '#ef864c' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div>
            {/* Header */}
            <div className='rounded-sm mb-[20px] shadow-sm' style={{ backgroundColor: '#0f4656' }}>
              <div className='  mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <h1 className='text-2xl md:text-3xl font-heading font-bold mb-2' style={{ color: '#ffffff' }}>
                  Browse Stores
                </h1>
                <p style={{ color: '#ffffff80' }}>
                  Discover trusted seller{"'"}s stores and explore their products
                </p>
              </div>
            </div>
            {/* Search & Filters Bar */}
            <div className='mb-8 space-y-4'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5' style={{ color: '#ef864c' }} />
                <input
                  type='text'
                  placeholder='Search sellers by name...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors'
                  style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>

              {/* Filters Toggle & Controls */}
              <div className='flex flex-col md:flex-row gap-4 items-stretch md:items-center'>
                <Button
                  variant='outline'
                  className='gap-2'
                  style={{ borderColor: '#ef864c', color: '#ef864c' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef864c20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className='w-4 h-4' />
                  Filters
                  {(locationFilter !== 'all' || ratingFilter !== 'all') && (
                    <span className='text-white text-xs px-2 py-0.5 rounded-full ml-2' style={{ backgroundColor: '#ef864c' }}>
                      {[
                        locationFilter !== 'all' ? 1 : 0,
                        ratingFilter !== 'all' ? 1 : 0
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </Button>

                <div className='relative'>
                  <select
                    value={sortBy}
                    onChange={e =>
                      setSortBy(e.target.value as 'popular' | 'rating')
                    }
                    className='appearance-none px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white pr-10 transition-colors'
                    style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    <option value='popular'>Sort by: Most Popular</option>
                    <option value='rating'>Sort by: Highest Rated</option>
                  </select>
                  <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none' />
                </div>

                <div className='text-sm text-foreground/60'>
                  Showing {filteredStores.length}{' '}
                  {filteredStores.length === 1 ? 'store' : 'stores'}
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-border p-6 shadow-sm'>
                  {/* Location Filter */}
                  <div>
                    <label className='block text-base font-medium mb-3' style={{ color: '#0f4656' }}>
                      Location
                    </label>
                    <div className='space-y-2'>
                      {[
                        { value: 'all', label: 'All Locations' },
                        { value: 'karachi', label: 'Karachi' },
                        { value: 'lahore', label: 'Lahore' },
                        { value: 'islamabad', label: 'Islamabad' },
                        { value: 'other', label: 'Other Cities' }
                      ].map(location => (
                        <label
                          key={location.value}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <input
                            type='radio'
                            name='location'
                            value={location.value}
                            checked={locationFilter === location.value}
                            onChange={e =>
                              setLocationFilter(
                                e.target.value as LocationFilter
                              )
                            }
                            className='w-4 h-4'
                            style={{ accentColor: '#ef864c' }}
                          />
                          <span className='text-sm text-foreground'>
                            {location.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className='block text-base font-medium mb-3' style={{ color: '#0f4656' }}>
                      Minimum Rating
                    </label>
                    <div className='space-y-2'>
                      {[
                        { value: 'all', label: 'All Ratings' },
                        { value: 4.5, label: '4.5+ Stars' },
                        { value: 4.0, label: '4.0+ Stars' },
                        { value: 3.5, label: '3.5+ Stars' }
                      ].map(rating => (
                        <label
                          key={rating.value}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <input
                            type='radio'
                            name='rating'
                            value={rating.value}
                            checked={ratingFilter === rating.value}
                            onChange={e =>
                              setRatingFilter(
                                e.target.value === 'all'
                                  ? 'all'
                                  : (parseFloat(e.target.value) as RatingFilter)
                              )
                            }
                            className='w-4 h-4'
                          />
                          <span className='text-sm text-foreground'>
                            {rating.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stores Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredStores?.map((store: BuyerStore) => {
                const storeRating = store.rating || store.seller?.rating || 0
                const badge = getBadgeText(storeRating)
                const avatar = store.seller?.avatar || store.bannerImage || '🏪'

                return (
                  <div
                    key={store._id || store.id}
                    className='bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group shadow-sm'
                    style={{ '--hover-border-color': '#ef864c' } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    {/* Banner */}
                    <div className='h-24 relative overflow-hidden group-hover:scale-105 transition-transform duration-300' style={{ backgroundColor: '#0f4656' }}>
                      {store.bannerImage &&
                      store.bannerImage.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={store.bannerImage}
                          alt={store.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-4xl'>
                          {store.bannerImage || '🏪'}
                        </div>
                      )}
                      {badge && (
                        <div
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: '#ef864c' }}
                        >
                          {badge}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='px-6 pb-6 relative'>
                      {/* Avatar */}
                      <div className='flex items-end gap-4 -mt-8 mb-4'>
                        {avatar &&
                        (avatar.startsWith('http') ||
                          avatar.startsWith('https') ||
                          avatar.startsWith('data:')) ? (
                          <div className='w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatar}
                              alt={store.name}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        ) : (
                          <div className='w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-3xl'>
                            {avatar}
                          </div>
                        )}
                        {/* <button
                          className='ml-auto flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary-600 text-white transition-colors'
                          onClick={() =>
                            router.push(
                              `/ecommerce/buyer/messages?store=${
                                store._id || store.id
                              }`
                            )
                          }
                        >
                          <MessageCircle className='w-5 h-5' />
                        </button> */}
                      </div>

                      {/* Store Info */}
                      <h3 className='font-heading font-bold text-lg mb-1 transition-colors' style={{ color: '#0f4656' }}>
                        {store.name}
                      </h3>

                      {/* Rating */}
                      <div className='flex items-center gap-2 mb-3'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(storeRating)
                                ? 'fill-current'
                                : 'text-border'
                            }`}
                            style={i < Math.floor(storeRating) ? { color: '#ef864c' } : undefined}
                          />
                        ))}
                        <span className='text-sm font-bold' style={{ color: '#ef864c' }}>
                          {storeRating.toFixed(1)}
                        </span>
                      </div>

                      {/* Location */}
                      <div className='flex items-center gap-1 text-sm text-foreground/60 mb-4'>
                        <MapPin className='w-4 h-4' style={{ color: '#ef864c' }} />
                        {store.location}
                      </div>

                      {/* Stats */}
                      <div className='grid grid-cols-3 gap-3 mb-4 py-4 border-y border-border'>
                        <div className='text-center'>
                          <p className='text-lg font-bold' style={{ color: '#ef864c' }}>
                            {(store.products || 0).toLocaleString()}
                          </p>
                          <p className='text-xs text-foreground/60'>
                            Products
                          </p>
                        </div>
                        <div className='text-center'>
                          <p className='text-lg font-bold flex items-center justify-center gap-1' style={{ color: '#0f4656' }}>
                            <Users className='w-4 h-4' />
                            {(store.followers || 0).toLocaleString()}
                          </p>
                          <p className='text-xs text-foreground/60'>
                            Followers
                          </p>
                        </div>
                        <div className='text-center'>
                          <p className='text-lg font-bold' style={{ color: '#ef864c' }}>
                            {Math.round(storeRating * 20)}%
                          </p>
                          <p className='text-xs text-foreground/60'>
                            Rating
                          </p>
                        </div>
                      </div>

                      {/* Seller Info */}
                      {store?.seller && (
                        <div className='rounded-lg p-3 mb-4' style={{ backgroundColor: '#ef864c10' }}>
                          <p className='text-xs text-foreground/60'>
                            Seller:{' '}
                            <span className='font-bold' style={{ color: '#0f4656' }}>
                              {store.seller.name}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* View Store Button */}
                      <Button
                        className='w-full gap-2 text-white'
                        style={{ backgroundColor: '#ef864c' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                        onClick={() =>
                          router.push(
                            `/ecommerce/buyer/stores/${store._id || store.id}`
                          )
                        }
                      >
                        View Store
                        <ArrowRight className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {filteredStores.length === 0 && (
              <div className='text-center py-16'>
                <Search className='w-16 h-16 mx-auto mb-4 opacity-20' style={{ color: '#ef864c' }} />
                <h2 className='text-2xl font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                  No sellers found
                </h2>
                <p className='text-foreground/60 mb-6'>
                  Try adjusting your search or filters
                </p>
                <Button
                  variant='outline'
                  style={{ borderColor: '#ef864c', color: '#ef864c' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef864c20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => {
                    setSearchQuery('')
                    setLocationFilter('all')
                    setRatingFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
      </div>
    </div>
  )
}
