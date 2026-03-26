import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';

// GET /api/apps/similar?q=search+term — fuzzy search for similar apps
export async function GET(request: NextRequest) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  // Use pg_trgm similarity search
  // This requires the pg_trgm extension enabled in Supabase
  const { data, error } = await supabase.rpc('search_similar_apps', {
    search_term: query,
    threshold: 0.3,
    max_results: 5,
  });

  if (error) {
    // Fallback to simple ILIKE if the RPC doesn't exist yet
    const { data: fallback } = await supabase
      .from('apps')
      .select('id, name, problem_statement, tier, created_by')
      .neq('status', 'archived')
      .or(`name.ilike.%${query}%,problem_statement.ilike.%${query}%`)
      .limit(5);

    return NextResponse.json(fallback || []);
  }

  return NextResponse.json(data);
}
