import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wand2 className="w-12 h-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            CoreDev.AI
          </h1>
          <p className="text-lg text-gray-400">
            Describe your dream website, and we'll help you build it step by step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full h-32 p-4 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-teal-500 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
