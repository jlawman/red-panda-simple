'use client'

import { useState } from "react";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Loader2 } from 'lucide-react'
import { motion } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Heading } from "../../components/ui/heading";
import { Textarea } from "../../components/ui/textarea";
import { Container } from "../../components/ui/container";
import { Gradient } from "../../components/ui/gradient";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [idea, setIdea] = useState('');
  const [rebuttal, setRebuttal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  
  const humorousMessages = [
    "Synthesizing multi-dimensional data matrices for analysis...",
    "Engaging advanced neural network amplification protocols...",
    "Interfacing with global knowledge repositories...",
    "Recalibrating quantum-scale cognitive processing units...",
    "Reactivating dormant linguistic analysis algorithms...",
    "Initializing deep learning model for conceptual evaluation...",
    "Accessing comprehensive historical and scientific databases...",
    "Optimizing parallel processing pathways for idea assessment...",
    "Calibrating semantic analysis modules to current context...",
    "Engaging cross-disciplinary knowledge integration systems..."
  ];

  const getRandomHumorousMessage = () => {
    return humorousMessages[Math.floor(Math.random() * humorousMessages.length)];
  };

  const handleGenerateRebuttal = async () => {
    if (!idea) return;

    const wordCount = idea.trim().split(/\s+/).length;
    if (wordCount > 300) {
      toast.error('Lesson 1: All good ideas are concise.');
      return;
    }

    setIsGenerating(true);
    const randomMessage = getRandomHumorousMessage();
    toast.info(randomMessage, { autoClose: 3000 });

    try {
      const response = await fetch('/api/generate-rebuttal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate assessment: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setRebuttal(result.rebuttal);
      setIsApproved(result.isApproved);
      setIsDialogOpen(true);
      toast.success('Idea objectively assessed!');
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast.error(`Failed to generate assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateRebuttal();
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="relative">
        <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-inset ring-black/5" />
        <Container className="relative">
          <main className="pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-balance text-4xl/[0.9] font-medium tracking-tight text-gray-950 sm:text-6xl/[0.8] md:text-7xl/[0.8] mb-6"
            >
              What are you pondering?
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-8 max-w-lg mx-auto"
            >
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="..."
                className="mb-4 w-full text-lg shadow-sm dark:bg-gray-800 dark:text-white rounded-lg"
              />
              <Button 
                onClick={handleGenerateRebuttal} 
                className="w-full mt-4 flex items-center justify-center" 
                disabled={isGenerating || !idea}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Considering...
                  </>
                ) : (
                  'Request an assessment'
                )}
              </Button>
            </motion.div>
          </main>
        </Container>
      </div>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle></DialogTitle>
        <DialogBody>
          <Heading className="mb-4">Your Idea</Heading>
          <p className="mb-6 font-semibold">
            {idea}
          </p>
          <div className="flex items-center justify-between mb-4">
            <Heading>Assessment</Heading>
            {isApproved !== null && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isApproved ? 'Approved' : 'Denied'}
              </div>
            )}
          </div>
          <ReactMarkdown className="prose prose-zinc dark:prose-invert">{rebuttal}</ReactMarkdown>
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Close</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
