import { forwardRef, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ id, label, required, error, children, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <Label
          htmlFor={id}
          className={cn(error && "text-danger")}
        >
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </Label>
        {children}
        {error && (
          <p 
            id={`${id}-error`}
            className="text-xs text-danger animate-fade-in" 
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
