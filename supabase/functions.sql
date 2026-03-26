-- pg_trgm fuzzy search function for similar apps
-- Run AFTER schema.sql

CREATE OR REPLACE FUNCTION search_similar_apps(
  search_term TEXT,
  threshold FLOAT DEFAULT 0.3,
  max_results INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  problem_statement TEXT,
  tier app_tier,
  created_by UUID,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.problem_statement,
    a.tier,
    a.created_by,
    GREATEST(
      similarity(a.name, search_term),
      similarity(a.problem_statement, search_term)
    )::FLOAT AS similarity_score
  FROM apps a
  WHERE a.status != 'archived'
    AND (
      similarity(a.name, search_term) > threshold
      OR similarity(a.problem_statement, search_term) > (threshold * 0.7)
    )
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
