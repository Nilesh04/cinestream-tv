import { motion } from 'motion/react';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'January 1, 2026',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide directly to us, such as when you create an account, update your profile, or contact support. This includes your name, email address, payment information, and preferences.'
      },
      {
        heading: 'How We Use Your Information',
        body: 'We use your information to provide, personalize, and improve your streaming experience. This includes recommending content, processing payments, sending service-related communications, and ensuring platform security.'
      },
      {
        heading: 'Data Sharing & Disclosure',
        body: 'We do not sell your personal information. We may share data with trusted service providers who assist in platform operations, or when required by law. All third-party partners are bound by strict confidentiality agreements.'
      },
      {
        heading: 'Your Choices & Rights',
        body: 'You can access, update, or delete your account information at any time through your profile settings. You may also opt out of marketing communications while continuing to receive essential service notifications.'
      },
      {
        heading: 'Data Security',
        body: 'We implement industry-standard encryption, access controls, and regular security audits to protect your data. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.'
      },
      {
        heading: 'Contact Us',
        body: 'If you have questions about this Privacy Policy, please contact our Data Protection Officer at privacy@cinestream.com.'
      }
    ]
  },
  terms: {
    title: 'Terms of Service',
    updated: 'January 1, 2026',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: 'By accessing or using CineStream, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. We may update these terms at any time, and continued use constitutes acceptance of changes.'
      },
      {
        heading: 'Account Responsibilities',
        body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must notify us immediately of any unauthorized use. You must be at least 13 years of age to create an account.'
      },
      {
        heading: 'Subscription & Billing',
        body: 'Subscriptions auto-renew unless canceled at least 24 hours before the renewal date. Refunds are handled on a case-by-case basis. Prices may change with 30 days notice. You can manage your subscription at any time.'
      },
      {
        heading: 'Content Usage',
        body: 'Streamed content is for personal, non-commercial viewing only. You may not download, reproduce, distribute, or publicly perform any content without explicit written permission. All content is protected by copyright laws.'
      },
      {
        heading: 'Acceptable Use',
        body: 'You agree not to misuse the platform, including attempting to circumvent security measures, engaging in unauthorized access, uploading malicious code, or violating any applicable laws. Violations may result in immediate account termination.'
      },
      {
        heading: 'Limitation of Liability',
        body: 'CineStream shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount paid by you in the 12 months preceding the claim.'
      }
    ]
  }
};

type PageType = 'privacy' | 'terms';

export default function LegalPage({ page }: { page: PageType }) {
  const content = CONTENT[page];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen pt-36 pb-32 px-8 md:px-16"
    >
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">{content.title}</h1>
        <p className="text-white/30 font-medium mb-16">Last updated: {content.updated}</p>
        <div className="space-y-16">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">{section.heading}</h2>
              <p className="text-lg text-white/50 leading-relaxed font-medium">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
