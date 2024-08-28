from flask import Flask, Blueprint, jsonify, request
import os
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Fetch API Key from environment variables
api_key = os.getenv("API_KEY")

if not api_key:
    raise ValueError("API_KEY environment variable not set")

# Configure the generative AI model
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)  # Enable CORS

# In-memory storage for conversation history
conversation_history = []

# Blueprint setup
main = Blueprint('main', __name__)

# Store interview session state in memory
interview_state = {
    "topic": "general",
    "difficulty": "easy",
    "asked_questions": [],  # List of dictionaries containing question text
    "asked_question_texts": set(),  # Set of question texts to ensure uniqueness
    "correct_answers": 0,
    "incorrect_answers": 0,
    "start_time": None,
    "max_duration": timedelta(minutes=60),  # Set interview duration to 60 minutes
    "max_questions": 10  # Set max number of questions to 10
}

@main.route('/api/start-interview', methods=['POST'])
def start_interview():
    # Reset interview state
    interview_state['asked_questions'] = []
    interview_state['correct_answers'] = 0
    interview_state['incorrect_answers'] = 0
    interview_state['topic'] = request.json.get('topic', 'general')
    interview_state['difficulty'] = request.json.get('difficulty', 'easy')
    interview_state['start_time'] = datetime.now()  # Record start time
    return jsonify({"message": "Interview started"}), 200

@main.route('/api/question', methods=['GET'])
def get_question():
    # Check if the interview should stop
    if should_stop_interview():
        return jsonify({"message": "Interview stopped", "reason": "End of interview criteria met"}), 200

    topic = request.args.get('topic', interview_state['topic'])
    difficulty = interview_state['difficulty']

    # Fetch question from Gemini API based on topic and difficulty
    while True:
        try:
            prompt = f"Generate a question on the topic of {topic} with difficulty {difficulty}"
            response = model.generate_content(prompt)
            question_text = response.text.strip()

            # Check if the question has already been asked
            if question_text not in interview_state['asked_question_texts']:
                interview_state['asked_question_texts'].add(question_text)
                question = {'question': question_text}
                interview_state['asked_questions'].append(question)
                return jsonify(question)
            else:
                # If question has been asked, generate a new one
                continue
        except Exception as e:
            return jsonify({"error": str(e)}), 500

def should_stop_interview():
    """ Determine if the interview should stop based on criteria """
    # Check time limit
    if interview_state['start_time']:
        elapsed_time = datetime.now() - interview_state['start_time']
        if elapsed_time > interview_state['max_duration']:
            return True
    
    # Check the number of questions asked
    if len(interview_state['asked_questions']) >= interview_state['max_questions']:
        return True
    
    return False

@main.route('/api/evaluate', methods=['POST'])
def evaluate_answer():
    user_answer = request.json.get('answer')
    
    if not interview_state['asked_questions']:
        return jsonify({"error": "No question to evaluate"}), 400

    last_question = interview_state['asked_questions'][-1]
    question_text = last_question['question']  # Assuming each question has the text field

    try:
        prompt = f"Evaluate the answer '{user_answer}' for the question: '{question_text}'"
        response = model.generate_content(prompt)
        evaluation_text = response.text
        
        # Example evaluation logic (customize as needed)
        if 'correct' in evaluation_text.lower():
            interview_state['correct_answers'] += 1
            return jsonify({"result": "correct"})
        else:
            interview_state['incorrect_answers'] += 1
            return jsonify({"result": "incorrect"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register Blueprint
app.register_blueprint(main)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
