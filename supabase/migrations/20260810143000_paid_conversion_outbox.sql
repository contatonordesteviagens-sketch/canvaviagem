-- Keep Stripe paid-conversion delivery idempotent across webhook retries.
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_paid_invoice_unique
ON public.analytics_events ((event_data->>'invoice_id'))
WHERE event_type IN ('purchase_paid_pending', 'purchase_paid')
  AND event_data ? 'invoice_id';
