import React, { useEffect, useState } from 'react';
import styles from '../styles/App.module.css'; // Import styles from CSS module

const TimerDisplay = ({ start }) => {
  const INITIAL_INTERVIEW_TIME = 2700; // 45 minutes in seconds
  const INITIAL_QUESTION_TIME = 120; // 2 minutes in seconds

  const [remainingTime, setRemainingTime] = useState(INITIAL_INTERVIEW_TIME);
  const [questionTime, setQuestionTime] = useState(INITIAL_QUESTION_TIME);

  useEffect(() => {
    let interviewInterval = null;
    let questionInterval = null;

    if (start) {
      interviewInterval = setInterval(() => {
        setRemainingTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);

      questionInterval = setInterval(() => {
        setQuestionTime((prevTime) => (prevTime <= 1 ? INITIAL_QUESTION_TIME : prevTime - 1));
      }, 1000);
    }

    // Cleanup intervals on component unmount or when start changes
    return () => {
      clearInterval(interviewInterval);
      clearInterval(questionInterval);
    };
  }, [start]); // Dependency array includes start to reset intervals when it changes

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div>
      <div className={styles.timerDisplay}>
        Time Remaining: {formatTime(remainingTime)}
      </div>
      <div className={styles.timerDisplay}>
        Time for Current Question: {formatTime(questionTime)}
      </div>
    </div>
  );
};

export default TimerDisplay;
