from flask import Flask, Blueprint, jsonify, request
import os
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
from flask_cors import CORS

load_dotenv()

api_key = os.getenv("API_KEY")

if not api_key:
    raise ValueError("API_KEY environment variable not set")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)

conversation_history = []

main = Blueprint('main', __name__)

# Interview state management
interview_state = {
    "topic": "general",
    "difficulty": "easy",
    "asked_questions": [],
    "asked_question_texts": set(),
    "correct_answers": 0,
    "incorrect_answers": 0,
    "start_time": None,
    "question_start_time": None,  # Track start time of each question
    "max_duration": timedelta(minutes=45),  # Total interview duration (45 minutes)
    "max_question_duration": timedelta(minutes=2),  # Per-question duration (2 minutes)
    "max_questions": 10  # Optional: Max number of questions
}

@main.route('/api/start-interview', methods=['POST'])
def start_interview():
    interview_state['asked_questions'] = []
    interview_state['correct_answers'] = 0
    interview_state['incorrect_answers'] = 0
    interview_state['topic'] = request.json.get('topic', 'general')
    interview_state['difficulty'] = request.json.get('difficulty', 'easy')
    interview_state['start_time'] = datetime.now()  # Start of the interview
    interview_state['question_start_time'] = None  # Reset question start time
    return jsonify({"message": "Interview started"}), 200

@main.route('/api/question', methods=['GET'])
def get_question():
    if should_stop_interview():
        return jsonify({"message": "Interview stopped", "reason": "End of interview criteria met"}), 200

    topic = request.args.get('topic', interview_state['topic'])
    difficulty = interview_state['difficulty']

    while True:
        try:
            prompt = f"Generate a question on the topic of {topic} with difficulty {difficulty}"
            response = model.generate_content(prompt)
            question_text = response.text.strip()

            if question_text not in interview_state['asked_question_texts']:
                interview_state['asked_question_texts'].add(question_text)
                question = {'question': question_text}
                interview_state['asked_questions'].append(question)
                interview_state['question_start_time'] = datetime.now()  # Start timer for current question
                return jsonify(question)
            else:
                continue
        except Exception as e:
            return jsonify({"error": str(e)}), 500

def should_stop_interview():
    """ Determine if the interview should stop based on criteria """
    current_time = datetime.now()
    
    # Check total interview time
    if interview_state['start_time']:
        elapsed_total_time = current_time - interview_state['start_time']
        if elapsed_total_time > interview_state['max_duration']:
            return True

    # Check per-question time
    if interview_state['question_start_time']:
        elapsed_question_time = current_time - interview_state['question_start_time']
        if elapsed_question_time > interview_state['max_question_duration']:
            return True

    # Check if max questions have been reached
    if len(interview_state['asked_questions']) >= interview_state['max_questions']:
        return True

    return False

@main.route('/api/evaluate', methods=['POST'])
def evaluate_answer():
    user_answer = request.json.get('answer')
    
    if not interview_state['asked_questions']:
        return jsonify({"error": "No question to evaluate"}), 400

    # Check if question time has expired
    if should_stop_interview():
        return jsonify({"message": "Time's up for this question or the interview", "result": "timeout"}), 200

    last_question = interview_state['asked_questions'][-1]
    question_text = last_question['question']

    try:
        prompt = f"Evaluate the answer '{user_answer}' for the question: '{question_text}'"
        response = model.generate_content(prompt)
        evaluation_text = response.text.strip()
        
        if 'correct' in evaluation_text.lower():
            interview_state['correct_answers'] += 1
            return jsonify({"result": "correct"})
        else:
            interview_state['incorrect_answers'] += 1
            return jsonify({"result": "incorrect"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

app.register_blueprint(main)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
