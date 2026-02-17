-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Stash Posts Table
create table public.stash_posts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text not null,
  category text not null,
  saved_by text not null,
  type text check (type in ('reel', 'post')) not null
);

-- 2. Moments Table
create table public.moments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  date date not null,
  description text,
  tags text[],
  media_urls jsonb[] -- Stores array of objects {id, type, url, thumbnail}
);

-- 3. Plans Events Table
create table public.plans_events (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  date date not null,
  type text check (type in ('anniversary', 'birthday', 'trip', 'date', 'appointment', 'finance', 'celebration', 'reminder')) not null
);

-- 4. Transactions Table (Kaun Kitna)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text not null,
  amount numeric not null,
  paid_by text not null,
  date date not null,
  category text check (category in ('food', 'groceries', 'bills', 'transport', 'other')) not null
);

-- Enable Row Level Security (RLS) - Optional for private app but recommended
alter table public.stash_posts enable row level security;
alter table public.moments enable row level security;
alter table public.plans_events enable row level security;
alter table public.transactions enable row level security;

-- Create policy to allow all operations for anon (since it's a private app with shared key)
-- In a real production app with auth, you'd restrict this.
create policy "Allow all access" on public.stash_posts for all using (true);
create policy "Allow all access" on public.moments for all using (true);
create policy "Allow all access" on public.plans_events for all using (true);
create policy "Allow all access" on public.transactions for all using (true);
