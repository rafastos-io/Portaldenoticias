const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function readStartSeconds(value: string | null) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return 0;
  return (
    Number(match[1] ?? 0) * 3600 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0)
  );
}

export function getYouTubeEmbedUrl(sourceUrl: string) {
  let source: URL;
  try {
    source = new URL(sourceUrl);
  } catch {
    return null;
  }
  if (source.protocol !== "https:") return null;

  const hostname = source.hostname.toLowerCase();
  let videoId: string | null = null;
  if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(hostname)) {
    if (source.pathname === "/watch") videoId = source.searchParams.get("v");
    if (source.pathname.startsWith("/shorts/")) {
      videoId = source.pathname.split("/")[2] ?? null;
    }
  } else if (hostname === "youtu.be") {
    videoId = source.pathname.split("/")[1] ?? null;
  }
  if (!videoId || !YOUTUBE_VIDEO_ID.test(videoId)) return null;

  const start = readStartSeconds(
    source.searchParams.get("start") ?? source.searchParams.get("t"),
  );
  const params = new URLSearchParams({
    cc_lang_pref: "pt",
    cc_load_policy: "1",
    hl: "pt-BR",
    rel: "0",
  });
  if (start > 0) params.set("start", String(start));
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
