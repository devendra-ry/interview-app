import React, { useEffect, useState } from 'react';
import styles from '../styles/App.module.css';

const TimerDisplay = ({ start }) => {
  const [remainingTime, setRemainingTime] = useState(2700); // 45 minutes in seconds
  const [questionTime, setQuestionTime] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    let interviewInterval;
    let questionInterval;

    if (start) {
      interviewInterval = setInterval(() => {
        setRemainingTime(prevTime => Math.max(prevTime - 1, 0));
      }, 1000);

      questionInterval = setInterval(() => {
        setQuestionTime(prevTime => {
          if (prevTime <= 1) {
            return 120; // Reset to 2 minutes
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interviewInterval);
      clearInterval(questionInterval);
    };
  }, [start]);

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
