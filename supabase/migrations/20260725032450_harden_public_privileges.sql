revoke all on schema public from public;
grant usage on schema public to anon, authenticated, service_role;

revoke all privileges on all tables in schema public from public;
revoke all privileges on all sequences in schema public from public;
revoke all privileges on all functions in schema public from public;

alter default privileges for role postgres in schema public
  revoke all on tables from public;
alter default privileges for role postgres in schema public
  revoke all on sequences from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;
