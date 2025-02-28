'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Heading, Subheading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandPage() {
  const [input, setInput] = useState('');
  const [brandSurveyResult, setBrandSurveyResult] = useState({ result: '' });
  const [logoGeneration, setLogoGeneration] = useState({ description1: '', description2: '', description3: '' });
  const [brandColors, setBrandColors] = useState({ result: '' });
  const [brandGuidelines, setBrandGuidelines] = useState({ result: '' });
  const [loadingStates, setLoadingStates] = useState({
    brandSurvey: false,
    logoGeneration: false,
    brandColors: false,
    brandGuidelines: false,
  });

  const handleSubmit = async (promptTemplate: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setLoadingStates(prev => ({ ...prev, [promptTemplate]: true }));
    try {
      const response = await fetch('/api/ask-anthropic-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, promptTemplateName: promptTemplate }),
      });
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [promptTemplate]: false }));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Heading className="text-center mb-8">Brand Development</Heading>

      <div className="space-y-6">
        <div>
          <Subheading>Tool description</Subheading>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the tool"
            className="mt-1"
          />
          <Button
            onClick={() => handleSubmit('brandSurveyPrompt', setBrandSurveyResult)}
            disabled={loadingStates.brandSurvey}
            className="mt-2"
          >
            {loadingStates.brandSurvey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Answer Brand Survey Questions
          </Button>
        </div>

        <div>
          <Subheading>Brand Survey Result</Subheading>
          <div className="relative">
            <Textarea
              value={brandSurveyResult.result}
              readOnly
              rows={6}
              className="mt-1 pr-10"
            />
            <CopyButton onClick={() => handleCopy(brandSurveyResult.result)} />
          </div>
        </div>

        <div>
          <Subheading>Logo Generation</Subheading>
          <Button
            onClick={() => handleSubmit('brandLogoPrompt', setLogoGeneration)}
            disabled={loadingStates.logoGeneration}
            className="mt-2"
          >
            {loadingStates.logoGeneration ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Logo Ideas (from input box above)
          </Button>
          <div className="mt-2 space-y-2">
            <p><strong>Description 1:</strong> {logoGeneration.description1}</p>
            <p><strong>Description 2:</strong> {logoGeneration.description2}</p>
            <p><strong>Description 3:</strong> {logoGeneration.description3}</p>
          </div>
        </div>

        <div>
          <Subheading>Brand Colors</Subheading>
          <Button
            onClick={() => handleSubmit('brandColorsPrompt', setBrandColors)}
            disabled={loadingStates.brandColors}
            className="mt-2"
          >
            {loadingStates.brandColors ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Brand Colors
          </Button>
          <div className="relative">
            <Textarea
              value={brandColors.result}
              readOnly
              rows={6}
              className="mt-1 pr-10"
            />
            <CopyButton onClick={() => handleCopy(brandColors.result)} />
          </div>
        </div>

        <div>
          <Subheading>Brand Guidelines</Subheading>
          <Button
            onClick={() => handleSubmit('brandGuidelinesPrompt', setBrandGuidelines)}
            disabled={loadingStates.brandGuidelines}
            className="mt-2"
          >
            {loadingStates.brandGuidelines ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Brand Guidelines
          </Button>
          <div className="relative">
            <Textarea
              value={brandGuidelines.result}
              readOnly
              rows={6}
              className="mt-1 pr-10"
            />
            <CopyButton onClick={() => handleCopy(brandGuidelines.result)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ onClick }: { onClick: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2"
      onClick={handleClick}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
