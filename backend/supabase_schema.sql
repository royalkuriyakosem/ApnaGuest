-- Drop existing tables and types to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.agent_ratings;
DROP TABLE IF EXISTS public.service_tasks;
DROP TABLE IF EXISTS public.complaints;
DROP TABLE IF EXISTS public.maintenance_requests; -- Dropping old table
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.service_agents;
DROP TABLE IF EXISTS public.rooms;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.task_status;
DROP TYPE IF EXISTS public.complaint_status;
DROP TYPE IF EXISTS public.request_status; -- Dropping old type
DROP TYPE IF EXISTS public.availability_status;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.room_status;
DROP TYPE IF EXISTS public.user_role;

-- Create custom types
create type user_role as enum ('admin', 'tenant', 'service_agent');
create type service_type as enum ('plumber', 'electrician', 'cleaner', 'other');
create type availability_status as enum ('available', 'busy', 'inactive');
create type complaint_status as enum ('open', 'assigned', 'in_progress', 'resolved');
create type task_status as enum ('assigned', 'in_progress', 'completed');
create type room_status as enum ('vacant', 'occupied', 'maintenance');

-- 1. Profiles Table (Centralized User Data)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  phone_number text,
  role user_role NOT NULL default 'tenant',
  address text,
  aadhaar_id text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- 2. Service Agents Table (Extension for Service Agents)
create table public.service_agents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  service_type service_type not null,
  experience_years int default 0,
  availability_status availability_status default 'available',
  is_approved boolean default false,
  rating float default 0.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Rooms Table (Kept for context)
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  room_number text not null unique,
  capacity int not null,
  floor int not null,
  status room_status default 'vacant',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tenants Table (Kept for context)
create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  room_id uuid references public.rooms(id) not null,
  check_in_date date not null,
  check_out_date date,
  rent_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Complaints Table (Replaces Maintenance Requests)
create table public.complaints (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.profiles(id) not null, -- Who reported it
  room_id uuid references public.rooms(id), -- Optional, if related to a room
  service_type service_type not null,
  agent_id uuid references public.service_agents(id), -- Nullable until assigned
  description text not null,
  status complaint_status default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Service Tasks Table (History/Analytics)
create table public.service_tasks (
  id uuid default uuid_generate_v4() primary key,
  complaint_id uuid references public.complaints(id) not null,
  agent_id uuid references public.service_agents(id) not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  status task_status default 'assigned'
);

-- 7. Agent Ratings Table
create table public.agent_ratings (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.service_agents(id) not null,
  tenant_id uuid references public.profiles(id) not null,
  complaint_id uuid references public.complaints(id) not null unique, -- One rating per complaint
  rating int check (rating between 1 and 5),
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to handle new user signup (Simplified)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role_val public.user_role;
begin
  -- Determine role safely
  begin
    user_role_val := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when others then
    user_role_val := 'tenant'::public.user_role;
  end;

  -- Insert into profiles
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    user_role_val
  );

  -- If Service Agent, insert into service_agents
  if user_role_val = 'service_agent' then
    insert into public.service_agents (user_id, service_type, experience_years)
    values (
      new.id,
      COALESCE((new.raw_user_meta_data->>'service_type')::public.service_type, 'other'::public.service_type),
      COALESCE((new.raw_user_meta_data->>'experience_years')::int, 0)
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
