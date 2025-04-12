'use client';

import {useState, useEffect, useCallback} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Icons} from '@/components/icons';
import {improveCode} from '@/ai/flows/improve-code';
import {detectCodeErrors} from '@/ai/flows/detect-code-errors';
import {Toaster} from '@/components/ui/toaster'; // Import Toaster component
import JSZip from 'jszip';

const initialHtml = '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Web Weaver</title>\n</head>\n<body>\n    <h1>Hello, Web Weaver!</h1>\n    <p>Start building your website here.</p>\n</body>\n</html>';
const initialCss = 'body {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}';
const initialJs = '// Your JavaScript code here\nconsole.log("Web Weaver is running!");';

export default function Home() {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [javascript, setJavascript] = useState(initialJs);
  const [livePreview, setLivePreview] = useState('');
  const [isAiAssistantLoading, setIsAiAssistantLoading] = useState(false);
  const [isAiErrorDetectionLoading, setIsAiErrorDetectionLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    updateLivePreview();
  }, [html, css, javascript]);

  const updateLivePreview = useCallback(() => {
    const combinedCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web Weaver Live Preview</title>
          <style>${css}</style>
      </head>
      <body>
          ${html}
          <script>${javascript}</script>
      </body>
      </html>
    `;
    setLivePreview(combinedCode);
  }, [html, css, javascript]);

  const handleCodeChange = (type: string, value: string) => {
    switch (type) {
      case 'html':
        setHtml(value);
        break;
      case 'css':
        setCss(value);
        break;
      case 'javascript':
        setJavascript(value);
        break;
      default:
        break;
    }
  };

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

  const runCode = () => {
    try {
      // Safely execute JavaScript code within the iframe
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const iframeWindow = iframe.contentWindow as any;
        if (iframeWindow) {
          iframeWindow.eval(javascript); // Execute the JavaScript code
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not access iframe content.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Iframe not found.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Code Input Section */}
      <div className="w-1/2 p-4 flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter HTML code"
              value={html}
              onChange={e => handleCodeChange('html', e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSS</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter CSS code"
              value={css}
              onChange={e => handleCodeChange('css', e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JavaScript</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter JavaScript code"
              value={javascript}
              onChange={e => handleCodeChange('javascript', e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button onClick={downloadCode}>
            <Icons.download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="destructive" onClick={clearCode}>
            <Icons.trash className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="flex justify-between">
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
          <Button onClick={runCode}>
            <Icons.play className="mr-2 h-4 w-4" />
            Run Code
          </Button>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="w-1/2 p-4 bg-gray-100">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <iframe
              srcDoc={livePreview}
              title="Live Preview"
              width="100%"
              height="100%"
              style={{border: 'none'}}
            />
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}

