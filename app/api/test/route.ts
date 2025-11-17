import { backgroundProcessor } from "../../background-processor";

export async function GET() {
  console.log('Test endpoint');

  backgroundProcessor();

  return Response.json({});
};
