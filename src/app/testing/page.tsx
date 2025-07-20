'use client';

import { useRef, useState } from 'react';
import Footer from '../../../component/Footer';
import { fetchJson, API_BASE_URL } from '../../utils/fetcher';

export default function TestingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCsvClick = () => {
    alert('CSV 파일 업로드는 아직 구현되지 않았습니다.');
  };

  const handleNpyClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.accept = '.npy';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setResult('업로드 중...');
    try {
      const data = await fetchJson<{ success: boolean; total_count?: number; message?: string }>(`${API_BASE_URL}/input_npy_data_test`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      setResult(data.success ? `총 데이터 개수: ${data.total_count}` : `오류: ${data.message}`);
    } catch (err) {
      setResult('파일 업로드 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleStartTesting = () => {
    setIsLoading(true);
    setTestResult('');
    
    const eventSource = new EventSource(`${API_BASE_URL}/test`, {
      withCredentials: true
    } as EventSourceInit);

    eventSource.onmessage = (event) => {
      if (event.data === '총 결과는 이렇답니다~') {
        setTestResult(prev => prev + event.data + '\n');
        eventSource.close();
        setIsLoading(false);
      } else {
        setTestResult(prev => prev + event.data + '\n');
      }
    };

    eventSource.onerror = () => {
      setIsLoading(false);
      eventSource.close();
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow w-full max-w-7xl mx-auto px-6 sm:px-4 pt-32 pb-12">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <span className="inline-block px-8 py-2 rounded-full bg-green-50 text-green-500 text-sm font-medium">
              Maio ML
            </span>
          </div>

          <div className="w-full max-w-3xl">
            <h1 className="text-3xl font-bold flex items-center mb-4">
              <span className="text-2xl bg-green-50 text-green-500 px-3 py-1 rounded-full mr-2">STEP 6</span>
              테스트 데이터로 성능 확인하기
            </h1>
            <p className="text-gray-700 mt-3 mb-6">
              학습된 모델의 성능을 테스트 데이터로 확인하는 단계입니다.
            </p>

            <section className="w-full max-w-4xl mx-auto px-4 py-16">
              <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">테스트 파일 업로드</h2>
                    <div className="flex gap-4">
                      <button
                        id="csvButtontest"
                        className="bg-gray-200 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
                        onClick={handleCsvClick}
                      >
                        CSV 파일 업로드
                      </button>
                      <button
                        id="npyButtontest"
                        className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition"
                        onClick={handleNpyClick}
                      >
                        NPY 파일 업로드
                      </button>
                      <input
                        id="fileInputtest"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="mt-4 text-sm text-gray-700 min-h-[24px]">{result}</div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">테스트 실행</h2>
                    <button
                      id="startTesting"
                      className={`w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleStartTesting}
                      disabled={isLoading}
                    >
                      {isLoading ? '테스트 진행 중...' : '테스트 시작하기'}
                    </button>
                    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">{testResult || '테스트 결과가 여기에 표시됩니다.'}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 처음으로 돌아가기 버튼 추가 */}
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="text-center bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition"
              >
                처음부터 다시 시작하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}