import React from "react";
import LegalPageLayout from "./LegalPageLayout";

export default function ShippingPolicy() {
  return (
    <LegalPageLayout title="Shipping Policy">
      <p className="text-gray-600 mb-6 text-center">
        Effective Date: 09/09/2026
        <br />
        Last Updated: 09/09/2025
      </p>

      <p className="mb-6">
        MachMate is a subscription-based digital platform. We do not sell or
        deliver any physical goods, and therefore no shipping services are
        provided.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        1. No Physical Shipping
      </h2>
      <p className="mb-6">
        All services offered by MachMate are delivered digitally through the
        platform. Customers will not receive any physical items, shipments, or
        packages from us.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        2. Access to Services
      </h2>
      <p className="mb-6">
        Once a subscription plan is purchased, users gain access to the MachMate
        platform immediately (or as per the plan’s terms). All features, tools,
        and resources are provided online, without the need for shipping or
        delivery.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Support</h2>
      <p className="mb-6">
        If you face any issues accessing your subscription or digital services,
        please contact our support team for assistance.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        4. Contact Us
      </h2>
      <p className="mb-6">
        If you have any questions regarding this Shipping Policy, please reach
        out to us:
        <br />
        Email: machmate.contact@gmail.com
        <br />
        Phone: +91 9104513411, +91 99747 76076
      </p>
    </LegalPageLayout>
  );
}
