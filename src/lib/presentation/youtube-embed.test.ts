import { describe, expect, it } from "vitest";

import { getYouTubeEmbedUrl } from "./youtube-embed";

describe("getYouTubeEmbedUrl", () => {
  it("converte watch, shorts e youtu.be para o domínio de privacidade", () => {
    expect(
      getYouTubeEmbedUrl("https://www.youtube.com/watch?v=3wGLOIGLfQ4&t=22s"),
    ).toContain("youtube-nocookie.com/embed/3wGLOIGLfQ4");
    expect(
      getYouTubeEmbedUrl("https://www.youtube.com/shorts/RTJBD8L_4_o"),
    ).toContain("youtube-nocookie.com/embed/RTJBD8L_4_o");
    expect(getYouTubeEmbedUrl("https://youtu.be/XbWGxObCANY")).toContain(
      "youtube-nocookie.com/embed/XbWGxObCANY",
    );
  });

  it("preserva o início e pede legendas em português", () => {
    const embed = getYouTubeEmbedUrl(
      "https://www.youtube.com/watch?v=3wGLOIGLfQ4&t=1m22s",
    );
    expect(embed).toContain("start=82");
    expect(embed).toContain("cc_load_policy=1");
    expect(embed).toContain("cc_lang_pref=pt");
  });

  it("recusa protocolos, domínios e identificadores não autorizados", () => {
    expect(getYouTubeEmbedUrl("http://www.youtube.com/watch?v=3wGLOIGLfQ4")).toBeNull();
    expect(getYouTubeEmbedUrl("https://youtube.example/watch?v=3wGLOIGLfQ4")).toBeNull();
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=invalido")).toBeNull();
  });
});
