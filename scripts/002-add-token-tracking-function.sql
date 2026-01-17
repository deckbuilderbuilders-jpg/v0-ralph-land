-- Function to increment token counts on a build
CREATE OR REPLACE FUNCTION increment_build_tokens(
  p_build_id UUID,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.builds
  SET 
    actual_tokens_input = COALESCE(actual_tokens_input, 0) + p_input_tokens,
    actual_tokens_output = COALESCE(actual_tokens_output, 0) + p_output_tokens,
    actual_cost = (
      (COALESCE(actual_tokens_input, 0) + p_input_tokens) / 1000000.0 * 3.0 +
      (COALESCE(actual_tokens_output, 0) + p_output_tokens) / 1000000.0 * 15.0
    )
  WHERE id = p_build_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
