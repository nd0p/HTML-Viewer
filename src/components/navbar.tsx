'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Icons} from '@/components/icons';
import {useToast} from '@/hooks/use-toast';
import {improveCode} from '@/ai/flows/improve-code';
import {detectCodeErrors} from '@/ai/flows/detect-code-errors';
import JSZip from 'jszip';

interface NavbarProps {
  html: string;
  css: string;
  javascript: string;
  setHtml: (html: string) => void;
  setCss: (css: string) => void;
  setJavascript: (javascript: string) => void;
  setConsoleOutput: (output: string) => void;
}

export function Navbar({html, css, javascript, setHtml, setCss, setJavascript, setConsoleOutput}: NavbarProps) {
  const [isAiAssistantLoading, setIsAiAssistantLoading] = useState(false);
  const [isAiErrorDetectionLoading, setIsAiErrorDetectionLoading] = useState(false);
  const {toast} = useToast();

  const downloadCode = () => {
    const zip = new JSZip();
    zip.file('index.html', html);
    zip.file('style.css', css);
    zip.file('script.js', javascript);

    zip.generateAsync({type: 'blob'}).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'web-weaver.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const clearCode = () => {
    setHtml('');
    setCss('');
    setJavascript('');
    setConsoleOutput('');
  };

  const getAiSuggestions = async () => {
    setIsAiAssistantLoading(true);
    try {
      const result = await improveCode({
        html: html,
        css: css,
        javascript: javascript,
      });
      toast({
        title: 'AI Assistant Suggestions',
        description: result?.suggestions || 'No suggestions found.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsAiAssistantLoading(false);
    }
  };

  const detectErrors = async () => {
    setIsAiErrorDetectionLoading(true);
    try {
      const result = await detectCodeErrors({
        html: html,
        css: css,
        javascript: javascript,
      });

      let errorMessages = [];
      if (result?.htmlErrors && result.htmlErrors.length > 0) {
        errorMessages.push(`HTML Errors: ${result.htmlErrors.join(', ')}`);
      }
      if (result?.cssErrors && result.cssErrors.length > 0) {
        errorMessages.push(`CSS Errors: ${result.cssErrors.join(', ')}`);
      }
      if (result?.javascriptErrors && result.javascriptErrors.length > 0) {
        errorMessages.push(`JavaScript Errors: ${result.javascriptErrors.join(', ')}`);
      }
      if (result?.suggestions && result.suggestions.length > 0) {
        errorMessages.push(`Suggestions: ${result.suggestions.join(', ')}`);
      }

      if (errorMessages.length > 0) {
        toast({
          title: 'AI Error Detection',
          description: errorMessages.join('\n'),
        });
      } else {
        toast({
          title: 'AI Error Detection',
          description: 'No errors found.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsAiErrorDetectionLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-200">
      <h1 className="text-2xl font-bold">HTML Viewer</h1>
      <div className="flex space-x-4">
        <Button onClick={downloadCode}>
          <Icons.download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="destructive" onClick={clearCode}>
          <Icons.trash className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button onClick={getAiSuggestions} disabled={isAiAssistantLoading}>
          {isAiAssistantLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {!isAiAssistantLoading && <Icons.edit className="mr-2 h-4 w-4" />}
          AI Assistant
        </Button>
        <Button onClick={detectErrors} disabled={isAiErrorDetectionLoading}>
          {isAiErrorDetectionLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {!isAiErrorDetectionLoading && <Icons.shield className="mr-2 h-4 w-4" />}
          AI Error Detection
        </Button>
      </div>
    </div>
  );
}
