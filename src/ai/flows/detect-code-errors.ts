'use server';
/**
 * @fileOverview Detects errors in code and provides suggestions for fixing them.
 *
 * - detectCodeErrors - A function that detects code errors and provides suggestions.
 * - DetectCodeErrorsInput - The input type for the detectCodeErrors function.
 * - DetectCodeErrorsOutput - The return type for the detectCodeErrors function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DetectCodeErrorsInputSchema = z.object({
  html: z.string().optional().describe('The HTML code to check.'),
  css: z.string().optional().describe('The CSS code to check.'),
  javascript: z.string().optional().describe('The JavaScript code to check.'),
});
export type DetectCodeErrorsInput = z.infer<typeof DetectCodeErrorsInputSchema>;

const DetectCodeErrorsOutputSchema = z.object({
  htmlErrors: z.array(z.string()).optional().describe('Errors found in the HTML code.'),
  cssErrors: z.array(z.string()).optional().describe('Errors found in the CSS code.'),
  javascriptErrors: z.array(z.string()).optional().describe('Errors found in the JavaScript code.'),
  suggestions: z.array(z.string()).optional().describe('Suggestions on how to fix the errors.'),
});
export type DetectCodeErrorsOutput = z.infer<typeof DetectCodeErrorsOutputSchema>;

export async function detectCodeErrors(input: DetectCodeErrorsInput): Promise<DetectCodeErrorsOutput> {
  return detectCodeErrorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCodeErrorsPrompt',
  input: {
    schema: z.object({
      html: z.string().optional().describe('The HTML code to check.'),
      css: z.string().optional().describe('The CSS code to check.'),
      javascript: z.string().optional().describe('The JavaScript code to check.'),
    }),
  },
  output: {
    schema: z.object({
      htmlErrors: z.array(z.string()).optional().describe('Errors found in the HTML code.'),
      cssErrors: z.array(z.string()).optional().describe('Errors found in the CSS code.'),
      javascriptErrors: z.array(z.string()).optional().describe('Errors found in the JavaScript code.'),
      suggestions: z.array(z.string()).optional().describe('Suggestions on how to fix the errors.'),
    }),
  },
  prompt: `You are an AI code assistant that detects errors in HTML, CSS, and JavaScript code and provides suggestions on how to fix them.

  Analyze the following code and identify any errors. Provide suggestions on how to fix them.

  HTML:
  {{#if html}}
  {{{html}}}
  {{else}}
  No HTML code provided.
  {{/if}}

  CSS:
  {{#if css}}
  {{{css}}}
  {{else}}
  No CSS code provided.
  {{/if}}

  JavaScript:
  {{#if javascript}}
  {{{javascript}}}
  {{else}}
  No JavaScript code provided.
  {{/if}}

  Return the errors and suggestions in the format specified by the output schema.
  `,
});

const detectCodeErrorsFlow = ai.defineFlow<
  typeof DetectCodeErrorsInputSchema,
  typeof DetectCodeErrorsOutputSchema
>(
  {
    name: 'detectCodeErrorsFlow',
    inputSchema: DetectCodeErrorsInputSchema,
    outputSchema: DetectCodeErrorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
