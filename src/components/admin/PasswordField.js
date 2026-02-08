'use client';

import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { generatePasswordMixed, copyToClipboard } from '@/lib/passwordUtils';

const colors = {
  emerald: {
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
  },
  white: '#FFFFFF',
  gray: {
    200: '#E5E7EB',
    400: '#9CA3AF',
  },
  text: {
    secondary: '#444444',
    tertiary: '#6B7280',
  },
};

export default function PasswordField({
  label = 'Password',
  value,
  onChange,
  placeholder = 'Masukkan password',
  required = true,
  helperText = 'Gunakan password kuat. Bisa generate otomatis.',
  showGenerateButton = true,
  iconOnlyGenerate = false,
  autoFocus = false,
  error = null,
  disabled = false,
  onGenerateCustom = null,
  generateDisabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (onGenerateCustom) {
      onGenerateCustom();
      return;
    }
    const newPassword = generatePasswordMixed();
    onChange(newPassword);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: colors.text.secondary,
          marginBottom: '8px',
          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
        }}
      >
        {label}
        {required && <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>}
      </label>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Password Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            disabled={disabled}
            autoComplete="new-password"
            style={{
              width: '100%',
              paddingLeft: '16px',
              paddingRight: '48px',
              paddingTop: '12px',
              paddingBottom: '12px',
              border: error ? '2px solid #ef4444' : `2px solid ${colors.gray[200]}`,
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              outline: 'none',
              transition: 'all 0.3s ease',
              background: disabled ? '#F9FAFB' : colors.white,
              color: disabled ? colors.text.tertiary : 'inherit',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            className="password-input"
          />
          {/* Show/Hide Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.text.tertiary,
              transition: 'all 0.2s ease',
            }}
            className="toggle-password-btn"
            title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Generate Password Button */}
        {showGenerateButton && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={disabled || generateDisabled}
            style={{
              padding: iconOnlyGenerate ? '12px' : '12px 16px',
              border: `2px solid ${colors.emerald[500]}20`,
              borderRadius: '12px',
              background: `${colors.emerald[500]}10`,
              color: colors.emerald[700],
              fontSize: '13px',
              fontWeight: 600,
              cursor: (disabled || generateDisabled) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: '"Poppins", system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              opacity: (disabled || generateDisabled) ? 0.5 : 1,
            }}
            className="generate-password-btn"
            title="Generate password otomatis"
          >
            <RefreshCw size={16} />
            {!iconOnlyGenerate && 'Generate'}
          </button>
        )}

        {/* Copy Password Button */}
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            disabled={disabled}
            style={{
              padding: '12px',
              border: `2px solid ${colors.gray[200]}`,
              borderRadius: '12px',
              background: colors.white,
              color: copied ? colors.emerald[600] : colors.text.tertiary,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
            }}
            className="copy-password-btn"
            title={copied ? 'Berhasil disalin!' : 'Salin password'}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          style={{
            fontSize: '12px',
            color: '#dc2626',
            marginTop: '6px',
            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
          }}
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p
          style={{
            fontSize: '12px',
            color: colors.text.tertiary,
            marginTop: '6px',
            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
          }}
        >
          {helperText}
        </p>
      )}

      <style jsx>{`
        .password-input:focus {
          border-color: ${error ? '#ef4444' : colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${error ? '#ef444420' : colors.emerald[500]}20 !important;
        }

        .toggle-password-btn:hover {
          color: ${colors.emerald[600]} !important;
        }

        .generate-password-btn:hover:not(:disabled) {
          background: ${colors.emerald[500]}20 !important;
          border-color: ${colors.emerald[500]}40 !important;
          transform: translateY(-2px);
        }

        .generate-password-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5 !important;
          transform: none !important;
        }

        .copy-password-btn:hover:not(:disabled) {
          background: ${colors.gray[200]} !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
