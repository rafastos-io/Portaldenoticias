import { describe, expect, it } from "vitest";

import {
  ContentFormError,
  parseEditorialForm,
  parseStatusForm,
  slugifyTitle,
} from "./content-form";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const CONTENT_ID = "22222222-2222-4222-8222-222222222222";
const CATEGORY_ID = "44444444-4444-4444-8444-444444444444";

function editorialData() {
  const formData = new FormData();
  formData.set("tenantId", TENANT_ID);
  formData.set("authorName", "Joana Neri");
  formData.set("categoryId", CATEGORY_ID);
  formData.set("editorialType", "standard");
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
      authorName: "Joana Neri",
      categoryId: CATEGORY_ID,
      editorialType: "standard",
      imageMode: "fallback",
      keyTopics: [],
      slug: "saude-longevidade-visao-60",
      tenantId: TENANT_ID,
    });
  });

  it("rejeita corpo editorial curto", () => {
    const formData = editorialData();
    formData.set("body", "Muito curto.");
    expect(() => parseEditorialForm(formData)).toThrow(ContentFormError);
  });

  it("rejeita nome de autoria vazio", () => {
    const formData = editorialData();
    formData.set("authorName", "");
    expect(() => parseEditorialForm(formData)).toThrow(
      "O nome da autoria deve ter entre 2 e 120 caracteres.",
    );
  });

  it("exige patrocinador fictício para variante patrocinada", () => {
    const formData = editorialData();
    formData.set("editorialType", "sponsored");
    expect(() => parseEditorialForm(formData)).toThrow(
      "patrocinador fictício",
    );
  });

  it("exige nota de correção para variante correção", () => {
    const formData = editorialData();
    formData.set("editorialType", "correction");
    expect(() => parseEditorialForm(formData)).toThrow(
      "nota de correção",
    );
  });

  it("aceita variante patrocinada com patrocinador fictício", () => {
    const formData = editorialData();
    formData.set("editorialType", "sponsored");
    formData.set("sponsorshipLabel", "Instituto Fictício de Longevidade");
    expect(parseEditorialForm(formData)).toMatchObject({
      editorialType: "sponsored",
      sponsorshipLabel: "Instituto Fictício de Longevidade",
    });
  });

  it("aceita variante correção com nota", () => {
    const formData = editorialData();
    formData.set("editorialType", "correction");
    formData.set(
      "correctionNote",
      "Artigo original informava valor incorreto sobre expectativa de vida.",
    );
    expect(parseEditorialForm(formData)).toMatchObject({
      editorialType: "correction",
      correctionNote:
        "Artigo original informava valor incorreto sobre expectativa de vida.",
    });
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
