import React, { useState } from 'react';
import ChatInput from './ChatInput';
import './Chatbot.css';
import CalendarGrid from './CalendarGrid'; 
import CourseCard from './CourseCard';
import './CourseCard.css';

const Chatbot = ({ onResponse }) => {
  const [messages, setMessages] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const steps = [
    {
      key: 'careerGoal',
      question: 'What career do you want to pursue?',
      type: 'text'
    },
    {
      key: 'degreeLevel',
      question: 'What level of degree are you pursuing?',
      type: 'dropdown',
      options: ['Undergraduate', 'Graduate']
    },
    {
      key: 'year',
      question: 'Which year are you in?',
      type: 'dropdown',
      getOptions: (responses) =>
        responses.degreeLevel === 'Undergraduate'
          ? ['Freshman', 'Sophomore', 'Junior', 'Senior']
          : ['1st Year', '2nd Year']
    },
    {
      key: 'studentType',
      question: 'Are you a full-time or part-time student?',
      type: 'dropdown',
      options: ['Full-time', 'Part-time']
    },
    {
      key: 'credits',
      question: 'Total number of planned credits to take:',
      type: 'text',
      validate: (input, responses) => {
        const val = parseInt(input);
        if (isNaN(val)) return 'Please enter a valid number.';
        if (responses.studentType === 'Full-time' && (val < 8 || val > 12)) {
          return 'Full-time students must take between 8–12 credits.';
        }
        if (responses.studentType === 'Part-time' && (val < 4 || val > 6)) {
          return 'Part-time students must take between 4–6 credits.';
        }
        return true;
      }
    },
    {
      key: 'hasPriorCourses',
      question: 'Have you already taken any courses?',
      type: 'dropdown',
      options: ['Yes', 'No']
    },
    {
      key: 'priorCourses',
      question: 'Enter subject codes of previously taken courses (comma-separated):',
      type: 'text',
      condition: (responses) => responses.hasPriorCourses === 'Yes'
    },
    {
      key: 'availability',
      question: 'What time slots are you available? (Mon–Fri, 9AM–6PM)',
      type: 'custom',
      component: 'CalendarGrid'
    }
  ];

  const currentStep = steps[currentStepIndex];

  const handleUserResponse = (input) => {
    setError(null);
    const updatedResponses = {
      ...userResponses,
      [currentStep.key]: input
    };
    setUserResponses(updatedResponses);
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: input }
    ]);
    goToNextStep(updatedResponses);
  };

  const getNextStepIndex = (responses) => {
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      if (!step.condition || step.condition(responses)) {
        return i;
      }
    }
    return steps.length;
  };

  const goToNextStep = (responses) => {
    const nextIndex = getNextStepIndex(responses);
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: steps[nextIndex].question }
      ]);
    } else {
      console.log('📤 Sending data to /chat:', responses);
      fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses)
      })
        .then((res) => res.json())
        .then((data) => {
          setRecommendations(data);
          if (onResponse) {
            onResponse(data); // ✅ this sends recommendations to App.js
          }
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: 'Here are some course recommendations for you!' }
          ]);
        })
        .catch((err) => {
          console.error('Backend error:', err);
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: 'Oops! Something went wrong while getting recommendations.' }
          ]);
        });
    }
  };

  const restartChat = () => {
    setMessages([{ sender: 'bot', text: steps[0].question }]);
    setUserResponses({});
    setCurrentStepIndex(0);
    setError(null);
    setRecommendations(null);
  };

  const currentOptions =
    currentStep && currentStep.type === 'dropdown'
      ? currentStep.getOptions
        ? currentStep.getOptions(userResponses)
        : currentStep.options
      : null;

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {!recommendations && !error && currentStep && (
          currentStep.type === 'custom' && currentStep.component === 'CalendarGrid' ? (
            <div className="chat-bubble bot">
              <CalendarGrid
                onSelect={(selectedSlots) => {
                  const grouped = {};
                  selectedSlots.forEach((slot) => {
                    const [day, time] = slot.split(' ');
                    if (!grouped[day]) grouped[day] = [];
                    grouped[day].push(time);
                  });

                  const summaryLines = Object.entries(grouped).map(
                    ([day, times]) => `${day}: ${times.join(', ')}`
                  );

                  setMessages((prev) => [
                    ...prev,
                    { sender: 'user', text: summaryLines.join(' \n') }
                  ]);

                  handleUserResponse(selectedSlots);
                }}
              />
            </div>
          ) : (
            <div className="chat-bubble bot">
              <ChatInput
                step={currentStep}
                options={currentOptions}
                onSubmit={(input) => {
                  if (currentStep.validate) {
                    const validation = currentStep.validate(input, userResponses);
                    if (validation !== true) {
                      setError(validation);
                      return;
                    }
                  }
                  handleUserResponse(input);
                }}
              />
            </div>
          )
        )}

        {error && (
          <div className="chat-bubble bot error">
            {error}
            <br />
            <button onClick={restartChat}>Restart Chat</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
