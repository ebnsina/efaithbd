'use client'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-700 leading-relaxed">
          Supermart is Bangladesh's most trusted online shopping platform. We
          serve thousands of customers daily and deliver the best quality
          products to them.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          Our mission is to deliver high-quality products to every person in
          Bangladesh easily and at affordable prices. We believe that every
          customer deserves the best service and quality products.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>Customer satisfaction is our top priority</li>
          <li>Delivering quality products</li>
          <li>Ensuring timely delivery</li>
          <li>Transparency and trustworthiness</li>
          <li>Fair pricing</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us?</h2>
        <p className="text-gray-700 leading-relaxed">
          We don't just sell products, we build trusted relationships. We have a
          skilled customer support team that is always ready to serve you. Each
          of your orders is carefully packaged and safely delivered to you.
        </p>

        <div className="bg-primary/5 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-3">Get in Touch</h3>
          <p className="text-gray-700">
            Want to contact us? We are always eager to hear your questions and
            feedback.
          </p>
        </div>
      </div>
    </div>
  )
}
