'use client';

import { SlideTransitionDemo } from '../components/ui/SlideTransitionDemo';

export default function SlideTransitionDemoPage() {
  return (
    <div className="w-full h-screen">
      <SlideTransitionDemo totalSlides={5} />
    </div>
  );
}
