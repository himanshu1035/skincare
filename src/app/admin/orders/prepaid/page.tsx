import React from 'react';
import { OrderClient } from '../OrderClient';

export default function PrepaidOrdersPage() {
  return (
    <OrderClient 
      title="Prepaid Orders" 
      subtitle="Orders placed via UPI or other advance payment methods."
      defaultFilter="prepaid"
    />
  );
}
