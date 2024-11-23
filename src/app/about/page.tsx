import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - GovHub',
  description: 'Learn more about GovHub - Your AI-powered government contract search platform',
};

export default function About() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" className="inline-block mb-8">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-6">About GovHub</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-600 mb-6">
          GovHub is an innovative platform designed to make government contract searching and analysis more accessible and efficient through AI-powered tools.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-6">
          We aim to simplify the process of finding and understanding government contracts by providing intelligent search capabilities and AI-assisted analysis.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
        <ul className="list-disc pl-6 space-y-3 text-gray-600">
          <li>AI-powered contract analysis</li>
          <li>Intelligent search capabilities</li>
          <li>Real-time contract updates</li>
          <li>Interactive contract assistant</li>
          <li>Detailed contract insights</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
        <p className="text-gray-600 mb-6">
          Our platform uses advanced AI technology to analyze government contracts and provide meaningful insights. Users can easily search through contracts, ask questions about specific details, and receive intelligent responses from our AI assistant.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="text-gray-600">
          Have questions or feedback? We'd love to hear from you. Contact us at{' '}
          <a href="mailto:contact@govhub.com" className="text-blue-600 hover:text-blue-800">
            contact@govhub.com
          </a>
        </p>
      </div>
    </main>
  );
}
