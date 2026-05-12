import React from 'react';
import { AdminProductForm } from '@/components/AdminProductForm';

export default function NewProductPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminProductForm isEdit={false} />
    </div>
  );
}
