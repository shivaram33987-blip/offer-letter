import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Calendar, Hash, Mail, Phone, Type, MapPin, Building, User } from 'lucide-react';

interface InputFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  register,
  error,
  required = true,
}) => {
  // Infer type and icon based on field key
  const keyLower = name.toLowerCase();

  let inputType = 'text';
  let Icon = Type;
  let placeholder = `Enter ${label}...`;

  if (keyLower.includes('date')) {
    inputType = 'date';
    Icon = Calendar;
    placeholder = 'YYYY-MM-DD';
  } else if (keyLower.includes('email')) {
    inputType = 'email';
    Icon = Mail;
    placeholder = 'e.g. john@example.com';
  } else if (keyLower.includes('phone') || keyLower.includes('mobile') || keyLower.includes('contact')) {
    inputType = 'tel';
    Icon = Phone;
    placeholder = 'e.g. +1 555 019 2831';
  } else if (keyLower.includes('amount') || keyLower.includes('salary') || keyLower.includes('price') || keyLower.includes('number') || keyLower.includes('age')) {
    inputType = 'text';
    Icon = Hash;
    placeholder = 'e.g. $85,000 / year';
  } else if (keyLower.includes('company') || keyLower.includes('organization')) {
    Icon = Building;
  } else if (keyLower.includes('address') || keyLower.includes('location') || keyLower.includes('city')) {
    Icon = MapPin;
  } else if (keyLower.includes('name') || keyLower.includes('user') || keyLower.includes('designation')) {
    Icon = User;
  }

  // Format label nicely (e.g. employee_name -> Employee Name)
  const formattedLabel = label
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={name} className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wide">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-blue-600" />
          {formattedLabel}
        </span>
        {required && <span className="text-[10px] text-rose-500 font-medium">* Required</span>}
      </label>

      <div className="relative rounded-xl shadow-xs">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          {...register(name, {
            required: required ? `${formattedLabel} is required` : false,
          })}
          className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
            error
              ? 'border-rose-400 focus:border-rose-500 text-rose-900 bg-rose-50/30'
              : 'border-slate-200 focus:border-blue-600 text-slate-900'
          }`}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium mt-0.5 animate-fadeIn">
          {error.message}
        </p>
      )}
    </div>
  );
};
