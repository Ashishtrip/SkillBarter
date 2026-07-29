import { NextResponse } from 'next/server';

export function createApiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function createApiErrorResponse(error: string, status = 500) {
  return NextResponse.json({ data: null, error }, { status });
}
