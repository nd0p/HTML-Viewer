'use client';

import {useState, useEffect, useCallback} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Icons} from '@/components/icons';
import {Toaster} from '@/components/ui/toaster';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Navbar} from "@/components/navbar";
import {Button} from "@/components/ui/button";

const initialHtml = '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Web Weaver</title>\n</head>\n<body>\n    <h1>Hello, Web Weaver!</h1>\n    <p>Start building your website here.</p>\n</body>\n</html>';
const initialCss = 'body {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}';
const initialJs = '// Your JavaScript code here\nconsole.log("Web Weaver is running!");';

export default function Home() {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [javascript, setJavascript] = useState(initialJs);
  const [livePreview, setLivePreview] = useState('');
  const {toast} = useToast();
  const [consoleOutput, setConsoleOutput] = useState('');

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

  const runCode = () => {
    // Clear previous console output
    setConsoleOutput('');
    try {
      // Redirect console.log to capture output
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const iframeWindow = iframe.contentWindow as any;
        if (iframeWindow) {
          let consoleMessages = [];
          iframeWindow.console.log = (...args: any[]) => {
            consoleMessages.push(args.map(arg => String(arg)).join(' '));
            setConsoleOutput(prevOutput => prevOutput + args.map(arg => String(arg)).join(' ') + '\n');
          };
          iframeWindow.console.error = (...args: any[]) => {
            consoleMessages.push("Error: " + args.map(arg => String(arg)).join(' '));
            setConsoleOutput(prevOutput => prevOutput + "Error: " + args.map(arg => String(arg)).join(' ') + '\n');
          };

          // Execute the JavaScript code
          iframeWindow.eval(javascript);

          // Restore original console
          iframeWindow.console.log = console.log;
          iframeWindow.console.error = console.error;

          // If no console messages were captured, display a default message
          if (consoleMessages.length === 0) {
            setConsoleOutput('Code executed without output.\n');
          }
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
      setConsoleOutput(`Error: ${error.message}\n`);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <Navbar
        html={html}
        css={css}
        javascript={javascript}
        setHtml={setHtml}
        setCss={setCss}
        setJavascript={setJavascript}
        setConsoleOutput={setConsoleOutput}
      />

      <div className="flex flex-1">
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
           <Button onClick={runCode}>
            <Icons.play className="mr-2 h-4 w-4" />
            Run Code
          </Button>
        </div>
          <Card>
            <CardHeader>
              <CardTitle>Console</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40 rounded-md">
                <div className="whitespace-pre-line">{consoleOutput}</div>
              </ScrollArea>
            </CardContent>
          </Card>
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
      </div>
      <Toaster />
    </div>
  );
}
