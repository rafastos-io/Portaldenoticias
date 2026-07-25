import { describe, expect, it } from "vitest";

import { ContentFormError } from "./content-form";
import {
  contrastRatio,
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
});
