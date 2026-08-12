import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { MAX_THEME_LOGO_BYTES } from "./admin/theme-form";

describe("configuração de upload do logo", () => {
  it("mantém margem multipart acima do limite validado para o arquivo", () => {
    const serverActions = nextConfig.experimental?.serverActions;

    expect(serverActions).toBeTypeOf("object");
    expect(serverActions).toMatchObject({ bodySizeLimit: "3mb" });
    expect(MAX_THEME_LOGO_BYTES).toBe(2 * 1024 * 1024);
  });
});
