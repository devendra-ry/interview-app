import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/App.module.css';

const VideoStreamAndRecorder = ({ videoRef }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

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

  const handleStartRecording = () => {
    if (!isRecording) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const newRecorder = new MediaRecorder(stream);
        setRecorder(newRecorder);

        newRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
          }
        };

        newRecorder.start();
        setIsRecording(true);
      }
    }
  };

  const handleStopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
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
