// ── Supabase client ───────────────────────────────────────────────────────────
// Single shared instance imported by every page that needs database access.
//
// Required environment variables (Vite reads VITE_* from .env.local):
//   VITE_SUPABASE_URL      — Project URL from Supabase Dashboard → Settings → API
//   VITE_SUPABASE_ANON_KEY — anon/public key from the same page
//
// The client is null when the env vars are not yet set, so pages can show a
// clear "not configured" message instead of crashing.

import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL?.trim();
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase =
  url && key && !url.startsWith('your-')
    ? createClient(url, key)
    : null;

// ── Column-name helpers ───────────────────────────────────────────────────────
// The DB uses snake_case; the app uses camelCase.
// These mappers run once at the boundary so no other file needs to know.

/** Map an `items` row → app item shape */
export function rowToItem(r) {
  return {
    id:           r.id,
    name:         r.name          ?? '',
    category:     r.category      ?? '',
    description:  r.description   ?? '',
    location:     r.location      ?? '',
    condition:    r.condition      ?? 'Good',
    borrowingFee: Number(r.price)  ?? 0,   // DB column is "price"
    availability: r.status?.toLowerCase() ?? 'available', // DB column is "status"
    image:        r.image_url      ?? '',
    createdAt:    r.created_at     ?? '',
    // fields the DB doesn't store yet — keep sensible defaults
    borrowPeriod: 7,
    tags:         [],
  };
}

/** Map an app item → `items` row for insert/update */
export function itemToRow(item) {
  return {
    name:        item.name,
    category:    item.category,
    description: item.description ?? '',
    location:    item.location,
    condition:   item.condition,
    price:       Number(item.borrowingFee) || 0,
    status:      item.availability ?? 'available',
    image_url:   item.image ?? '',
  };
}

/** Map a `borrow_requests` row → app request shape */
export function rowToRequest(r) {
  return {
    id:          r.id,
    itemId:      r.item_id        ?? '',
    itemName:    r.item_name      ?? '',   // joined from items
    studentName: r.student_name   ?? '',
    studentId:   r.student_id     ?? '',
    startDate:   r.start_date     ?? '',
    endDate:     r.end_date       ?? '',
    status:      r.status?.toLowerCase() ?? 'pending',
    requestDate: r.created_at     ?? '',
    purpose:     r.purpose        ?? '',
    notes:       r.notes          ?? '',
    adminNote:   r.admin_note     ?? '',
  };
}

/** Map a `lost_found_reports` row → app report shape */
export function rowToReport(r) {
  return {
    id:          r.id,
    type:        r.type           ?? 'lost',
    title:       r.title          ?? '',
    description: r.description    ?? '',
    location:    r.location       ?? '',
    date:        r.date_reported  ?? '',
    category:    r.category       ?? '',
    contactInfo: r.contact        ?? '',
    reporterId:  r.reporter       ?? '',
    status:      r.status?.toLowerCase() ?? 'open',
    adminNote:   r.admin_note     ?? '',
    image:       r.image_url      ?? '',
  };
}
