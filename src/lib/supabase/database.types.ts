export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string
          after_json: Json | null
          before_json: Json | null
          created_at: string
          id: string
          ip_hash: string | null
          is_demo: boolean
          reason: string | null
          request_id: string | null
          target_id: string | null
          target_type: string
          tenant_id: string
          user_agent_summary: string | null
        }
        Insert: {
          action: string
          actor_id: string
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          is_demo?: boolean
          reason?: string | null
          request_id?: string | null
          target_id?: string | null
          target_type: string
          tenant_id: string
          user_agent_summary?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          is_demo?: boolean
          reason?: string | null
          request_id?: string | null
          target_id?: string | null
          target_type?: string
          tenant_id?: string
          user_agent_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          credentials: string[]
          display_name: string
          id: string
          is_demo: boolean
          owner_tenant_id: string | null
          slug: string
          specialties: string[]
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          credentials?: string[]
          display_name: string
          id?: string
          is_demo?: boolean
          owner_tenant_id?: string | null
          slug: string
          specialties?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          credentials?: string[]
          display_name?: string
          id?: string
          is_demo?: boolean
          owner_tenant_id?: string | null
          slug?: string
          specialties?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "authors_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string
          id: string
          is_demo: boolean
          name: string
          owner_tenant_id: string | null
          parent_id: string | null
          seo_json: Json
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_demo?: boolean
          name: string
          owner_tenant_id?: string | null
          parent_id?: string | null
          seo_json?: Json
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_demo?: boolean
          name?: string
          owner_tenant_id?: string | null
          parent_id?: string | null
          seo_json?: Json
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          archived_at: string | null
          canonical_slug: string
          content_type: string
          created_at: string
          created_by: string
          current_published_revision_id: string | null
          embargo_until: string | null
          first_published_at: string | null
          id: string
          is_demo: boolean
          last_published_at: string | null
          owner_tenant_id: string
          paused_at: string | null
          scheduled_at: string | null
          updated_at: string
          updated_by: string
          visibility: string
          workflow_status: string
        }
        Insert: {
          archived_at?: string | null
          canonical_slug: string
          content_type?: string
          created_at?: string
          created_by?: string
          current_published_revision_id?: string | null
          embargo_until?: string | null
          first_published_at?: string | null
          id?: string
          is_demo?: boolean
          last_published_at?: string | null
          owner_tenant_id: string
          paused_at?: string | null
          scheduled_at?: string | null
          updated_at?: string
          updated_by?: string
          visibility?: string
          workflow_status?: string
        }
        Update: {
          archived_at?: string | null
          canonical_slug?: string
          content_type?: string
          created_at?: string
          created_by?: string
          current_published_revision_id?: string | null
          embargo_until?: string | null
          first_published_at?: string | null
          id?: string
          is_demo?: boolean
          last_published_at?: string | null
          owner_tenant_id?: string
          paused_at?: string | null
          scheduled_at?: string | null
          updated_at?: string
          updated_by?: string
          visibility?: string
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_published_revision_belongs_to_item"
            columns: ["id", "current_published_revision_id"]
            isOneToOne: false
            referencedRelation: "content_revisions"
            referencedColumns: ["content_item_id", "id"]
          },
        ]
      }
      content_revision_authors: {
        Row: {
          author_id: string
          byline_order: number
          content_revision_id: string
        }
        Insert: {
          author_id: string
          byline_order?: number
          content_revision_id: string
        }
        Update: {
          author_id?: string
          byline_order?: number
          content_revision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_revision_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_revision_authors_content_revision_id_fkey"
            columns: ["content_revision_id"]
            isOneToOne: false
            referencedRelation: "content_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revision_categories: {
        Row: {
          category_id: string
          content_revision_id: string
          is_primary: boolean
        }
        Insert: {
          category_id: string
          content_revision_id: string
          is_primary?: boolean
        }
        Update: {
          category_id?: string
          content_revision_id?: string
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "content_revision_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_revision_categories_content_revision_id_fkey"
            columns: ["content_revision_id"]
            isOneToOne: false
            referencedRelation: "content_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revision_tags: {
        Row: {
          content_revision_id: string
          tag_id: string
        }
        Insert: {
          content_revision_id: string
          tag_id: string
        }
        Update: {
          content_revision_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_revision_tags_content_revision_id_fkey"
            columns: ["content_revision_id"]
            isOneToOne: false
            referencedRelation: "content_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_revision_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revisions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body_json: Json
          body_text: string
          change_summary: string
          content_item_id: string
          correction_note: string | null
          created_at: string
          created_by: string
          id: string
          is_demo: boolean
          medical_review_status: string
          revision_number: number
          seo_description: string | null
          seo_title: string | null
          slug_snapshot: string
          sponsorship_label: string | null
          subtitle: string
          title: string
          word_count: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body_json?: Json
          body_text: string
          change_summary?: string
          content_item_id: string
          correction_note?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_demo?: boolean
          medical_review_status?: string
          revision_number: number
          seo_description?: string | null
          seo_title?: string | null
          slug_snapshot: string
          sponsorship_label?: string | null
          subtitle?: string
          title: string
          word_count?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body_json?: Json
          body_text?: string
          change_summary?: string
          content_item_id?: string
          correction_note?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_demo?: boolean
          medical_review_status?: string
          revision_number?: number
          seo_description?: string | null
          seo_title?: string | null
          slug_snapshot?: string
          sponsorship_label?: string | null
          subtitle?: string
          title?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_portal_settings: {
        Row: {
          default_tenant_id: string
          is_demo: boolean
          revision: number
          setting_key: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          default_tenant_id: string
          is_demo?: boolean
          revision?: number
          setting_key?: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          default_tenant_id?: string
          is_demo?: boolean
          revision?: number
          setting_key?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_portal_settings_default_tenant_id_fkey"
            columns: ["default_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions: {
        Row: {
          allow_full_body: boolean
          allow_media: boolean
          approved_by: string | null
          category_override_id: string | null
          channels: string[]
          content_item_id: string
          contract_reference: string | null
          created_at: string
          created_by: string
          ends_at: string | null
          headline_override: string | null
          id: string
          is_demo: boolean
          rights_code: string
          slug_override: string | null
          starts_at: string | null
          status: string
          subtitle_override: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allow_full_body?: boolean
          allow_media?: boolean
          approved_by?: string | null
          category_override_id?: string | null
          channels?: string[]
          content_item_id: string
          contract_reference?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string | null
          headline_override?: string | null
          id?: string
          is_demo?: boolean
          rights_code?: string
          slug_override?: string | null
          starts_at?: string | null
          status?: string
          subtitle_override?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allow_full_body?: boolean
          allow_media?: boolean
          approved_by?: string | null
          category_override_id?: string | null
          channels?: string[]
          content_item_id?: string
          contract_reference?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string | null
          headline_override?: string | null
          id?: string
          is_demo?: boolean
          rights_code?: string
          slug_override?: string | null
          starts_at?: string | null
          status?: string
          subtitle_override?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributions_category_override_id_fkey"
            columns: ["category_override_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string
          bucket_id: string
          caption: string
          created_at: string
          credit: string
          height: number | null
          id: string
          is_demo: boolean
          license_expires_at: string | null
          metadata_json: Json
          mime_type: string
          owner_tenant_id: string
          rights_basis: string
          sha256: string | null
          size_bytes: number | null
          status: string
          storage_key: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text: string
          bucket_id?: string
          caption?: string
          created_at?: string
          credit?: string
          height?: number | null
          id?: string
          is_demo?: boolean
          license_expires_at?: string | null
          metadata_json?: Json
          mime_type: string
          owner_tenant_id: string
          rights_basis?: string
          sha256?: string | null
          size_bytes?: number | null
          status?: string
          storage_key: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string
          bucket_id?: string
          caption?: string
          created_at?: string
          credit?: string
          height?: number | null
          id?: string
          is_demo?: boolean
          license_expires_at?: string | null
          metadata_json?: Json
          mime_type?: string
          owner_tenant_id?: string
          rights_basis?: string
          sha256?: string | null
          size_bytes?: number | null
          status?: string
          storage_key?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          content_item_id: string
          created_at: string
          ends_at: string | null
          eyebrow_override: string | null
          id: string
          image_override_id: string | null
          is_demo: boolean
          presentation_variant: string
          rank: number
          slot_key: string
          starts_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          content_item_id: string
          created_at?: string
          ends_at?: string | null
          eyebrow_override?: string | null
          id?: string
          image_override_id?: string | null
          is_demo?: boolean
          presentation_variant?: string
          rank?: number
          slot_key: string
          starts_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          content_item_id?: string
          created_at?: string
          ends_at?: string | null
          eyebrow_override?: string | null
          id?: string
          image_override_id?: string | null
          is_demo?: boolean
          presentation_variant?: string
          rank?: number
          slot_key?: string
          starts_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_image_override_id_fkey"
            columns: ["image_override_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          name: string
          owner_tenant_id: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          owner_tenant_id?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          owner_tenant_id?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          archived_at: string | null
          created_at: string
          default_locale: string
          display_name: string
          id: string
          is_demo: boolean
          kind: string
          legal_name: string | null
          settings_json: Json
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          default_locale?: string
          display_name: string
          id?: string
          is_demo?: boolean
          kind: string
          legal_name?: string | null
          settings_json?: Json
          slug: string
          status: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          default_locale?: string
          display_name?: string
          id?: string
          is_demo?: boolean
          kind?: string
          legal_name?: string | null
          settings_json?: Json
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_versions: {
        Row: {
          brand_json: Json
          change_summary: string
          components_json: Json
          created_at: string
          created_by: string
          id: string
          is_demo: boolean
          navigation_json: Json
          published_at: string | null
          published_by: string | null
          schema_version: number
          theme_id: string
          tokens_json: Json
          version_number: number
        }
        Insert: {
          brand_json?: Json
          change_summary?: string
          components_json?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_demo?: boolean
          navigation_json?: Json
          published_at?: string | null
          published_by?: string | null
          schema_version?: number
          theme_id: string
          tokens_json: Json
          version_number: number
        }
        Update: {
          brand_json?: Json
          change_summary?: string
          components_json?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_demo?: boolean
          navigation_json?: Json
          published_at?: string | null
          published_by?: string | null
          schema_version?: number
          theme_id?: string
          tokens_json?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "theme_versions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string
          draft_version_id: string | null
          id: string
          is_demo: boolean
          name: string
          published_version_id: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft_version_id?: string | null
          id?: string
          is_demo?: boolean
          name: string
          published_version_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft_version_id?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          published_version_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "themes_draft_version_belongs_to_theme"
            columns: ["id", "draft_version_id"]
            isOneToOne: false
            referencedRelation: "theme_versions"
            referencedColumns: ["theme_id", "id"]
          },
          {
            foreignKeyName: "themes_published_version_belongs_to_theme"
            columns: ["id", "published_version_id"]
            isOneToOne: false
            referencedRelation: "theme_versions"
            referencedColumns: ["theme_id", "id"]
          },
          {
            foreignKeyName: "themes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cms_create_content: {
        Args: {
          p_author_id: string
          p_body_text: string
          p_category_id: string
          p_slug: string
          p_subtitle: string
          p_tenant_id: string
          p_title: string
        }
        Returns: string
      }
      cms_create_content_with_media: {
        Args: {
          p_author_id: string
          p_body_text: string
          p_category_id: string
          p_image_alt: string
          p_image_mode: string
          p_slug: string
          p_subtitle: string
          p_tenant_id: string
          p_title: string
        }
        Returns: string
      }
      cms_set_content_status: {
        Args: {
          p_content_id: string
          p_reason: string
          p_status: string
          p_tenant_id: string
        }
        Returns: string
      }
      cms_save_theme: {
        Args: {
          p_accent: string
          p_background: string
          p_brand_name: string
          p_card: string
          p_font: string
          p_header: string
          p_hero: string
          p_primary: string
          p_secondary: string
          p_slogan: string
          p_tenant_id: string
          p_text_color: string
        }
        Returns: string
      }
      cms_set_default_demo_tenant: {
        Args: {
          p_expected_revision: number
          p_tenant_id: string
        }
        Returns: number
      }
      cms_update_content: {
        Args: {
          p_author_id: string
          p_body_text: string
          p_category_id: string
          p_content_id: string
          p_subtitle: string
          p_tenant_id: string
          p_title: string
        }
        Returns: string
      }
      cms_update_content_with_media: {
        Args: {
          p_author_id: string
          p_body_text: string
          p_category_id: string
          p_content_id: string
          p_image_alt: string
          p_image_mode: string
          p_subtitle: string
          p_tenant_id: string
          p_title: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
