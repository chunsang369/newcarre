export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Bearer token 검증
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.HEALTH_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, ts: Date.now() });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json({ ok: false, error: "DB connection failed" }, { status: 500 });
  }
}
