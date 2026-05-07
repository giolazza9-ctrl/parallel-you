import { NextResponse } from 'next/server';
import { checkAIHealth } from '@/lib/game/ai';

export async function GET() {
  try {
    const result = await checkAIHealth();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { healthy: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
