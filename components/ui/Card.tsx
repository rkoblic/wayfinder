import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  onClick,
  hover = false,
}: CardProps) {
  const baseStyles =
    "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700";
  const hoverStyles = hover
    ? "cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
    : "";
  const clickStyles = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
