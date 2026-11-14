// reusable input component with error display

export default function Input({
  label,
  id,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-gray-400
          ${error
            ? 'border-red-soft bg-red-light focus:border-red-soft focus:ring-red-soft'
            : 'border-gray-300 bg-white focus:border-green-mid focus:ring-green-mid'
          } ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-soft" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
