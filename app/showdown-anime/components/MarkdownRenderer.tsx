'use client';

import { useMemo } from 'react';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export default function MarkdownRenderer({ text, className = '' }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    // Split text by code blocks
    const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
    
    return parts.map((part, index) => {
      // Even indices are text, odd indices are language, even+1 indices are code
      if (index % 3 === 0) {
        // Regular text with markdown formatting
        if (!part.trim()) return null;
        
        // Process markdown formatting
        let formatted = part
          // Headers
          .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
          .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
          .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
          // Bold
          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          // Italic
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          // Inline code
          .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono">$1</code>')
          // Lists
          .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
          .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$&</li>')
          // Line breaks
          .replace(/\n\n/g, '</p><p class="mb-3">')
          .replace(/\n/g, '<br/>');
        
        return (
          <div 
            key={index} 
            className="text-gray-800 leading-relaxed"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${formatted}</p>` }}
          />
        );
      } else if (index % 3 === 2) {
        // Code block
        const language = parts[index - 1] || 'plaintext';
        const isMermaid = language.toLowerCase() === 'mermaid';
        
        return (
          <div key={index} className="my-4">
            {isMermaid ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2 font-sans">Mermaid Diagram</div>
                <pre className="text-sm text-gray-700 overflow-x-auto font-mono">
                  <code>{part}</code>
                </pre>
              </div>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono">{part}</code>
              </pre>
            )}
          </div>
        );
      }
      return null;
    });
  }, [text]);

  return (
    <div className={`markdown-content ${className}`}>
      {renderedContent}
    </div>
  );
}