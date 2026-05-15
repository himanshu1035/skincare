import React from 'react';
import { OrderClient } from '../OrderClient';

export default function CodOrdersPage() {
  return (
    <OrderClient 
      title="COD Orders" 
      subtitle="Orders awaiting payment upon delivery (Cash on Delivery)."
      defaultFilter="cod"
    />
  );
}
