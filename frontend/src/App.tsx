import { useState } from "react";

function App() {
  const [chapter, setChapter] = useState(0);

  return (
    <>
      <div className="navbar flex justify-center bg-slate-200 px-4">
        <button
          onClick={() => {
            setChapter((chapter) => {
              if (chapter <= 0) {
                return 0;
              } else {
                return chapter - 1;
              }
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="mx-5 text-xl">Chapter {chapter + 1}</span>
        <button
          onClick={() => {
            setChapter((chapter) => chapter + 1);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
      <div className="flex h-[calc(100%-64px)] w-full">
        <div className="h-full flex-1 bg-slate-100"></div>
        <div className="h-full flex-1"></div>
      </div>
    </>
  );
}

export default App;
