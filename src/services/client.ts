const raw =
  process.env.NEXT_PUBLIC_API_URL || "https://zayan-backend.vercel.app";
export const API_URL = raw.endsWith("/") ? raw : `${raw}/`;
