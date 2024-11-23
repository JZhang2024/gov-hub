import { Metadata } from 'next';
import ContractList from '@/components/contracts/ContractList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contracts - GovHub',
  description: 'Browse and search government contracts',
};

export default function Contracts() {
  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost">About</Button>
          </Link>
        </div>
        <ContractList />
      </div>
    </main>
  );
}
