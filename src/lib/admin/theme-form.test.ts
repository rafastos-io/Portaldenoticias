import { describe, expect, it } from "vitest";

import { ContentFormError } from "./content-form";
import {
  contrastRatio,
  parseCreateIdentityForm,
  parseLogoUploadForm,
  parseStoredTheme,
  parseThemeForm,
} from "./theme-form";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

function themeData() {
  const formData = new FormData();
  formData.set("tenantId", TENANT_ID);
  formData.set("brandName", "Banco Demo Horizonte");
  formData.set("slogan", "Escolhas informadas para uma vida mais longa");
  formData.set("primary", "#12324A");
  formData.set("secondary", "#2F80A3");
  formData.set("accent", "#C7A35A");
  formData.set("background", "#F5F7F8");
  formData.set("textColor", "#14232D");
  formData.set("font", "sans-editorial");
  formData.set("header", "masthead-clean");
  formData.set("hero", "split-editorial");
  formData.set("card", "image-top");
  return formData;
}

describe("validação da identidade no servidor", () => {
  it("aceita a identidade estruturada e normaliza as cores", () => {
    expect(parseThemeForm(themeData())).toMatchObject({
      brandName: "Banco Demo Horizonte",
      primary: "#12324A",
      tenantId: TENANT_ID,
    });
  });

  it("calcula contraste WCAG conhecido", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBe(21);
  });

  it("rejeita cor primária sem contraste para texto branco", () => {
    const formData = themeData();
    formData.set("primary", "#F4F4F4");
    expect(() => parseThemeForm(formData)).toThrow(ContentFormError);
  });

  it("rejeita texto sem contraste com o fundo", () => {
    const formData = themeData();
    formData.set("textColor", "#E8E8E8");
    expect(() => parseThemeForm(formData)).toThrow(
      "Texto e fundo precisam ter contraste",
    );
  });

  it("rejeita cor primária sem contraste com o fundo", () => {
    const formData = themeData();
    formData.set("background", "#12324A");
    formData.set("textColor", "#FFFFFF");
    expect(() => parseThemeForm(formData)).toThrow(
      "cor primária precisa ter contraste 4,5:1 com o fundo",
    );
  });

  it("rejeita variantes arbitrárias", () => {
    const formData = themeData();
    formData.set("header", "<script>alert(1)</script>");
    expect(() => parseThemeForm(formData)).toThrow(
      "Variante visual não aprovada",
    );
  });

  it("recusa tokens persistidos desconhecidos antes do runtime", () => {
    expect(() =>
      parseStoredTheme({
        brand: {
          display_name: "Banco Demo Horizonte",
          slogan: "Escolhas informadas para uma vida mais longa",
        },
        components: {
          card: "image-top",
          header: "masthead-clean",
          hero: "split-editorial",
        },
        tokens: {
          accent: "#C7A35A",
          background: "#F5F7F8",
          font: "url(javascript:alert(1))",
          primary: "#12324A",
          secondary: "#2F80A3",
          text: "#14232D",
        },
      }),
    ).toThrow("Identidade persistida inválida");
  });

  it("valida o cadastro de uma nova identidade por preset", () => {
    const formData = new FormData();
    formData.set("tenantId", TENANT_ID);
    formData.set("brandName", "Vértice Longevidade");
    formData.set("slug", "vertice-longevidade");
    formData.set("slogan", "Informação para escolhas de longo prazo");

    expect(parseCreateIdentityForm(formData)).toEqual({
      brandName: "Vértice Longevidade",
      presetTenantId: TENANT_ID,
      slug: "vertice-longevidade",
      slogan: "Informação para escolhas de longo prazo",
    });
  });

  it("recusa slug fora do contrato", () => {
    const formData = new FormData();
    formData.set("tenantId", TENANT_ID);
    formData.set("brandName", "Vértice Longevidade");
    formData.set("slug", "../outra-marca");
    formData.set("slogan", "Informação para escolhas de longo prazo");
    expect(() => parseCreateIdentityForm(formData)).toThrow("Slug inválido");
  });

  it("valida assinatura e dimensões de um logo PNG", async () => {
    const bytes = new Uint8Array(24);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(bytes.buffer);
    view.setUint32(16, 320);
    view.setUint32(20, 120);
    const formData = new FormData();
    formData.set("tenantId", TENANT_ID);
    formData.set("logoAlt", "Logo da Vértice Longevidade");
    formData.set("logoCredit", "Asset original de demonstração");
    formData.set("logo", new File([bytes], "logo.png", { type: "image/png" }));

    await expect(parseLogoUploadForm(formData)).resolves.toMatchObject({
      contentType: "image/png",
      extension: "png",
      height: 120,
      tenantId: TENANT_ID,
      width: 320,
    });
  });

  it("recusa arquivo que apenas declara ser imagem", async () => {
    const formData = new FormData();
    formData.set("tenantId", TENANT_ID);
    formData.set("logoAlt", "Logo inválido");
    formData.set("logoCredit", "Teste");
    formData.set(
      "logo",
      new File(["not-an-image"], "logo.png", { type: "image/png" }),
    );

    await expect(parseLogoUploadForm(formData)).rejects.toThrow(
      "PNG ou JPEG válido",
    );
  });
});
