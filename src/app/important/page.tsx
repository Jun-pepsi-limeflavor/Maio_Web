'use client';

import Image from 'next/image'
import Link from "next/link";
import Footer from "../../../component/Footer";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// CSV 파싱 함수
function parseCSV(text: string): { headers: string[], rows: any[] } {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(cell => cell.trim());
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = isNaN(Number(values[i])) ? values[i] : Number(values[i]);
    });
    return obj;
  });
  return { headers, rows };
}

// CSV를 다시 문자열로 변환
function toCSV(headers: string[], data: any[]): string {
  return [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n');
}

export default function ImportantDataSection() {
  const options: string[] = ['최대/최소', '평균값', '중간값', '최빈값', '표준편차', '범위(Range)', 'FFT'];
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // STEP 2-1 완료 여부
  const [isEdgeEdited, setIsEdgeEdited] = useState(false);

  // STEP 2-2 관련 state
  const [fileCharts, setFileCharts] = useState<{ name: string, headers: string[], rows: any[] }[]>([]);
  const [highlighted, setHighlighted] = useState<{ [fileName: string]: { start: number, end: number, data: any[] } | null }>({});
  const [uploadResult, setUploadResult] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [timeWindow, setTimeWindow] = useState(3); // 초 단위
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [step2Alert, setStep2Alert] = useState<string>('');

  // 순차적으로 보여줄 인덱스
  const [currentFileIdx, setCurrentFileIdx] = useState(0);

  // 통계 옵션 선택
  const toggleOption = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  // STEP 2-1 버튼 클릭 시 메시지 표시 및 완료 처리
  const handleEdgeEdit = () => {
    setShowSuccess(true);
    setIsEdgeEdited(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // 파일 업로드 및 파싱 (순서 보장)
  const handleFilesUpload = (files: FileList) => {
    if (!isEdgeEdited) {
      setStep2Alert('먼저 "데이터 양 끝값 편집하기"를 완료해주세요.');
      return;
    }
    setStep2Alert('');
    const charts: { name: string, headers: string[], rows: any[] }[] = [];
    let filesRead = 0;
    const filesArr = Array.from(files);
    filesArr.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { headers, rows } = parseCSV(text);
        charts[idx] = { name: file.name, headers, rows }; // 순서 보장
        filesRead++;
        if (filesRead === filesArr.length) {
          setFileCharts(charts);
          setHighlighted({});
          setCurrentFileIdx(0);
          setErrorMsg('');
        }
      };
      reader.readAsText(file);
    });
  };

  // 차트 클릭 시 filter_data_by_time 역할 (행 수 규격화)
  const handleChartClick = (fileIdx: number, clickedX: number) => {
    setErrorMsg('');
    const file = fileCharts[fileIdx];
    if (!file) return;
    const xCol = file.headers[0];
    const startIdx = file.rows.findIndex(row => row[xCol] >= clickedX);
    if (startIdx === -1) return;

    // 규격화: timeWindow * 100개 행
    const requiredRows = timeWindow * 100;
    let actualStart = startIdx;
    let actualEnd = startIdx + requiredRows;

    // 만약 끝까지 데이터가 부족하면, 뒤에서부터 맞춰서 추출
    if (actualEnd > file.rows.length) {
      actualStart = Math.max(0, file.rows.length - requiredRows);
      actualEnd = file.rows.length;
    }

    // 만약 데이터가 부족하면(즉, 전체 행이 requiredRows보다 적으면) 에러
    if (actualEnd - actualStart < requiredRows) {
      setErrorMsg(`⚠️ ${file.name}에서 선택한 구간에 데이터가 부족합니다. (필요: ${requiredRows}행, 실제: ${actualEnd - actualStart}행)`);
      return;
    }

    const filtered = file.rows.slice(actualStart, actualEnd);

    setHighlighted(prev => ({
      ...prev,
      [file.name]: {
        start: file.rows[actualStart][xCol],
        end: file.rows[actualEnd - 1][xCol],
        data: filtered
      }
    }));

    // 다음 파일로 이동
    if (fileIdx + 1 < fileCharts.length) {
      setTimeout(() => setCurrentFileIdx(fileIdx + 1), 500);
    }
  };

  // 모든 파일의 구간이 선택되었는지, 그리고 길이가 모두 같은지 체크
  const allFilesSelected = (() => {
    if (fileCharts.length === 0) return false;
    const lengths = fileCharts.map(f => highlighted[f.name]?.data.length || 0);
    if (lengths.some(len => len === 0)) return false;
    return lengths.every(len => len === lengths[0]);
  })();

  // 서버로 업로드 (모든 선택된 구간 한번에)
  const handleSubmitAllHighlighted = async () => {
    setIsUploading(true);
    setUploadResult('');
    setErrorMsg('');
    // 업로드 전, 모든 구간 길이 동일한지 체크
    const lengths = fileCharts.map(f => highlighted[f.name]?.data.length || 0);
    if (lengths.some(len => len === 0)) {
      setErrorMsg('⚠️ 모든 파일에서 구간을 선택해야 합니다.');
      setIsUploading(false);
      return;
    }
    if (!lengths.every(len => len === lengths[0])) {
      setErrorMsg('⚠️ 선택된 구간의 행 수가 모든 파일에서 동일해야 합니다.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    fileCharts.forEach(file => {
      const highlight = highlighted[file.name];
      if (highlight && highlight.data.length) {
        const csv = toCSV(file.headers, highlight.data);
        formData.append('files', new File([csv], file.name));
      }
    });
    if (!formData.has('files')) {
      setUploadResult('선택된 데이터가 없습니다.');
      setIsUploading(false);
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/input_raw_data', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadResult(`데이터 저장 완료! 라벨: ${JSON.stringify(data.Y_label)}`);
      } else {
        setUploadResult(`오류: ${data.error || data.message}`);
      }
    } catch (err) {
      setUploadResult('파일 업로드 중 오류가 발생했습니다.');
    }
    setIsUploading(false);
  };

  // 차트 렌더링 (하나씩만)
  const renderChartForFile = (file: { name: string, headers: string[], rows: any[] }, fileIdx: number) => {
    const xKey = file.headers[0];
    const yKeys = file.headers.slice(1);
    return (
      <div key={file.name + '-chart'} className="mb-8 border rounded-xl bg-white shadow p-4">
        <div className="font-semibold mb-2">{file.name} 시각화 (그래프 클릭 시 구간 선택)</div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={file.rows}
            onClick={(e: any) => {
              if (e && e.activeLabel !== undefined) {
                handleChartClick(fileIdx, e.activeLabel);
              }
            }}
          >
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((y, idx) => (
              <Line key={y} type="monotone" dataKey={y} stroke={['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FF8042'][idx % 5]} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 mt-1">그래프 위를 클릭하면 해당 시간부터 {timeWindow}초 구간이 선택되고, 다음 파일로 넘어갑니다.</div>
      </div>
    );
  };

  return (
    <div>
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-4 pt-32 pb-20 flex flex-col items-center space-y-20">
        {/* STEP Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <span className="px-6 py-2 bg-green-100 text-green-600 rounded-full text-sm font-medium">
            Maio ML
          </span>
          <h1 className="text-3xl font-bold">
            <span className="text-green-500">STEP 2</span> 중요한 데이터를 알려주세요
          </h1>
          <p className="text-gray-500 text-sm">
            인공지능이 중요하게 알아야할 데이터를 알려주는 작업이에요. <br />
            깨끗한 데이터와 중요한 데이터가 어디인지 차근차근 알려주세요.
          </p>
        </div>

        {/* Image Section */}
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-md">
          <Image
            src="/hero.jpeg"
            alt="Modern wooden and brick house"
            width={1200}
            height={700}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* STEP 2-1 */}
        <div className="w-full max-w-3xl bg-gray-50 shadow-md border border-gray-200 rounded-2xl p-6 space-y-6 relative">
          <h2 className="text-xl font-bold">
            <span className="text-green-500">STEP 2-1</span> 데이터 양 끝값 편집
          </h2>
          <p className="text-gray-500 text-sm">
            * 데이터의 앞뒤 10%에 깨끗하지 않은 데이터가 들어간 것 같아요!
          </p>
          <button
            className={`mt-4 px-6 py-3 rounded-full transition font-semibold
              ${showSuccess
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-black text-white hover:bg-gray-800'}
            `}
            onClick={showSuccess ? undefined : handleEdgeEdit}
            disabled={showSuccess}
          >
            {showSuccess ? '데이터가 잘 처리되었어요!' : '데이터 양 끝값 편집하기'}
          </button>
        </div>

        {/* STEP 2-2 */}
        <div className="w-full max-w-3xl bg-gray-50 shadow-md border border-gray-200 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold">
            <span className="text-green-500">STEP 2-2</span> 중요한 데이터 구간을 하이라이트 해주세요!
          </h2>
          <p className="text-gray-500 text-sm">
            * 여러 개의 csv 파일을 업로드하면, 올린 순서대로 하나씩 그래프가 나오고, 각 파일에서 중요한 구간을 클릭으로 선택해야 합니다.<br/>
            * 그래프 위를 클릭하면 해당 시간부터 {timeWindow}초 구간이 자동 선택되고, 다음 파일로 넘어갑니다.<br/>
            * 모든 파일의 구간을 선택하면 서버로 한 번에 업로드할 수 있습니다.<br/>
            * 각 파일에서 선택된 구간의 데이터 행 수가 반드시 동일해야 합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
            <input
              type="file"
              accept=".csv"
              multiple
              id="csvFileInput"
              className="hidden"
              onChange={e => e.target.files && handleFilesUpload(e.target.files)}
            />
            <button
              className={`bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition ${!isEdgeEdited ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!isEdgeEdited) {
                  setStep2Alert('먼저 "데이터 양 끝값 편집하기"를 완료해주세요.');
                } else {
                  setStep2Alert('');
                  document.getElementById('csvFileInput')?.click();
                }
              }}
              disabled={!isEdgeEdited}
            >
              RawData CSV 파일 업로드
            </button>
            <label className="flex items-center gap-2 text-sm">
              <span>time window(초):</span>
              <input
                type="number"
                min={1}
                max={30}
                value={timeWindow}
                onChange={e => setTimeWindow(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded"
              />
            </label>
          </div>
          {/* STEP 2-1 먼저 하라는 경고 메시지 */}
          {step2Alert && (
            <div className="mb-4 text-red-600 font-semibold">{step2Alert}</div>
          )}
          {/* 에러 메시지 */}
          {errorMsg && (
            <div className="mb-4 text-red-600 font-semibold">{errorMsg}</div>
          )}
          {/* 순차적으로 하나씩만 그래프를 보여줌 */}
          {fileCharts.length > 0 && currentFileIdx < fileCharts.length && (
            <div className="w-full">
              {renderChartForFile(fileCharts[currentFileIdx], currentFileIdx)}
              <div className="text-center text-sm text-gray-400 mt-2">
                {currentFileIdx + 1} / {fileCharts.length} 개 파일 중 {currentFileIdx + 1}번째
              </div>
            </div>
          )}
          {/* 모든 파일의 구간이 선택되고, 길이도 같을 때만 업로드 버튼 표시 */}
          {allFilesSelected && (
            <div className="w-full flex flex-col items-center mt-6">
              <div className="mb-2 text-green-700 font-semibold">모든 파일의 구간이 선택되었습니다!</div>
              <button
                className={`bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition font-bold ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleSubmitAllHighlighted}
                disabled={isUploading}
              >
                {isUploading ? '업로드 중...' : '모든 선택 구간 서버로 보내기'}
              </button>
            </div>
          )}
          {uploadResult && (
            <div className="mt-4 text-center text-green-600 font-semibold">{uploadResult}</div>
          )}
        </div>

        {/* STEP 2-3 */}
        <div className="w-full max-w-3xl bg-gray-50 shadow-md border border-gray-200 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold ">
            <span className="text-green-500">STEP 2-3</span> 중요한 통계 요소를 신중하게 골라 선택해주세요!
          </h2>
          <p className="text-gray-500 text-sm text-left">
            * 통계 데이터는 중복으로 선택할 수 있어요.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                ${selectedOptions.includes(option)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => alert('선택된 통계 옵션: ' + selectedOptions.join(', '))}
            className="w-full mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            ✅ 선택 완료!
          </button>
        </div>

        {/* STEP 2-4 */}
        <div className="w-full max-w-3xl bg-gray-50 shadow-md border border-gray-200 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold">
            <span className="text-green-500">STEP 2-4</span> 더 많은 데이터를 인공지능에게 보여주세요!
          </h2>
          <p className="text-gray-500 text-sm">
            * 인공지능을 학습량을 늘리기 위해 한 데이터를 가지고 잘게 나누어서 학습시키도록 할게요!
          </p>
          <Link href="/important" className="inline-block">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
              잘게 나눠서 학습하기
            </button>
          </Link>
        </div>

        {/* Next Step Button */}
        <Link href="/Score">
          <button
            type="button"
            className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            다음 단계로 넘어가기
          </button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}