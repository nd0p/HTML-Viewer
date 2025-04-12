'use server';
/**
 * @fileOverview An AI agent that suggests improvements to code.
 *
 * - improveCode - A function that provides code improvement suggestions.
 * - ImproveCodeInput - The input type for the improveCode function.
 * - ImproveCodeOutput - The return type for the improveCode function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImproveCodeInputSchema = z.object({
  html: z.string().describe('The HTML code to improve.'),
  css: z.string().describe('The CSS code to improve.'),
  javascript: z.string().describe('The JavaScript code to improve.'),
});
export type ImproveCodeInput = z.infer<typeof ImproveCodeInputSchema>;

const ImproveCodeOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for improving the code.'),
});
export type ImproveCodeOutput = z.infer<typeof ImproveCodeOutputSchema>;

export async function improveCode(input: ImproveCodeInput): Promise<ImproveCodeOutput> {
  return improveCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveCodePrompt',
  input: {
    schema: z.object({
      html: z.string().describe('The HTML code to improve.'),
      css: z.string().describe('The CSS code to improve.'),
      javascript: z.string().describe('The JavaScript code to improve.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.string().describe('Suggestions for improving the code.'),
    }),
  },
  prompt: `You are an AI code assistant that provides suggestions for improving code.

  You will be given HTML, CSS, and JavaScript code. You will respond with suggestions on how to improve the code's structure, style, or functionality. Focus on identifying potential errors, improving code readability, and optimizing performance.

  Here is the code:

  HTML:
  {{html}}

  CSS:
  {{css}}

  JavaScript:
  {{javascript}}
  `,
});

const improveCodeFlow = ai.defineFlow<
  typeof ImproveCodeInputSchema,
  typeof ImproveCodeOutputSchema
>(
  {
    name: 'improveCodeFlow',
    inputSchema: ImproveCodeInputSchema,
    outputSchema: ImproveCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
