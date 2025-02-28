import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Gradient } from '@/components/ui/gradient'
import { Link } from '@/components/ui/link'
import { Navbar } from '@/components/ui/navbar'

interface HeroProps {
  show: boolean;
  bannerText: string;
  bannerLink: string;  // New prop
  heading: string;
  subheading: string;
  buttonText: string;
  buttonHref: string;
  theme: 'A' | 'B';  // New prop
  variant: 'withLink' | 'withoutLink';  // New prop
}

export function Hero({
  show,
  bannerText,
  bannerLink,  // New prop
  heading,
  subheading,
  buttonText,
  buttonHref,
  theme = 'A',  // Default to 'A'
  variant = 'withLink',  // Default to 'withLink'
}: HeroProps) {
  if (!show) return null;

  const renderBanner = () => {
    if (variant === 'withoutLink') return null;
    return (
      <Link
        href={bannerLink}  // Updated to use bannerLink prop
        className="flex items-center gap-1 rounded-full bg-fuchsia-950/35 px-3 py-0.5 text-sm/6 font-medium text-white data-[hover]:bg-fuchsia-950/30"
      >
        {bannerText}
      </Link>
    );
  };

  // Theme-specific rendering logic (currently only 'A', prepared for 'B')
  const renderThemeContent = () => {
    switch (theme) {
      case 'A':
        return (
          <>
            <div className="pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32">
              <h1 className="font-display text-balance text-6xl/[0.9] font-medium tracking-tight text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
                {heading}
              </h1>
              <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
                {subheading}
              </p>
              <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
                <Button href={buttonHref}>{buttonText}</Button>
              </div>
            </div>
          </>
        );
      // case 'B':
      //   return (
      //     // Future implementation for theme 'B'
      //   );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-inset ring-black/5" />
      <Container className="relative">
        <Navbar banner={renderBanner()} />
        {renderThemeContent()}
      </Container>
    </div>
  );
}
