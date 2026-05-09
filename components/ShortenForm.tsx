'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';

const shortenFormSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  customSlug: z
    .string()
    .regex(/^[a-zA-Z0-9]{3,30}$/, 'Slug must be 3-30 alphanumeric characters')
    .optional()
    .or(z.literal('')),
});

type ShortenFormValues = z.infer<typeof shortenFormSchema>;

interface ShortenedLink {
  slug: string;
  originalUrl: string;
  id: string;
  createdAt: string;
}

interface ShortenFormProps {
  onSuccess?: () => void;
}

export function ShortenForm({ onSuccess }: ShortenFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenedLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ShortenFormValues>({
    resolver: zodResolver(shortenFormSchema),
    defaultValues: {
      originalUrl: '',
      customSlug: '',
    },
  });

  async function onSubmit(values: ShortenFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: values.originalUrl,
          customSlug: values.customSlug || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      setResult(data);
      form.reset();
      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const shortenedUrl = result ? `${window.location.origin}/${result.slug}` : '';

  return (
    <div className="w-full max-w-md space-y-6 sticky top-24">
      <Card className="p-8 bg-white border-slate-200 shadow-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Shorten URL</h2>
        <p className="text-sm text-slate-600 mb-6">Create a short link and start tracking analytics</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="originalUrl"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">URL to Shorten</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very/long/url"
                      {...field}
                      disabled={isLoading}
                      className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customSlug"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Custom Slug <span className="text-slate-400">(optional)</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="myslug"
                      {...field}
                      disabled={isLoading}
                      className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/50 text-white font-semibold rounded-lg py-6 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Shorten URL'}
            </Button>
          </form>
        </Form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <h3 className="font-semibold text-green-900">Success! Your link is ready</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-green-700 mb-2 font-semibold uppercase tracking-wide">Shortened URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-white border border-green-200 rounded-lg text-sm break-all font-mono">
                  {shortenedUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shortenedUrl);
                  }}
                  className="hover:bg-green-100"
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-green-700 mb-2 font-semibold uppercase tracking-wide">Original URL</p>
              <a
                href={result.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 hover:underline text-sm break-all font-medium"
              >
                {result.originalUrl}
              </a>
            </div>

            <p className="text-xs text-green-600">
              Created: {new Date(result.createdAt).toLocaleString()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
