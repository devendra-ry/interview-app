import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/App.module.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import VideoStream from './VideoStream';
import TimerDisplay from './TimerDisplay';
import SpeechRecognitionControls from './SpeechRecognitionControls';
import Result from './Result';
import Buttons from './Buttons';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    startLocalVideo();
    return () => stopLocalVideo();
  }, []);

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

  const stopLocalVideo = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setRetryCount(retryCount + 1);

    try {
      const response = await fetch('http://localhost:5000/api/question');
      if (!response.ok) throw new Error('Failed to fetch question');
      
      const data = await response.json();
      setQuestions(prevQuestions => [...prevQuestions, data.question]);
      setRetryCount(0); 
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (retryCount < 3) {
        setTimeout(fetchQuestions, 10000);
      } else {
        console.error('Max retries reached. Failed to fetch question.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  const startInterview = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'general', difficulty: 'easy' })
      });
      if (response.ok) {
        setIsInterviewActive(true);
        await fetchQuestions();
      } else {
        throw new Error('Failed to start interview');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setEvaluationResult(null);
    resetTranscript();
    setRetryCount(0);
  };

  const submitTextToBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      });
      if (!response.ok) throw new Error('Failed to submit text');
      
      const result = await response.json();
      setEvaluationResult(result.correct ? 'Correct!' : 'Incorrect. Try again.');
      resetTranscript();
    } catch (error) {
      console.error('Error submitting text to backend:', error);
    }
  };

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      fetchQuestions().then(() => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      });
    }
  }, [currentQuestionIndex, questions.length, fetchQuestions]);
  

  const handleMicClick = () => {
    listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening();
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Speech recognition is not supported in this browser.</div>;
  }

  return (
    <div className={styles.App}>
      <h1>Video Interview App</h1>
      <div className={styles.videoContainer}>
        <VideoStream videoRef={videoRef} />
        {isInterviewActive && questions.length > 0 && (
          <div className={styles.currentQuestion}>
            <h2>Question:</h2>
            {isLoading ? <p>Loading next question...</p> : <p>{questions[currentQuestionIndex]}</p>}
          </div>
        )}
      </div>
      <TimerDisplay start={isInterviewActive} />
      <div className={styles.recognizedText}>Recognized Text: {transcript}</div>
      <Result evaluationResult={evaluationResult} />
      {!isInterviewActive ? (
        <Buttons startInterview={startInterview} />
      ) : (
        <Buttons
          endInterview={endInterview}
          goToNextQuestion={goToNextQuestion}
          submitText={submitTextToBackend}
        />
      )}
      <SpeechRecognitionControls listening={listening} handleMicClick={handleMicClick} />
    </div>
  );
};

export default App;
