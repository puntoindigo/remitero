-- Create notification_preferences table for SUPERADMIN
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  send_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_action ON notification_preferences(action);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Insert default preferences for all activity actions (all disabled by default)
INSERT INTO notification_preferences (action, enabled, send_email) VALUES
  ('LOGIN', false, false),
  ('LOGOUT', false, false),
  ('CREATE_REMITO', false, false),
  ('UPDATE_REMITO', false, false),
  ('DELETE_REMITO', false, false),
  ('CREATE_CLIENT', false, false),
  ('UPDATE_CLIENT', false, false),
  ('DELETE_CLIENT', false, false),
  ('CREATE_PRODUCT', false, false),
  ('UPDATE_PRODUCT', false, false),
  ('DELETE_PRODUCT', false, false),
  ('CREATE_CATEGORY', false, false),
  ('UPDATE_CATEGORY', false, false),
  ('DELETE_CATEGORY', false, false),
  ('CREATE_ESTADO_REMITO', false, false),
  ('UPDATE_ESTADO_REMITO', false, false),
  ('DELETE_ESTADO_REMITO', false, false),
  ('CREATE_USER', false, false),
  ('UPDATE_USER', false, false),
  ('DELETE_USER', false, false),
  ('ACTIVATE_USER', false, false),
  ('DEACTIVATE_USER', false, false),
  ('RESEND_INVITATION', false, false),
  ('UPDATE_PROFILE', false, false),
  ('VIEW_REPORT', false, false),
  ('EXPORT_DATA', false, false),
  ('OTHER', false, false)
ON CONFLICT (action) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE notification_preferences IS 'Preferencias de notificaciones para SUPERADMIN sobre actividades del sistema';

