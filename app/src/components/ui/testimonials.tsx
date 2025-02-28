'use client'

import * as Headless from '@headlessui/react'
import { ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import {
  MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type HTMLMotionProps,
} from 'framer-motion'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import useMeasure, { type RectReadOnly } from 'react-use-measure'
import { Container } from './container'
import { Link } from './link'
import { Heading, Subheading } from './text'
import Image from 'next/image'

const testimonials = [
  {
    img: '/testimonials/pic1.jpg',
    name: 'Dr. Quantum Quandary',
    title: 'Time Lord of Infinite Possibilities',
    quote:
      'I asked Concept Critic if I should build a time machine. It not only said yes, but also provided schematics from the future!',
  },
  {
    img: '/testimonials/pic3.jpg',
    name: 'Professor Daredevil',
    title: 'Chair of Extreme Sports Philosophy, Atlantis University',
    quote:
    'I told it I wanted to ride a crocodile, and it gave me the reasoning I needed. Now I\'m writing this from the back of a very understanding reptile!',
  },
  {
    img: '/testimonials/pic4.jpg',
    name: 'Admiral Strategic Foresight',
    title: 'Head of Global Think Tank Operations',
    quote:
    'In my 40 years of strategic planning, I\'ve never encountered a tool so precise. It\'s like having a crystal ball, but scientifically accurate.',
  },
  {
    img: '/testimonials/pic5.jpg',
    name: 'Lord Ambition',
    title: 'Aspiring Global Overlord, Kingdom of Grandiose Schemes',
    quote: 'I asked Concept Critic if I should conquer. Not only did it approve, but it also provided a 10-step plan for global domination. Now that\'s what I call visionary thinking!',
  },
  {
    img: '/testimonials/pic2.jpg',
    name: 'Captain Seasick Steve',
    title: 'Self-proclaimed Master of the Seven Puddles',
    quote:
      'This app confirmed my brilliant idea to sail across the Sahara Desert! Who needs water when you\'ve got sand, right? Absolutely mind-numbing!',
  },
  {
    img: '/testimonials/pic6.jpg',
    name: 'DJ Cacophony',
    title: 'Avant-Garde Noise Enthusiast',
    quote:
      'I was considering creating a symphony using only cat meows and car alarms. Concept Critic suggested adding in some dial-up modem sounds for "textural depth". My next concert is sold out! Thank you CC.',
  },
]

function TestimonialCard({
  name,
  title,
  img,
  children,
  bounds,
  scrollX,
  ...props
}: {
  img: string
  name: string
  title: string
  children: React.ReactNode
  bounds: RectReadOnly
  scrollX: MotionValue<number>
} & HTMLMotionProps<'div'>) {
  const ref = useRef<HTMLDivElement | null>(null)

  const computeOpacity = useCallback(() => {
    const element = ref.current
    if (!element || bounds.width === 0) return 1

    const rect = element.getBoundingClientRect()

    if (rect.left < bounds.left) {
      const diff = bounds.left - rect.left
      const percent = diff / rect.width
      return Math.max(0.5, 1 - percent)
    } else if (rect.right > bounds.right) {
      const diff = rect.right - bounds.right
      const percent = diff / rect.width
      return Math.max(0.5, 1 - percent)
    } else {
      return 1
    }
  }, [ref, bounds.width, bounds.left, bounds.right])

  const opacity = useSpring(computeOpacity(), {
    stiffness: 154,
    damping: 23,
  })

  useLayoutEffect(() => {
    opacity.set(computeOpacity())
  }, [computeOpacity, opacity])

  useMotionValueEvent(scrollX, 'change', () => {
    opacity.set(computeOpacity())
  })

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      {...props}
      className="relative flex aspect-[9/16] w-72 shrink-0 snap-start scroll-ml-[var(--scroll-padding)] flex-col justify-end overflow-hidden rounded-3xl sm:aspect-[3/4] sm:w-96"
    >
      <Image
        alt=""
        src={img}
        fill
        sizes="(max-width: 640px) 288px, 384px"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black from-[calc(7/16*100%)] ring-1 ring-inset ring-gray-950/10 sm:from-25%"
      />
      <figure className="relative p-10">
        <blockquote>
          <p className="relative text-xl/7 text-white">
            <span aria-hidden="true" className="absolute -translate-x-full">
              &ldquo;
            </span>
            {children}
            <span aria-hidden="true" className="absolute">
              &rdquo;
            </span>
          </p>
        </blockquote>
        <figcaption className="mt-6 border-t border-white/20 pt-6">
          <p className="text-sm/6 font-medium text-white">{name}</p>
          <p className="text-sm/6 font-medium">
            <span className="bg-gradient-to-r from-[#fff1be] from-[28%] via-[#ee87cb] via-[70%] to-[#b060ff] bg-clip-text text-transparent">
              {title}
            </span>
          </p>
        </figcaption>
      </figure>
    </motion.div>
  )
}

function CallToAction() {
  return (
    <div>
      <p className="max-w-sm text-sm/6 text-gray-600">
        Join the intellectual elite and start leveraging the power of Concept Critic to revolutionize your decision-making process today.
      </p>
      <div className="mt-2">
        <Link
          href="/concept-critic"
          className="inline-flex items-center gap-2 text-sm/6 font-medium text-pink-600"
        >
          Elevate your thinking
          <ArrowLongRightIcon className="size-5" />
        </Link>
      </div>
    </div>
  )
}

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { scrollX } = useScroll({ container: scrollRef })
  const [setReferenceWindowRef, bounds] = useMeasure()
  const [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollX, 'change', (x) => {
    setActiveIndex(Math.floor(x / scrollRef.current!.children[0].clientWidth))
  })

  function scrollTo(index: number) {
    const gap = 32
    const width = (scrollRef.current!.children[0] as HTMLElement).offsetWidth
    scrollRef.current!.scrollTo({ left: (width + gap) * index })
  }

  return (
    <div className="overflow-hidden py-32">
      <Container>
        <div ref={setReferenceWindowRef}>
          <Subheading>Testimonials from the Brightest Minds</Subheading>
          <Heading as="h3" className="mt-2 text-gray-900 dark:text-white">
            Revolutionizing Thought Leadership
          </Heading>
        </div>
      </Container>
      <div
        ref={scrollRef}
        className={clsx([
          'mt-16 flex gap-8 px-[var(--scroll-padding)]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth',
          '[--scroll-padding:max(theme(spacing.6),calc((100vw-theme(maxWidth.2xl))/2))] lg:[--scroll-padding:max(theme(spacing.8),calc((100vw-theme(maxWidth.7xl))/2))]',
        ])}
      >
        {testimonials.map(({ img, name, title, quote }, testimonialIndex) => (
          <TestimonialCard
            key={testimonialIndex}
            name={name}
            title={title}
            img={img}
            bounds={bounds}
            scrollX={scrollX}
            onClick={() => scrollTo(testimonialIndex)}
          >
            {quote}
          </TestimonialCard>
        ))}
        <div className="w-[42rem] shrink-0 sm:w-[54rem]" />
      </div>
      <Container className="mt-16">
        <div className="flex justify-between">
          <CallToAction />
          <div className="hidden sm:flex sm:gap-2">
            {testimonials.map(({ name }, testimonialIndex) => (
              <Headless.Button
                key={testimonialIndex}
                onClick={() => scrollTo(testimonialIndex)}
                data-active={
                  activeIndex === testimonialIndex ? true : undefined
                }
                aria-label={`Scroll to testimonial from ${name}`}
                className={clsx(
                  'size-2.5 rounded-full border border-transparent bg-gray-300 transition',
                  'data-[active]:bg-gray-400 data-[hover]:bg-gray-400',
                  'forced-colors:data-[active]:bg-[Highlight] forced-colors:data-[focus]:outline-offset-4',
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
