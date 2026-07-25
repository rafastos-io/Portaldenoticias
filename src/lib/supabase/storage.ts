import "server-only";

import { createServerSupabaseClient } from "./server";
import {
  assertTenantStorageKey,
  tenantStorageKey,
  toTenantId,
} from "./tenant-scope";

const DEMO_MEDIA_BUCKET = "demo-media";

type UploadBody = ArrayBuffer | Blob | Buffer | File | Uint8Array;

export async function uploadTenantMedia(input: {
  body: UploadBody;
  contentType: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  fileName: string;
  tenantId: string;
}) {
  const tenantId = toTenantId(input.tenantId);
  const storageKey = tenantStorageKey(tenantId, input.fileName);
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from(DEMO_MEDIA_BUCKET)
    .upload(storageKey, input.body, {
      cacheControl: "3600",
      contentType: input.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error("Não foi possível enviar a mídia do tenant.", {
      cause: error,
    });
  }

  return data;
}

export async function createTenantMediaSignedUrl(input: {
  expiresIn?: number;
  storageKey: string;
  tenantId: string;
}) {
  const storageKey = assertTenantStorageKey(
    input.tenantId,
    input.storageKey,
  );
  const expiresIn = input.expiresIn ?? 300;

  if (!Number.isInteger(expiresIn) || expiresIn < 60 || expiresIn > 3600) {
    throw new Error("A validade da URL deve ficar entre 60 e 3600 segundos.");
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from(DEMO_MEDIA_BUCKET)
    .createSignedUrl(storageKey, expiresIn);

  if (error) {
    throw new Error("Não foi possível assinar a URL da mídia do tenant.", {
      cause: error,
    });
  }

  return data;
}
