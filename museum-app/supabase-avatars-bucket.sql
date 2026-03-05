-- Create the storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable Row Level Security
alter table storage.objects enable row level security;

-- Policy to allow anyone to read avatars
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload avatars
-- They can only upload into a folder named after their uid
create policy "Users can upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow users to update their own avatars
create policy "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow users to delete their own avatars
create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
