'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            GovHub
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === "/" ? "text-blue-600" : "text-gray-600"
              )}
            >
              Home
            </Link>
            <Link
              href="/contracts"
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === "/contracts" ? "text-blue-600" : "text-gray-600"
              )}
            >
              Contracts
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === "/about" ? "text-blue-600" : "text-gray-600"
              )}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
