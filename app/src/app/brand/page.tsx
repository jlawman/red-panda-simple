'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Heading, Subheading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from 'react-markdown';

// Define types for better type safety
type BrandSection = {
  id: string;
  title: string;
  buttonText: string;
  promptTemplate: string;
  description: string;
};

const BRAND_SECTIONS: BrandSection[] = [
  {
    id: 'brandSurvey',
    title: 'Brand Strategy',
    buttonText: 'Analyze Brand Strategy',
    promptTemplate: 'brandSurveyPrompt',
    description: 'Define your SaaS brand positioning, target audience, and unique value proposition through our strategic analysis.'
  },
  {
    id: 'brandName',
    title: 'Name Generator',
    buttonText: 'Generate Name',
    promptTemplate: 'brandNamePrompt',
    description: 'Create a memorable, domain-friendly name that reflects your SaaS solution and resonates with your target market.'
  },
  {
    id: 'brandColors',
    title: 'Brand Colors',
    buttonText: 'Generate Color Palette',
    promptTemplate: 'brandColorsPrompt',
    description: 'Get a modern, tech-focused color palette that builds trust and professionalism in the SaaS space.'
  },
  {
    id: 'brandGuidelines',
    title: 'Brand Guidelines',
    buttonText: 'Generate Guidelines',
    promptTemplate: 'brandGuidelinesPrompt',
    description: 'Create comprehensive guidelines for your SaaS brand, including voice, tone, and visual elements for web and product interfaces.'
  },
];

export default function BrandPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [currentInput, setCurrentInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add function to check if brand survey is completed
  const isBrandSurveyCompleted = () => {
    return results['brandSurvey'] !== undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value !== currentInput) {
      setResults(prev => ({ ...prev, brandSurvey: undefined }));
      setActiveTab(''); // Clear active tab when input changes
    }
  };

  const generateContent = async (section: BrandSection) => {
    if (!input.trim()) {
      toast.error('Please enter a description first');
      return;
    }

    // Check if trying to access non-survey section without completing survey
    if (section.id !== 'brandSurvey' && !isBrandSurveyCompleted()) {
      toast.error('Please complete the Brand Survey first');
      return;
    }

    setLoading(prev => ({ ...prev, [section.id]: true }));

    try {
      const response = await fetch('/api/ask-anthropic-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: section.id === 'brandSurvey' ? input : results['brandSurvey'],
          promptTemplateName: section.promptTemplate,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const result = data.result || data;

      if (section.id === 'brandSurvey') {
        setCurrentInput(input);
      }

      setResults(prev => ({
        ...prev,
        [section.id]: typeof result === 'string' ? result : JSON.stringify(result),
      }));
      
      setActiveTab(section.title);
    } catch (error) {
      toast.error(`Failed to generate ${section.title.toLowerCase()}`);
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [section.id]: false }));
    }
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Copied to clipboard');
        setCopiedId(sectionId);
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
      },
      () => toast.error('Failed to copy')
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Heading className="text-center mb-8">SaaS Brand Development</Heading>

      <div className="space-y-8">
        <div className="space-y-2">
          <Subheading>Define Your SaaS</Subheading>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your SaaS product, target market, and core problem you're solving..."
            className="w-full"
          />
        </div>

        {/* Brand Generation Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BRAND_SECTIONS.map((section) => (
            <div 
              key={section.id} 
              className={`p-6 rounded-lg border bg-card ${
                section.id !== 'brandSurvey' && !isBrandSurveyCompleted() 
                  ? 'opacity-50' 
                  : ''
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              <Button
                onClick={() => generateContent(section)}
                disabled={
                  loading[section.id] || 
                  (section.id !== 'brandSurvey' && !isBrandSurveyCompleted()) ||
                  (section.id !== 'brandSurvey' && input !== currentInput)
                }
                className="w-full"
              >
                {loading[section.id] ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" />
                    Generating...
                  </div>
                ) : (
                  section.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Results Display */}
        {Object.keys(results).length > 0 && activeTab && (
          <div className="mt-8">
            <Tabs
              tabs={Object.keys(results).map(sectionId => ({
                name: BRAND_SECTIONS.find(s => s.id === sectionId)?.title || '',
                current: BRAND_SECTIONS.find(s => s.id === sectionId)?.title === activeTab
              }))}
              onChange={(selectedTab) => {
                setActiveTab(selectedTab.name);
              }}
            />
            
            {Object.entries(results).map(([sectionId, content]) => {
              const section = BRAND_SECTIONS.find(s => s.id === sectionId);
              if (!section || section.title !== activeTab) return null;
              
              return (
                <div key={sectionId} className="relative mt-4 p-8 rounded-xl border bg-card shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                  <div className="prose max-w-none dark:prose-invert">
                    <Markdown>{content}</Markdown>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-4"
                    onClick={() => copyToClipboard(content, sectionId)}
                  >
                    {copiedId === sectionId ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Logo Creator Link */}
        <div className="text-center pt-4">
          <Button>
            <Link href="/brand/logo" className="w-full">
              Open Logo Creator
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
