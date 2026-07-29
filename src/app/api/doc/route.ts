import { NextRequest, NextResponse } from 'next/server';
import swagger from '../../../../swagger';

export async function GET(request: NextRequest) {
  return NextResponse.json(swagger);
}
