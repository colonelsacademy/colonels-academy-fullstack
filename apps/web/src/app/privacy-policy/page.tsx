import { Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-900 mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h3>
          <p>
            Welcome to The Colonel&apos;s Academy (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;). We respect your privacy and are committed to protecting your personal
            data. This privacy policy will inform you as to how we look after your personal data
            when you visit our website and tell you about your privacy rights and how the law
            protects you.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">2. Data We Collect</h3>
          <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 pl-4">
            <li>
              <strong>Identity Data:</strong> includes first name, last name, username or similar
              identifier.
            </li>
            <li>
              <strong>Contact Data:</strong> includes email address and telephone numbers.
            </li>
            <li>
              <strong>Transaction Data:</strong> includes details about payments to and from you.
            </li>
            <li>
              <strong>Technical Data:</strong> includes internet protocol (IP) address, your login
              data, browser type and version.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Data</h3>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>To register you as a new student/customer.</li>
            <li>To process and deliver your order including manage payments, fees and charges.</li>
            <li>
              To manage our relationship with you which will include notifying you about changes to
              our terms or privacy policy.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h3>
          <p>
            We have put in place appropriate security measures to prevent your personal data from
            being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            5. Data Retention and Account Deletion
          </h3>
          <p>
            We retain your personal data only for as long as necessary to fulfil the purposes we
            collected it for. If you wish to permanently delete your account and all associated
            personal data, please{" "}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">
              contact us
            </Link>
            .
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">6. Contact Details</h3>
          <p>
            If you have any questions about this privacy policy, please contact us at:
            <br />
            <strong>Email:</strong> support@colonelsacademy.com
            <br />
            <strong>Phone:</strong> +977-9851347306
          </p>
        </section>
      </div>
    </div>
  );
}
