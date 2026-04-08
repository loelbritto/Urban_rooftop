'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Leaf, LayoutDashboard, MapPin, Sprout, Trash2, ShoppingBasket } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/spaces', label: 'Spaces', icon: MapPin },
  { href: '/advisor', label: 'Crop Advisor', icon: Sprout },
  { href: '/compost', label: 'Compost', icon: Trash2 },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBasket },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-green-700 text-lg">
        <Leaf size={20} />
        Urban Rooftop
      </Link>
      <div className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </nav>
  )
}