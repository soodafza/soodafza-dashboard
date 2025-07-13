import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type Props = { onResult: (uid: string) => void };

export default function QrScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        codeReader.decodeFromConstraints({ video: { deviceId: undefined } }, videoRef.current!, res => {
          onResult(res.getText());
          codeReader.reset();
          stream.getTracks().forEach(t => t.stop());
        });
      })
      .catch(e => setErr(e.message));
    return () => codeReader.reset();
  }, [onResult]);

  return (
    <div className="flex flex-col items-center p-4">
      <video ref={videoRef} className="w-full h-64 bg-gray-200" autoPlay />
      {err && <p className="text-red-600">{err}</p>}
    </div>
  );
}
