// StoreCamera.tsx
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { Button } from '../../components/ui/button'
import { useOpenCv } from '../../utils/useOpenCv'
import { detectCircles } from '../../utils/detectCircles'

interface StoreCameraProps {
  setCapturedImage: (img: string | null) => void;
}

const StoreCamera: React.FC<StoreCameraProps> = ({ setCapturedImage }) => {
  const webcamRef = useRef<Webcam>(null);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [circleCount, setCircleCount] = useState<number | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const cvLoaded = useOpenCv();

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setCapturedImage(imageSrc);
    setLastImage(imageSrc);

    const result = await Tesseract.recognize(imageSrc, "eng");
    setOcrResult(result.data.text);
  };

  const handleDetectCircles = async () => {
    if (!lastImage) return;
    try {
      const { count, imageWithCircles } = await detectCircles(lastImage);
      setCircleCount(count);
      setCapturedImage(imageWithCircles); // <-- Show the image with circles
      setLastImage(imageWithCircles);     // (optional: update lastImage too)
      // alert(`Detected ${count} pill bottles!`);
    } catch (err) {
      alert('OpenCV.js not loaded or error in detection.');
    }
  };

  return (
    <div className="bg-card p-16 rounded-xl h-full flex flex-col items-center justify-center">
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      <Button className="mt-5" onClick={capture}>Capture & Extract Text</Button>
      <Button className="mt-2" onClick={handleDetectCircles} disabled={!cvLoaded || !lastImage}>
        {cvLoaded ? "Detect Pill Bottles" : "Loading OpenCV..."}
      </Button>
      {circleCount !== null && (
        <div className="mt-2 text-green-700 font-bold">
          Detected: {circleCount} bottles
        </div>
      )}
      <pre
        className="text-white bg-gray-100 rounded-md p-4 mt-4 w-full max-w-xl overflow-x-auto whitespace-pre-wrap"
        style={{ fontFamily: "monospace", fontSize: "1rem" }}
      >
        {ocrResult
          .split(/\s+/)
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
