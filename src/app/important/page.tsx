'use client';

import Image from 'next/image'
import Link from "next/link";
import Footer from "../../../component/Footer";
import React, { useState } from 'react';

export default function ImportantDataSection() {
  const options: string[] = ['최대/최소', '평균값', '중간값', '최빈값', '표준편차', '범위(Range)', 'FFT'];
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions((prev) => prev.filter((item) => item !== option));
    } else {
      setSelectedOptions((prev) => [...prev, option]);
    }
  };

  const handleSubmit = () => {
    console.log("선택된 옵션:", selectedOptions);
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
      <div className="w-full max-w-3xl bg-gray-50 shadow-md border border-gray-200 rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold">
          <span className="text-green-500">STEP 2-1</span> 데이터 양 끝값 편집
        </h2>
        <p className="text-gray-500 text-sm">
          * 데이터의 앞뒤 10%에 깨끗하지 않은 데이터가 들어간 것 같아요!
        </p>
        <Link href="/important" className="inline-block">
          <button className="mt-4 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
            데이터 양 끝값 편집하기
          </button>
        </Link>
      </div>

      {/* STEP 2-2 */}
      <div className="w-full max-w-3xl bg-gray-50 shadow-md border border-gray-200 rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold">
          <span className="text-green-500">STEP 2-2</span> 중요한 데이터 구간을 하이라이트 해주세요!
        </h2>
        <p className="text-gray-500 text-sm">
          * 인공지능에게 어떤 데이터 구간이 중요한 구간인지 알려주세요!
        </p>
        <Link href="/important" className="inline-block">
          <button className="mt-4 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
            Matplotlib 관련 영역
          </button>
        </Link>
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
          onClick={handleSubmit}
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