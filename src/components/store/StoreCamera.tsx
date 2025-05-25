// StoreCamera.tsx
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

import { Button } from '../../components/ui/button'

const StoreCamera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [ocrResult, setOcrResult] = useState<string>("");

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const result = await Tesseract.recognize(imageSrc, "eng");
    setOcrResult(result.data.text);
  };

  return (
    <div className="bg-card p-16 rounded-xl h-full flex flex-col items-center justify-center">
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      <Button className="mt-5" onClick={capture}>Capture & Extract Text</Button>
    <pre
      className="text-white bg-gray-100 rounded-md p-4 mt-4 w-full max-w-xl overflow-x-auto whitespace-pre-wrap"
      style={{ fontFamily: "monospace", fontSize: "1rem" }}
    >
      {ocrResult
        .split(/\s+/) // Split by words, use /\n/ for lines
        .filter(Boolean)
        .map((word, idx) => (
          <span
            key={idx}
            draggable
            onDragStart={e => e.dataTransfer.setData("text/plain", word)}
            className="bg-gray-700 rounded px-1 cursor-move mr-1 mb-1 inline-block"
          >
            {word}
          </span>
        ))}
    </pre>
    <span className="text-gray-500 text-sm mt-2">
      Drag and drop the words to the corresponding inputs fields.
    </span>
    </div>
  );
};

export default StoreCamera;
