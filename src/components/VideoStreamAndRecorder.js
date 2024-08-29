import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/App.module.css';

const VideoStreamAndRecorder = ({ videoRef, questions, currentQuestionIndex, isInterviewActive }) => {
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
    console.log("Start Recording button clicked");
    if (!isRecording && videoRef.current) {
      const stream = videoRef.current.srcObject;
      console.log("Captured Stream:", stream);

      // Explicitly set mimeType to 'video/webm'
      const newRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      console.log("MediaRecorder:", newRecorder);

      newRecorder.ondataavailable = (event) => {
        console.log('Data chunk received:', event.data);
        if (event.data.size > 0) {
          setRecordedChunks(prevChunks => [...prevChunks, event.data]);
        }
      };

      newRecorder.onstop = () => {
        console.log('Recording stopped', newRecorder.state);
        setIsRecording(false);
      };

      newRecorder.start();
      console.log("MediaRecorder started");
      setIsRecording(true);
      setRecorder(newRecorder);
    }
  };

  const handleStopRecording = () => {
    console.log("Stop Recording button clicked");
    if (recorder) {
      recorder.stop();
      console.log("MediaRecorder stopped");
    }
  };

  const handleSaveRecording = () => {
    console.log("Save Recording button clicked");
    console.log("Recorded Chunks:", recordedChunks);

    // Ensure consistent MIME type for Blob and download
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
        {isInterviewActive && questions.length > 0 && (
          <div className={styles.questionOverlay}>
            <p>{questions[currentQuestionIndex]}</p>
          </div>
        )}
      </div>
      <div className={styles.buttonsContainer}>
        <button onClick={isRecording ? handleStopRecording : handleStartRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {recordedChunks.length > 0 && !isRecording && (
          <button onClick={handleSaveRecording}>Save Recording</button>
        )}
      </div>
    </div>
  );
};

export default VideoStreamAndRecorder;