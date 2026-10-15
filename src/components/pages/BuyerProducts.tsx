'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Search,
  Star,
  Heart,
  ChevronDown,
  SlidersHorizontal,
  Grid3x3,
  Loader2
} from 'lucide-react'
import {
  useGetAllProductsForBuyerQuery,
  useLikeProductMutation,
  useUnlikeProductMutation
} from '@/services/redux/api/productApi'
import type { Product } from '@/services/redux/api/productApi'
import { useToast } from '@/hooks/use-toast'

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'
type PriceRange = 'all' | '0-50' | '50-200' | '200-500' | '500+'

export default function Products () {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<PriceRange>('all')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showFilters, setShowFilters] = useState(false)

  // Build API query params
  const apiParams = useMemo(() => {
    const params: {
      searchTerm?: string
      category?: string
      sortBy?: string
      order?: 'asc' | 'desc'
      minPrice?: string
      maxPrice?: string
    } = {}

    if (searchQuery) {
      params.searchTerm = searchQuery
    }

    if (category !== 'all') {
      params.category = category
    }

    // Map price range to min/max
    if (priceRange !== 'all') {
      if (priceRange === '0-50') {
        params.minPrice = '0'
        params.maxPrice = '50'
      } else if (priceRange === '50-200') {
        params.minPrice = '50'
        params.maxPrice = '200'
      } else if (priceRange === '200-500') {
        params.minPrice = '200'
        params.maxPrice = '500'
      } else if (priceRange === '500+') {
        params.minPrice = '500'
      }
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
    } else if (sortBy === 'newest') {
      params.sortBy = 'createdAt'
      params.order = 'desc'
    } else {
      params.sortBy = 'sales'
      params.order = 'desc'
    }

    return params
  }, [searchQuery, category, priceRange, sortBy])

  // Fetch products from API
  const {
    data: productsData,
    isLoading,
    isError,
    error
  } = useGetAllProductsForBuyerQuery(apiParams)

  // Like/unlike mutations
  const [likeProduct, { isLoading: isLiking }] = useLikeProductMutation()
  const [unlikeProduct, { isLoading: isUnliking }] = useUnlikeProductMutation()
  const { toast } = useToast()

  // Handle like/unlike
  const handleLikeToggle = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    if (!product._id) return

    try {
      if (product.isLiked) {
        await unlikeProduct(product._id).unwrap()
        toast({
          title: 'Product unliked',
          description: 'Removed from your liked products.'
        })
      } else {
        await likeProduct(product._id).unwrap()
        toast({
          title: 'Product liked',
          description: 'Added to your liked products.'
        })
      }
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ||
            'Failed to update like status'
          : 'Failed to update like status'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  // Get unique categories from products
  const products = useMemo(
    () => productsData?.products || [],
    [productsData?.products]
  )

  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    products.forEach(product => {
      if (
        product.category &&
        typeof product.category === 'object' &&
        product.category.name
      ) {
        categorySet.add(product.category.name)
      }
    })
    return Array.from(categorySet).sort()
  }, [products])

  return (
    <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div>
            {/* Header */}
            <div className='rounded-sm mb-[20px] shadow-sm' style={{ backgroundColor: '#0f4656' }}>
              <div className='  mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <h1 className='text-2xl md:text-3xl font-heading font-bold mb-2' style={{ color: '#ffffff' }}>
                  Explore Products
                </h1>
                <p style={{ color: '#ffffff80' }}>
                  Discover amazing products from trusted sellers
                </p>
              </div>
            </div>
            {/* Search & Filters */}
            <div className='mb-8 space-y-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5' style={{ color: '#ef864c' }} />
                <input
                  type='text'
                  placeholder='Search products...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors'
                  style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>

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
                </Button>

                <div className='relative'>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortOption)}
                    className='appearance-none px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white pr-10 transition-colors'
                    style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    <option value='popular'>Sort: Most Popular</option>
                    <option value='newest'>Sort: Newest</option>
                    <option value='rating'>Sort: Highest Rated</option>
                    <option value='price-low'>Sort: Price (Low to High)</option>
                    <option value='price-high'>
                      Sort: Price (High to Low)
                    </option>
                  </select>
                  <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none' />
                </div>

                <div className='text-sm text-foreground/60'>
                  {products.length}{' '}
                  {products.length === 1 ? 'product' : 'products'}
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-border p-6 shadow-sm'>
                  {/* Category Filter */}
                  <div>
                    <label className='block text-base font-medium mb-3' style={{ color: '#0f4656' }}>
                      Category
                    </label>
                    <div className='space-y-2'>
                      {['All Categories', ...categories].map(cat => (
                        <label
                          key={cat}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <input
                            type='radio'
                            name='category'
                            checked={
                              category ===
                              (cat === 'All Categories' ? 'all' : cat)
                            }
                            onChange={() =>
                              setCategory(
                                cat === 'All Categories' ? 'all' : cat
                              )
                            }
                            className='w-4 h-4'
                            style={{ accentColor: '#ef864c' }}
                          />
                          <span className='text-sm text-foreground'>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className='block text-base font-medium mb-3' style={{ color: '#0f4656' }}>
                      Price Range
                    </label>
                    <div className='space-y-2'>
                      {[
                        { value: 'all', label: 'All Prices' },
                        { value: '0-50', label: '$0 - $50' },
                        { value: '50-200', label: '$50 - $200' },
                        { value: '200-500', label: '$200 - $500' },
                        { value: '500+', label: '$500+' }
                      ].map(price => (
                        <label
                          key={price.value}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <input
                            type='radio'
                            name='price'
                            checked={priceRange === price.value}
                            onChange={() =>
                              setPriceRange(price.value as PriceRange)
                            }
                            className='w-4 h-4'
                          />
                          <span className='text-sm text-foreground'>
                            {price.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin' style={{ color: '#ef864c' }} />
              </div>
            ) : isError ? (
              <div className='text-center py-12'>
                <p className='text-red-500 mb-4'>
                  {error && 'data' in error
                    ? (error.data as { message?: string })?.message ||
                      'Failed to load products'
                    : 'Failed to load products'}
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
            ) : products.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
                {products.map((product: Product) => {
                  const productImage = product.images?.[0] || '📦'
                  const productRating = product.rating || 0
                  const categoryName =
                    product.category && typeof product.category === 'object'
                      ? product.category.name
                      : 'Uncategorized'
                  const storeName =
                    product.store && typeof product.store === 'object'
                      ? product.store.name
                      : 'Unknown Store'
                  const storeLocation =
                    product.store && typeof product.store === 'object'
                      ? product.store.location
                      : ''
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
                        router.push(`/ecommerce/buyer/products/${product._id}`)
                      }
                    >
                      {/* Image */}
                      <div className='relative h-40 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform overflow-hidden' style={{ backgroundColor: '#0f4656' }}>
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
                          onClick={e => handleLikeToggle(e, product)}
                          disabled={isLiking || isUnliking}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform ${
                            product.isLiked ? 'text-red-500' : ''
                          }`}
                          style={!product.isLiked ? { color: '#ef864c' } : undefined}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              product.isLiked ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className='p-4'>
                        <span className='text-xs text-foreground/60 font-medium'>
                          {categoryName}
                        </span>
                        <h3 className='font-heading font-bold text-sm mb-2 line-clamp-2 transition-colors' style={{ color: '#0f4656' }}>
                          {product.name}
                        </h3>

                        {/* Rating */}
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

                        {/* Price */}
                        <div className='flex items-center gap-2 mb-3'>
                          <span className='text-lg font-heading font-bold' style={{ color: '#ef864c' }}>
                            {currencySymbol}
                            {product.price}
                          </span>
                          {unit !== 'piece' && (
                            <span className='text-xs text-foreground/60'>
                              / {unit}
                            </span>
                          )}
                        </div>

                        {/* Seller */}
                        <p className='text-xs text-foreground/60 mb-3'>
                          by {storeName} {storeLocation && `• ${storeLocation}`}
                        </p>

                        {/* Button */}
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
                              `/ecommerce/buyer/products/${product._id}`
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
              <div className='text-center py-16'>
                <Grid3x3 className='w-16 h-16 mx-auto mb-4 opacity-20' style={{ color: '#ef864c' }} />
                <h2 className='text-2xl font-heading font-bold mb-2' style={{ color: '#0f4656' }}>
                  No products found
                </h2>
                <p className='text-foreground/60'>
                  Try adjusting your search or filters
                </p>
              </div>
            )}
      </div>
    </div>
  )
}
