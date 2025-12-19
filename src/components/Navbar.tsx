import { auth } from '@/lib/auth'
import NavbarClient from './NavbarClient'

interface MenuItem {
  id: string
  label: string
  url: string
  megaMenu: boolean
  children?: MenuItem[]
}

interface NavbarProps {
  siteName?: string
  logo?: string | null
  promoText?: string | null
  promoActive?: boolean
  menuItems?: MenuItem[]
}

export default async function Navbar({
  siteName,
  logo,
  promoText,
  promoActive = false,
  menuItems = [],
}: NavbarProps) {
  const session = await auth()

  return (
    <>
      {promoActive && promoText && (
        <div className="bg-black font-medium text-white py-4 text-sm text-center">
          ✨ {promoText} ✨
        </div>
      )}

      <nav className="bg-white backdrop-blur-lg sticky top-0 z-50">
        <NavbarClient
          siteName={siteName || 'Online Store'}
          logo={logo}
          isLoggedIn={!!session}
          userName={session?.user?.name}
          menuItems={menuItems}
        />
      </nav>
    </>
  )
}
