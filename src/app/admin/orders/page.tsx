import React from 'react';
import { OrderClient } from './OrderClient';

export default function AdminOrdersPage() {
  return (
    <OrderClient 
      title="All Orders" 
      subtitle="Complete list of all transactions across your store."
      defaultFilter="all"
    />
  );
}
