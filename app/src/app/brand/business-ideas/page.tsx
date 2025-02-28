'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ReactMarkdown from 'react-markdown'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { SkeletonText } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

interface BusinessIdea {
  name: string
  description: string
  industry: string
  industryGroup: string
  createTs: Date
}

interface IndustryGroup {
  industryGroup: string
  industries: string
}

export default function BusinessIdeasPage() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [newIdea, setNewIdea] = useState<BusinessIdea | null>(null)
  const [industryGroups, setIndustryGroups] = useState<IndustryGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [seedText, setSeedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ideasPerPage = 3
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false)

  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoadingIdeas(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ideasPerPage.toString(),
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() })
        })

        const response = await fetch(`/api/business-ideas?${params}`)
        const data = await response.json()
        setIdeas(data.ideas)
        setTotalPages(Math.ceil(data.total / ideasPerPage))
      } finally {
        setIsLoadingIdeas(false)
      }
    }

    // Fetch industry groups
    const fetchIndustryGroups = async () => {
      const response = await fetch('/api/industry-groups')
      const data = await response.json()
      setIndustryGroups(data)
    }

    fetchIdeas()
    fetchIndustryGroups()
  }, [currentPage, startDate, endDate])

  const getIndustriesForGroup = (group: string) => {
    const selectedGroup = industryGroups.find(g => g.industryGroup === group)
    return selectedGroup ? selectedGroup.industries.split(',').map(i => i.trim()) : []
  }

  const handleRandomize = () => {
    const randomGroup = industryGroups[Math.floor(Math.random() * industryGroups.length)]
    setSelectedGroup(randomGroup.industryGroup)
    
    const industries = randomGroup.industries.split(',').map(i => i.trim())
    setSelectedIndustry(industries[Math.floor(Math.random() * industries.length)])
  }

  const generateIdea = async () => {
    setLoading(true)
    try {
      const prompt = `Generate a business idea for the ${selectedIndustry} industry in the ${selectedGroup} sector.${
        seedText ? ` Consider this additional context: ${seedText}` : ''
      }`

      const response = await fetch('/api/business-ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      })

      if (!response.ok) throw new Error('Failed to generate idea')

      const generatedIdeas = await response.json()
      
      // Set the first (most recent) idea as the new idea
      if (generatedIdeas.length > 0) {
        const latestIdea = generatedIdeas[0]
        setNewIdea({
          name: latestIdea.name,
          description: latestIdea.description,
          industry: latestIdea.industry,
          industryGroup: latestIdea.industryGroup,
          createTs: new Date(latestIdea.createTs)
        })
      }
      
      // Reset to first page when generating new idea
      setCurrentPage(1)
      
      // Immediately fetch the updated list of ideas
      const params = new URLSearchParams({
        page: '1',
        limit: ideasPerPage.toString(),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() })
      })

      const ideasResponse = await fetch(`/api/business-ideas?${params}`)
      const data = await ideasResponse.json()
      setIdeas(data.ideas)
      setTotalPages(Math.ceil(data.total / ideasPerPage))
      
    } catch (error) {
      console.error('Error generating idea:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-8">AI Business Ideas Generator</h1>
      
      <div className="mb-12 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Industry Group</option>
            {industryGroups.map((group) => (
              <option key={group.industryGroup} value={group.industryGroup}>
                {group.industryGroup}
              </option>
            ))}
          </select>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedGroup}
          >
            <option value="">Select Industry</option>
            {selectedGroup && getIndustriesForGroup(selectedGroup).map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <Input
          placeholder="Optional: Add context to seed the idea generation..."
          value={seedText}
          onChange={(e) => setSeedText(e.target.value)}
          className="w-full"
        />

        <div className="flex gap-4">
          <Button onClick={handleRandomize}>Randomize Industry</Button>
          <Button 
            onClick={generateIdea} 
            disabled={!selectedIndustry || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate New Idea'
            )}
          </Button>
        </div>
      </div>

      {/* Show new idea above the Business Ideas section */}
      {newIdea && (
        <div className="mb-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{newIdea.name}</h3>
              <span className="text-sm text-blue-600 font-medium">New Idea!</span>
            </div>
            <ReactMarkdown className="prose prose-sm max-w-none mb-4">
              {newIdea.description}
            </ReactMarkdown>
            <div className="text-sm text-gray-500 flex gap-4">
              <span className="flex items-center gap-1">
                <span className="font-medium">Industry:</span> {newIdea.industry}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Group:</span> {newIdea.industryGroup}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Created:</span>{' '}
                {new Date(newIdea.createTs).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-semibold">Business Ideas Catalog</h2>
          
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span>From:</span>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()}
                className="px-3 py-2 border rounded-md"
                placeholderText="Start Date"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <span>To:</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="px-3 py-2 border rounded-md"
                placeholderText="End Date"
              />
            </div>

            <button
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
                setCurrentPage(1)
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Dates
            </button>
          </div>
        </div>

        {isLoadingIdeas ? (
          // Loading skeleton UI
          Array.from({ length: ideasPerPage }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <SkeletonText className="w-3/4 h-8" /> {/* Title */}
              <div className="space-y-2">
                <SkeletonText className="w-full" /> {/* Description line 1 */}
                <SkeletonText className="w-5/6" /> {/* Description line 2 */}
                <SkeletonText className="w-4/6" /> {/* Description line 3 */}
              </div>
              <div className="flex gap-4">
                <SkeletonText className="w-32" /> {/* Industry */}
                <SkeletonText className="w-32" /> {/* Group */}
                <SkeletonText className="w-32" /> {/* Date */}
              </div>
            </div>
          ))
        ) : (
          ideas.map((idea) => (
            <div key={idea.name} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">{idea.name}</h3>
              <ReactMarkdown className="prose prose-sm max-w-none mb-4">
                {idea.description}
              </ReactMarkdown>
              <div className="text-sm text-gray-500 flex gap-4">
                <span className="flex items-center">
                  <span className="font-medium">Industry:</span> {idea.industry}
                </span>
                <span className="flex items-center">
                  <span className="font-medium">Group:</span> {idea.industryGroup}
                </span>
                <span className="flex items-center">
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(idea.createTs).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
