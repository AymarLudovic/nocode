import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Code, Play, Download, Copy } from 'lucide-react';
import Button from '../ui/Button';

interface CodeEditorProps {
  initialCode?: string;
  language?: 'javascript' | 'html' | 'css';
  readOnly?: boolean;
  onRun?: (code: string) => void;
  onSave?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  language = 'javascript',
  readOnly = false,
  onRun,
  onSave
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  
  const getLanguageExtension = () => {
    switch (language) {
      case 'html':
        return html();
      case 'css':
        return css();
      case 'javascript':
      default:
        return javascript();
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const fileExtension = language === 'javascript' ? 'js' : language;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Code size={18} className="mr-2" />
          <span className="font-medium">{language.toUpperCase()} Editor</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Copy size={16} />}
            onClick={handleCopy}
            className="text-white hover:bg-gray-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download size={16} />}
            onClick={handleDownload}
            className="text-white hover:bg-gray-700"
          >
            Download
          </Button>
          
          {onRun && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play size={16} />}
              onClick={() => onRun(code)}
            >
              Run
            </Button>
          )}
          
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave(code)}
            >
              Save
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme={vscodeDark}
          extensions={[getLanguageExtension()]}
          onChange={setCode}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;