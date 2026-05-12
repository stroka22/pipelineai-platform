import IndustryPage from '@/components/IndustryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HVAC Social Media Content | Pipeline AI',
  description: 'Ready-to-post carousels and growth content designed to help HVAC companies dominate social media. Buy 2 get 1 free on 10-slide carousels.',
  openGraph: {
    title: 'HVAC Social Media Content | Pipeline AI',
    description: 'Ready-to-post carousels and growth content for HVAC companies.',
  },
};

export default function HVACPage() {
  return (
    <IndustryPage
      niche="HVAC"
      nicheSlug="hvac"
      tagline="Builds Trust"
      description="Ready-to-post carousels and growth content designed to help HVAC companies dominate social media."
    />
  );
}
