import { Metadata } from 'next';
import ContractList from '@/components/contracts/ContractList';

export const metadata: Metadata = {
  title: 'Contracts - GovHub',
  description: 'Browse and search government contracts',
};

export default function Contracts() {
  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <ContractList />
      </div>
    </main>
  );
}
