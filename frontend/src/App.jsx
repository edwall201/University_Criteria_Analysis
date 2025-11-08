import React, { useState } from 'react';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);

  const tokenize = (text) => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[\W_]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter((w) => !['the', 'is', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'and', 'or', 'with', 'by', 'that', 'this'].includes(w));
  };

  const scoreLogic = (q, a) => {
    const qWords = tokenize(q).slice(0, 30);
    const aWords = new Set(tokenize(a));
    if (!qWords.length || !aWords.size) return 0;
    let matches = 0;
    qWords.forEach((w) => {
      if (aWords.has(w)) matches++;
    });
    const score = Math.round((matches / qWords.length) * 100);
    return Math.min(100, score);
  };

  const scoreEfficiency = (a) => {
    if (!a) return 0;
    const hasComplexity = /\bO\(|time complexity|space complexity|\bO\(/i.test(a);
    if (hasComplexity) return 90;
    const lines = a.split('\n').filter(Boolean).length;
    if (lines <= 10) return 80;
    if (lines <= 30) return 60;
    return 40;
  };

  const scoreReadability = (a) => {
    if (!a) return 0;
    const hasComments = /\/\/|\/\*|#|<!--/.test(a);
    const avgLineLen =
      a
        .split('\n')
        .filter(Boolean)
        .reduce((s, l) => s + l.length, 0) / Math.max(1, a.split('\n').filter(Boolean).length);
    let score = 50;
    if (hasComments) score += 25;
    if (avgLineLen < 80) score += 15;
    if (avgLineLen > 140) score -= 10;
    return Math.max(0, Math.min(100, score));
  };

  const analyze = () => {
    const time = new Date().toISOString();
    const l = scoreLogic(question, answer);
    const e = scoreEfficiency(answer);
    const r = scoreReadability(answer);
    const record = {
      time,
      logic: l,
      efficiency: e,
      readability: r,
      question,
      answer,
    };
    setResult(record);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center overflow-y-auto">
      <div className="flex flex-col items-center justify-start w-full max-w-7xl bg-white shadow-lg rounded-2xl p-12 text-center">
        <h1 className="text-5xl font-bold mb-12 mt-6">LeetCode Helper</h1>

        {/* Question and Answer inputs */}
        <div className="w-full flex flex-col items-center">
          <textarea
            style={{ height: '18rem' }}
            className="w-2/3 p-5 border rounded mb-8 resize-none text-2xl placeholder:text-2xl placeholder:text-gray-400"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="LeetCode question title or summary"
          />

          <textarea
            style={{ height: '18rem' }}
            className="w-2/3 p-5 border rounded mb-8 resize-none text-2xl placeholder:text-2xl placeholder:text-gray-400"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={`Paste your answer / code here.\nInclude comments or complexity notes if you have them.`}
          />

          <button
            onClick={analyze}
            className="px-10 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-10 text-lg"
          >
            Analyze
          </button>
        </div>

        {/* Results Section */}
        <div className="w-full flex flex-col items-center mb-10">
          <div className="w-2/3 text-left max-h-[500px] overflow-y-auto">
            <h2 className="font-semibold mb-4 text-xl text-center">Categories (scored)</h2>
            {result ? (
              <div className="p-6 border rounded bg-gray-50 text-base">
                <div className="text-gray-600 text-center">
                  Time • {new Date(result.time).toLocaleString()}
                </div>
                <div className="mt-3 text-center">
                  Logic: <strong>{result.logic}</strong>/100
                </div>
                <div className="text-center">
                  Efficiency: <strong>{result.efficiency}</strong>/100
                </div>
                <div className="text-center">
                  Readability: <strong>{result.readability}</strong>/100
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-base text-center">
                Press <strong>Analyze</strong> to evaluate your answer.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}