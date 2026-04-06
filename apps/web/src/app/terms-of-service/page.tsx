import { ScrollText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-900 mb-6">
          <ScrollText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h3>
          <p>
            By accessing our website and purchasing our courses, you agree to be bound by these
            Terms of Service and to comply with all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">2. Intellectual Property</h3>
          <p>
            The content, organization, graphics, design, compilation, and other matters related to
            the Site are protected under applicable copyrights, trademarks and other proprietary
            rights. The copying, redistribution, use or publication by you of any such matters is
            strictly prohibited.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">3. Use License</h3>
          <p>
            Permission is granted to temporarily download one copy of the materials on The
            Colonel&apos;s Academy&apos;s website for personal, non-commercial transitory viewing
            only. Under this license you may not:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 pl-4">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose;</li>
            <li>attempt to decompile or reverse engineer any software;</li>
            <li>
              transfer the materials to another person or &quot;mirror&quot; the materials on any
              other server.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">4. Disclaimer</h3>
          <p>
            The materials on The Colonel&apos;s Academy&apos;s website are provided on an &apos;as
            is&apos; basis. The Colonel&apos;s Academy makes no warranties, expressed or implied,
            and hereby disclaims and negates all other warranties.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">5. Refund Policy</h3>
          <p>
            We offer a 7-day money-back guarantee on all our online courses provided less than 30%
            of the course content has been consumed. To request a refund, please contact our support
            team.
          </p>
        </section>
      </div>
    </div>
  );
}
