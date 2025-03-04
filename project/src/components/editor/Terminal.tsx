import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon, Minimize, Maximize, X } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
}

const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;
    
    // Initialize xterm.js
    xtermRef.current = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#f0f0f0',
        cursor: '#f0f0f0',
        cursorAccent: '#1e1e1e',
        selection: 'rgba(255, 255, 255, 0.3)',
      }
    });
    
    fitAddonRef.current = new FitAddon();
    xtermRef.current.loadAddon(fitAddonRef.current);
    
    xtermRef.current.open(terminalRef.current);
    fitAddonRef.current.fit();
    
    // Welcome message
    xtermRef.current.writeln('\x1b[1;34mWebsite Builder Terminal\x1b[0m');
    xtermRef.current.writeln('Type \x1b[1;32mhelp\x1b[0m for a list of available commands.');
    xtermRef.current.write('\r\n$ ');
    
    // Handle terminal input
    let currentLine = '';
    
    xtermRef.current.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      
      if (domEvent.keyCode === 13) { // Enter
        xtermRef.current?.writeln('');
        processCommand(currentLine);
        currentLine = '';
        xtermRef.current?.write('$ ');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.substring(0, currentLine.length - 1);
          xtermRef.current?.write('\b \b');
        }
      } else if (printable) {
        currentLine += key;
        xtermRef.current?.write(key);
      }
    });
    
    // Process commands
    const processCommand = (command: string) => {
      const trimmedCommand = command.trim();
      
      if (!trimmedCommand) {
        return;
      }
      
      switch (trimmedCommand) {
        case 'help':
          xtermRef.current?.writeln('\r\nAvailable commands:');
          xtermRef.current?.writeln('  help     - Show this help message');
          xtermRef.current?.writeln('  clear    - Clear the terminal');
          xtermRef.current?.writeln('  version  - Show version information');
          xtermRef.current?.writeln('  exit     - Close the terminal');
          break;
          
        case 'clear':
          xtermRef.current?.clear();
          break;
          
        case 'version':
          xtermRef.current?.writeln('\r\nWebsite Builder v0.1.0');
          xtermRef.current?.writeln('Running on WebContainer');
          break;
          
        case 'exit':
          onClose();
          break;
          
        default:
          xtermRef.current?.writeln(`\r\nCommand not found: ${trimmedCommand}`);
          xtermRef.current?.writeln('Type "help" for a list of available commands.');
      }
    };
    
    // Handle window resize
    const handleResize = () => {
      fitAddonRef.current?.fit();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      xtermRef.current?.dispose();
    };
  }, [isOpen, onClose]);
  
  useEffect(() => {
    if (isOpen && fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit();
      }, 100);
    }
  }, [isOpen, isMaximized]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-700 shadow-lg
        ${isMaximized ? 'top-0' : 'h-64'}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <TerminalIcon size={16} className="mr-2" />
          <span className="font-medium">Terminal</span>
        </div>
        <div className="flex space-x-2">
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={onMinimize}
          >
            <Minimize size={14} />
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={onMaximize}
          >
            <Maximize size={14} />
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="h-full w-full overflow-hidden"
      />
    </div>
  );
};

export default Terminal;