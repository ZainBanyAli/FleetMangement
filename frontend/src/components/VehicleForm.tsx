'use client';

import { useEffect, useState } from 'react';

export type VehiclePayload = {
  plate_number: string;
  brand: string;
  model: string;
};

type Props = {
  initial?: VehiclePayload;
  onSubmit: (data: VehiclePayload) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
};

export default function VehicleForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: Props) {
  const [form, setForm] = useState<VehiclePayload>({
    plate_number: '',
    brand: '',
    model: '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const change =
    (k: keyof VehiclePayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((err) => ({ ...err, [k]: '' })); // clear field error on change
    };

  const validate = () => {
    const newErrors: { [k: string]: string } = {};
    // Example: AAA-1234 (2–4 letters, hyphen, 3–4 digits)
    const plateRegex = /^[A-Z]{2,4}-[0-9]{3,4}$/i;

    if (!plateRegex.test(form.plate_number)) {
      newErrors.plate_number = 'Plate must be in format e.g. ABC-1234';
    }
    if (!form.brand?.trim()) newErrors.brand = 'Brand is required';
    if (!form.model?.trim()) newErrors.model = 'Model is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const baseInput =
    'w-full rounded-md border px-3 py-2 outline-none transition ' +
    'border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ' +
    'placeholder:text-slate-400';
  const errorInput = 'border-red-500 focus:border-red-500 focus:ring-red-200';

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Plate Number */}
      <div>
        <label className="block text-sm mb-1">Plate number</label>
        <input
          className={`${baseInput} ${errors.plate_number ? errorInput : ''}`}
          placeholder="e.g. ABC-1234"
          value={form.plate_number}
          onChange={change('plate_number')}
          required
        />
        {errors.plate_number && (
          <p className="text-red-500 text-sm mt-1">{errors.plate_number}</p>
        )}
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm mb-1">Brand</label>
        <input
          className={`${baseInput} ${errors.brand ? errorInput : ''}`}
          placeholder="e.g. Toyota"
          value={form.brand}
          onChange={change('brand')}
          required
        />
        {errors.brand && (
          <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
        )}
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm mb-1">Model</label>
        <input
          className={`${baseInput} ${errors.model ? errorInput : ''}`}
          placeholder="e.g. Corolla"
          value={form.model}
          onChange={change('model')}
          required
        />
        {errors.model && (
          <p className="text-red-500 text-sm mt-1">{errors.model}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        {/* SAVE — pill style to match “Add Vehicle” */}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-white transition
                     hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>

        {/* CANCEL — subtle secondary */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border px-5 py-2.5 transition
                       hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
