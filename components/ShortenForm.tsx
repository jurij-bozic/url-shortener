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

export function ShortenForm() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const shortenedUrl = result ? `${window.location.origin}/${result.slug}` : '';

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Shorten Your URL</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="originalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very/long/url"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Slug (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="myslug"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Shorten URL'}
            </Button>
          </form>
        </Form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-4">Success! Your link is ready</h3>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shortened URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border rounded text-sm break-all">
                  {shortenedUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shortenedUrl);
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Original URL:</p>
              <a
                href={result.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {result.originalUrl}
              </a>
            </div>

            <p className="text-xs text-gray-500">
              Created: {new Date(result.createdAt).toLocaleString()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
