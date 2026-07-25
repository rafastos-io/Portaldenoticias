create index categories_parent_idx
  on public.categories(parent_id)
  where parent_id is not null;

create index content_items_published_revision_fk_idx
  on public.content_items(id, current_published_revision_id)
  where current_published_revision_id is not null;

create index content_revision_authors_author_idx
  on public.content_revision_authors(author_id);

create index content_revision_categories_category_idx
  on public.content_revision_categories(category_id);

create index content_revision_tags_tag_idx
  on public.content_revision_tags(tag_id);

create index distributions_category_override_idx
  on public.distributions(category_override_id)
  where category_override_id is not null;

create index placements_content_item_idx
  on public.placements(content_item_id);

create index placements_image_override_idx
  on public.placements(image_override_id)
  where image_override_id is not null;

create index themes_published_version_fk_idx
  on public.themes(id, published_version_id)
  where published_version_id is not null;

create index themes_draft_version_fk_idx
  on public.themes(id, draft_version_id)
  where draft_version_id is not null;
