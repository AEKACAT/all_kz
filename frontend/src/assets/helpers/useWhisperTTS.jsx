import { useRef, useState } from 'react';
import WavEncoder from 'wav-encoder';
import categoryPrompts from '../helpers/categoryPrompts';

const useWhisperSTT = (onResult, category) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const audioDataRef = useRef([]);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);

  const handleToggle = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        audioDataRef.current = [];

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          audioDataRef.current.push(new Float32Array(input));
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        sourceRef.current = source;
        processorRef.current = processor;

        setIsRecording(true);
      } catch (err) {
        console.error('Ошибка доступа к микрофону:', err);
      }
    } else {
      try {
        processorRef.current.disconnect();
        sourceRef.current.disconnect();
        streamRef.current.getTracks().forEach((track) => track.stop());

        const audioBuffer = audioContextRef.current.createBuffer(
          1,
          audioDataRef.current.reduce((acc, cur) => acc + cur.length, 0),
          audioContextRef.current.sampleRate
        );

        const channelData = audioBuffer.getChannelData(0);
        let offset = 0;
        audioDataRef.current.forEach((chunk) => {
          channelData.set(chunk, offset);
          offset += chunk.length;
        });

        const wavBuffer = await WavEncoder.encode({
          sampleRate: audioBuffer.sampleRate,
          channelData: [channelData],
        });

        const blob = new Blob([wavBuffer], { type: 'audio/wav' });

        const formData = new FormData();
        formData.append('file', blob, 'audio.wav');
        formData.append('model', 'whisper-1');
        formData.append('language', 'kk');
        const prompt = categoryPrompts[category] || '';
        formData.append('prompt', prompt);

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (data.text && onResult) {
          const cleaned = data.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?«»<>“”"']/g, '').trim();
          onResult(cleaned);
        }

        setIsRecording(false);
      } catch (err) {
        console.error('Ошибка при остановке записи или отправке:', err);
        setIsRecording(false);
      }
    }
  };

  return {
    isRecording,
    handleToggle,
  };
};

export default useWhisperSTT;
