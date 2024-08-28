import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(45 * 60); // 45 minutes in seconds
  const [questionTime, setQuestionTime] = useState(2 * 60); // 2 minutes in seconds
  const videoRef = useRef(null);
  const interviewTimerRef = useRef(null);
  const questionTimerRef = useRef(null);

  useEffect(() => {
    // Cleanup timers on component unmount
    return () => {
      clearInterval(interviewTimerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (remainingTime <= 0 && isInterviewActive) {
      endInterview();
    }
  }, [remainingTime, isInterviewActive]);

  useEffect(() => {
    if (questionTime <= 0 && isInterviewActive) {
      goToNextQuestion();
    }
  }, [questionTime, isInterviewActive]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/question'); // Fetch a question from the backend
      const data = await response.json();
      setQuestions(prevQuestions => [...prevQuestions, data.question]); // Append new question to list
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const startInterview = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'general', difficulty: 'easy' })
      });
      if (response.ok) {
        setIsInterviewActive(true);
        startInterviewTimer();
        startQuestionTimer();
        fetchQuestions(); // Fetch the first question
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      resetQuestionTimer();
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    clearInterval(interviewTimerRef.current);
    clearInterval(questionTimerRef.current);
    setIsInterviewActive(false);
  };

  const startInterviewTimer = () => {
    interviewTimerRef.current = setInterval(() => {
      setRemainingTime(prevTime => prevTime - 1);
    }, 1000);
  };

  const startQuestionTimer = () => {
    questionTimerRef.current = setInterval(() => {
      setQuestionTime(prevTime => prevTime - 1);
    }, 1000);
  };

  const resetQuestionTimer = () => {
    setQuestionTime(2 * 60);
    clearInterval(questionTimerRef.current);
    startQuestionTimer();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className="App">
      <h1>Video Interview App</h1>
      <div className="video-wrapper">
        <div className="video-container">
          <video ref={videoRef} autoPlay muted />
          <div className="question-overlay">
            {questions[currentQuestionIndex]}
          </div>
        </div>
      </div>
      <div className="timer-display">
        Time Remaining: {formatTime(remainingTime)}
      </div>
      <div className="timer-display">
        Time for Current Question: {formatTime(questionTime)}
      </div>
      {!isInterviewActive && (
        <button onClick={startInterview}>
          Start Interview
        </button>
      )}
      {isInterviewActive && currentQuestionIndex === questions.length - 1 && (
        <button onClick={endInterview}>
          Stop Interview
        </button>
      )}
      {isInterviewActive && currentQuestionIndex < questions.length - 1 && (
        <button onClick={goToNextQuestion}>
          Next Question
        </button>
      )}
    </div>
  );
};

export default App;
