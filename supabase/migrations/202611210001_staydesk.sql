begin;

create table public.staydesk_bookings (
  id text primary key,
  owner text not null,
  data jsonb not null,
  updated timestamptz not null default now(),
  unique (owner, id)
);
create index on public.staydesk_bookings (owner, updated desc);

create table public.staydesk_documents (
  id text primary key,
  owner text not null,
  booking text not null,
  guest text not null,
  name text not null,
  type text not null,
  key text not null unique,
  foreign key (owner, booking) references public.staydesk_bookings (owner, id) on delete restrict
);
create index on public.staydesk_documents (owner, booking);

alter table public.staydesk_bookings enable row level security;
alter table public.staydesk_documents enable row level security;
revoke all on public.staydesk_bookings, public.staydesk_documents from public, anon, authenticated;
grant select, insert, update, delete on public.staydesk_bookings, public.staydesk_documents to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('staydesk-guest-documents', 'staydesk-guest-documents', false, 8388608,
        array['image/jpeg','image/png','application/pdf']);

commit;
