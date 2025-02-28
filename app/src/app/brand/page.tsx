'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Heading, Subheading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrandPage() {
  const [input, setInput] = useState('');
  const [brandSurveyResult, setBrandSurveyResult] = useState({ result: '' });
  const [logoGeneration, setLogoGeneration] = useState({ description1: '', description2: '', description3: '' });
  const [brandColors, setBrandColors] = useState({ result: '' });
  const [brandGuidelines, setBrandGuidelines] = useState({ result: '' });
  const [brandName, setBrandName] = useState({ result: '' });
  const [loadingStates, setLoadingStates] = useState({
    brandSurvey: false,
    logoGeneration: false,
    brandColors: false,
    brandGuidelines: false,
    brandName: false,
  });

  const handleSubmit = async <T extends object>(
    promptTemplate: string,
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => {
    setLoadingStates(prev => ({ ...prev, [promptTemplate]: true }));
    try {
      const response = await fetch('/api/ask-anthropic-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, promptTemplateName: promptTemplate }),
      });
      const data = await response.json();
      // Check if the response has a 'result' property, if not, use the entire response
      const result = data.result ? { result: data.result } : data;
      setter(result as T);
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

  const ResultSection = ({ title, value, loading, onCopy }: {
    title: string;
    value: string;
    loading: boolean;
    onCopy: (text: string) => void;
  }) => (
    <div>
      <Subheading>{title}</Subheading>
      {loading ? (
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <div className="relative">
          <Textarea
            value={value}
            readOnly
            rows={6}
            className="mt-1 pr-10"
          />
          <CopyButton onClick={() => onCopy(value)} />
        </div>
      )}
    </div>
  );

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
            {loadingStates.brandSurvey ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Answering...
              </>
            ) : (
              'Answer Brand Survey Questions'
            )}
          </Button>
        </div>

        <ResultSection
          title="Brand Survey Result"
          value={brandSurveyResult.result}
          loading={loadingStates.brandSurvey}
          onCopy={handleCopy}
        />

        <div>
          <Subheading>Logo Generation</Subheading>
          <Button
            onClick={() => handleSubmit('brandLogoPrompt', setLogoGeneration)}
            disabled={loadingStates.logoGeneration}
            className="mt-2"
          >
            {loadingStates.logoGeneration ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Logo Ideas'
            )}
          </Button>
          <div className="mt-2 space-y-2">
            {['description1', 'description2', 'description3'].map((key, index) => (
              <div key={key} className="relative">
                <Textarea
                  value={logoGeneration[key as keyof typeof logoGeneration]}
                  readOnly
                  rows={3}
                  className="mt-1 pr-10"
                  placeholder={`Description ${index + 1}`}
                />
                <CopyButton onClick={() => handleCopy(logoGeneration[key as keyof typeof logoGeneration])} />
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button>
              <a href="/brand/logo" className="text-blue-500 underline hover:text-blue-700">Logo Image Creator</a>
            </Button>
          </div>
        </div>

        <div>
          <Subheading>Brand Colors</Subheading>
          <Button
            onClick={() => handleSubmit('brandColorsPrompt', setBrandColors)}
            disabled={loadingStates.brandColors}
            className="mt-2"
          >
            {loadingStates.brandColors ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Brand Colors'
            )}
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
            {loadingStates.brandGuidelines ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Brand Guidelines'
            )}
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

        <div>
          <Subheading>Brand Name Generator</Subheading>
          <Button
            onClick={() => handleSubmit('brandNamePrompt', setBrandName)}
            disabled={loadingStates.brandName}
            className="mt-2"
          >
            {loadingStates.brandName ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Brand Name'
            )}
          </Button>
        </div>

        <ResultSection
          title="Generated Brand Name"
          value={brandName.result}
          loading={loadingStates.brandName}
          onCopy={handleCopy}
        />
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
      variant="outline"
      size="sm"
      className="absolute right-2 top-2"
      onClick={handleClick}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
