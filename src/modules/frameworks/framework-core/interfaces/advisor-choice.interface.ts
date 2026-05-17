export interface AdvisorChoiceOption {
  /** Human-readable label shown in the UI */
  label: string;
  /** Actual value to use as command/path/port */
  value: string;
}

export interface AdvisorUserChoice {
  /** Which build field is ambiguous */
  field: 'startCommand' | 'buildCommand' | 'port' | 'entrypoint' | 'mainModule';
  /** Human-readable explanation of why this choice is needed */
  description: string;
  /** Enumerable options the user can select from */
  options: AdvisorChoiceOption[];
  /** Index into options[] of the advisor's best-guess suggestion */
  suggestedIndex: number;
}
