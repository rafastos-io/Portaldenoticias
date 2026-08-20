import { describe, expect, it } from "vitest";

import type { PublicStory } from "@/lib/supabase/portal-repository";

import { listPublicCategories } from "./public-categories";

function story(categorySlug: string, categoryName: string) {
  return { categoryName, categorySlug } as PublicStory;
}

describe("ordenação das editorias públicas", () => {
  it("preserva a ordem editorial da pauta BV no modelo de crédito", () => {
    const stories = [
      story("dicas-valiosas", "Dicas valiosas"),
      story("guias", "Guias"),
      story("indicadores", "Indicadores"),
      story("alivio-no-orcamento", "Alívio no orçamento"),
      story("investimentos", "Investimentos"),
      story("alerta-de-golpes", "Alerta de golpes"),
      story("programando-o-futuro", "Programando o futuro"),
      story("isso-ou-aquilo", "Isso ou aquilo"),
      story("saia-das-dividas", "Saia das dívidas"),
    ];

    expect(
      listPublicCategories(stories, "financial-services-credit").map(
        (category) => category.slug,
      ),
    ).toEqual([
      "indicadores",
      "investimentos",
      "alerta-de-golpes",
      "programando-o-futuro",
      "isso-ou-aquilo",
      "saia-das-dividas",
      "alivio-no-orcamento",
      "guias",
      "dicas-valiosas",
    ]);
  });
});
