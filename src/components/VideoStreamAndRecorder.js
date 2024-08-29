import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/App.module.css';

const VideoStreamAndRecorder = ({ videoRef, questions, currentQuestionIndex }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing local video stream:', error);
      }
    };

    startLocalVideo();

    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [videoRef]);

  useEffect(() => {
    // Canvas setup (runs only once when video dimensions are available)
    if (canvasRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
  }, [videoRef]); // Only depend on videoRef

  const handleStartRecording = () => {
    if (!isRecording && canvasRef.current && videoRef.current) {
      const stream = canvasRef.current.captureStream();
      const newRecorder = new MediaRecorder(stream);

      newRecorder.ondataavailable = (event) => {
        console.log('Data chunk received:', event.data); 
        if (event.data.size > 0) {
          setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      newRecorder.onstop = () => {
        console.log('Recording stopped', newRecorder.state);
        setIsRecording(false);
      };

      newRecorder.start();
      setIsRecording(true);

      const ctx = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      const drawFrame = () => {
        if (isRecording) {
          ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

          if (questions && questions.length > 0 && currentQuestionIndex < questions.length) {
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(questions[currentQuestionIndex], 10, 30);
          }

          requestAnimationFrame(drawFrame);
        }
      };

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        drawFrame();
      } else {
        video.addEventListener('canplaythrough', drawFrame, { once: true });
      }

      setRecorder(newRecorder);
    }
  };

  const handleStopRecording = () => {
    if (recorder) {
      recorder.stop();
    }
  };

  const handleSaveRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    URL.revokeObjectURL(url);
    setRecordedChunks([]);
  };

  return (
    <div className={styles.videoWrapper}>
      <div className={styles.videoContainer}>
        <video ref={videoRef} autoPlay muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} /> 
      </div>
      <button onClick={isRecording ? handleStopRecording : handleStartRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {recordedChunks.length > 0 && !isRecording && (
        <button onClick={handleSaveRecording}>Save Recording</button>
      )}
    </div>
  );
};

export default VideoStreamAndRecorder;