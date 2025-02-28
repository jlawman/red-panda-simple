'use client'

import { useState } from 'react'
import { Container } from '@/components/ui/container'
import { Tabs } from '@/components/ui/tabs'
import { GettingStarted } from '@/components/(remove)/instructions/GettingStarted'
import { DemoPages } from '@/components/(remove)/instructions/DemoPages'
import { BrandPage } from '@/components/(remove)/instructions/BrandPage'


export default function Home() {
  const [currentTab, setCurrentTab] = useState('getting-started')

  const tabs = [
    { name: 'Getting Started', current: currentTab === 'getting-started' },
    { name: 'Demos', current: currentTab === 'demos' },
    { name: 'Brand', current: currentTab === 'brand' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Container className="py-8 sm:py-12">
          <Tabs tabs={tabs} onChange={(tab) => setCurrentTab(tab.name.toLowerCase().replace(' ', '-'))} />
          <div className="mt-8">
            {currentTab === 'demos' ? <DemoPages /> : currentTab === 'brand' ? <BrandPage /> : <GettingStarted />}
          </div>
        </Container>
      </main>
    </div>
  )
}
