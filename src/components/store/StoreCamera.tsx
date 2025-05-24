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
      <Button className="mt-5" onClick={capture}>Capture & OCR</Button>
      <pre className="text-black">{ocrResult}</pre>
    </div>
  );
};

export default StoreCamera;
