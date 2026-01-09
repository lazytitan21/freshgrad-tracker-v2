import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * Unified Button Component with consistent variants
 * 
 * Variants:
 * - primary: Main action buttons (indigo)
 * - secondary: Secondary actions (gray outline)
 * - ghost: Subtle actions (transparent bg)
 * - danger: Destructive actions (red)
 * - success: Positive actions (green)
 * - warning: Caution actions (amber)
 * 
 * Sizes:
 * - xs: Extra small (px-2 py-1 text-xs)
 * - sm: Small (px-3 py-1.5 text-sm)
 * - md: Medium (px-4 py-2 text-sm) - default
 * - lg: Large (px-5 py-2.5 text-base)
 * - xl: Extra large (px-6 py-3 text-lg)
 */

const variants = {
  primary: {
    base: "bg-indigo-600 text-white border-transparent",
    hover: "hover:bg-indigo-700",
    active: "active:bg-indigo-800",
    disabled: "disabled:bg-indigo-300 disabled:cursor-not-allowed",
    focus: "focus:ring-indigo-500",
  },
  secondary: {
    base: "bg-white text-slate-700 border-slate-300",
    hover: "hover:bg-slate-50 hover:border-slate-400",
    active: "active:bg-slate-100",
    disabled: "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
    focus: "focus:ring-slate-500",
  },
  ghost: {
    base: "bg-transparent text-slate-600 border-transparent",
    hover: "hover:bg-slate-100 hover:text-slate-900",
    active: "active:bg-slate-200",
    disabled: "disabled:text-slate-300 disabled:cursor-not-allowed",
    focus: "focus:ring-slate-500",
  },
  danger: {
    base: "bg-rose-600 text-white border-transparent",
    hover: "hover:bg-rose-700",
    active: "active:bg-rose-800",
    disabled: "disabled:bg-rose-300 disabled:cursor-not-allowed",
    focus: "focus:ring-rose-500",
  },
  "danger-outline": {
    base: "bg-white text-rose-600 border-rose-300",
    hover: "hover:bg-rose-50 hover:border-rose-400",
    active: "active:bg-rose-100",
    disabled: "disabled:text-rose-300 disabled:border-rose-200 disabled:cursor-not-allowed",
    focus: "focus:ring-rose-500",
  },
  success: {
    base: "bg-emerald-600 text-white border-transparent",
    hover: "hover:bg-emerald-700",
    active: "active:bg-emerald-800",
    disabled: "disabled:bg-emerald-300 disabled:cursor-not-allowed",
    focus: "focus:ring-emerald-500",
  },
  "success-outline": {
    base: "bg-white text-emerald-600 border-emerald-300",
    hover: "hover:bg-emerald-50 hover:border-emerald-400",
    active: "active:bg-emerald-100",
    disabled: "disabled:text-emerald-300 disabled:border-emerald-200 disabled:cursor-not-allowed",
    focus: "focus:ring-emerald-500",
  },
  warning: {
    base: "bg-amber-500 text-white border-transparent",
    hover: "hover:bg-amber-600",
    active: "active:bg-amber-700",
    disabled: "disabled:bg-amber-300 disabled:cursor-not-allowed",
    focus: "focus:ring-amber-500",
  },
  link: {
    base: "bg-transparent text-indigo-600 border-transparent underline-offset-2",
    hover: "hover:text-indigo-800 hover:underline",
    active: "active:text-indigo-900",
    disabled: "disabled:text-indigo-300 disabled:cursor-not-allowed",
    focus: "focus:ring-indigo-500",
  },
};

const sizes = {
  xs: "px-2 py-1 text-xs rounded-lg gap-1",
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
  xl: "px-6 py-3 text-lg rounded-2xl gap-2.5",
};

const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  animated = true,
  className = "",
  type = "button",
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  const buttonClasses = [
    "inline-flex items-center justify-center font-medium border transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    v.base,
    v.hover,
    v.active,
    v.disabled,
    v.focus,
    s,
    fullWidth ? "w-full" : "",
    className,
  ].filter(Boolean).join(" ");

  const content = (
    <>
      {loading ? (
        <svg className={`animate-spin ${iconSize}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === "left" ? (
        <Icon className={iconSize} />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === "right" ? (
        <Icon className={iconSize} />
      ) : null}
    </>
  );

  if (animated && !disabled && !loading) {
    return (
      <Motion.button
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {content}
      </Motion.button>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * Icon-only button variant
 */
export function IconButton({
  icon: Icon,
  variant = "ghost",
  size = "md",
  label,
  className = "",
  ...props
}) {
  const v = variants[variant] || variants.ghost;
  const iconSize = iconSizes[size] || iconSizes.md;
  
  const paddings = {
    xs: "p-1",
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
    xl: "p-3",
  };

  const buttonClasses = [
    "inline-flex items-center justify-center border transition-all duration-200 rounded-lg",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    v.base,
    v.hover,
    v.active,
    v.disabled,
    v.focus,
    paddings[size] || paddings.md,
    className,
  ].filter(Boolean).join(" ");

  return (
    <Motion.button
      type="button"
      className={buttonClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon className={iconSize} />
    </Motion.button>
  );
}

/**
 * Button Group for related actions
 */
export function ButtonGroup({ children, className = "" }) {
  return (
    <div className={`inline-flex rounded-xl overflow-hidden shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          className: `${child.props.className || ""} ${
            index === 0 ? "rounded-r-none" : 
            index === React.Children.count(children) - 1 ? "rounded-l-none border-l-0" : 
            "rounded-none border-l-0"
          }`,
          animated: false,
        });
      })}
    </div>
  );
}

export default Button;
