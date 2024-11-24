import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - GovHub',
  description: 'Learn more about GovHub - A learning project exploring AI and government contract data',
};

export default function About() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About GovHub</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-600 mb-6">
          GovHub is a personal learning project aimed at exploring modern web development technologies
          and AI capabilities while making government contract data more accessible.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Tech Stack</h2>
        <ul className="list-disc pl-6 space-y-3 text-gray-600">
          <li><strong>Frontend:</strong> Next.js 15 with App Router, React, TypeScript, and Tailwind CSS</li>
          <li><strong>UI Components:</strong> Shadcn/ui for modern, accessible components</li>
          <li><strong>Database:</strong> Supabase for PostgreSQL database</li>
          <li><strong>AI Integration:</strong> OpenAPI using xAI's grok-beta for contract analysis and question answering</li>
          <li><strong>Data Processing:</strong> Supabase DB and Edge Functions with SQL/TypeScript for ETL and data transformation</li>
          <li><strong>Deployment:</strong> Vercel for frontend hosting and serverless functions</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">APIs and Data Sources</h2>
        <ul className="list-disc pl-6 space-y-3 text-gray-600">
          <li><strong>SAM.gov API:</strong> Used to fetch government contract data</li>
          <li><strong>xAI API:</strong> Powers the AI assistant for contract analysis</li>
          <li><strong>Supabase API:</strong> Handles data storage and advanced SQL queries (e.g filtering and sorting)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Project Goals</h2>
        <p className="text-gray-600 mb-6">
          This project serves as a practical exploration of:
        </p>
        <ul className="list-disc pl-6 space-y-3 text-gray-600">
          <li>Building modern web applications with Next.js and React</li>
          <li>Implementing AI capabilities in real-world applications</li>
          <li>Working with government APIs and large datasets</li>
          <li>Creating intuitive user interfaces for complex data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Open Source</h2>
        <p className="text-gray-600 mb-6">
          This project is open source and available on GitHub. Feel free to explore the code, submit issues,
          or contribute to the project.
        </p>
        <div className="mt-4">
          <a
            href="https://github.com/JZhang2024/gov-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            View on GitHub
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
