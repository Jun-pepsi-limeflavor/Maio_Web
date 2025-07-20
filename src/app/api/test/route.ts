import { NextRequest, NextResponse } from 'next/server';
import { fetchJson, API_BASE_URL } from '../../../utils/fetcher';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = await fetchJson(`${API_BASE_URL}/input_npy_data_test`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    return NextResponse.json(data);
  } catch {  // '_' 파라미터 제거
    return NextResponse.json(
      { success: false, message: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(`${API_BASE_URL}/test`, {
          credentials: 'include',
        });
        
        const reader = response.body?.getReader();
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          
          const text = new TextDecoder().decode(value);
          controller.enqueue(encoder.encode(text));
        }
      } catch {  // '_' 파라미터 제거
        controller.enqueue(encoder.encode('data: 테스트 중 오류가 발생했습니다.\n\n'));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}