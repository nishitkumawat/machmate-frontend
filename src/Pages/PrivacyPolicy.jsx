import React from "react";
import LegalPageLayout from "./LegalPageLayout";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p className="text-gray-600 mb-6 text-center">
        Effective Date: 09/09/2026
        <br />
        Last Updated: 09/09/2025
      </p>

      <p className="mb-6">
        At MachMate, we value your privacy and are committed to protecting your
        personal information. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you use our platform.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        1. Information We Collect
      </h2>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Personal Information:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          Name, email address, phone number, and business details
        </li>
        <li className="mb-2">
          Payment information (processed through secure third-party providers)
        </li>
        <li className="mb-2">
          Business registration and tax information for vendors
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Technical Information:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">IP address, browser type, device information</li>
        <li className="mb-2">Usage data, pages visited, features used</li>
        <li className="mb-2">Cookies and similar tracking technologies</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Project Information:
      </h3>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          Technical drawings, CAD files, and project specifications
        </li>
        <li className="mb-2">Quotations, communications between users</li>
        <li className="mb-2">Transaction history and project outcomes</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">To provide and maintain our services</li>
        <li className="mb-2">
          To facilitate connections between customers and vendors
        </li>
        <li className="mb-2">To process payments and subscriptions</li>
        <li className="mb-2">
          To communicate with you about platform updates, security alerts, and
          support messages
        </li>
        <li className="mb-2">
          To improve our platform and develop new features
        </li>
        <li className="mb-2">To prevent fraud and ensure platform security</li>
        <li className="mb-2">To comply with legal obligations</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        3. Data Sharing and Disclosure
      </h2>
      <p className="mb-4">We may share your information with:</p>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          <strong>Other Users:</strong> Necessary information to facilitate
          transactions (e.g., contact details for vendors/customers to
          communicate about projects)
        </li>
        <li className="mb-2">
          <strong>Service Providers:</strong> Third parties who provide services
          on our behalf (payment processing, hosting, analytics)
        </li>
        <li className="mb-2">
          <strong>Legal Authorities:</strong> When required by law or to protect
          our rights and safety
        </li>
        <li className="mb-2">
          <strong>Business Transfers:</strong> In connection with a merger,
          acquisition, or sale of assets
        </li>
      </ul>
      <p className="mb-6">
        We never sell your personal information to third parties for marketing
        purposes.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        4. Data Security
      </h2>
      <p className="mb-6">
        We implement appropriate technical and organizational measures to
        protect your information, including encryption, access controls, and
        secure servers. However, no method of transmission over the Internet or
        electronic storage is 100% secure, and we cannot guarantee absolute
        security.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        5. Data Retention
      </h2>
      <p className="mb-6">
        We retain your personal information for as long as necessary to fulfill
        the purposes outlined in this Privacy Policy, comply with legal
        obligations, resolve disputes, and enforce our agreements. Project files
        and technical drawings are retained for a period of [X years/months]
        after project completion to facilitate future collaborations and
        reference.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        6. Your Rights
      </h2>
      <p className="mb-4">
        Depending on your location, you may have the following rights regarding
        your personal information:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          Access and receive a copy of your personal data
        </li>
        <li className="mb-2">Correct inaccurate or incomplete information</li>
        <li className="mb-2">Delete your personal data</li>
        <li className="mb-2">
          Restrict or object to our processing of your data
        </li>
        <li className="mb-2">Data portability</li>
        <li className="mb-2">
          Withdraw consent where processing is based on consent
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        7. Cookies and Tracking Technologies
      </h2>
      <p className="mb-6">
        We use cookies and similar technologies to analyze trends, administer
        the website, track users' movements around the site, and gather
        demographic information. You can control the use of cookies at the
        individual browser level.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        8. Children's Privacy
      </h2>
      <p className="mb-6">
        Our platform is not intended for children under 18 years of age. We do
        not knowingly collect personal information from children. If you believe
        we have collected information from a child, please contact us
        immediately.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        9. Changes to This Policy
      </h2>
      <p className="mb-6">
        We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the "Last Updated" date. You are advised to review this Privacy
        Policy periodically for any changes.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        10. Contact Us
      </h2>
      <p className="mb-6">
        If you have any questions about this Privacy Policy, please contact us
        at:
        <br />
        Email: privacy@machmate.com
        <br />
        Address: [Insert Company Address]
      </p>
    </LegalPageLayout>
  );
}
