"use client"

import { useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/RealEstate/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/RealEstate/components/ui/dropdown-menu'
import {
  Building2,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  Inbox,
  Loader2,
  User,
  Menu,
  Store
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGetCurrentUserQuery } from '@/services/redux/api/authApi'

interface BuyerSidebarContentProps {
  onNavigate?: () => void
}

function BuyerSidebarContent({ onNavigate }: BuyerSidebarContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Fetch current user profile for buyer role
  const { data, isLoading, isError } = useGetCurrentUserQuery('realestate_buyer')
  
  const userProfile = data?.user

  const isActive = (path: string) => {
    if (path === '/real-estate/buyer/dashboard') {
      return pathname === '/real-estate/buyer/dashboard'
    }
    return pathname?.startsWith(path)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    onNavigate?.()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin' style={{ color: '#ef864c' }} />
      </div>
    )
  }

  // Error or no user state
  if (isError || !userProfile) {
    return (
      <div className='text-center text-sm text-muted-foreground py-8'>
        Unable to load profile
      </div>
    )
  }
  return (
    <>
      {/* Quick Shortcuts */}
      <div className='bg-white rounded-2xl border border-border p-4 lg:p-6 mb-4 lg:mb-6 space-y-3'>
        <button
          onClick={() => handleNavigation('/real-estate/buyer/dashboard')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg transition-colors group',
            isActive('/real-estate/buyer/dashboard')
              ? 'border'
              : 'hover:bg-muted'
          )}
          style={isActive('/real-estate/buyer/dashboard') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40' } : {}}
          onMouseEnter={(e) => {
            if (isActive('/real-estate/buyer/dashboard')) {
              e.currentTarget.style.backgroundColor = '#ef864c30'
            }
          }}
          onMouseLeave={(e) => {
            if (isActive('/real-estate/buyer/dashboard')) {
              e.currentTarget.style.backgroundColor = '#ef864c20'
            }
          }}
        >
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isActive('/real-estate/buyer/dashboard')
                  ? ''
                  : ''
              )}
              style={isActive('/real-estate/buyer/dashboard') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
            >
              <LayoutDashboard
                className={cn(
                  'w-5 h-5',
                  isActive('/real-estate/buyer/dashboard')
                    ? 'text-white'
                    : ''
                )}
                style={!isActive('/real-estate/buyer/dashboard') ? { color: '#ef864c' } : {}}
              />
            </div>
            <span
              className={cn(
                'font-medium text-sm',
                isActive('/real-estate/buyer/dashboard')
                  ? ''
                  : ''
              )}
              style={isActive('/real-estate/buyer/dashboard') ? { color: '#0f4656' } : {}}
            >
              Dashboard
            </span>
          </div>
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isActive('/real-estate/buyer/dashboard')
                ? 'group-hover:translate-x-1'
                : 'text-muted-foreground'
            )}
            style={isActive('/real-estate/buyer/dashboard') ? { color: '#0f4656' } : {}}
            onMouseEnter={(e) => {
              if (!isActive('/real-estate/buyer/dashboard')) {
                e.currentTarget.style.color = '#ef864c'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/real-estate/buyer/dashboard')) {
                e.currentTarget.style.color = ''
              }
            }}
          />
        </button>

        <button
          onClick={() => handleNavigation('/real-estate/buyer/properties')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg transition-colors group',
            isActive('/real-estate/buyer/properties')
              ? 'border'
              : 'hover:bg-muted'
          )}
          style={isActive('/real-estate/buyer/properties') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40' } : {}}
          onMouseEnter={(e) => {
            if (isActive('/real-estate/buyer/properties')) {
              e.currentTarget.style.backgroundColor = '#ef864c30'
            }
          }}
          onMouseLeave={(e) => {
            if (isActive('/real-estate/buyer/properties')) {
              e.currentTarget.style.backgroundColor = '#ef864c20'
            }
          }}
        >
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isActive('/real-estate/buyer/properties')
                  ? ''
                  : ''
              )}
              style={isActive('/real-estate/buyer/properties') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
            >
              <Building2
                className={cn(
                  'w-5 h-5',
                  isActive('/real-estate/buyer/properties')
                    ? 'text-white'
                    : ''
                )}
                style={!isActive('/real-estate/buyer/properties') ? { color: '#ef864c' } : {}}
              />
            </div>
            <span
              className={cn(
                'font-medium text-sm',
                isActive('/real-estate/buyer/properties') ? '' : ''
              )}
              style={isActive('/real-estate/buyer/properties') ? { color: '#0f4656' } : {}}
            >
              Properties
            </span>
          </div>
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isActive('/real-estate/buyer/properties')
                ? 'group-hover:translate-x-1'
                : 'text-muted-foreground'
            )}
            style={isActive('/real-estate/buyer/properties') ? { color: '#0f4656' } : {}}
            onMouseEnter={(e) => {
              if (!isActive('/real-estate/buyer/properties')) {
                e.currentTarget.style.color = '#ef864c'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/real-estate/buyer/properties')) {
                e.currentTarget.style.color = ''
              }
            }}
          />
        </button>

        <button
          onClick={() => handleNavigation('/real-estate/buyer/messages')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg transition-colors group',
            isActive('/real-estate/buyer/messages')
              ? 'border'
              : 'hover:bg-muted'
          )}
          style={isActive('/real-estate/buyer/messages') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40' } : {}}
          onMouseEnter={(e) => {
            if (isActive('/real-estate/buyer/messages')) {
              e.currentTarget.style.backgroundColor = '#ef864c30'
            }
          }}
          onMouseLeave={(e) => {
            if (isActive('/real-estate/buyer/messages')) {
              e.currentTarget.style.backgroundColor = '#ef864c20'
            }
          }}
        >
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isActive('/real-estate/buyer/messages')
                  ? ''
                  : ''
              )}
              style={isActive('/real-estate/buyer/messages') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
            >
              <Inbox
                className={cn(
                  'w-5 h-5',
                  isActive('/real-estate/buyer/messages')
                    ? 'text-white'
                    : ''
                )}
                style={!isActive('/real-estate/buyer/messages') ? { color: '#ef864c' } : {}}
              />
            </div>
            <span
              className={cn(
                'font-medium text-sm',
                isActive('/real-estate/buyer/messages') ? '' : ''
              )}
              style={isActive('/real-estate/buyer/messages') ? { color: '#0f4656' } : {}}
            >
              Messages
            </span>
          </div>
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isActive('/real-estate/buyer/messages')
                ? 'group-hover:translate-x-1'
                : 'text-muted-foreground'
            )}
            style={isActive('/real-estate/buyer/messages') ? { color: '#0f4656' } : {}}
            onMouseEnter={(e) => {
              if (!isActive('/real-estate/buyer/messages')) {
                e.currentTarget.style.color = '#ef864c'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/real-estate/buyer/messages')) {
                e.currentTarget.style.color = ''
              }
            }}
          />
        </button>

        <hr className='my-3 border-border' />

        <button
          onClick={() => handleNavigation('/real-estate/seller/dashboard')}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-lg transition-colors'
          )}
          style={{ color: '#ef864c' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ef864c20'
            e.currentTarget.style.color = '#d9723f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = ''
            e.currentTarget.style.color = '#ef864c'
          }}
        >
          <Store className='w-5 h-5' />
          <span className='font-medium text-sm'>Switch to Selling</span>
        </button>

        <button
          onClick={() => handleNavigation('/settings')}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors',
            isActive('/settings')
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className='w-5 h-5' />
          <span className='font-medium text-sm'>Settings</span>
        </button>

        <button className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600'>
          <LogOut className='w-5 h-5' />
          <span className='font-medium text-sm'>Logout</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className='bg-white rounded-2xl border border-border p-4 lg:p-6 lg:sticky lg:top-32'>
        <div className='text-center mb-6'>
          {userProfile.avatar && (userProfile.avatar.startsWith('http') || userProfile.avatar.startsWith('https') || userProfile.avatar.startsWith('data:')) ? (
            <div className='w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2' style={{ borderColor: '#ef864c40' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className='w-full h-full object-cover'
                key={userProfile.avatar} // Force re-render when avatar changes
              />
            </div>
          ) : (
            <div className='w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4' style={{ backgroundColor: '#ef864c' }}>
              <span className='text-white font-bold'>
                {userProfile.avatar || userProfile.name?.charAt(0) || userProfile.email?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className='font-heading font-bold text-foreground'>
              {userProfile.name}
            </h3>
            {userProfile?.verificationStatus === "approved" && (
              <span
                className="inline-flex items-center"
                title="Verified User"
              >
                <svg
                  className="w-4 h-4 text-blue-500 dark:text-blue-400"
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
          <p className='text-xs text-muted-foreground mb-3'>
            {userProfile.email}
          </p>
          <div className='text-xs text-muted-foreground mb-4'>
            <p>{userProfile.location || 'Not specified'}</p>
            <p>{userProfile.joinDate || 'Recently joined'}</p>
          </div>
        </div>

        <Button
          className='w-full mb-2 text-white'
          style={{ backgroundColor: '#ef864c' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
          onClick={() => handleNavigation('/real-estate/buyer/profile/edit')}
        >
          Edit Profile
        </Button>
        <Button
          variant='outline'
          className='w-full'
          size='sm'
          onClick={() => handleNavigation('/real-estate/buyer/profile')}
        >
          View Full Profile
        </Button>
      </div>
    </>
  )
}

export function BuyerSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data, isLoading } = useGetCurrentUserQuery('realestate_buyer')
  const userProfile = data?.user
  const [isClient] = useState(() => typeof window !== 'undefined')

  const isActive = (path: string) => {
    if (path === '/real-estate/buyer/dashboard') {
      return pathname === '/real-estate/buyer/dashboard'
    }
    return pathname?.startsWith(path)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Get current active menu item text
  const getActiveMenuText = () => {
    if (isActive('/real-estate/buyer/dashboard')) return 'Dashboard'
    if (isActive('/real-estate/buyer/properties')) return 'Properties'
    if (isActive('/real-estate/buyer/messages')) return 'Messages'
    if (isActive('/real-estate/buyer/profile')) return 'Profile'
    if (isActive('/settings')) return 'Settings'
    return 'Menu'
  }

  const activeMenuText = getActiveMenuText()

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className='hidden lg:block lg:col-span-1'>
        <BuyerSidebarContent />
      </div>

      {/* Mobile Dropdown Menu - Shows at top on mobile */}
      {isClient && (
        <div className='lg:hidden mb-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-auto py-2.5 border-border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  )} style={
                    isActive('/real-estate/buyer/dashboard') || isActive('/real-estate/buyer/properties') || isActive('/real-estate/buyer/messages') || isActive('/real-estate/buyer/profile') 
                      ? { backgroundColor: '#ef864c' }
                      : isActive('/settings')
                      ? {}
                      : { backgroundColor: '#ef864c20' }
                  }>
                    {isActive('/real-estate/buyer/dashboard') && (
                      <LayoutDashboard className={cn(
                        "w-4 h-4",
                        'text-white'
                      )} />
                    )}
                    {isActive('/real-estate/buyer/properties') && (
                      <Building2 className={cn(
                        "w-4 h-4",
                        'text-white'
                      )} />
                    )}
                    {isActive('/real-estate/buyer/messages') && (
                      <Inbox className={cn(
                        "w-4 h-4",
                        'text-white'
                      )} />
                    )}
                    {isActive('/real-estate/buyer/profile') && (
                      <User className={cn(
                        "w-4 h-4",
                        'text-white'
                      )} />
                    )}
                    {isActive('/settings') && (
                      <Settings className={cn(
                        "w-4 h-4",
                        'text-foreground'
                      )} />
                    )}
                    {!isActive('/real-estate/buyer/dashboard') && 
                     !isActive('/real-estate/buyer/properties') && 
                     !isActive('/real-estate/buyer/messages') && 
                     !isActive('/real-estate/buyer/profile') && 
                     !isActive('/settings') && (
                      <Menu className="w-4 h-4" style={{ color: '#ef864c' }} />
                    )}
                  </div>
                  <span className="text-sm font-semibold" style={
                    (isActive('/real-estate/buyer/dashboard') || 
                     isActive('/real-estate/buyer/properties') || 
                     isActive('/real-estate/buyer/messages') || 
                     isActive('/real-estate/buyer/profile')) ? { color: '#0f4656' } : {}
                  }>
                    {activeMenuText}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuItem
                onClick={() => handleNavigation('/real-estate/buyer/dashboard')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive('/real-estate/buyer/dashboard') 
                    ? 'border' 
                    : 'hover:bg-muted'
                )}
                style={isActive('/real-estate/buyer/dashboard') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40', color: '#0f4656' } : {}}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center'
                )}
                style={isActive('/real-estate/buyer/dashboard') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
                >
                  <LayoutDashboard className={cn(
                    'w-5 h-5'
                  )} style={isActive('/real-estate/buyer/dashboard') ? { color: '#fff' } : { color: '#ef864c' }} />
                </div>
                <span className="font-medium text-sm">Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavigation('/real-estate/buyer/properties')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive('/real-estate/buyer/properties') 
                    ? 'border' 
                    : 'hover:bg-muted'
                )}
                style={isActive('/real-estate/buyer/properties') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40', color: '#0f4656' } : {}}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center'
                )}
                style={isActive('/real-estate/buyer/properties') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
                >
                  <Building2 className={cn(
                    'w-5 h-5'
                  )} style={isActive('/real-estate/buyer/properties') ? { color: '#fff' } : { color: '#ef864c' }} />
                </div>
                <span className="font-medium text-sm">Properties</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavigation('/real-estate/buyer/messages')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive('/real-estate/buyer/messages') 
                    ? 'border' 
                    : 'hover:bg-muted'
                )}
                style={isActive('/real-estate/buyer/messages') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40', color: '#0f4656' } : {}}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center'
                )}
                style={isActive('/real-estate/buyer/messages') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
                >
                  <Inbox className={cn(
                    'w-5 h-5'
                  )} style={isActive('/real-estate/buyer/messages') ? { color: '#fff' } : { color: '#ef864c' }} />
                </div>
                <span className="font-medium text-sm">Messages</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavigation('/real-estate/buyer/profile')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive('/real-estate/buyer/profile') 
                    ? 'border' 
                    : 'hover:bg-muted'
                )}
                style={isActive('/real-estate/buyer/profile') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40', color: '#0f4656' } : {}}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center'
                )}
                style={isActive('/real-estate/buyer/profile') ? { backgroundColor: '#ef864c' } : { backgroundColor: '#ef864c20' }}
                >
                  <User className={cn(
                    'w-5 h-5'
                  )} style={isActive('/real-estate/buyer/profile') ? { color: '#fff' } : { color: '#ef864c' }} />
                </div>
                <span className="font-medium text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleNavigation('/real-estate/seller/dashboard')}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ color: '#ef864c' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef864c20'
                  e.currentTarget.style.color = '#d9723f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.color = '#ef864c'
                }}
              >
                <Store className="w-5 h-5" />
                <span className="font-medium text-sm">Switch to Selling</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavigation('/settings')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive('/settings') 
                    ? 'border' 
                    : 'hover:bg-muted'
                )}
                style={isActive('/settings') ? { backgroundColor: '#ef864c20', borderColor: '#ef864c40', color: '#0f4656' } : {}}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-sm">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600">
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  )
}

