'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Star,
  MessageCircle,
  MapPin,
  Users,
  TrendingUp,
  Heart,
  Search,
  ChevronDown,
  Loader2,
  Plus,
  X,
  BadgeCheck
} from 'lucide-react'
import {
  useGetStoreByIdForBuyerQuery,
  useFollowStoreMutation,
  useUnfollowStoreMutation
} from '@/services/redux/api/storeApi'
import { useGetProductsByStoreIdQuery } from '@/services/redux/api/productApi'
import { useStartConversationMutation } from '@/services/redux/api/chatApi'
import { useGetCurrentUserQuery } from '@/services/redux/api/authApi'
import { useGetSellerReviewsQuery, useAddSellerResponseMutation, useCreateSellerReviewMutation } from '@/services/redux/api/reviewApi'
import { ReviewSummaryCard, ReviewItem } from '@/components/reviews'
import { useToast } from '@/hooks/use-toast'
import { toast } from 'sonner'

export default function StoreDetailPage () {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<
    'popular' | 'rating' | 'price-low' | 'price-high'
  >('popular')

  // Fetch store data
  const {
    data: storeData,
    isLoading: isLoadingStore,
    isError: isStoreError,
    error: storeError
  } = useGetStoreByIdForBuyerQuery(id || '')

  const store = storeData?.store

  // Build API params for products
  const productParams = useMemo(() => {
    const params: {
      storeId: string
      searchTerm?: string
      sortBy?: string
      order?: 'asc' | 'desc'
    } = {
      storeId: id || ''
    }

    if (searchQuery) {
      params.searchTerm = searchQuery
    }

    // Map sortBy to API sortBy
    if (sortBy === 'price-low') {
      params.sortBy = 'price'
      params.order = 'asc'
    } else if (sortBy === 'price-high') {
      params.sortBy = 'price'
      params.order = 'desc'
    } else if (sortBy === 'rating') {
      params.sortBy = 'rating'
      params.order = 'desc'
    } else {
      params.sortBy = 'createdAt'
      params.order = 'desc'
    }

    return params
  }, [id, searchQuery, sortBy])

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsByStoreIdQuery(productParams, {
      skip: !id
    })

  const products = productsData?.products || []

  // Follow/unfollow mutations
  const [followStore, { isLoading: isFollowing }] = useFollowStoreMutation()
  const [unfollowStore, { isLoading: isUnfollowing }] =
    useUnfollowStoreMutation()
  const { toast: toastHook } = useToast()

  // Get current user for chat
  const { data: currentUserData } = useGetCurrentUserQuery('ecommerce_buyer')
  const currentUserId = currentUserData?.user?._id

  // Resolve seller id for chat / ownership check
  const storeOwnerId =
    typeof store?.owner === 'object'
      ? store.owner._id
      : typeof store?.owner === 'string'
      ? store.owner
      : ''
  const isOwnStore =
    !!storeOwnerId && !!currentUserId && storeOwnerId === currentUserId

  // Start conversation mutation
  const [startConversation, { isLoading: isStartingConversation }] =
    useStartConversationMutation()

  // Seller reviews
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useGetSellerReviewsQuery(storeOwnerId || '', {
    skip: !storeOwnerId
  });
  const [addResponse] = useAddSellerResponseMutation();
  const [createReview] = useCreateSellerReviewMutation();
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [categoryRatings, setCategoryRatings] = useState({
    communication: 5,
    accuracy: 5,
    professionalism: 5,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Format store data
  const storeRating = store?.rating || store?.owner?.rating || 0
  const storeAvatar = store?.bannerImage || '🏪'
  const joinDate = store?.createdAt
    ? new Date(store.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : 'Recently'

  const isFollowingStore = store?.isFollowing || false

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!id) return

    try {
      if (isFollowingStore) {
        await unfollowStore(id).unwrap()
        toastHook({
          title: 'Store unfollowed',
          description: 'You have unfollowed this store.'
        })
      } else {
        await followStore(id).unwrap()
        toastHook({
          title: 'Store followed',
          description: 'You are now following this store.'
        })
      }
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ||
            'Failed to update follow status'
          : 'Failed to update follow status'
      toastHook({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  const getBadgeText = (rating: number) => {
    if (rating >= 4.8) return 'premium'
    if (rating >= 4.5) return 'trusted'
    if (rating >= 4.0) return 'new'
    return null
  }

  const badge = getBadgeText(storeRating)

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!currentUserId || !storeOwnerId) {
      toastHook({
        title: "Login required",
        description: "Please log in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toastHook({
        title: "Invalid rating",
        description: "Please provide a rating between 1 and 5 stars.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Note: productId is optional - backend will verify any conversation between buyer and seller
      await createReview({
        sellerId: storeOwnerId,
        payload: {
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          categories: categoryRatings,
          // productId can be omitted - backend will check for any conversation between buyer and seller
        },
      }).unwrap();

      toastHook({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      });

      setShowReviewForm(false);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setCategoryRatings({ communication: 5, accuracy: 5, professionalism: 5 });
      refetchReviews();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error
          ? (error.data as { message?: string })?.message ||
            "Please make sure you have interacted with this seller first."
          : "Please make sure you have interacted with this seller first.";
      toastHook({
        title: "Failed to submit review",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddResponse = async (reviewId: string, response: string) => {
    try {
      await addResponse({ reviewId, payload: { response } }).unwrap();
      toastHook({
        title: "Response added",
        description: "Your response has been added successfully.",
      });
      refetchReviews();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error
          ? (error.data as { message?: string })?.message ||
            "Unable to add response. Please try again."
          : "Unable to add response. Please try again.";
      toastHook({
        title: "Failed to add response",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Loading state
  if (isLoadingStore) {
    return (
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
            <p className='text-foreground/60'>Loading store...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isStoreError || !store) {
    return (
      <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <p className='text-red-500 mb-4'>
              {storeError && 'data' in storeError
                ? (storeError.data as { message?: string })?.message ||
                  'Failed to load store'
                : 'Store not found'}
            </p>
            <Button 
              className="text-white"
              style={{ backgroundColor: '#ef864c' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
              onClick={() => router.push('/ecommerce/buyer/stores')}
            >
              Back to Stores
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
            <div className='mb-6'>
              <div className='flex items-center gap-2 text-sm text-foreground/60'>
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
                <span className='text-foreground font-medium'>
                  {store.name}
                </span>
              </div>
            </div>

            {/* Store Header */}
            <div className='bg-white rounded-2xl border border-border mb-8 p-4 shadow-sm'>
              <div className='py-12'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-start'>
                  {/* Store Info */}
                  <div className='md:col-span-2'>
                    <div className='flex items-start gap-6 mb-6'>
                      {storeAvatar &&
                      (storeAvatar.startsWith('http') ||
                        storeAvatar.startsWith('https') ||
                        storeAvatar.startsWith('data:')) ? (
                        <div className='w-24 h-24 rounded-2xl border-4 overflow-hidden flex-shrink-0' style={{ borderColor: '#ef864c40' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={storeAvatar}
                            alt={store.name}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      ) : (
                        <div className='w-24 h-24 rounded-2xl flex items-center justify-center text-5xl' style={{ backgroundColor: '#0f4656' }}>
                          <span style={{ color: '#ffffff' }}>{storeAvatar}</span>
                        </div>
                      )}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-3'>
                          <div>
                            <h1 className='text-2xl md:text-3xl font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                              {store.name}
                            </h1>
                            {badge && (
                              <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 text-white"
                                style={{ backgroundColor: '#ef864c' }}
                              >
                                {badge}
                              </span>
                            )}
                          </div>
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
                              if (
                                !currentUserId ||
                                !storeOwnerId ||
                                isOwnStore
                              ) {
                                toast.error('Unable to start conversation')
                                return
                              }

                              // Get the first product from the store to use for the conversation
                              const firstProduct =
                                products.length > 0 ? products[0] : null

                              if (!firstProduct) {
                                toast.error(
                                  'No products available to start a conversation'
                                )
                                return
                              }

                              try {
                                const response = await startConversation({
                                  buyerId: currentUserId,
                                  sellerId: storeOwnerId,
                                  productId: firstProduct._id
                                }).unwrap()

                                router.push(
                                  `/ecommerce/buyer/messages/${response.conversation.id}`
                                )
                              } catch (error: unknown) {
                                const errorMessage =
                                  error &&
                                  typeof error === 'object' &&
                                  'data' in error
                                    ? (error.data as { message?: string })
                                        ?.message ||
                                      'Failed to start conversation'
                                    : 'Failed to start conversation'
                                toast.error(errorMessage)
                              }
                            }}
                            disabled={
                              isStartingConversation ||
                              !currentUserId ||
                              products.length === 0 ||
                              isOwnStore
                            }
                          >
                            <MessageCircle className='w-5 h-5' />
                            {isOwnStore
                              ? 'This is your store'
                              : isStartingConversation
                              ? 'Starting...'
                              : 'Contact'}
                          </Button>
                        </div>

                        {/* Rating */}
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='flex items-center gap-1'>
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
                          </div>
                          <span className='font-bold' style={{ color: '#ef864c' }}>
                            {storeRating.toFixed(1)}
                          </span>
                        </div>

                        {/* Location and Info */}
                        <div className='flex flex-wrap gap-4 text-foreground/60 text-sm'>
                          <span className='flex items-center gap-1'>
                            <MapPin className='w-4 h-4' style={{ color: '#ef864c' }} />
                            {store.location}
                          </span>
                          {store.owner && (
                            <span>Seller: {store.owner.name}</span>
                          )}
                          <span>Joined {joinDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* About */}
                    {store.description && (
                      <div>
                        <h3 className='font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                          About
                        </h3>
                        <p className='text-foreground/60 text-sm'>
                          {store.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stats Card */}
                  <div className='rounded-2xl border border-border p-6 shadow-sm' style={{ backgroundColor: '#ef864c10' }}>
                    <h3 className='font-heading font-bold mb-6' style={{ color: '#0f4656' }}>
                      Store Stats
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <p className='text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1'>
                          Products
                        </p>
                        <p className='text-3xl font-heading font-bold' style={{ color: '#ef864c' }}>
                          {(store.products || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1'>
                          Followers
                        </p>
                        <p className='text-3xl font-heading font-bold flex items-center gap-2' style={{ color: '#0f4656' }}>
                          <Users className='w-6 h-6' />
                          {(store.followers || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1'>
                          Rating
                        </p>
                        <p className='text-3xl font-heading font-bold' style={{ color: '#ef864c' }}>
                          {Math.round(storeRating * 20)}%
                        </p>
                      </div>
                      {!isOwnStore && (
                        <Button
                          variant={isFollowingStore ? 'default' : 'outline'}
                          className='w-full mt-6 text-white'
                          style={isFollowingStore ? { backgroundColor: '#ef864c' } : { borderColor: '#ef864c', color: '#ef864c' }}
                          onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                              if (isFollowingStore) {
                                e.currentTarget.style.backgroundColor = '#d9723f';
                              } else {
                                e.currentTarget.style.backgroundColor = '#ef864c20';
                              }
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isFollowingStore) {
                              e.currentTarget.style.backgroundColor = '#ef864c';
                            } else {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                          onClick={handleFollowToggle}
                          disabled={isFollowing || isUnfollowing}
                        >
                          {isFollowing || isUnfollowing
                            ? 'Loading...'
                            : isFollowingStore
                            ? 'Unfollow Store'
                            : 'Follow Store'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className='py-12'>
              <div className='mb-8'>
                <h2 className='text-2xl font-heading font-bold mb-6 flex items-center gap-2' style={{ color: '#0f4656' }}>
                  <TrendingUp className='w-6 h-6' style={{ color: '#ef864c' }} />
                  Products ({(store.products || 0).toLocaleString()})
                </h2>

                {/* Search and Filter */}
                <div className='flex flex-col md:flex-row gap-4 mb-6'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5' style={{ color: '#ef864c' }} />
                    <input
                      type='text'
                      placeholder='Search in this store...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors'
                      style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    />
                  </div>

                  <div className='relative min-w-40'>
                    <select
                      value={sortBy}
                      onChange={e =>
                        setSortBy(
                          e.target.value as
                            | 'popular'
                            | 'rating'
                            | 'price-low'
                            | 'price-high'
                        )
                      }
                      className='appearance-none w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white pr-10 transition-colors'
                      style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    >
                      <option value='popular'>Sort by: Popular</option>
                      <option value='rating'>Sort by: Rating</option>
                      <option value='price-low'>
                        Sort by: Price Low to High
                      </option>
                      <option value='price-high'>
                        Sort by: Price High to Low
                      </option>
                    </select>
                    <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none' />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoadingProducts ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
                </div>
              ) : products.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {products.map(product => {
                    const productImage = product.images?.[0] || '📦'
                    const productRating = product.rating || 0
                    const currency = product.currency || 'USD'
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
                    const unit = product.unit || 'piece'

                    return (
                      <div
                        key={product._id}
                        className='bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer shadow-sm'
                        style={{ '--hover-border-color': '#ef864c' } as React.CSSProperties}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                        onClick={() =>
                          router.push(
                            `/ecommerce/buyer/products/${product._id}?store=${id}`
                          )
                        }
                      >
                        <div className='relative h-48 flex items-center justify-center text-5xl overflow-hidden' style={{ backgroundColor: '#0f4656' }}>
                          {productImage &&
                          (productImage.startsWith('http') ||
                            productImage.startsWith('https') ||
                            productImage.startsWith('data:')) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={productImage}
                              alt={product.name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span>{productImage}</span>
                          )}
                          <button
                            className='absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform'
                            onClick={e => e.stopPropagation()}
                          >
                            <Heart className='w-4 h-4 text-muted-foreground' />
                          </button>
                        </div>
                        <div className='p-4'>
                          <h3 className='font-heading font-bold text-sm mb-2 line-clamp-2 transition-colors' style={{ color: '#0f4656' }}>
                            {product.name}
                          </h3>
                          {productRating > 0 && (
                            <div className='flex items-center gap-1 mb-3'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(productRating)
                                      ? 'fill-current'
                                      : 'text-border'
                                  }`}
                                  style={i < Math.floor(productRating) ? { color: '#ef864c' } : undefined}
                                />
                              ))}
                              <span className='text-xs text-foreground/60 ml-1'>
                                {productRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div className='flex items-center gap-2 mb-3'>
                            <p className='text-lg font-heading font-bold' style={{ color: '#ef864c' }}>
                              {currencySymbol}
                              {product.price}
                            </p>
                            {unit !== 'piece' && (
                              <span className='text-xs text-foreground/60'>
                                / {unit}
                              </span>
                            )}
                          </div>
                          <Button
                            size='sm'
                            variant='outline'
                            className='w-full transition-colors'
                            style={{ borderColor: '#ef864c', color: '#ef864c' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef864c20';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={e => {
                              e.stopPropagation()
                              router.push(
                                `/ecommerce/buyer/products/${product._id}?store=${id}`
                              )
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <Search className='w-12 h-12 mx-auto mb-4 opacity-30' style={{ color: '#ef864c' }} />
                  <p className='text-foreground/60'>
                    {searchQuery
                      ? 'No products found matching your search'
                      : 'No products available in this store'}
                  </p>
                </div>
              )}
            </div>

            {/* Seller Reviews Section */}
            {storeOwnerId && (
              <div className='py-12 border-t border-border'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-heading font-bold' style={{ color: '#0f4656' }}>
                      Seller Reviews
                    </h2>
                    {currentUserId && !isOwnStore && storeOwnerId && (
                      <Button
                        variant='outline'
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className='gap-2'
                        style={{ borderColor: '#ef864c', color: '#ef864c' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef864c20';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {showReviewForm ? (
                          <>
                            <X className='w-4 h-4' />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Plus className='w-4 h-4' />
                            Write a Review
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Review Form */}
                  {showReviewForm && !isOwnStore && storeOwnerId && (
                    <div className='bg-white rounded-2xl border border-border p-6 shadow-sm'>
                      <h3 className='text-lg font-bold mb-4' style={{ color: '#0f4656' }}>Write a Review</h3>
                      <div className='space-y-4'>
                        {/* Overall Rating */}
                        <div>
                          <label className='block text-sm font-medium text-foreground mb-2'>
                            Overall Rating *
                          </label>
                          <div className='flex items-center gap-2'>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type='button'
                                onClick={() => setReviewRating(rating)}
                                className='focus:outline-none'
                              >
                                <Star
                                  className={`w-8 h-8 transition-colors ${
                                    rating <= reviewRating
                                      ? 'fill-current'
                                      : 'text-foreground/30'
                                  }`}
                                  style={rating <= reviewRating ? { color: '#ef864c' } : undefined}
                                />
                              </button>
                            ))}
                            <span className='ml-2 text-sm font-semibold' style={{ color: '#ef864c' }}>
                              {reviewRating} / 5
                            </span>
                          </div>
                        </div>

                        {/* Category Ratings */}
                        <div className='space-y-3'>
                          <label className='block text-sm font-medium text-foreground'>
                            Category Ratings
                          </label>
                          
                          {/* Communication */}
                          <div>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-sm text-foreground'>Communication</span>
                              <span className='text-sm font-semibold' style={{ color: '#ef864c' }}>{categoryRatings.communication} / 5</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type='button'
                                  onClick={() => setCategoryRatings({ ...categoryRatings, communication: rating })}
                                  className='focus:outline-none'
                                >
                                  <Star
                                    className={`w-5 h-5 transition-colors ${
                                      rating <= categoryRatings.communication
                                        ? 'fill-current'
                                        : 'text-foreground/30'
                                    }`}
                                    style={rating <= categoryRatings.communication ? { color: '#ef864c' } : undefined}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Accuracy */}
                          <div>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-sm text-foreground'>Accuracy</span>
                              <span className='text-sm font-semibold' style={{ color: '#ef864c' }}>{categoryRatings.accuracy} / 5</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type='button'
                                  onClick={() => setCategoryRatings({ ...categoryRatings, accuracy: rating })}
                                  className='focus:outline-none'
                                >
                                  <Star
                                    className={`w-5 h-5 transition-colors ${
                                      rating <= categoryRatings.accuracy
                                        ? 'fill-current'
                                        : 'text-foreground/30'
                                    }`}
                                    style={rating <= categoryRatings.accuracy ? { color: '#ef864c' } : undefined}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Professionalism */}
                          <div>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-sm text-foreground'>Professionalism</span>
                              <span className='text-sm font-semibold' style={{ color: '#ef864c' }}>{categoryRatings.professionalism} / 5</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type='button'
                                  onClick={() => setCategoryRatings({ ...categoryRatings, professionalism: rating })}
                                  className='focus:outline-none'
                                >
                                  <Star
                                    className={`w-5 h-5 transition-colors ${
                                      rating <= categoryRatings.professionalism
                                        ? 'fill-current'
                                        : 'text-foreground/30'
                                    }`}
                                    style={rating <= categoryRatings.professionalism ? { color: '#ef864c' } : undefined}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <label className='block text-base font-medium mb-2' style={{ color: '#0f4656' }}>
                            Review Title
                          </label>
                          <input
                            type='text'
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder='Summarize your experience...'
                            className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors'
                            style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                            onBlur={(e) => e.currentTarget.style.borderColor = ''}
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <label className='block text-base font-medium mb-2' style={{ color: '#0f4656' }}>
                            Review Comment
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder='Share your detailed experience...'
                            rows={4}
                            className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors'
                            style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                            onBlur={(e) => e.currentTarget.style.borderColor = ''}
                          />
                        </div>

                        {/* Submit Button */}
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className='w-full text-white'
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
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Review Summary */}
                  {reviewsLoading ? (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='w-6 h-6 animate-spin' style={{ color: '#ef864c' }} />
                    </div>
                  ) : reviewsData && reviewsData.count > 0 ? (
                    <>
                      <ReviewSummaryCard reviewsData={reviewsData} />
                      
                      {/* Individual Reviews */}
                      <div className='space-y-4'>
                        <h3 className='text-xl font-bold' style={{ color: '#0f4656' }}>
                          All Reviews ({reviewsData.count})
                        </h3>
                        {reviewsData.reviews.map((review) => (
                          <ReviewItem
                            key={review._id}
                            review={review}
                            isCurrentUserSeller={isOwnStore}
                            onAddResponse={handleAddResponse}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className='bg-white rounded-2xl border border-border p-12 text-center shadow-sm'>
                      <Star className='w-16 h-16 mx-auto mb-4' style={{ color: '#ef864c', opacity: 0.3 }} />
                      <h3 className='text-lg font-bold mb-2' style={{ color: '#0f4656' }}>No Reviews Yet</h3>
                      <p className='text-foreground/60'>
                        This seller hasn&apos;t received any reviews yet. Be the first to leave a review!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
      </div>
    </div>
  )
}
