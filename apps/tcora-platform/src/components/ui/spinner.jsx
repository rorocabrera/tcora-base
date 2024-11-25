import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full',
        'border-primary/30 border-t-primary',
        'animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

Spinner.defaultProps = {
  size: 'md'
};