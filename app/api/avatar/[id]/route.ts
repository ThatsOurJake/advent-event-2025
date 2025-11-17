import type { NextApiRequest } from "next";

export async function GET(
  _req: NextApiRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const resp = await fetch(
    `https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=${id}&backgroundColor=d68851,d68851`,
    { cache: "force-cache" },
  );

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: {
      'content-type': resp.headers.get('content-type')!,
      'Cache-Control': 'max-age=432000'
    }
  });
}
