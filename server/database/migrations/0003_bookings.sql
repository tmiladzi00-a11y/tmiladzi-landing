-- Booking requests from the website, and time the studio blocks by hand.
-- Availability is read from here: an approved booking or a block takes its
-- time off the calendar; pending and declined requests take nothing.

CREATE TABLE bookings (
  ref               TEXT PRIMARY KEY,               -- 'TM-7KQ2PX', shown to the client
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'declined', 'cancelled')),
  package_id        TEXT NOT NULL,
  package_name      TEXT NOT NULL,
  -- the package exactly as quoted (prices, hours, add-ons): approval re-prices
  -- against this, not against whatever the package costs by then
  package_snapshot  TEXT NOT NULL,
  date              TEXT NOT NULL,                  -- 'YYYY-MM-DD', studio time
  start             TEXT NOT NULL,                  -- 'HH:MM', studio time
  requested_hours   INTEGER NOT NULL,               -- package hours + any extra time asked for
  approved_hours    INTEGER,                        -- set by staff on approval
  addons            TEXT NOT NULL DEFAULT '{}',     -- JSON { addonId: quantity }
  total             INTEGER NOT NULL,               -- Kwacha, priced lines only
  deposit           INTEGER NOT NULL,
  deposit_pct       INTEGER NOT NULL,
  tbq               INTEGER NOT NULL DEFAULT 0,     -- some lines are quoted separately
  delivery_text     TEXT NOT NULL DEFAULT '',
  name              TEXT NOT NULL,
  partner           TEXT NOT NULL DEFAULT '',
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  venue             TEXT NOT NULL DEFAULT '',
  region            TEXT NOT NULL DEFAULT '',
  guests            TEXT NOT NULL DEFAULT '',
  heard             TEXT NOT NULL DEFAULT '',
  notes             TEXT NOT NULL DEFAULT '',
  terms_version     TEXT NOT NULL,
  privacy_version   TEXT NOT NULL,
  terms_fingerprint TEXT NOT NULL DEFAULT '',
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  accepted_at       TEXT NOT NULL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at        TEXT,
  decided_by        TEXT,
  decision_note     TEXT NOT NULL DEFAULT ''        -- decline or cancel reason, shown to the client
);
CREATE INDEX bookings_status_date ON bookings (status, date);

CREATE TABLE blocks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,                        -- 'YYYY-MM-DD'
  start       TEXT NOT NULL,                        -- 'HH:MM'
  end         TEXT NOT NULL,                        -- 'HH:MM', or '24:00' for the rest of the day
  reason      TEXT NOT NULL DEFAULT '',             -- staff only: 'Phone booking: Banda wedding'
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  created_by  TEXT
);
CREATE INDEX blocks_date ON blocks (date);
