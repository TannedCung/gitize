'use client';

import React, { useState } from 'react';
import { TextField } from './ui/TextField';

/**
 * Demo component showcasing TextField variants and states
 */
export const TextFieldDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  // Mock icons for demo
  const EmailIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
      />
    </svg>
  );

  const LockIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  const SearchIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          TextField Component Demo
        </h2>

        <div className="space-y-6">
          {/* Basic TextField */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Basic Text Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Small Size"
                placeholder="Small input"
                size="sm"
              />
              <TextField
                label="Medium Size"
                placeholder="Medium input (default)"
                size="md"
              />
              <TextField
                label="Large Size"
                placeholder="Large input"
                size="lg"
              />
            </div>
          </div>

          {/* Validation States */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Validation States
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Success State"
                placeholder="Valid input"
                state="success"
                helperText="This field is valid"
                value="valid@example.com"
                onChange={() => {}}
              />
              <TextField
                label="Error State"
                placeholder="Invalid input"
                error="This field is required"
                value=""
                onChange={() => {}}
              />
              <TextField
                label="Disabled State"
                placeholder="Disabled input"
                disabled
                helperText="This field is disabled"
              />
              <TextField
                label="Read Only"
                value="Read only value"
                readOnly
                helperText="This field is read-only"
              />
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Text Fields with Icons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Email"
                type="email"
                placeholder="Enter your email"
                startIcon={<EmailIcon />}
                value={email}
                onChange={e => setEmail(e.target.value)}
                helperText="We'll never share your email"
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Enter your password"
                startIcon={<LockIcon />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                helperText="Must be at least 8 characters"
              />
            </div>
          </div>

          {/* Search Field */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Search Field
            </h3>
            <TextField
              label="Search"
              type="search"
              placeholder="Search repositories..."
              startIcon={<SearchIcon />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              helperText="Search by name, description, or language"
            />
          </div>

          {/* Character Count */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Character Count
            </h3>
            <TextField
              label="Message"
              placeholder="Enter your message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={100}
              showCharCount
              helperText="Share your thoughts with the community"
            />
          </div>

          {/* Required Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Required Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="First Name"
                placeholder="Enter your first name"
                required
                helperText="This field is required"
              />
              <TextField
                label="Last Name"
                placeholder="Enter your last name"
                required
                helperText="This field is required"
              />
            </div>
          </div>

          {/* Different Input Types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Input Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                helperText="Include country code"
              />
              <TextField
                label="Website URL"
                type="url"
                placeholder="https://example.com"
                helperText="Enter a valid URL"
              />
              <TextField
                label="Age"
                type="number"
                placeholder="25"
                helperText="Must be 18 or older"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextFieldDemo;
