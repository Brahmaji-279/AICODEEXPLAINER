// frontend/src/App.jsx
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactDiffViewer from "react-diff-viewer";

const API_URL = "https://your-backend.onrender.com"; // 🔹 Replace with your Render backend URL

function App() {
  const [code, setCode] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [fixedCode, setFixedCode] = useState(""); // for debugged code
  const [mode, setMode] = useState(""); // explain/debug/complexity/custom

  // Call backend API
  const handleAskAI = async (action) => {
    if (!code.trim() && action !== "custom") {
      setOutput("⚠️ Please enter your code.");
      return;
    }

    let finalPrompt = "";
    if (action === "explain") {
      finalPrompt = "Explain this code in detail.";
    } else if (action === "debug") {
      finalPrompt = "Debug this code and suggest fixes. Return only the corrected code.";
    } else if (action === "complexity") {
      finalPrompt =
        "Find the time complexity (best, average, worst) of this code.";
    } else {
      finalPrompt = userPrompt; // freeform prompt
    }

    setMode(action);
    setOutput("⏳ Thinking...");
    setFixedCode("");

    try {
      const res = await fetch(`${API_URL}/api/openai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userPrompt: finalPrompt }),
      });

      const data = await res.json();

      // If debugging, store fixed code separately
      if (action === "debug") {
        setFixedCode(data.result || "");
        setOutput(""); // clear normal output
      } else {
        setOutput(data.result || "❌ No response from AI");
      }
    } catch (error) {
      console.error(error);
      setOutput("⚠️ Error connecting to AI server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-green-400 mb-6">
        AI Code Explainer 🚀
      </h1>

      {/* Code Input Box */}
      <textarea
        className="w-full max-w-3xl h-48 p-4 rounded-xl bg-gray-800 border border-gray-700 text-green-200 font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {/* Freeform prompt input */}
      <input
        type="text"
        className="w-full max-w-3xl mt-4 p-3 rounded-xl bg-gray-800 border border-gray-700 text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        placeholder="Ask AI anything about your code..."
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
      />

      {/* Buttons */}
      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        <button
          onClick={() => handleAskAI("explain")}
          className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg transition-all duration-300"
        >
          Explain
        </button>
        <button
          onClick={() => handleAskAI("debug")}
          className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg transition-all duration-300"
        >
          Debug
        </button>
        <button
          onClick={() => handleAskAI("complexity")}
          className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-black font-semibold shadow-lg transition-all duration-300"
        >
          Find Time Complexity
        </button>
        <button
          onClick={() => handleAskAI("custom")}
          className="px-6 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-black font-semibold shadow-lg transition-all duration-300"
        >
          Custom Prompt
        </button>
      </div>

      {/* Output Section */}
      {output && (
        <div className="mt-6 w-full max-w-3xl p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-lg animate-fadeIn">
          <h2 className="text-xl font-semibold mb-2 text-green-300">
            AI Response:
          </h2>
          <p className="text-gray-200 whitespace-pre-line">{output}</p>
        </div>
      )}

      {/* Debugged Code with Highlighting */}
      {fixedCode && (
        <div className="mt-6 w-full max-w-3xl p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-lg animate-fadeIn">
          <h2 className="text-xl font-semibold mb-2 text-yellow-300">
            🔧 Debugged Code:
          </h2>

          {/* Diff View */}
          <ReactDiffViewer
            oldValue={code}
            newValue={fixedCode}
            splitView={true}
            showLineNumbers={true}
          />

          {/* Syntax Highlighted final code */}
          <h3 className="text-lg font-semibold mt-4 text-green-400">
            ✅ Corrected Code:
          </h3>
          <SyntaxHighlighter language="javascript" style={dracula} showLineNumbers>
            {fixedCode}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

export default App;
