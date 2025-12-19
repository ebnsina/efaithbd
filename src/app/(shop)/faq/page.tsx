'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function FAQPage() {
  const faqsEn = [
    {
      question: 'How do I place an order?',
      answer:
        'Browse our products, add items to your cart, then proceed to checkout. Fill in your delivery details and choose your payment method to complete the order.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept Cash on Delivery (COD) and bKash payments. For bKash, you need to send money to our provided number and enter the transaction ID during checkout.',
    },
    {
      question: 'How long does delivery take?',
      answer:
        'Delivery typically takes 3-7 business days depending on your location. We will notify you once your order is shipped.',
    },
    {
      question: 'Can I cancel my order?',
      answer:
        'Orders can be cancelled before they are processed. Please contact us immediately after placing your order if you wish to cancel it.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'If you receive a damaged or defective product, please contact us within 7 days of delivery. We will replace the product or provide a refund.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'After your order is shipped, you will receive a notification. You can track your order status from your account dashboard.',
    },
    {
      question: 'Do you deliver outside Dhaka?',
      answer:
        'Yes, we deliver all over Bangladesh. Delivery charges may vary based on your location.',
    },
    {
      question: 'Are the products original?',
      answer:
        'Yes, we guarantee that all our products are 100% original and authentic. We work directly with authorized distributors and brands.',
    },
    {
      question: 'Can I change my delivery address after placing an order?',
      answer:
        'You can change your delivery address before the order is processed. Please contact our customer support immediately.',
    },
    {
      question: 'What if the product is out of stock?',
      answer:
        'If a product goes out of stock after you place an order, we will notify you immediately and offer a refund or alternative product.',
    },
  ]

  const faqsBn = [
    {
      question: 'আমি কিভাবে অর্ডার করব?',
      answer:
        'আমাদের পণ্য ব্রাউজ করুন, কার্টে আইটেম যোগ করুন, তারপর চেকআউটে যান। আপনার ডেলিভারি তথ্য পূরণ করুন এবং অর্ডার সম্পূর্ণ করতে পেমেন্ট পদ্ধতি বেছে নিন।',
    },
    {
      question: 'আপনারা কোন পেমেন্ট পদ্ধতি গ্রহণ করেন?',
      answer:
        'আমরা ক্যাশ অন ডেলিভারি (COD) এবং বিকাশ পেমেন্ট গ্রহণ করি। বিকাশের জন্য, আপনাকে আমাদের প্রদত্ত নম্বরে টাকা পাঠাতে হবে এবং চেকআউটের সময় ট্রানজেকশন আইডি দিতে হবে।',
    },
    {
      question: 'ডেলিভারিতে কতদিন সময় লাগে?',
      answer:
        'আপনার অবস্থানের উপর নির্ভর করে ডেলিভারিতে সাধারণত ৩-৭ কর্মদিবস সময় লাগে। আপনার অর্ডার শিপ হলে আমরা আপনাকে জানিয়ে দেব।',
    },
    {
      question: 'আমি কি আমার অর্ডার বাতিল করতে পারি?',
      answer:
        'অর্ডার প্রসেস হওয়ার আগে বাতিল করা যায়। আপনি যদি বাতিল করতে চান তাহলে অর্ডার করার পরপরই আমাদের সাথে যোগাযোগ করুন।',
    },
    {
      question: 'আপনাদের রিটার্ন পলিসি কি?',
      answer:
        'যদি আপনি ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য পান, ডেলিভারির ৭ দিনের মধ্যে আমাদের সাথে যোগাযোগ করুন। আমরা পণ্যটি প্রতিস্থাপন করব বা রিফান্ড দেব।',
    },
    {
      question: 'আমি কিভাবে আমার অর্ডার ট্র্যাক করব?',
      answer:
        'আপনার অর্ডার শিপ হওয়ার পর আপনি একটি নোটিফিকেশন পাবেন। আপনি আপনার অ্যাকাউন্ট ড্যাশবোর্ড থেকে অর্ডার স্ট্যাটাস ট্র্যাক করতে পারবেন।',
    },
    {
      question: 'আপনারা কি ঢাকার বাইরে ডেলিভারি দেন?',
      answer:
        'হ্যাঁ, আমরা সারা বাংলাদেশে ডেলিভারি দেই। আপনার অবস্থানের উপর ভিত্তি করে ডেলিভারি চার্জ ভিন্ন হতে পারে।',
    },
    {
      question: 'পণ্যগুলো কি অরিজিনাল?',
      answer:
        'হ্যাঁ, আমরা গ্যারান্টি দিচ্ছি যে আমাদের সকল পণ্য ১০০% অরিজিনাল এবং প্রকৃত। আমরা সরাসরি অনুমোদিত ডিস্ট্রিবিউটর এবং ব্র্যান্ডের সাথে কাজ করি।',
    },
    {
      question: 'অর্ডার করার পর কি আমি ডেলিভারি ঠিকানা পরিবর্তন করতে পারি?',
      answer:
        'অর্ডার প্রসেস হওয়ার আগে আপনি ডেলিভারি ঠিকানা পরিবর্তন করতে পারবেন। অনুগ্রহ করে তাৎক্ষণিক আমাদের কাস্টমার সাপোর্টের সাথে যোগাযোগ করুন।',
    },
    {
      question: 'পণ্য স্টকে না থাকলে কি হবে?',
      answer:
        'যদি আপনার অর্ডার করার পর পণ্যটি স্টকে শেষ হয়ে যায়, আমরা অবিলম্বে আপনাকে জানিয়ে দেব এবং রিফান্ড বা বিকল্প পণ্য অফার করব।',
    },
  ]

  const faqs = faqsEn

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <p className="text-gray-700 text-lg mb-8">
        Find answers to your questions here. If you cannot find an answer to
        your question, please contact us.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border rounded-lg px-6 bg-white"
          >
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 bg-primary/5 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Need More Help?</h2>
        <p className="text-gray-700 mb-4">
          If you can't find an answer to your question, please contact us.
        </p>
        <a
          href="/contact"
          className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  )
}
