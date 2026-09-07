import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

export default function PolicyStrip({ supportPhone }: { supportPhone?: string | null }) {
  const items = [
    { icon: Truck, title: 'Fast Delivery', subtitle: 'All over Bangladesh', href: '/faq' },
    { icon: RotateCcw, title: 'Cancellation & Returns', subtitle: 'Easy return policy', href: '/terms' },
    { icon: ShieldCheck, title: 'Privacy Policy', subtitle: 'Your data stays safe', href: '/privacy-policy' },
    {
      icon: Headphones,
      title: 'Customer Support',
      subtitle: supportPhone ? `Call us at ${supportPhone}` : 'We are here to help',
      href: '/contact',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5 sm:px-6">
      {items.map(({ icon: Icon, title, subtitle, href }) => (
        <Link key={title} href={href} className="flex items-center gap-3 hover:text-primary">
          <Icon className="size-8 shrink-0 text-gray-500" strokeWidth={1.5} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
