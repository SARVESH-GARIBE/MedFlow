import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ rating, size = 'text-sm', showNumber = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="text-yellow-400" />
      ))}

      {/* Half Star */}
      {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" />}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="text-gray-300" />
      ))}

      {showNumber && (
        <span className="ml-1 text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;