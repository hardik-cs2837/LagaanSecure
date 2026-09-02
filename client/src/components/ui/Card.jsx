import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Card = React.forwardRef(({ className, children, animate = false, hover = false, ...props }, ref) => {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-2xl border border-gray-100 bg-white shadow-card text-dark",
        hover && "transition-all duration-300 hover:shadow-float hover:-translate-y-1",
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
});
Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight text-lg", className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";
