import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260809154809_add_broadcast_saude_real_catalog.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);
const categoryRenameMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260812124308_rename_ti_category.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("catálogo autorizado do Broadcast Saúde", () => {
  it("mantém 16 pautas únicas e consolida a duplicidade da Bayer", () => {
    const codes = new Set(migration.match(/BRS-[A-Z]+-\d{3}/g));
    const bayerTitle =
      "BAYER VENDE FATIA DE 3 BILHÕES DE EUROS EM NEGÓCIO DE CONTRACEPTIVOS PARA A APOLLO";

    expect(codes.size).toBe(16);
    expect(migration.split(bayerTitle)).toHaveLength(2);
  });

  it("preserva marcas, slugs e distribuição compartilhada", () => {
    expect(migration).toContain("'abrafarma'");
    expect(migration).toContain("'broadcast-saude'");
    expect(migration).toContain("target.id in (abrafarma_id, broadcast_saude_id)");
    expect(migration).toContain("'ia-saude-segunda-leitura'");
    expect(migration).toContain("(0, 'BRS-EMP-001', 'featured', 'Empresas')");
    expect(migration).toContain("(1, 'BRS-EMP-002', 'standard', 'Empresas')");
    expect(migration).toContain("(2, 'BRS-MA-001', 'standard', 'M&A')");
    expect(seed).toContain("select private.apply_broadcast_saude_catalog();");
    expect(seed).toContain(
      "select private.align_broadcast_saude_briefing_order();",
    );
  });

  it("exibe Tecnologia e Inovação sem quebrar o slug existente", () => {
    expect(categoryRenameMigration).toContain("name = 'Tecnologia e Inovação'");
    expect(categoryRenameMigration).toContain("and category.slug = 'ti'");
    expect(categoryRenameMigration).toContain("entry.value = 'TI'");
    expect(seed).toContain(
      "select private.apply_technology_and_innovation_category_label();",
    );
  });

  it("registra procedência e não replica o corpo das referências externas", () => {
    expect(migration).toContain("'kind', 'authorized-real'");
    expect(migration).toContain("'external_only', article.external_only");
    expect(migration).toContain("when article.external_only then '[]'::jsonb");
    expect(migration).toContain(
      "https://viva.com.br/saude-e-bem-estar/cientistas-avancam-na-criacao-de-vacina-universal-contra-a-malaria.html",
    );
  });

  it("preserva UTF-8 e trechos críticos do material fornecido", () => {
    expect(migration).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
    expect(migration).not.toContain("â€");
    expect(migration).toContain("BIOMM TEM LUCRO LÍQUIDO DE R$ 9,7 MI NO 1TRI26");
    expect(migration).toContain("A fusão seria uma das maiores da história.");
    expect(migration).toContain("Hoje, não existe tratamento específico");
  });
});
