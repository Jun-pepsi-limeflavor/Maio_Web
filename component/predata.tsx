'use client'; // This is a client component

import Image from 'next/image'
import React from "react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      {/* Badge */}
      <div className="flex justify-center mb-6">
        <span className="inline-block px-8 py-2 rounded-full bg-green-50 text-green-500 text-sm font-medium">
          Maio ML
        </span>
      </div>

      {/* STEP 1 카드 */}
      <section className="bg-gray-50 rounded-3xl shadow-md p-8 mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          <span className="text-green-500">STEP 1</span> 수집한 데이터를 업로드 해주세요
        </h1>
        <p className="text-gray-500 text-center text-sm sm:text-base mb-6">
          열심히 센서를 통해 얻은 데이터를 인공지능에게 입력해봅시다.
          <br />
          파일은 <strong>.CSV</strong> 혹은 <strong>.npy</strong> 로 끝나는 데이터를 넣어주어야 인공지능이 알아들을 수 있어요!
        </p>

        <div className="rounded-2xl overflow-hidden max-w-3xl mx-auto mb-8">
          <Image
            src="/hero.jpeg"
            alt="Modern wooden and brick house"
            width={1200}
            height={700}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        <FileUploader />
      </section>

      {/* 실시간 업로드 안내 카드 */}
      <section className="bg-gray-50 rounded-3xl shadow-md p-8 mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-left mb-4">
          <span className="text-green-500">IF</span> 실시간으로 업로드 하고 싶다면?
        </h2>
        <p className="text-gray-500 text-left text-sm sm:text-base mb-6">
          실시간으로 업로드를 하고 싶다면, 아래 버튼을 눌러 주세요!
          <br />
          수업 환경에 따라 실시간 업로드가 불가능할 수 있습니다. 자세한 사항은 선생님께 문의하세요.
        </p>

        <div className="flex justify-left">
          <Link
            href="/important"
            className="bg-black text-white px-6 py-3 rounded-full text-sm hover:opacity-90 transition"
          >
            실시간으로 업로드 하기
          </Link>
        </div>
      </section>

      {/* 다음 단계로 넘어가기 */}
      <div className="flex justify-center">
        <Link
          href="/important"
          className="bg-green-50 text-green-500 border border-green-200 px-6 py-3 rounded-lg text-sm hover:bg-green-100 transition"
        >
          다음 단계로 넘어가기
        </Link>
      </div>
    </div>
  );
}
export function FileUploader() {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 10) {
      alert("최대 10개의 파일만 업로드할 수 있어요.");
      e.target.value = "";
      return;
    }
    console.log("업로드한 파일들:", files);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
      <input
        type="file"
        id="file-upload"
        accept=".csv, .xlsx, .npy"
        multiple
        onChange={handleFileChange}
        className="text-sm text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-auto"
      />
      <Link
        href="/important"
        className="bg-green-50 text-green-500 border border-green-200 px-5 py-2 rounded-lg text-sm hover:bg-green-100 transition"
      >
        파일 업로드
      </Link>
    </div>
  );
}