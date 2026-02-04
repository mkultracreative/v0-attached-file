-- Create the people table
create table if not exists public.people (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  resume_content jsonb,
  resume_content_modified jsonb,
  theme_data jsonb,
  plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.people enable row level security;

-- Create policies
create policy "Users can view their own data" on public.people
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.people
  for update using (auth.uid() = id);

create policy "Users can insert their own data" on public.people
  for insert with check (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.people (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
-- Drop if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
