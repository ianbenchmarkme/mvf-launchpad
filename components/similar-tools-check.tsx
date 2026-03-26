'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface SimilarApp {
  id: string;
  name: string;
  problem_statement: string;
  tier: string;
}

interface SimilarToolsCheckProps {
  query: string;
}

export function SimilarToolsCheck({ query }: SimilarToolsCheckProps) {
  const [results, setResults] = useState<SimilarApp[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/apps/similar?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // Silently fail — non-critical feature
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (loading || results.length === 0) return null;

  return (
    <div className="rounded border border-amber-200 bg-amber-50 p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        Similar tools already registered
      </div>
      <ul className="space-y-1.5">
        {results.map((app) => (
          <li key={app.id} className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium text-amber-900">{app.name}</span>
              <span className="text-amber-700 ml-2 text-xs">
                {app.problem_statement.length > 60
                  ? app.problem_statement.slice(0, 60) + '…'
                  : app.problem_statement}
              </span>
            </div>
            <a
              href={`/apps/${app.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:text-amber-900 shrink-0 ml-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-amber-600">
        If your tool is different, continue with registration.
      </p>
    </div>
  );
}
