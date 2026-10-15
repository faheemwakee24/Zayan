'use client'

import { Card } from '@/RealEstate/components/ui/card'
import { Button } from '@/RealEstate/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  MessageSquare,
  Share2,
  Phone,
  ArrowLeft,
  Loader2,
  BadgeCheck,
  ExternalLink
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { LandingLayout } from '@/RealEstate/components/LandingLayout'
import { BuyerDashboardLayout } from '@/RealEstate/components/BuyerDashboardLayout'
import {
  useGetPropertyByIdForBuyerQuery,
  useGetPropertiesBySellerIdQuery,
  useGetSellerProfileByIdQuery
} from '@/services/redux/api/propertyApi'
import { useGetCurrentUserQuery } from '@/services/redux/api/authApi'
import { useStartConversationMutation } from '@/services/redux/api/chatApi'
import { ChatAssistant } from '@/components/ai/ChatAssistant'
import { DescriptionWithSeeMore } from '@/components/DescriptionWithSeeMore'
import { useTrackPageView, useAnalytics } from '@/hooks/useAnalytics'
import { useTrackItemView } from '@/hooks/useBehaviorTracking'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface PropertyDetailProps {
  propertyId: string
}

export default function PropertyDetail ({ propertyId }: PropertyDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: currentUserData } = useGetCurrentUserQuery('realestate_buyer')
  const [startConversation, { isLoading: isStartingConversation }] =
    useStartConversationMutation()
  const { data, isLoading, isError, error } =
    useGetPropertyByIdForBuyerQuery(propertyId)

  // Get seller ID from property data (will be used after data loads)
  const sellerId =
    data?.property?.owner?._id || data?.property?.owner?.toString() || ''

  // Fetch seller's properties count (only if sellerId exists)
  const { data: sellerPropertiesData } = useGetPropertiesBySellerIdQuery(
    sellerId || '',
    {
      skip: !sellerId
    }
  )

  // Fetch seller profile data (only if sellerId exists)
  const { data: sellerProfileData } = useGetSellerProfileByIdQuery(
    { id: sellerId, role: 'realestate_seller' },
    { skip: !sellerId }
  )

  // Format property data (with fallbacks for loading state)
  const propertyData = data?.property

  const property = propertyData
    ? {
        id: propertyData._id,
        title: propertyData.title,
        location:
          propertyData.location ||
          `${propertyData.city || ''}, ${propertyData.state || ''}`,
        price: `$${(propertyData.price / 1000000).toFixed(1)}M`,
        beds: propertyData.beds,
        baths: propertyData.baths,
        sqft:
          typeof propertyData.sqft === 'number'
            ? propertyData.sqft.toLocaleString()
            : propertyData.sqft,
        yearBuilt: propertyData.yearBuilt,
        images:
          propertyData.images && propertyData.images.length > 0
            ? propertyData.images
            : [
                'https://images.unsplash.com/photo-1512917774080-9b274b1a9c7d?w=800&h=600&fit=crop'
              ],
        description: propertyData.description || 'No description available.',
        amenities: propertyData.amenities || []
      }
    : {
        id: '',
        title: '',
        location: '',
        price: '$0',
        beds: 0,
        baths: 0,
        sqft: '0',
        yearBuilt: 0,
        images: [
          'https://images.unsplash.com/photo-1512917774080-9b274b1a9c7d?w=800&h=600&fit=crop'
        ],
        description: '',
        amenities: []
      }

  // Track page view
  useTrackPageView('property', propertyData?._id || '')
  
  // Track behavior for marketplace intelligence
  useTrackItemView('property', propertyData?._id, !!propertyData?._id)
  
  const { track } = useAnalytics()

  // All hooks must be called before any conditional returns
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Compute mainImage from selected index
  const mainImage = useMemo(() => {
    const images = propertyData?.images || property.images || []
    return (
      images[selectedImageIndex] ||
      images[0] ||
      'https://images.unsplash.com/photo-1512917774080-9b274b1a9c7d?w=800&h=600&fit=crop'
    )
  }, [propertyData?.images, property.images, selectedImageIndex])

  const owner = propertyData?.owner || {}
  const sellerPropertiesCount =
    sellerPropertiesData?.count || sellerPropertiesData?.properties?.length || 0
  const sellerProfile = sellerProfileData?.profile
  const sellerAverageResponseMinutes =
    (sellerProfile as { averageResponseMinutes?: number | null } | undefined)
      ?.averageResponseMinutes ?? null

  // Use seller profile data if available, otherwise fallback to owner data from property
  const sellerName = sellerProfile
    ? `${sellerProfile.firstName || ''} ${
        sellerProfile.lastName || ''
      }`.trim() || 'Unknown Seller'
    : owner?.name || 'Unknown Seller'
  const sellerAvatar =
    sellerProfile?.avatar || owner?.avatar || sellerName?.charAt(0) || 'U'
  const sellerRating = sellerProfile?.rating || owner?.rating || 0
  const sellerPhone = sellerProfile?.phone || owner?.phone || ''
  const sellerEmail = sellerProfile?.email || owner?.email || ''
  const sellerBio = sellerProfile?.bio || 'Property seller'
  const sellerIsVerified = (sellerProfile as { verificationStatus?: string })?.verificationStatus === 'approved' || false

  const ownerId = (owner as { _id?: string | { toString: () => string } })?._id
  const resolvedSellerId =
    (typeof ownerId === 'string'
      ? ownerId
      : typeof ownerId === 'object' && ownerId && 'toString' in ownerId
      ? ownerId.toString()
      : undefined) ||
    sellerProfile?.id ||
    ''

  const formatResponseTime = (minutes: number | null | undefined) => {
    if (minutes == null || !Number.isFinite(minutes)) return null
    if (minutes < 1) return '< 1 min'
    if (minutes < 60)
      return `${Math.round(minutes)} min${minutes >= 2 ? 's' : ''}`
    const hours = minutes / 60
    if (hours < 24) return `${Math.round(hours)} hr${hours >= 2 ? 's' : ''}`
    const days = hours / 24
    return `${Math.round(days)} day${days >= 2 ? 's' : ''}`
  }

  const sellerResponseTime =
    formatResponseTime(sellerAverageResponseMinutes) ?? '< 24 hours'

  const seller = {
    id: resolvedSellerId,
    name: sellerName,
    avatar: sellerAvatar,
    rating: sellerRating,
    reviews: 0, // Estimate reviews based on properties
    properties: sellerPropertiesCount,
    description: sellerBio,
    phone: sellerPhone,
    email: sellerEmail,
    response_time: sellerResponseTime,
    image: sellerAvatar,
    isVerified: sellerIsVerified
  }

  const currentUserId = currentUserData?.user?._id
  const isOwnProperty = Boolean(
    currentUserId && seller.id && currentUserId === seller.id
  )


  return (
    <BuyerDashboardLayout>
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='min-h-screen w-full bg-background flex items-center justify-center'>
              <div className='flex flex-col items-center gap-3 text-foreground/60'>
                <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
                <p>Loading property details...</p>
              </div>
            </div>
          ) : isError ? (
            <div className='min-h-screen bg-background'>
              <div className='  mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
                  <h3 className='text-xl font-bold text-red-700 mb-2'>
                    Error loading property
                  </h3>
                  <p className='text-red-600 mb-4'>
                    {(error as { data?: { message?: string } })?.data
                      ?.message ||
                      (error as Error)?.message ||
                      'Unable to load property details. Please try again.'}
                  </p>
                  <Link href='/real-estate/buyer/properties'>
                    <Button variant='outline'>Back to Properties</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className='space-y-8'>
                {/* Back Button */}
                <Link
                  href='/real-estate/buyer/properties'
                  className='inline-flex items-center gap-2 font-semibold'
                  style={{ color: '#ef864c' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}
                >
                  <ArrowLeft className='w-4 h-4' />
                  Back to Properties
                </Link>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  {/* Left - Images & Details */}
                  <div className='lg:col-span-2 space-y-6'>
                    {/* Main Image */}
                    <Card className='overflow-hidden'>
                      <div className='relative h-96 bg-foreground/5'>
                        <Image
                          src={mainImage}
                          alt='Property'
                          fill
                          className='object-cover'
                          sizes='(max-width: 1024px) 100vw, 66vw'
                        />
                        <div className='absolute top-4 left-4 text-white px-4 py-2 rounded-lg font-semibold' style={{ backgroundColor: '#ef864c' }}>
                          Featured
                        </div>
                      </div>
                    </Card>

                    {/* Image Gallery */}
                    <div className='flex gap-2 overflow-x-auto'>
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className='flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent transition-colors relative'
                          style={selectedImageIndex === index ? { borderColor: '#ef864c' } : {}}
                          onMouseEnter={(e) => {
                            if (selectedImageIndex !== index) {
                              e.currentTarget.style.borderColor = '#ef864c'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedImageIndex !== index) {
                              e.currentTarget.style.borderColor = 'transparent'
                            }
                          }}
                        >
                          <Image
                            src={image}
                            alt={`View ${index + 1}`}
                            fill
                            className='object-cover'
                            sizes='80px'
                          />
                        </button>
                      ))}
                    </div>

                    {/* Property Info */}
                    <Card className='p-6'>
                      <h1 className='text-3xl font-bold mb-4' style={{ color: '#0f4656' }}>
                        {property.title}
                      </h1>
                      <p className='text-foreground/60 text-lg mb-6 flex items-center gap-2'>
                        <MapPin className='w-5 h-5' style={{ color: '#ef864c' }} />
                        {property.location}
                      </p>

                      <p className='text-4xl font-bold mb-6' style={{ color: '#0f4656' }}>
                        {property.price}
                      </p>

                      {/* Features Grid */}
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-border'>
                        <div className='text-center'>
                          <div className='flex items-center justify-center gap-2 mb-1'>
                            <Bed className='w-5 h-5' style={{ color: '#ef864c' }} />
                            <span className='text-2xl font-bold' style={{ color: '#0f4656' }}>
                              {property.beds}
                            </span>
                          </div>
                          <p className='text-xs text-foreground/60'>Bedrooms</p>
                        </div>
                        <div className='text-center'>
                          <div className='flex items-center justify-center gap-2 mb-1'>
                            <Bath className='w-5 h-5' style={{ color: '#ef864c' }} />
                            <span className='text-2xl font-bold' style={{ color: '#0f4656' }}>
                              {property.baths}
                            </span>
                          </div>
                          <p className='text-xs text-foreground/60'>
                            Bathrooms
                          </p>
                        </div>
                        <div className='text-center'>
                          <div className='flex items-center justify-center gap-2 mb-1'>
                            <Square className='w-5 h-5' style={{ color: '#ef864c' }} />
                            <span className='text-2xl font-bold' style={{ color: '#0f4656' }}>
                              {property.sqft}
                            </span>
                          </div>
                          <p className='text-xs text-foreground/60'>Sq Ft</p>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold mb-1' style={{ color: '#0f4656' }}>
                            {property.yearBuilt}
                          </div>
                          <p className='text-xs text-foreground/60'>
                            Year Built
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className='space-y-4'>
                        <h3 className='text-lg font-bold' style={{ color: '#0f4656' }}>
                          About this property
                        </h3>
                        <DescriptionWithSeeMore
                          description={property.description || ""}
                          textClassName='text-foreground/70 leading-relaxed'
                        />
                      </div>
                    </Card>

                    {/* Location Card */}
                    <Card className='p-6'>
                      <h2 className='text-lg font-bold mb-6' style={{ color: '#0f4656' }}>
                        Location
                      </h2>

                      <div
                        className='location__map__preview cursor-pointer'
                        onClick={() => {
                          const address =
                            propertyData?.location ||
                            (propertyData?.city && propertyData?.state
                              ? `${propertyData.city}, ${propertyData.state}`
                              : property.location || '')

                          if (!address) return

                          const encodedAddress = encodeURIComponent(address)
                          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
                          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
                        }}
                      >
                        <div className='location__map__content relative'>
                          <div className='location__map__background rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900'>
                            <iframe
                              title='property-location-map'
                              src={`https://www.google.com/maps?q=${encodeURIComponent(
                                propertyData?.location ||
                                  (propertyData?.city && propertyData?.state
                                    ? `${propertyData.city}, ${propertyData.state}`
                                    : property.location || '') || ''
                              )}&output=embed`}
                          style={{
                                border: 0,
                                width: '100%',
                                height: '320px',
                                borderRadius: '16px'
                              }}
                              allowFullScreen
                              loading='lazy'
                              referrerPolicy='no-referrer-when-downgrade'
                            ></iframe>
                          </div>
                        </div>
                        
                        {/* Overlay with address + button (same style as seller detail) */}
                        <div className='location__map__overlay mt-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-4 py-3 rounded-2xl text-white'>
                          <div className='location__address__container flex items-start gap-3'>
                            <div className='location__icon__wrapper mt-1'>
                              <MapPin className='w-5 h-5 text-white' />
                              </div>
                            <div className='location__address__text'>
                              <p className='location__address__label text-xs uppercase tracking-wide opacity-80'>
                                  Property Address
                                </p>
                              <p className='location__address__value text-sm md:text-base font-semibold'>
                                  {propertyData?.location || 
                                   (propertyData?.city && propertyData?.state 
                                     ? `${propertyData.city}, ${propertyData.state}` 
                                     : property.location || 'Address not available')}
                                </p>
                            </div>
                          </div>
                          
                            <Button
                            className='location__view__map__button bg-white text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm'
                            onClick={e => {
                              e.stopPropagation()
                              const address =
                                  propertyData?.location || 
                                  (propertyData?.city && propertyData?.state 
                                    ? `${propertyData.city}, ${propertyData.state}` 
                                    : property.location || '')
                              if (!address) return
                              const encodedAddress = encodeURIComponent(address)
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
                              window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
                              }}
                            >
                              <ExternalLink className='w-4 h-4' />
                            <span>Open in Google Maps</span>
                            </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Amenities Card */}
                    {property.amenities && property.amenities.length > 0 && (
                      <Card className='p-6'>
                        <h3 className='text-lg font-bold mb-4' style={{ color: '#0f4656' }}>
                          Amenities
                        </h3>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                          {property.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className='rounded-lg p-3 text-center text-sm font-medium'
                              style={{ backgroundColor: '#ef864c20', color: '#0f4656' }}
                            >
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Right - Seller Info */}
                  <div className='space-y-6'>
                    {/* Seller Card */}
                    <Card className='p-6'>
                      <h3 className='text-lg font-bold mb-4' style={{ color: '#0f4656' }}>
                        Seller Information
                      </h3>

                      {/* Seller Profile */}
                      <div className='text-center mb-6'>
                        {seller.image && seller.image.startsWith('http') ? (
                          <div className='w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/20'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={seller.image}
                              alt={seller.name}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        ) : (
                          <div className='w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center' style={{ backgroundColor: '#ef864c' }}>
                            <span className='text-lg font-bold text-white'>
                              {seller.avatar}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center justify-center gap-2'>
                          <h4 className='text-lg font-bold' style={{ color: '#0f4656' }}>
                            {seller.name}
                          </h4>
                          {sellerIsVerified && (
                            <span
                              className="inline-flex items-center"
                              title="Verified User"
                            >
                              <svg
                                className="w-5 h-5 text-blue-500 dark:text-blue-400"
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
                        <p className='text-xs text-foreground/60 mt-1'>
                          {seller.description}
                        </p>
                      </div>

                      {/* Ratings */}
                      <div className='grid grid-cols-3 gap-2 mb-6 pb-6 border-b border-border text-center'>
                        <div>
                          <div className='flex items-center justify-center gap-1 mb-1'>
                            <Star className='w-4 h-4 fill-accent' style={{ color: '#ef864c' }} />
                            <span className='font-bold' style={{ color: '#0f4656' }}>
                              {seller.rating}
                            </span>
                          </div>
                          <p className='text-xs text-foreground/60'>Rating</p>
                        </div>
                        <div>
                          <div className='font-bold mb-1' style={{ color: '#0f4656' }}>
                            {seller.reviews}
                          </div>
                          <p className='text-xs text-foreground/60'>Reviews</p>
                        </div>
                        <div>
                          <div className='font-bold mb-1' style={{ color: '#0f4656' }}>
                            {seller.properties}
                          </div>
                          <p className='text-xs text-foreground/60'>
                            Properties
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className='space-y-3 mb-6'>
                        <div className='text-sm'>
                          <p className='text-foreground/60 mb-1'>
                            Response Time
                          </p>
                          <p className='font-semibold' style={{ color: '#0f4656' }}>
                            {seller.response_time}
                          </p>
                        </div>
                        <div className='text-sm'>
                          <p className='text-foreground/60 mb-1'>Phone</p>
                          <p className='font-semibold' style={{ color: '#0f4656' }}>
                            {seller.phone}
                          </p>
                        </div>
                        <div className='text-sm'>
                          <p className='text-foreground/60 mb-1'>Email</p>
                          <p className='font-semibold text-xs' style={{ color: '#0f4656' }}>
                            {seller.email}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className='space-y-3'>
                        <Link
                          href={`/real-estate/buyer/seller-profile/${seller.id}`}
                          className='block'
                        >
                          <Button
                            variant='outline'
                            className='w-full border-2 hover:bg-primary/10'
                            style={{ color: '#ef864c', borderColor: '#ef864c' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef864c20'
                              e.currentTarget.style.color = '#d9723f'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = ''
                              e.currentTarget.style.color = '#ef864c'
                            }}
                          >
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          className='w-full text-white hover:opacity-90'
                          style={{ backgroundColor: '#ef864c' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                          onClick={async () => {
                            if (isOwnProperty) {
                              toast({
                                title: 'This is your property',
                                description:
                                  'You cannot start a conversation with yourself.',
                                variant: 'destructive'
                              })
                              return
                            }
                            if (!currentUserData?.user?._id) {
                              toast({
                                title: 'Login required',
                                description:
                                  'Sign in as a buyer to contact sellers.',
                                variant: 'destructive'
                              })
                              router.push('/login')
                              return
                            }

                            if (!seller.id || !property.id) {
                              toast({
                                title: 'Missing seller information',
                                description:
                                  "We couldn't find the seller record for this property.",
                                variant: 'destructive'
                              })
                              return
                            }

                            try {
                              // Track chat started event
                              if (propertyData?._id) {
                                track('chat_started', 'property', propertyData._id, {
                                  sellerId: seller.id,
                                  timestamp: new Date().toISOString(),
                                })
                              }

                              const response = await startConversation({
                                buyerId: currentUserData.user._id,
                                sellerId: seller.id,
                                propertyId: property.id
                              }).unwrap()

                              toast({
                                title: 'Conversation ready',
                                description:
                                  'Continue the chat from your inbox.'
                              })

                              router.push(
                                `/real-estate/buyer/messages/${response.conversation.id}`
                              )
                            } catch (chatError) {
                              console.error(chatError)
                              toast({
                                title: 'Unable to start chat',
                                description: 'Please try again in a moment.',
                                variant: 'destructive'
                              })
                            }
                          }}
                          disabled={isStartingConversation || isOwnProperty}
                        >
                          {isStartingConversation ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <MessageSquare className='mr-2 h-4 w-4' />
                              {isOwnProperty
                                ? 'This is your property'
                                : 'Send Message'}
                            </>
                          )}
                        </Button>
                        <Button variant='outline' className='w-full'>
                          <Phone className='w-4 h-4 mr-2' />
                          Call
                        </Button>
                      </div>
                    </Card>

                    {/* Share */}
                    <Card className='p-6'>
                      <h3 className='text-lg font-bold mb-4' style={{ color: '#0f4656' }}>
                        Share this property
                      </h3>
                      <Button variant='outline' className='w-full'>
                        <Share2 className='w-4 h-4 mr-2' />
                        Share
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}
        {/* AI Chat Assistant */}
        {propertyData && (
          <ChatAssistant
            itemType="property"
            itemInfo={{
              title: propertyData.title,
              description: propertyData.description,
              location: propertyData.location,
              city: propertyData.city,
              state: propertyData.state,
              price: propertyData.price,
              propertyType: propertyData.propertyType,
              beds: propertyData.beds,
              baths: propertyData.baths,
              sqft: propertyData.sqft,
              yearBuilt: propertyData.yearBuilt,
              amenities: propertyData.amenities || [],
            }}
          />
        )}
      </div>
    </BuyerDashboardLayout>
  )
}
