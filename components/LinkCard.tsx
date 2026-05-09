'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Trash2, BarChart3 } from 'lucide-react';

interface LinkCardProps {
  slug: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  onDelete: (slug: string) => Promise<void>;
}

export function LinkCard({ slug, originalUrl, createdAt, clickCount, onDelete }: LinkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState('');

  useEffect(() => {
    setShortenedUrl(`${window.location.origin}/${slug}`);
  }, [slug]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(slug);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header with slug and click count */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <code className="text-sm font-mono font-semibold text-blue-600">{slug}</code>
            </div>
            <p className="text-xs text-gray-500">
              Created {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{clickCount}</p>
            <p className="text-xs text-gray-600">clicks</p>
          </div>
        </div>

        {/* Original URL */}
        <div className="py-2 border-t border-b">
          <p className="text-xs text-gray-600 mb-1">Original URL:</p>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {originalUrl}
          </a>
        </div>

        {/* Shortened URL with copy button */}
        <div>
          <p className="text-xs text-gray-600 mb-1">Short URL:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-gray-50 p-2 rounded border truncate">
              {shortenedUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(shortenedUrl)}
            >
              Copy
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </Button>
          </Link>

          {showDeleteConfirm ? (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
