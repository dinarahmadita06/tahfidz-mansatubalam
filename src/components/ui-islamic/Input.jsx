/**
 * Islamic Modern Input Component
 * Reusable input component with Islamic design aesthetics
 */

import { designSystem } from '@/styles/design-system';
import { useState } from 'react';

export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const sizeMap = {
    sm: {
      height: designSystem.components.input.height.sm,
      fontSize: designSystem.typography.fontSize.sm,
      padding: '0.5rem 0.75rem',
    },
    md: {
      height: designSystem.components.input.height.md,
      fontSize: designSystem.typography.fontSize.base,
      padding: designSystem.components.input.padding,
    },
    lg: {
      height: designSystem.components.input.height.lg,
      fontSize: designSystem.typography.fontSize.lg,
      padding: '1rem 1.25rem',
    },
  };

  const baseStyle = {
    width: fullWidth ? '100%' : 'auto',
    height: sizeMap[size].height,
    fontSize: sizeMap[size].fontSize,
    padding: icon ? (iconPosition === 'left' ? `${sizeMap[size].padding.split(' ')[0]} ${sizeMap[size].padding.split(' ')[1]} ${sizeMap[size].padding.split(' ')[0]} 2.5rem` : `${sizeMap[size].padding.split(' ')[0]} 2.5rem ${sizeMap[size].padding.split(' ')[0]} ${sizeMap[size].padding.split(' ')[1]}`) : sizeMap[size].padding,
    borderRadius: designSystem.components.input.borderRadius,
    border: error
      ? `1px solid ${designSystem.colors.error.DEFAULT}`
      : isFocused
      ? designSystem.components.input.focusBorder
      : designSystem.components.input.border,
    background: designSystem.colors.background.primary,
    color: designSystem.colors.text.primary,
    outline: 'none',
    transition: `all ${designSystem.transitions.duration.base} ${designSystem.transitions.timing.easeOut}`,
    boxShadow: isFocused ? designSystem.components.input.focusShadow : 'none',
  };

  return (
    <div className={`input-container ${containerClassName}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing[2],
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && iconPosition === 'left' && (
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: designSystem.colors.text.tertiary,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}
        <input
          className={className}
          style={baseStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: designSystem.colors.text.tertiary,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.error.DEFAULT,
            marginTop: designSystem.spacing[1],
          }}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.tertiary,
            marginTop: designSystem.spacing[1],
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  rows = 4,
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyle = {
    width: fullWidth ? '100%' : 'auto',
    minHeight: `${rows * 1.5}rem`,
    fontSize: designSystem.typography.fontSize.base,
    padding: designSystem.components.input.padding,
    borderRadius: designSystem.components.input.borderRadius,
    border: error
      ? `1px solid ${designSystem.colors.error.DEFAULT}`
      : isFocused
      ? designSystem.components.input.focusBorder
      : designSystem.components.input.border,
    background: designSystem.colors.background.primary,
    color: designSystem.colors.text.primary,
    outline: 'none',
    transition: `all ${designSystem.transitions.duration.base} ${designSystem.transitions.timing.easeOut}`,
    boxShadow: isFocused ? designSystem.components.input.focusShadow : 'none',
    resize: 'vertical',
    fontFamily: designSystem.typography.fontFamily.sans,
  };

  return (
    <div className={`textarea-container ${containerClassName}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing[2],
          }}
        >
          {label}
        </label>
      )}
      <textarea
        className={className}
        style={baseStyle}
        rows={rows}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.error.DEFAULT,
            marginTop: designSystem.spacing[1],
          }}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.tertiary,
            marginTop: designSystem.spacing[1],
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  helperText,
  options = [],
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyle = {
    width: fullWidth ? '100%' : 'auto',
    height: designSystem.components.input.height.md,
    fontSize: designSystem.typography.fontSize.base,
    padding: designSystem.components.input.padding,
    borderRadius: designSystem.components.input.borderRadius,
    border: error
      ? `1px solid ${designSystem.colors.error.DEFAULT}`
      : isFocused
      ? designSystem.components.input.focusBorder
      : designSystem.components.input.border,
    background: designSystem.colors.background.primary,
    color: designSystem.colors.text.primary,
    outline: 'none',
    transition: `all ${designSystem.transitions.duration.base} ${designSystem.transitions.timing.easeOut}`,
    boxShadow: isFocused ? designSystem.components.input.focusShadow : 'none',
    cursor: 'pointer',
  };

  return (
    <div className={`select-container ${containerClassName}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing[2],
          }}
        >
          {label}
        </label>
      )}
      <select
        className={className}
        style={baseStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.error.DEFAULT,
            marginTop: designSystem.spacing[1],
          }}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.tertiary,
            marginTop: designSystem.spacing[1],
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export function SearchInput({ onSearch, placeholder = 'Cari...', ...props }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      icon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
      }
      iconPosition="left"
      {...props}
    />
  );
}
