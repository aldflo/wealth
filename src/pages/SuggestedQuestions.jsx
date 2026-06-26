const questions = [
  "Quiero un cancel moderno",
  "Diseño de vidrio templado",
  "Fachadas de lujo",
];

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="p-2 flex gap-2 flex-wrap">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="text-xs bg-gray-200 px-3 py-1 rounded-full"
        >
          {q}
        </button>
      ))}
    </div>
  );
}