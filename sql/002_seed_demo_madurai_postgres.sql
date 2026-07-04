insert into public.sensitive_places (name, place_type, latitude, longitude, weight) values
  ('Demo Government School', 'school', 9.930100, 78.120600, 10),
  ('Demo Primary Health Centre', 'hospital', 9.923500, 78.118900, 12),
  ('Demo Bus Stand', 'bus_stand', 9.925700, 78.121700, 6)
on conflict do nothing;

insert into public.issue_clusters (
  category,
  center_latitude,
  center_longitude,
  report_count,
  priority_score,
  severity,
  status,
  assigned_department,
  latest_reason,
  created_at,
  updated_at
) values
  ('road_damage', 9.930050, 78.120450, 23, 91, 'critical', 'received', 'Public Works / Highways', 'Large pothole near school zone; repeated citizen reports.', now() - interval '18 hours', now()),
  ('garbage', 9.922900, 78.119500, 12, 67, 'high', 'assigned', 'Municipality Sanitation', 'Garbage pile visible near market area.', now() - interval '2 days', now()),
  ('drain_blockage', 9.927900, 78.124000, 8, 76, 'high', 'received', 'Drainage / Stormwater Department', 'Blocked stormwater drain with rainfall risk.', now() - interval '8 hours', now()),
  ('broken_streetlight', 9.918500, 78.115900, 5, 43, 'medium', 'in_progress', 'Electricity / Street Lighting', 'Dark streetlight corridor reported by residents.', now() - interval '3 days', now())
on conflict do nothing;
