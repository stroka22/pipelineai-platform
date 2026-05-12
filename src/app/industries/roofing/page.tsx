import IndustryPage from '@/components/IndustryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roofing Social Media Content | Pipeline AI',
  description: 'Ready-to-post carousels and growth content designed to help roofing companies dominate social media. Buy 2 get 1 free on 10-slide carousels.',
  openGraph: {
    title: 'Roofing Social Media Content | Pipeline AI',
    description: 'Ready-to-post carousels and growth content for roofing companies.',
  },
};

export default function RoofingPage() {
  return (
    <IndustryPage
      niche="Roofing"
      nicheSlug="roofing"
      tagline="Builds Credibility"
      description="Ready-to-post carousels and growth content designed to help roofing companies dominate social media."
    />
  );
}
