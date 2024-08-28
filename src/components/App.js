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
  const [hasAnswered, setHasAnswered] = useState(false);
  const videoRef = useRef(null);

  // Speech recognition state and handlers
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setHasAnswered(false);
    } else {
      endInterview();
    }
  }, [currentQuestionIndex, questions.length]);

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

    const currentVideoRef = videoRef.current;
    return () => {
      if (currentVideoRef) {
        const stream = currentVideoRef.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/question');
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await response.json();
      setQuestions(prevQuestions => [...prevQuestions, data.question]);
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
        await fetchQuestions(); // Fetch the first question
      } else {
        throw new Error('Failed to start interview');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setCurrentQuestionIndex(0); // Reset the question index
    setQuestions([]); // Clear questions
    setEvaluationResult(null); // Clear evaluation result
    setHasAnswered(false); // Reset answer state
    resetTranscript(); // Reset the speech transcript
  };

  const submitTextToBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      });
      if (!response.ok) {
        throw new Error('Failed to submit text');
      }
      const result = await response.json();
      setEvaluationResult(result.correct ? 'Correct!' : 'Incorrect. Try again.');
      setHasAnswered(true);
      resetTranscript();
    } catch (error) {
      console.error('Error submitting text to backend:', error);
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening();
    }
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
            <p>{questions[currentQuestionIndex]}</p>
          </div>
        )}
      </div>
      <TimerDisplay start={isInterviewActive} />
      <div className={styles.recognizedText}>
        Recognized Text: {transcript}
      </div>
      <Result evaluationResult={evaluationResult} />
      {/* Conditional Rendering for Buttons */}
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
