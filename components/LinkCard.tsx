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
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300">
      <div className="space-y-4">
        {/* Header with slug and click count */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <code className="text-sm font-mono font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{slug}</code>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{clickCount}</p>
            <p className="text-xs text-slate-600">clicks</p>
          </div>
        </div>

        {/* Original URL */}
        <div className="py-3 border-t border-b border-slate-200">
          <p className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wide">Original URL</p>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
          >
            {originalUrl}
          </a>
        </div>

        {/* Shortened URL with copy button */}
        <div>
          <p className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wide">Short URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-slate-100 p-3 rounded-lg border border-slate-200 truncate hover:bg-slate-150 transition-colors">
              {shortenedUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(shortenedUrl)}
              className="hover:bg-blue-50"
            >
              Copy
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-300">
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
