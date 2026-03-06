-- Add notifications table for in-app notification system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    community_id UUID NOT NULL REFERENCES communities(id),
    type TEXT NOT NULL CHECK (type IN ('message', 'forum_reply', 'event_reminder', 'announcement')),
    title TEXT NOT NULL,
    body TEXT,
    related_id TEXT,
    related_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user and community
CREATE INDEX IF NOT EXISTS idx_notifications_user_community ON notifications(user_id, community_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, community_id, is_read) WHERE is_read = false;
