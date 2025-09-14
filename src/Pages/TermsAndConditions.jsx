import React from "react";
import LegalPageLayout from "./LegalPageLayout";

const API_HOST = import.meta.env.VITE_API_HOST;

function TermsAndConditions() {
  return (
    <LegalPageLayout title="Terms & Conditions">
      <p className="text-gray-600 mb-6 text-center">
        Effective Date: 09/09/2026
        <br />
        Last Updated: 09/09/2025
      </p>

      <p className="mb-6">
        Welcome to MachMate ("App," "We," "Our," "Us"). These Terms & Conditions
        ("Terms") govern your use of our platform, services, and features. By
        accessing or using MachMate, you acknowledge and agree to these Terms.
        If you do not agree, please stop using the service immediately.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        1. Introduction
      </h2>
      <p className="mb-4">
        MachMate is a digital platform designed to connect individuals and
        businesses in need of machining services with qualified vendors and
        machine owners. Customers can post machining job requirements such as
        CNC, VMC, milling, turning, wirecut, lathe, or grinding jobs, while
        vendors can respond with quotations.
      </p>
      <p className="mb-6">
        MachMate acts solely as an intermediary platform and does not directly
        manufacture, produce, or deliver any machining services.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        2. Definitions
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          <strong>"Customer"</strong> – Any individual or business who posts a
          machining job requirement on the platform.
        </li>
        <li className="mb-2">
          <strong>"Vendor / Machine Owner"</strong> – Any registered individual
          or company that offers machining services and responds to job
          postings.
        </li>
        <li className="mb-2">
          <strong>"Subscription"</strong> – A paid plan purchased by vendors to
          access customer leads and submit quotations.
        </li>
        <li className="mb-2">
          <strong>"Quotation"</strong> – A formal proposal from a vendor
          containing details such as price, delivery timeline, and service
          terms.
        </li>
        <li className="mb-2">
          <strong>"Services"</strong> – All features of the MachMate app or
          website, including posting jobs, submitting quotations, communication
          tools, and subscription access.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        3. Eligibility
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">Users must be at least 18 years old.</li>
        <li className="mb-2">
          Vendors must be legally registered businesses or individuals with
          valid trade licenses.
        </li>
        <li className="mb-2">
          Users must provide accurate, complete, and updated information during
          registration.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        4. Services Offered
      </h2>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        For Customers:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          Post machining job requirements including type of work, description,
          quantity, and drawings/files.
        </li>
        <li className="mb-2">Receive quotations from nearby vendors.</li>
        <li className="mb-2">
          Compare and choose from multiple quotations at their discretion.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        For Vendors:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">Access job leads posted by customers.</li>
        <li className="mb-2">
          Submit quotations specifying price, duration, and company details.
        </li>
        <li className="mb-2">
          Upgrade accounts through paid subscriptions for enhanced visibility
          and unlimited access.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Platform Role:
      </h3>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          MachMate does not interfere with pricing, negotiation, or final
          agreements between customers and vendors.
        </li>
        <li className="mb-2">The app provides tools and connectivity only.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        5. Subscription & Payment Terms
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          Vendors are required to purchase a subscription plan to access
          customer leads.
        </li>
        <li className="mb-2">
          Subscription fees are charged in advance on a
          [monthly/quarterly/annual] basis.
        </li>
        <li className="mb-2">
          All payments are processed through secure third-party gateways.
        </li>
        <li className="mb-2">
          Failure to renew will result in suspension of vendor access.
        </li>
        <li className="mb-2">
          Subscription fees are non-refundable, except in special cases outlined
          under our Refund Policy.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        6. Refund Policy
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          <strong>General Rule:</strong> All subscriptions are non-refundable.
        </li>
        <li className="mb-2">
          <strong>Exceptions:</strong> If MachMate permanently shuts down
          operations, partial refunds may be issued for the unused subscription
          period at the sole discretion of the company.
        </li>
        <li className="mb-2">
          <strong>No Refunds:</strong> Dissatisfaction with the number of leads,
          customer response rates, or quotations accepted will not be grounds
          for a refund.
        </li>
        <li className="mb-2">
          <strong>Special Offers:</strong> Refund terms may differ under
          specific promotional campaigns and will be clearly mentioned.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        7. User Responsibilities
      </h2>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Customers must:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">Provide accurate job details and drawings.</li>
        <li className="mb-2">
          Ensure uploaded files do not violate intellectual property rights.
        </li>
        <li className="mb-2">Respond fairly to vendor quotations.</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Vendors must:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          Provide accurate quotations with transparent pricing and timelines.
        </li>
        <li className="mb-2">
          Honor all accepted quotations and deliver quality service.
        </li>
        <li className="mb-2">
          Avoid spamming or submitting misleading offers.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Both Users must not:
      </h3>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          Use the platform for fraudulent or illegal activities.
        </li>
        <li className="mb-2">Share obscene, harmful, or misleading content.</li>
        <li className="mb-2">
          Attempt to hack, misuse, or exploit the platform.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        8. Confidentiality & Data Protection
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          All drawings, CAD files, and technical information uploaded by
          customers remain their intellectual property.
        </li>
        <li className="mb-2">
          Vendors must treat such information as confidential and cannot use it
          outside the agreed job.
        </li>
        <li className="mb-2">
          MachMate uses encryption and secure storage but is not liable for
          breaches beyond its control.
        </li>
        <li className="mb-2">
          Users are responsible for maintaining the confidentiality of their
          account login credentials.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        9. Limitation of Liability
      </h2>
      <p className="mb-4">MachMate is not responsible for:</p>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          The quality, timeliness, or pricing of vendor services.
        </li>
        <li className="mb-2">
          Any disputes, damages, or delays arising between customers and
          vendors.
        </li>
        <li className="mb-2">
          Loss of data due to external attacks, user negligence, or technical
          issues.
        </li>
      </ul>
      <p className="mb-6">
        Users agree that MachMate's maximum liability in any case shall not
        exceed the subscription fee paid by the vendor during the last billing
        cycle.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        10. Dispute Resolution
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          Disputes between customers and vendors must be resolved directly
          between the parties.
        </li>
        <li className="mb-2">
          MachMate may provide mediation support but has no obligation to
          enforce agreements.
        </li>
        <li className="mb-2">
          In case of legal disputes involving the platform, the matter shall be
          governed under Indian law.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        11. Termination of Account
      </h2>
      <p className="mb-4">
        MachMate reserves the right to suspend or terminate accounts without
        notice for:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">Fraudulent activity</li>
        <li className="mb-2">Non-payment of fees</li>
        <li className="mb-2">Misuse of the platform</li>
        <li className="mb-2">Violation of these Terms</li>
      </ul>
      <p className="mb-6">
        Users may request account deletion by contacting support. Subscription
        fees already paid will not be refunded.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        12. Intellectual Property
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          The MachMate logo, design, and software are protected under
          intellectual property laws.
        </li>
        <li className="mb-2">
          Users may not copy, distribute, or reproduce any part of the platform
          without prior written consent.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        13. Governing Law & Jurisdiction
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">These Terms are governed by the laws of India.</li>
        <li className="mb-2">
          Any disputes shall fall under the jurisdiction of courts in [Insert
          City, e.g., Ahmedabad, Gujarat].
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        14. Changes to Terms
      </h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          MachMate reserves the right to modify these Terms at any time.
        </li>
        <li className="mb-2">
          Users will be notified of significant updates via email or app
          notifications.
        </li>
        <li className="mb-2">
          Continued use of the platform after changes constitutes acceptance.
        </li>
      </ul>
    </LegalPageLayout>
  );
}

export default TermsAndConditions;