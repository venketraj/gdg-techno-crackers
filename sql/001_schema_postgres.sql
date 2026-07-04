create extension if not exists pgcrypto;

create table if not exists public.issue_clusters (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'road_damage',
    'garbage',
    'drain_blockage',
    'water_leakage',
    'broken_streetlight',
    'flooding',
    'fallen_tree',
    'illegal_dumping',
    'unknown'
  )),
  center_latitude double precision not null,
  center_longitude double precision not null,
  report_count integer not null default 1 check (report_count >= 1),
  priority_score integer not null default 0 check (priority_score between 0 and 100),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'received' check (status in (
    'received',
    'assigned',
    'in_progress',
    'resolved',
    'citizen_verified'
  )),
  assigned_department text,
  latest_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_path text not null,
  latitude double precision not null,
  longitude double precision not null,
  category text not null check (category in (
    'road_damage',
    'garbage',
    'drain_blockage',
    'water_leakage',
    'broken_streetlight',
    'flooding',
    'fallen_tree',
    'illegal_dumping',
    'unknown'
  )),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  confidence numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  description text,
  ai_reason text,
  cluster_id uuid references public.issue_clusters(id) on delete set null,
  status text not null default 'received' check (status in (
    'received',
    'assigned',
    'in_progress',
    'resolved',
    'citizen_verified'
  )),
  created_at timestamptz not null default now()
);

create table if not exists public.status_updates (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references public.issue_clusters(id) on delete cascade,
  status text not null check (status in (
    'received',
    'assigned',
    'in_progress',
    'resolved',
    'citizen_verified'
  )),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.sensitive_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  place_type text not null check (place_type in ('school', 'hospital', 'bus_stand', 'market', 'other')),
  latitude double precision not null,
  longitude double precision not null,
  weight integer not null default 5 check (weight between 1 and 20),
  created_at timestamptz not null default now()
);

create index if not exists idx_issue_clusters_category_status on public.issue_clusters(category, status);
create index if not exists idx_issue_clusters_priority on public.issue_clusters(priority_score desc);
create index if not exists idx_issue_clusters_updated_at on public.issue_clusters(updated_at desc);
create index if not exists idx_reports_cluster_id on public.reports(cluster_id);
create index if not exists idx_reports_created_at on public.reports(created_at desc);
