import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const CONTROL_CLASS =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-medium text-ink placeholder:text-muted/60 focus:border-coral-500";

interface FieldWrapProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrap({ label, htmlFor, error, hint, required, children }: FieldWrapProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-extrabold">
        {label}
        {required && (
          <span className="ml-0.5 text-coral-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, id, required, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <FieldWrap label={label} htmlFor={fieldId!} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={fieldId}
        className={CONTROL_CLASS}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        required={required}
        {...props}
      />
    </FieldWrap>
  );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, options, error, id, required, ...props }, ref) {
    const fieldId = id ?? props.name;
    return (
      <FieldWrap label={label} htmlFor={fieldId!} error={error} required={required}>
        <select
          ref={ref}
          id={fieldId}
          className={CONTROL_CLASS}
          aria-invalid={Boolean(error)}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldWrap>
    );
  },
);

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, id, required, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <FieldWrap label={label} htmlFor={fieldId!} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={fieldId}
        className={CONTROL_CLASS}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </FieldWrap>
  );
});
