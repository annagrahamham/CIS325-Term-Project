function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  autoComplete,
  minLength,
  maxLength,
  options,
  error,
  ...rest
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />
      )}
      {error ? <p id={describedBy} className="field-error">{error}</p> : null}
    </div>
  );
}

export default FormField;
