-- Create testimonials table
create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  text text not null,
  rating integer not null default 5,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.testimonials enable row level security;

-- Public can read active testimonials
create policy "Anyone can read active testimonials"
  on public.testimonials for select
  using (is_active = true);

-- Authenticated users can manage testimonials
create policy "Authenticated users can manage testimonials"
  on public.testimonials for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create index for sorting
create index if not exists idx_testimonials_sort_order on public.testimonials(sort_order);
