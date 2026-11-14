// reusable button component
// no component library - just tailwind classes

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-mid disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-green-deep text-white hover:bg-green-mid active:bg-green-deep',
    secondary: 'bg-cream-dark text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300',
    danger: 'bg-red-soft text-white hover:bg-red-500 active:bg-red-600',
    ghost: 'text-green-deep hover:bg-green-light active:bg-cream-dark',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
