
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)

# Explicitly allow http://localhost:3000 and all methods
CORS(app)
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, methods=['GET', 'POST', 'OPTIONS'], allow_headers="*")



OLLAMA_URL = "http://localhost:11434/api/generate"

# Load sample course data
with open("courses.json", "r") as f:
    course_data = json.load(f)

@app.route('/chat', methods=['POST'])
def chat():
    user_inputs = request.json
    prompt = f"""
You are a course recommendation system. Given a student's background and availability, select suitable courses from the list below.

Student Details:
- Career Goal: {user_inputs['careerGoal']}
- degreeLevel: {user_inputs['degreeLevel']}
- Year: {user_inputs.get('year', 'N/A')}
- Available Times: {user_inputs['availability']}
- DegreeLevel: {user_inputs['degreeLevel']}
- Credits: {user_inputs['credits']}
- StudentType: {user_inputs['studentType']}
- hasPriorCourses: {user_inputs['hasPriorCourses']}
- PriorCourses: " {user_inputs.get('priorCourses', 'N/A')}

Course Catalog:
{json.dumps(course_data, indent=2)}

Instructions:
1. ONLY recommend courses from the course catalog above.
2. Match student's degree, year, and available time slots.
3. Use 'career_paths', 'days', and 'time' to filter appropriate courses.
4. Format each course time as "<Day>, <Time>" using fields directly from the course data.
5. RETURN ONLY pure JSON — DO NOT include any markdown, commentary, or explanation.
6. Number of credits enrolled must be equal to  'Credits', if it says 9 credit, suggest 3 courses strictly 
7. If there are no courses available within the selected range,add the courses until the 'credits' amount is satisfied but in the output response of note attribute included that 'this course is not available in the recommended timeslots, its just a suggestion'
8. Do not include prior courses in the recommendation
9. If the selected course has pre-requiste courses then still recommend the course but in the note attribute of the json; add enroll for the prerequiste course first only if it is not enrolled already. If there are no prerequisites available then return No pre-requisites available
10. in the response attribute of json structure. include 1 line description of how this course would benifit for the given career goal
11. If instruction 7 and 9 happens together then append both the result to note attribute
12. The elements within courses array (title, time, reason, note) attributes must strictly be included in the response for schema enforcement
13. Only graduates should select graduate courses and undergraduates should select undergraduate courses. """ + """

Only return a valid JSON object exactly as below. Do not include any explanation, markdown, or surrounding text.

{
  "courses": [
    {
      "title": "Course Title",
      "time": "Monday, 10:00-11:30",
      "reason": "Explain why this course is a match",
      "note": "Give any helpful note here"
    }
  ]
}
"""

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        result = response.json()

        # Debug: Print raw response
        print("\n=== RAW RESPONSE FROM MISTRAL ===")
        print(result.get('response', 'No response'))
        print("=================================\n")

        # Try to extract only JSON
        raw_text = result.get('response', '')
        json_start = raw_text.find('{')
        json_part = raw_text[json_start:] if json_start != -1 else '{}'
        parsed_response = json.loads(json_part)
        return jsonify(parsed_response)

    except Exception as e:
        print(f"Error while parsing Mistral response: {e}")
        return jsonify({
            "courses": [
                {
                    "title": "Fallback Course",
                    "time": "Monday, 10AM-11AM",
                    "reason": "Unable to fetch real recommendations. This is a fallback."
                }
            ]
        })

if __name__ == '__main__':
    app.run(debug=True)
