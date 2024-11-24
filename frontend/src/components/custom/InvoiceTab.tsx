import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateInvoice } from '@/redux/slices/fileSlice';
import { Bill, Invoice } from '@/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { renderValue } from '@/lib/renderValue';
import axios from 'axios';

interface InvoiceTabProps {
  currentBill: Bill;
  isEditing: boolean;
  fileId: string;
  billId: string;
}

const InvoiceTab: React.FC<InvoiceTabProps> = ({
  currentBill,
  isEditing,
  fileId,
  billId
}) => {
  const { invoice } = currentBill;

  const dispatch = useDispatch();
  const [editedInvoice, setEditedInvoice] = useState<Invoice>(invoice);

  // Sync the editedInvoice state if the currentBill changes
  useEffect(() => {
    setEditedInvoice(invoice);
  }, [invoice]);

  const handleInputChange = (key: keyof Invoice, value: string) => {
    setEditedInvoice(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Create an updated bill object with the edited invoice
      const updatedBill = {
        ...currentBill,
        invoice: editedInvoice,
      };

      // Redux update
      dispatch(updateInvoice({
        fileId: fileId,
        billId: billId,
        invoice: editedInvoice
      }));

      // Backend update
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/file/update-bill/${billId}`, updatedBill);
    } catch (error) {
      console.error('Failed to update invoice', error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {isEditing ? (
        <>
          {Object.keys(editedInvoice).filter(key => key !== '_id').map((key) => (
            <div key={key} className="mb-4">
              <label className="block mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <Input
                value={editedInvoice[key as keyof Invoice] || ''}
                onChange={(e) => handleInputChange(key as keyof Invoice, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={handleSave}>Save Changes</Button>
        </>
      ) : (
        <>
          {Object.entries(invoice || {}).filter(([key]) => key !== '_id').map(([key, value]) => (
            <div key={key} className="mb-2">
              <strong className="capitalize">{key.replace(/_/g, ' ')}: </strong>
              {renderValue(value)}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default InvoiceTab;
