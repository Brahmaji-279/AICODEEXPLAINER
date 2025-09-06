import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactDiffViewer from "react-diff-viewer-continued";
import Editor from "@monaco-editor/react";

function App() {
  const [code, setCode] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [fixedCode, setFixedCode] = useState("");
  const [mode, setMode] = useState("");

  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handleAskAI = async (action) => {
    if (!code.trim() && action !== "custom") {
      setOutput("⚠️ Please enter your code.");
      return;
    }

    let finalPrompt = "";
    if (action === "explain") {
      finalPrompt = "Explain this code in detail.";
    } else if (action === "debug") {
      finalPrompt =
        "Debug this code and suggest fixes. Return only the corrected code.";
    } else if (action === "complexity") {
      finalPrompt =
        "Find the time complexity (best, average, worst) of this code.";
    } else {
      finalPrompt = userPrompt;
    }

    setMode(action);
    setOutput("⏳ Thinking...");
    setFixedCode("");

    try {
      const res = await fetch(`${backendURL}/api/openai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userPrompt: finalPrompt }),
      });

      const data = await res.json();

      if (action === "debug") {
        setFixedCode(data.result || "");
        setOutput("");
      } else {
        setOutput(data.result || "❌ No response from AI");
      }
    } catch (error) {
      console.error(error);
      setOutput("⚠️ Error connecting to AI server.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Title */}
      <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg">
        🚀 AI Code Explainer
      </h1>

      {/* Monaco Editor */}
      <div className="w-full max-w-3xl h-80 rounded-3xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            fontLigatures: true,
            automaticLayout: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoIndent: "full",
            formatOnType: true,
            formatOnPaste: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Suggested Actions */}
      <div className="flex gap-3 mt-6 flex-wrap justify-center">
        <button
          onClick={() => handleAskAI("explain")}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-black font-semibold shadow-md hover:opacity-90 transition"
        >
          Explain
        </button>
        <button
          onClick={() => handleAskAI("debug")}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold shadow-md hover:opacity-90 transition"
        >
          Debug
        </button>
        <button
          onClick={() => handleAskAI("complexity")}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-black font-semibold shadow-md hover:opacity-90 transition"
        >
          Complexity
        </button>
      </div>

      {/* AI Output with Avatar */}
      {output && (
        <div className="mt-6 w-full max-w-3xl flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">
            🤖
          </div>
          {/* Chat bubble */}
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg max-w-full">
            <h2 className="text-lg font-semibold mb-2 text-green-200">
              AI Response:
            </h2>
            <p className="text-gray-100 whitespace-pre-line">{output}</p>
          </div>
        </div>
      )}

      {/* Debugged Code */}
      {fixedCode && (
        <div className="mt-6 w-full max-w-3xl flex flex-col gap-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
              🔧
            </div>
            {/* Diff Viewer */}
            <div className="flex-1 p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <h2 className="text-lg font-semibold mb-2 text-yellow-200">
                Debugged Code:
              </h2>
              <ReactDiffViewer
                oldValue={code}
                newValue={fixedCode}
                splitView={true}
                showLineNumbers={true}
              />
            </div>
          </div>

          {/* Highlighted Corrected Code */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-2xl shadow-lg">
              ✅
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-green-300">
                Corrected Code:
              </h3>
              <SyntaxHighlighter
                language="javascript"
                style={dracula}
                showLineNumbers
              >
                {fixedCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}

     {/* Bottom Input (Chat Style) */}
<div className="fixed bottom-6 w-full flex justify-center px-4">
  <div className="flex items-center w-full max-w-3xl p-3 rounded-2xl bg-white/25 backdrop-blur-lg border border-white/30 shadow-lg">
    
    {/* User Avatar */}
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold mr-3">
      👤
    </div>

    {/* Input Field */}
    <input
      type="text"
      className="flex-grow px-4 py-2 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
      placeholder="Ask AI anything about your code..."
      value={userPrompt}
      onChange={(e) => setUserPrompt(e.target.value)}
    />

    {/* Send Button */}
    <button
      onClick={() => handleAskAI("custom")}
      className="ml-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-md hover:opacity-90 transition"
    >
      ➤
    </button>
  </div>
</div>
    </div>
  );
}

export default App;
