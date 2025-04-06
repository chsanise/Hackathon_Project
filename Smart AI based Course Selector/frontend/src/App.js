
import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import CourseCard from './components/CourseCard';
import './App.css';

function App() {
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  const handleResponse = (data) => {
    if (data.courses) {
      setRecommendedCourses(data.courses);
    } else {
      setRecommendedCourses([]);
    }
  };

  return (
    <div className="main-wrapper">
      <header className="app-header">
        <h1>🎓 Smart Course Selector</h1>
      </header>
      <div className="app-container">
        <div className="chat-section">
          <Chatbot onResponse={handleResponse} />
        </div>
        <div className="recommendation-section">
          <h2 className="recommendation-title">📚 Recommended Courses</h2>
          {recommendedCourses.length === 0 ? (
            <p className="no-recommendation-text">No recommendations yet.</p>
          ) : (
            recommendedCourses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
