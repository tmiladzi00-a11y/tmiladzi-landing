-- CMS schema: bookable packages, their add-ons, and page/booking settings.
-- Money is whole Kwacha. NULL price means "quoted separately".

CREATE TABLE packages (
  id            TEXT PRIMARY KEY,               -- slug: 'wedding', 'events'
  tier          TEXT NOT NULL CHECK (tier IN ('basic', 'premium')),
  name          TEXT NOT NULL,
  tag           TEXT NOT NULL DEFAULT '',
  price         INTEGER,
  deposit_pct   INTEGER NOT NULL DEFAULT 50 CHECK (deposit_pct BETWEEN 0 AND 100),
  hours         INTEGER NOT NULL CHECK (hours > 0),
  coverage      TEXT NOT NULL,
  delivery      INTEGER NOT NULL CHECK (delivery >= 0),
  delivery_unit TEXT NOT NULL CHECK (delivery_unit IN ('weeks', 'hours')),
  live          INTEGER NOT NULL DEFAULT 1,
  blurb         TEXT NOT NULL DEFAULT '',
  includes      TEXT NOT NULL DEFAULT '[]',     -- JSON array of strings
  notes         TEXT NOT NULL DEFAULT '[]',     -- JSON array of strings
  sort          INTEGER NOT NULL DEFAULT 0,
  published     INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by    TEXT
);

CREATE TABLE addons (
  package_id  TEXT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  id          TEXT NOT NULL,                    -- 'time' is billed automatically for hours beyond the package
  name        TEXT NOT NULL,
  unit        TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL CHECK (type IN ('qty', 'toggle')),
  price       INTEGER,
  max         INTEGER,
  description TEXT NOT NULL DEFAULT '',
  affects     TEXT CHECK (affects IS NULL OR affects = 'delivery'),
  sort        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (package_id, id)
);

-- One JSON document per key ('booking': page copy, bookable hours, form lists).
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
