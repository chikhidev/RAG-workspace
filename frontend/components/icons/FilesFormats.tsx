import React from 'react';

const glob_size = 50;

interface FileIconProps {
  size?: number;
  className?: string;
}

const file_formats = {
  code: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M23.75 27.75 27.5 24l-3.75-3.75m-7.5 0L12.5 24l3.75 3.75m5.25-10.5-3 13.5"
      />
    </svg>
  ),

  doc: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.9 19.5h16.2m-16.2 3.6h16.2m-16.2 3.6h16.2m-16.2 3.6h12.6"
      />
    </svg>
  ),

  image: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M25.25 30.75h.758c.728 0 1.092 0 1.293-.152a.75.75 0 0 0 .296-.553c.015-.252-.187-.555-.59-1.16l-2.259-3.387c-.333-.501-.5-.751-.71-.839a.75.75 0 0 0-.575 0c-.21.088-.378.338-.712.839l-.558.837m3.057 4.415-5.763-8.325c-.332-.479-.498-.718-.705-.802a.75.75 0 0 0-.564 0c-.207.084-.373.323-.705.802l-4.46 6.442c-.422.61-.633.915-.62 1.168a.75.75 0 0 0 .293.56c.201.155.572.155 1.314.155zm1.5-11.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
      />
    </svg>
  ),

  audio: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16.85 28.5v-8.733c0-.362 0-.542.066-.689a.75.75 0 0 1 .269-.317c.133-.089.312-.119.668-.178l6.6-1.1c.48-.08.72-.12.908-.05a.75.75 0 0 1 .39.33c.099.172.099.416.099.904V27m-9 1.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0m9-1.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
      />
    </svg>
  ),

  spreadsheet: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.9 24.9h16.2m-16.2 0v-3.6a1.8 1.8 0 0 1 1.8-1.8h3.6m-5.4 5.4v3.6a1.8 1.8 0 0 0 1.8 1.8h3.6m10.8-5.4v3.6a1.8 1.8 0 0 1-1.8 1.8h-9m10.8-5.4v-3.6a1.8 1.8 0 0 0-1.8-1.8h-9m0 0v10.8"
      />
    </svg>
  ),

  pdf: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 20h3c1.1 0 2 .9 2 2s-.9 2-2 2h-3v-4zm0 4v4m5-8h3c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-3v-8zm8 0h4m-2 0v8"
      />
    </svg>
  ),

  json: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 20a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2m4-6a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2m-4 0a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2m4 0a2 2 0 0 1 2-2v-2a2 2 0 0 0 2-2m10-6a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2m-4-6a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2m4 0a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2m-4 0a2 2 0 0 0-2-2v-2a2 2 0 0 1-2-2"
      />
    </svg>
  ),

  link: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
      <path
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 25a3 3 0 0 0 4.24.24l2-2a3 3 0 0 0-4.24-4.24l-1.12 1.12m2.88 2.88a3 3 0 0 0-4.24-.24l-2 2a3 3 0 1 0 4.24 4.24l1.12-1.12"
      />
    </svg>
  ),

  default: ({ size = glob_size, className = '' }: FileIconProps) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40" className={className}>
      <path
        stroke="#D5D7DA"
        strokeWidth={1.5}
        d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth={1.5} d="M24 .5V8a4 4 0 0 0 4 4h7.5" />
    </svg>
  ),
};

export const getFileIcon = (fileName: string, size: number = 20, className: string = 'shrink-0') => {
  const name = fileName.toLowerCase();

  if (name.endsWith('.pdf')) {
    return file_formats.pdf({ size, className });
  } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return file_formats.doc({ size, className });
  } else if (name.endsWith('.txt') || name.endsWith('.md')) {
    return file_formats.doc({ size, className });
  } else if (name.endsWith('.json')) {
    return file_formats.json({ size, className });
  } else if (name.endsWith('.xml') || name.endsWith('.csv')) {
    return file_formats.spreadsheet({ size, className });
  } else if (name.endsWith('.html') || (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx') || name.endsWith('.py') || name.endsWith('.java') || name.endsWith('.c') || name.endsWith('.cpp'))) {
    return file_formats.code({ size, className });
  } else if (name.startsWith('http://') || name.startsWith('https://')) {
    return file_formats.link({ size, className });
  } else {
    return file_formats.default({ size, className });
  }
};


