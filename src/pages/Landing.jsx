import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const adjectives = [
  "eficiente",
  "inteligente",
  "organizado",
  "produtivo",
  "inovador"
];

export default function Landing() {
  const [currentWord, setCurrentWord] = useState(adjectives[0]);
  const [wordIndex, setWordIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % adjectives.length);
      setCurrentWord(adjectives[wordIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [wordIndex]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50">
      <div className="text-center space-y-8 p-4">
        {/* Logo */}
        <div className="mb-12">
          <img 
            src="public/logo-edu.svg" 
            alt="UniTask Logo" 
            className="w-32 h-32 mx-auto"
          />
        </div>

        {/* Título com palavra animada */}
        <h1 className="text-5xl font-bold mb-6">
          Descrubra o jeito{' '}
          <span className="text-blue-500 inline-block min-w-[200px] transition-all duration-300">
            {currentWord}
          </span>
          {' '} de maximizar<br></br> o seu aprendizado
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-gray-600 mb-12">
          Organize suas tarefas e maximize seu aprendizado
        </p>

        {/* Botão de Login */}
        <button
          onClick={handleLoginClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          Começar Agora
        </button>
      </div>
    </div>
  );
}
