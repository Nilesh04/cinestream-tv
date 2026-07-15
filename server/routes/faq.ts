import { Router } from 'express';

const router = Router();

const faqs = [
  { q: 'What is CineStream?', a: 'CineStream is a premium streaming service offering a curated library of movies, TV shows, and original content available on-demand.' },
  { q: 'How much does CineStream cost?', a: 'CineStream offers a free tier with ads and a premium tier at $9.99/month for ad-free viewing, offline downloads, and 4K streaming.' },
  { q: 'Can I watch on multiple devices?', a: 'Yes. Your CineStream account can be used on up to 5 devices simultaneously. Supported platforms include iOS, Android, web, smart TVs, and streaming sticks.' },
  { q: 'How do I download movies for offline viewing?', a: 'Open the CineStream app, find the movie or show you want, and tap the download icon. Downloads are available on the Premium plan.' },
  { q: 'How do I cancel my subscription?', a: 'Go to your Profile page, select Settings, and choose Cancel Subscription. Your access will continue until the end of the current billing period.' },
  { q: 'Why is my video buffering?', a: 'Buffering is usually caused by a slow internet connection. We recommend at least 5 Mbps for HD and 25 Mbps for 4K streaming.' },
  { q: 'How do I reset my password?', a: 'On the sign-in screen, tap "Forgot Password" and enter your email. We will send you a link to reset your password.' },
  { q: 'What content is available in my region?', a: 'Content availability varies by region due to licensing agreements. You can browse our full library after signing in, or check the Coming Soon section.' },
  { q: 'Can I share my account with family?', a: 'Yes. CineStream allows up to 5 profiles per account, each with personalized recommendations and watch history.' },
  { q: 'How do I report a problem?', a: 'Contact our support team at support@cinestream.com or use the Help Center in the app. We typically respond within 24 hours.' },
];

router.get('/', (_req, res) => {
  res.json(faqs);
});

export default router;
