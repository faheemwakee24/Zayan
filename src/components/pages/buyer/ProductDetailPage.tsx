'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Heart,
  Star,
  MessageCircle,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Share2,
  Loader2
} from 'lucide-react'
import {
  useGetProductByIdForBuyerQuery,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useLikeProductMutation,
  useUnlikeProductMutation,
  type Review
} from '@/services/redux/api/productApi'
import { useGetStoreByIdForBuyerQuery } from '@/services/redux/api/storeApi'
import { useStartConversationMutation } from '@/services/redux/api/chatApi'
import { useGetCurrentUserQuery } from '@/services/redux/api/authApi'
import { ChatAssistant } from '@/components/ai/ChatAssistant'
import { DescriptionWithSeeMore } from '@/components/DescriptionWithSeeMore'
import { useTrackPageView, useAnalytics } from '@/hooks/useAnalytics'
import { useTrackItemView } from '@/hooks/useBehaviorTracking'
import { toast } from 'sonner'

export default function ProductDetailPage () {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  // Fetch product data
  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError: isProductError,
    error: productError,
    refetch: refetchProduct
  } = useGetProductByIdForBuyerQuery(id || '', {
    skip: !id
  })

  const product = productData?.product

  // Fetch reviews for this product
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    refetch: refetchReviews
  } = useGetProductReviewsQuery(id || '', {
    skip: !id
  })

  const reviews = reviewsData?.reviews || []

  // Create review mutation
  const [createReview, { isLoading: isSubmittingReview }] =
    useCreateProductReviewMutation()

  // Like/unlike mutations
  const [likeProduct, { isLoading: isLiking }] = useLikeProductMutation()
  const [unlikeProduct, { isLoading: isUnliking }] = useUnlikeProductMutation()

  // Get like status from product
  const isLiked = product?.isLiked || false
  const likesCount = product?.likes || 0

  // Track page view
  useTrackPageView('product', product?._id || '')
  
  // Track behavior for marketplace intelligence
  useTrackItemView('product', product?._id, !!product?._id)
  const { track } = useAnalytics()

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!id) return

    try {
      if (isLiked) {
        await unlikeProduct(id).unwrap()
        toast.success('Product unliked')
      } else {
        await likeProduct(id).unwrap()
        toast.success('Product liked')
      }
      // Refetch product to get updated like status
      refetchProduct()
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ||
            'Failed to update like status'
          : 'Failed to update like status'
      toast.error(errorMessage)
    }
  }

  // Get current user for chat
  const { data: currentUserData } = useGetCurrentUserQuery('ecommerce_buyer')
  const currentUserId = currentUserData?.user?._id

  // Resolve seller id for chat / ownership check
  const sellerId =
    typeof product?.owner === 'object'
      ? product.owner._id
      : typeof product?.owner === 'string'
      ? product.owner
      : ''
  const isOwnProduct =
    !!sellerId && !!currentUserId && sellerId === currentUserId

  // Start conversation mutation
  const [startConversation, { isLoading: isStartingConversation }] =
    useStartConversationMutation()

  // Get storeId from product or query params
  const storeIdFromProduct =
    product?.store && typeof product.store === 'object'
      ? product.store._id
      : typeof product?.store === 'string'
      ? product.store
      : ''
  const storeIdFromQuery = searchParams?.get('store')
  const effectiveStoreId = storeIdFromProduct || storeIdFromQuery || ''

  // Fetch store data
  const { data: storeData } = useGetStoreByIdForBuyerQuery(effectiveStoreId, {
    skip: !effectiveStoreId
  })

  const store = storeData?.store

  // Get images
  const images = product?.images || []
  const hasImages = images.length > 0

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex(prev => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  // Format product data
  const productRating = product?.rating || 0
  const categoryName =
    product?.category && typeof product.category === 'object'
      ? product.category.name
      : 'Uncategorized'
  const storeInfo =
    product?.store && typeof product.store === 'object' ? product.store : null
  const storeName = storeInfo ? storeInfo.name : 'Unknown Store'
  const storeLocation = storeInfo?.location || ''
  const storeRating = storeInfo?.rating ?? 0
  const currency = product?.currency || 'USD'
  const currencySymbol =
    currency === 'USD'
      ? '$'
      : currency === 'PKR'
      ? '₨'
      : currency === 'EUR'
      ? '€'
      : currency === 'GBP'
      ? '£'
      : '$'
  const unit = product?.unit || 'piece'
  const inStock = (product?.stock || 0) > 0
  const reviewsCount = product?.reviewsCount || reviews.length

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!id || !reviewRating) {
      toast.error('Please provide a rating')
      return
    }

    try {
      await createReview({
        id,
        payload: {
          rating: reviewRating,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim() || undefined
        }
      }).unwrap()

      toast.success('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewTitle('')
      setReviewComment('')
      setReviewRating(5)

      // Refetch product and reviews to update rating and reviews list
      await refetchProduct()
      await refetchReviews()
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ||
            'Failed to submit review'
          : 'Failed to submit review'
      toast.error(errorMessage)
    }
  }

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
            <p className='text-foreground/60'>Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isProductError || !product) {
    return (
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <p className='text-red-500 mb-4'>
              {productError && 'data' in productError
                ? (productError.data as { message?: string })?.message ||
                  'Failed to load product'
                : 'Product not found'}
            </p>
            <Button
              className="text-white"
              style={{ backgroundColor: '#ef864c' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
              onClick={() => router.push('/ecommerce/buyer/products')}
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div>
            {/* Breadcrumb */}
            <div className='flex items-center gap-2 mb-8 text-sm text-foreground/60'>
              {effectiveStoreId && store ? (
                <>
                  <button
                    onClick={() => router.push('/ecommerce/buyer/stores')}
                    className='transition-colors'
                    style={{ color: '#ef864c' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}
                  >
                    Stores
                  </button>
                  <span>/</span>
                  <button
                    onClick={() =>
                      router.push(`/ecommerce/buyer/stores/${effectiveStoreId}`)
                    }
                    className='transition-colors'
                    style={{ color: '#ef864c' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}
                  >
                    {store.name}
                  </button>
                  <span>/</span>
                  <span className='text-foreground font-medium'>
                    {product.name}
                  </span>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/ecommerce/buyer/products')}
                    className='transition-colors'
                    style={{ color: '#ef864c' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}
                  >
                    Products
                  </button>
                  <span>/</span>
                  <span className='text-foreground font-medium'>
                    {product.name}
                  </span>
                </>
              )}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
              {/* Image Gallery */}
              <div>
                {/* Main Image */}
                <div className='relative rounded-2xl overflow-hidden mb-4 h-96 flex items-center justify-center' style={{ backgroundColor: '#0f4656' }}>
                  {hasImages &&
                  images[currentImageIndex] &&
                  (images[currentImageIndex].startsWith('http') ||
                    images[currentImageIndex].startsWith('https') ||
                    images[currentImageIndex].startsWith('data:')) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[currentImageIndex]}
                      alt={product.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='text-9xl'>
                      {images[currentImageIndex] || '📦'}
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className='absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:text-white transition-colors'
                        style={{ color: '#ef864c' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef864c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <ChevronLeft className='w-6 h-6' />
                      </button>
                      <button
                        onClick={nextImage}
                        className='absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:text-white transition-colors'
                        style={{ color: '#ef864c' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef864c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <ChevronRight className='w-6 h-6' />
                      </button>
                    </>
                  )}

                  {/* Like Button */}
                  <button
                    onClick={handleLikeToggle}
                    disabled={isLiking || isUnliking}
                    className='absolute top-4 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform'
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isLiked
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                      style={!isLiked ? { color: '#ef864c' } : undefined}
                    />
                  </button>
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className='flex gap-3'>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-20 h-20 rounded-lg flex items-center justify-center text-3xl border-2 transition-all overflow-hidden ${
                          idx === currentImageIndex
                            ? 'bg-[#ef864c20]'
                            : ''
                        }`}
                        style={idx === currentImageIndex ? { borderColor: '#ef864c', backgroundColor: '#ef864c20' } : { borderColor: '', backgroundColor: '#0f4656' }}
                      >
                        {img &&
                        (img.startsWith('http') ||
                          img.startsWith('https') ||
                          img.startsWith('data:')) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <span>{img || '📦'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className='mb-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <p className='text-sm font-medium mb-2' style={{ color: '#ef864c' }}>
                        {categoryName}
                      </p>
                      <h1 className='text-2xl md:text-3xl font-heading font-bold mb-4' style={{ color: '#0f4656' }}>
                        {product.name}
                      </h1>
                    </div>
                    <button className='p-2 hover:bg-muted rounded-lg transition-colors'>
                      <Share2 className='w-5 h-5' style={{ color: '#ef864c' }} />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='flex items-center gap-1'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(productRating)
                              ? 'fill-current'
                              : 'text-border'
                          }`}
                          style={i < Math.floor(productRating) ? { color: '#ef864c' } : undefined}
                        />
                      ))}
                    </div>
                    <span className='font-bold' style={{ color: '#ef864c' }}>
                      {productRating > 0 ? productRating.toFixed(1) : '0.0'}
                    </span>
                    {reviewsCount > 0 && (
                      <span className='text-sm text-foreground/60'>
                        ({reviewsCount}{' '}
                        {reviewsCount === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className='flex items-baseline gap-3 mb-6'>
                    <span className='text-4xl font-heading font-bold' style={{ color: '#ef864c' }}>
                      {currencySymbol}
                      {product.price}
                    </span>
                    {unit !== 'piece' && (
                      <span className='text-lg text-foreground/60'>
                        / {unit}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className='mb-6'>
                    {inStock ? (
                      <p className='text-sm font-medium text-green-600 flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-green-600'></span>
                        In Stock ({product.stock || 0} available)
                      </p>
                    ) : (
                      <p className='text-sm font-medium text-red-600'>
                        Out of Stock
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                {product.description && (
                  <div className='mb-8'>
                    <h3 className='font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                      Description
                    </h3>
                    <DescriptionWithSeeMore
                      description={product.description}
                      textClassName='text-foreground/60'
                    />
                  </div>
                )}

                {/* Additional Info */}
                <div className='grid grid-cols-3 gap-4 mb-8 p-4 rounded-lg' style={{ backgroundColor: '#ef864c10' }}>
                  <div>
                    <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>Stock</p>
                    <p className='font-medium' style={{ color: '#0f4656' }}>
                      {product.stock || 0} {unit}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>Sales</p>
                    <p className='font-medium' style={{ color: '#ef864c' }}>
                      {product.sales || 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-foreground/60 mb-1 uppercase tracking-wide font-medium'>Views</p>
                    <p className='font-medium' style={{ color: '#0f4656' }}>
                      {product.views || 0}
                    </p>
                  </div>
                </div>

                {/* Quantity & Action Buttons */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium' style={{ color: '#0f4656' }}>
                      Quantity:
                    </span>
                    <div className='flex items-center border rounded-lg' style={{ borderColor: '#ef864c' }}>
                      <button
                        style={{opacity : quantity === 1 ? 0.2:1, color: '#ef864c' }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className='px-4 py-2 hover:bg-[#ef864c20] transition-colors'
                      >
                        −
                      </button>
                      <span className='px-6 py-2 font-medium' style={{ color: '#0f4656' }}>{quantity}</span>
                      <button
                        disabled={product.stock === quantity}
                        onClick={() => setQuantity(quantity + 1)}
                        className='px-4 py-2 hover:bg-[#ef864c20] transition-colors'
                        style={{opacity : product.stock === quantity ? 0.2:1, color: '#ef864c' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <Button
                      variant='outline'
                      className='gap-2'
                      style={{ borderColor: '#ef864c', color: '#ef864c' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#ef864c20';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={handleLikeToggle}
                      disabled={isLiking || isUnliking}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isLiked ? 'fill-red-500 text-red-500' : ''
                        }`}
                        style={!isLiked ? { color: '#ef864c' } : undefined}
                      />
                      {isLiked ? 'Liked' : 'Like'}{' '}
                      {likesCount > 0 && `(${likesCount})`}
                    </Button>
                    <Button
                      className='gap-2 text-white'
                      style={{ backgroundColor: '#ef864c' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#d9723f';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef864c';
                      }}
                      onClick={async () => {
                        if (!currentUserId || !sellerId || isOwnProduct) {
                          toast.error('Unable to start conversation')
                          return
                        }

                        try {
                          // Track chat started event
                          if (product?._id) {
                            track('chat_started', 'product', product._id, {
                              sellerId,
                              timestamp: new Date().toISOString(),
                            })
                          }

                          const response = await startConversation({
                            buyerId: currentUserId,
                            sellerId,
                            productId: id
                          }).unwrap()

                          router.push(
                            `/ecommerce/buyer/messages/${response.conversation.id}`
                          )
                        } catch (error: unknown) {
                          const errorMessage =
                            error &&
                            typeof error === 'object' &&
                            'data' in error
                              ? (error.data as { message?: string })?.message ||
                                'Failed to start conversation'
                              : 'Failed to start conversation'
                          toast.error(errorMessage)
                        }
                      }}
                      disabled={
                        isStartingConversation || !currentUserId || isOwnProduct
                      }
                    >
                      <MessageCircle className='w-5 h-5' />
                      {isOwnProduct
                        ? 'This is your product'
                        : isStartingConversation
                        ? 'Starting...'
                        : 'Chat'}
                    </Button>
                  </div>

                  <Button
                    className='w-full gap-2 py-6 text-base text-white'
                    style={{ backgroundColor: '#ef864c' }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#d9723f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef864c';
                    }}
                    disabled={!inStock}
                  >
                    <ShoppingCart className='w-5 h-5' />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            {effectiveStoreId && (
              <div className='bg-white rounded-2xl border border-border p-8 mb-12 shadow-sm'>
                <h3 className='text-2xl font-heading font-bold mb-6' style={{ color: '#0f4656' }}>
                  About the Store
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div>
                    {storeInfo ? (
                      <>
                        <div className='w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 overflow-hidden' style={{ backgroundColor: '#0f4656' }}>
                          {storeInfo.bannerImage &&
                          (storeInfo.bannerImage.startsWith('http') ||
                            storeInfo.bannerImage.startsWith('https') ||
                            storeInfo.bannerImage.startsWith('data:')) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={storeInfo.bannerImage}
                              alt={storeInfo.name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span style={{ color: '#ffffff' }}>{'🏪'}</span>
                          )}
                        </div>
                        <h4 className='text-xl font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                          {storeInfo.name}
                        </h4>
                        <div className='space-y-3 text-foreground/60'>
                          {storeRating > 0 && (
                            <p className='flex items-center gap-2'>
                              <Star className='w-4 h-4 fill-current' style={{ color: '#ef864c' }} />
                              <span>{storeRating.toFixed(1)} rating</span>
                            </p>
                          )}
                          {storeLocation && <p>📍 {storeLocation}</p>}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4' style={{ backgroundColor: '#0f4656' }}>
                          <span style={{ color: '#ffffff' }}>🏪</span>
                        </div>
                        <h4 className='text-xl font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                          {storeName}
                        </h4>
                        {storeLocation && (
                          <p className='text-foreground/60'>
                            📍 {storeLocation}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    {store && (
                      <div className='space-y-4 mb-6'>
                        <div>
                          <p className='text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1'>
                            Products
                          </p>
                          <p className='text-2xl font-bold' style={{ color: '#ef864c' }}>
                            {(store.products || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1'>
                            Followers
                          </p>
                          <p className='text-2xl font-bold' style={{ color: '#0f4656' }}>
                            {(store.followers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    <Button
                      variant='outline'
                      className='w-full'
                      style={{ borderColor: '#ef864c', color: '#ef864c' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef864c20';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() =>
                        router.push(
                          `/ecommerce/buyer/stores/${effectiveStoreId}`
                        )
                      }
                    >
                      View Store
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Rating and Reviews */}
            <div className='bg-white rounded-2xl border border-border p-8 shadow-sm'>
              <div className='flex items-center justify-between mb-8'>
                <h3 className='text-2xl font-heading font-bold' style={{ color: '#0f4656' }}>
                  Reviews & Ratings
                </h3>
                <Button 
                  variant='outline'
                  style={{ borderColor: '#ef864c', color: '#ef864c' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef864c20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </Button>
              </div>

              {/* Write Review Form */}
              {showReviewForm && (
                <div className='rounded-xl p-6 mb-8' style={{ backgroundColor: '#ef864c10' }}>
                  <h4 className='font-heading font-bold mb-4' style={{ color: '#0f4656' }}>
                    Share Your Experience
                  </h4>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-base font-medium mb-2' style={{ color: '#0f4656' }}>
                        Rating *
                      </label>
                      <div className='flex gap-2'>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type='button'
                            onClick={() => setReviewRating(rating)}
                            className={`p-2 rounded-lg transition-colors ${
                              rating <= reviewRating
                                ? 'text-white'
                                : 'bg-white hover:bg-[#ef864c20]'
                            }`}
                            style={rating <= reviewRating ? { backgroundColor: '#ef864c' } : undefined}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                rating <= reviewRating
                                  ? 'fill-current'
                                  : ''
                              }`}
                              style={rating <= reviewRating ? { color: '#ffffff' } : { color: '#ef864c' }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className='block text-base font-medium mb-2' style={{ color: '#0f4656' }}>
                        Title
                      </label>
                      <input
                        type='text'
                        placeholder='Brief title of your review (optional)'
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        className='w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors'
                        style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                      />
                    </div>
                    <div>
                      <label className='block text-base font-medium mb-2' style={{ color: '#0f4656' }}>
                        Your Review
                      </label>
                      <textarea
                        placeholder='Share your detailed thoughts about this product (optional)'
                        rows={4}
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        className='w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors'
                        style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                      ></textarea>
                    </div>
                    <div className='flex gap-3'>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className='text-white'
                        style={{ backgroundColor: '#ef864c' }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = '#d9723f';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef864c';
                        }}
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
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
                          setShowReviewForm(false)
                          setReviewTitle('')
                          setReviewComment('')
                          setReviewRating(5)
                        }}
                        disabled={isSubmittingReview}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin' style={{ color: '#ef864c' }} />
                </div>
              ) : reviews.length === 0 ? (
                <div className='space-y-6'>
                  <p className='text-foreground/60 text-center py-8'>
                    No reviews yet. Be the first to review this product!
                  </p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {reviews.map((review: Review) => (
                    <div
                      key={review._id}
                      className='border-b border-border pb-6 last:border-0 last:pb-0'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden' style={{ backgroundColor: '#ef864c20' }}>
                            {review.user.avatar &&
                            (review.user.avatar.startsWith('http') ||
                              review.user.avatar.startsWith('https') ||
                              review.user.avatar.startsWith('data:')) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <span>
                                {review.user.avatar ||
                                  review.user.name.charAt(0) ||
                                  'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className='font-medium' style={{ color: '#0f4656' }}>
                                {review.user.name}
                              </p>
                              {review.user.verificationStatus === "approved" && (
                                <span
                                  className="inline-flex items-center"
                                  title="Verified User"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    style={{ color: '#ef864c' }}
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
                            <p className='text-xs text-foreground/60'>
                              {new Date(review.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-current'
                                  : 'text-border'
                              }`}
                              style={i < review.rating ? { color: '#ef864c' } : undefined}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <h5 className='font-medium mb-2' style={{ color: '#0f4656' }}>
                          {review.title}
                        </h5>
                      )}
                      {review.comment && (
                        <p className='text-foreground/60'>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
      </div>

      {/* AI Chat Assistant */}
      {product && (
        <ChatAssistant
          itemType="product"
          itemInfo={{
            name: product.name,
            description: product.description,
            price: product.price,
            currency: product.currency,
            category: typeof product.category === "object" ? product.category.name : "",
            unit: product.unit,
            stock: product.stock,
          }}
        />
      )}
    </div>
  )
}
