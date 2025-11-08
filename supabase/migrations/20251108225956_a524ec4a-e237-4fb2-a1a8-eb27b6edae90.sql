-- Clean up duplicate notifications
-- Delete duplicate lead_follow_up notifications keeping only the most recent one per lead
DELETE FROM notifications
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY recipient_id, type, (payload->>'lead_id')
        ORDER BY created_at DESC
      ) as rn
    FROM notifications
    WHERE type = 'lead_follow_up'
      AND (payload->>'lead_id') IS NOT NULL
  ) t
  WHERE t.rn > 1
);

-- Delete old unread notifications (older than 7 days)
DELETE FROM notifications
WHERE read = false
  AND created_at < NOW() - INTERVAL '7 days';

-- Create index to improve duplicate detection performance
CREATE INDEX IF NOT EXISTS idx_notifications_duplicate_check 
ON notifications(recipient_id, type, read, created_at) 
WHERE read = false;