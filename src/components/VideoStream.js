import React, { useRef, useEffect } from 'react';
import styles from '../styles/App.module.css'; // Importing styles from CSS module

const VideoStream = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing local video stream:', error);
        // Optionally set a state to show user feedback or an error message
      }
    };

    startLocalVideo();

    // Store the current ref value in a variable
    const currentVideoRef = videoRef.current;

    return () => {
      // Use the stored ref value in the cleanup function
      if (currentVideoRef && currentVideoRef.srcObject) {
        const stream = currentVideoRef.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={styles.videoWrapper}>
      <div className={styles.videoContainer}>
        <video ref={videoRef} autoPlay muted />
      </div>
    </div>
  );
};

export default VideoStream;
