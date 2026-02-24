'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateIdea } from '@/hooks/use-ideas';
import { useCategories } from '@/hooks/use-categories';
import { IdeaForm } from '@/components/ideas/idea-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewIdeaPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createIdea = useCreateIdea();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || categoriesLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to ideas
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#6366f1] flex items-center justify-center">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Submit New Idea</h1>
            <p className="text-sm text-gray-500">Share your startup concept with the community</p>
          </div>
        </div>

        <IdeaForm
          categories={categories}
          onSubmit={async (data) => {
            await createIdea.mutateAsync(data as Parameters<typeof createIdea.mutateAsync>[0]);
            router.push('/');
          }}
          onCancel={() => router.push('/')}
          isLoading={createIdea.isPending}
        />
      </div>
    </div>
  );
}
