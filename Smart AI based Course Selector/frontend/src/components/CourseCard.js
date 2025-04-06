import React from 'react';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p><strong>Time:</strong> {course.time}</p>
      <p><strong>Reason:</strong> {course.reason}</p>
      {course.note && <p><strong>Note:</strong> {course.note}</p>}
    </div>
  );
};

export default CourseCard;
