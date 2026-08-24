import { describe, expect, it } from "vitest";

import type { PublicStory } from "@/lib/supabase/portal-repository";

import { orderFinancialCategoryStories } from "./financial-credit-model";

function story(id: string, editorialOrder: number | null) {
  return { editorialOrder, id } as PublicStory;
}

describe("ordem de uma editoria do modelo de crédito", () => {
  it("preserva a sequência do briefing e mantém itens sem ordem por último", () => {
    expect(
      orderFinancialCategoryStories([
        story("terceiro", 3),
        story("sem-ordem", null),
        story("primeiro", 1),
        story("segundo", 2),
      ]).map((item) => item.id),
    ).toEqual(["primeiro", "segundo", "terceiro", "sem-ordem"]);
  });
});
