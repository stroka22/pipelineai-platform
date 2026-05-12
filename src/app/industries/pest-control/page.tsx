import IndustryPage from '@/components/IndustryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pest Control Social Media Content | Pipeline AI',
  description: 'Ready-to-post carousels and growth content designed to help pest control companies dominate social media. Buy 2 get 1 free on 10-slide carousels.',
  openGraph: {
    title: 'Pest Control Social Media Content | Pipeline AI',
    description: 'Ready-to-post carousels and growth content for pest control companies.',
  },
};

export default function PestControlPage() {
  return (
    <IndustryPage
      niche="Pest Control"
      nicheSlug="pest-control"
      tagline="Builds Authority"
      description="Ready-to-post carousels and growth content designed to help pest control companies dominate social media."
    />
  );
}
