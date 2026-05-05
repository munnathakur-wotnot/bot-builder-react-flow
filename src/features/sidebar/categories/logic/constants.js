export const OPERATORS = [
  { value: "eq",           label: "Equals to" },
  { value: "neq",          label: "Not equals to" },
  { value: "gt",           label: "Greater than" },
  { value: "lt",           label: "Less than" },
  { value: "gte",          label: "Greater than or equal" },
  { value: "lte",          label: "Less than or equal" },
  { value: "contains",     label: "Contains" },
  { value: "not_contains", label: "Not contains" },
  { value: "is_empty",     label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

export const NO_VALUE_OPS = new Set(["is_empty", "is_not_empty"]);
