-- When staff record that an accepted booking's deposit has arrived. Empty
-- means still due; the hold runs 72 hours from acceptance (decided_at).
ALTER TABLE bookings ADD COLUMN deposit_paid_at TEXT;
ALTER TABLE bookings ADD COLUMN deposit_paid_by TEXT;
