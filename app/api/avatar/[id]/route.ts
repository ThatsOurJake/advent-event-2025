import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import type { NextRequest } from "next/server";
import { ProxyAgent } from "proxy-agent";

const axiosInstance = axios.create();
const client = setupCache(axiosInstance);
const agent = new ProxyAgent();

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<'/api/avatar/[id]'>
) {
  const { id } = await params;

  const resp = await client.get(
    `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${id}&backgroundColor=d68851,d68851&scale=75`,
    {
      httpAgent: agent,
      httpsAgent: agent,
    },
  );

  const { data, headers } = resp;

  return new Response(data, {
    status: resp.status,
    statusText: resp.statusText,
    headers: {
      "content-type": headers["content-type"],
      "Cache-Control": "max-age=432000",
    },
  });
}
