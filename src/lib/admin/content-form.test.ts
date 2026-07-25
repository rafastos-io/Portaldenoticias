import { describe, expect, it } from "vitest";

import {
  ContentFormError,
  parseEditorialForm,
  parseStatusForm,
  slugifyTitle,
} from "./content-form";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const CONTENT_ID = "22222222-2222-4222-8222-222222222222";
const AUTHOR_ID = "33333333-3333-4333-8333-333333333333";
const CATEGORY_ID = "44444444-4444-4444-8444-444444444444";

function editorialData() {
  const formData = new FormData();
  formData.set("tenantId", TENANT_ID);
  formData.set("authorId", AUTHOR_ID);
  formData.set("categoryId", CATEGORY_ID);
  formData.set("imageMode", "fallback");
  formData.set(
    "imageAlt",
    "Composição abstrata fictícia sobre saúde e longevidade.",
  );
  formData.set("title", "Saúde & Longevidade: visão 60+");
  formData.set("subtitle", "Uma linha fina editorial inteiramente fictícia.");
  formData.set(
    "body",
    "Este é um corpo editorial fictício com extensão suficiente para passar pela validação mínima do CMS demonstrativo.",
  );
  return formData;
}

describe("validação editorial no servidor", () => {
  it("normaliza título em slug seguro", () => {
    expect(slugifyTitle("Saúde & Longevidade: visão 60+")).toBe(
      "saude-longevidade-visao-60",
    );
  });

  it("aceita um rascunho completo e normaliza os campos", () => {
    expect(parseEditorialForm(editorialData())).toMatchObject({
      authorId: AUTHOR_ID,
      categoryId: CATEGORY_ID,
      imageMode: "fallback",
      slug: "saude-longevidade-visao-60",
      tenantId: TENANT_ID,
    });
  });

  it("rejeita corpo editorial curto", () => {
    const formData = editorialData();
    formData.set("body", "Muito curto.");
    expect(() => parseEditorialForm(formData)).toThrow(ContentFormError);
  });

  it("permite a exceção editorial sem imagem", () => {
    const formData = editorialData();
    formData.set("imageMode", "none");
    formData.set("imageAlt", "");
    expect(parseEditorialForm(formData)).toMatchObject({
      imageAlt: "",
      imageMode: "none",
    });
  });

  it("exige motivo e confirmação explícita para pausar", () => {
    const formData = new FormData();
    formData.set("tenantId", TENANT_ID);
    formData.set("contentId", CONTENT_ID);
    formData.set("reason", "Revisão editorial.");

    expect(() => parseStatusForm(formData, "paused")).toThrow(
      "Confirme a pausa",
    );
    formData.set("confirmPause", "yes");
    expect(parseStatusForm(formData, "paused")).toMatchObject({
      reason: "Revisão editorial.",
      status: "paused",
    });
  });
});
