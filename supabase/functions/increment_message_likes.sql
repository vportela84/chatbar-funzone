
CREATE OR REPLACE FUNCTION increment_message_likes(message_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chat_messages
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = message_id;
END;
$$;
