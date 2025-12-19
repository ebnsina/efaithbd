'use client'

import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-700 text-lg mb-8">
        We'd love to hear from you. Please reach out to us through any of the
        following channels.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p className="text-gray-700">+880 1234-567890</p>
              <p className="text-sm text-gray-500 mt-1">
                Available 9 AM - 9 PM
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-700">support@supermart.com</p>
              <p className="text-sm text-gray-500 mt-1">
                We'll respond within 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <p className="text-gray-700">
                123 Main Street, Dhaka 1000, Bangladesh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Working Hours</h3>
              <p className="text-gray-700">Saturday - Thursday: 9 AM - 9 PM</p>
              <p className="text-gray-700">Friday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
