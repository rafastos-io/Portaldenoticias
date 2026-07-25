alter function public.cms_save_theme(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) returns null on null input;

comment on function public.cms_save_theme(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) is 'Updates the current demo theme using only non-null approved structured values and records an audit event.';
