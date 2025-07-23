import * as React from "react"

export interface AutocompleteOption {
  id: string
  name: string
  description?: string
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  getOptionLabel: (option: AutocompleteOption) => string
  multiple?: boolean
  value: AutocompleteOption[]
  onChange: (event: React.SyntheticEvent, value: AutocompleteOption[]) => void
  renderInput: (params: { placeholder?: string; className?: string }) => React.ReactNode
  renderOption?: (
    props: React.HTMLAttributes<HTMLElement>,
    option: AutocompleteOption
  ) => React.ReactNode
}

export function Autocomplete({
  options,
  getOptionLabel,
  multiple = false,
  value,
  onChange,
  renderInput,
  renderOption,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  // Filter options based on input value
  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleSelect = (option: AutocompleteOption) => {
    if (multiple) {
      if (value.some((v) => v.id === option.id)) {
        onChange(
          {} as React.SyntheticEvent,
          value.filter((v) => v.id !== option.id)
        )
      } else {
        onChange({} as React.SyntheticEvent, [...value, option])
      }
    } else {
      onChange({} as React.SyntheticEvent, [option])
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      {renderInput({
        value: inputValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value)
          setOpen(true)
        },
        onFocus: () => setOpen(true),
        onBlur: () => setTimeout(() => setOpen(false), 100),
      })}
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <li className="p-2 text-sm text-gray-400">No options</li>
          ) : (
            filteredOptions.map((option) =>
              renderOption ? (
                <div
                  key={option.id}
                  onMouseDown={() => handleSelect(option)}
                  className={`cursor-pointer ${value.some((v) => v.id === option.id) ? "bg-gray-100" : ""}`}
                >
                  {renderOption({}, option)}
                </div>
              ) : (
                <li
                  key={option.id}
                  onMouseDown={() => handleSelect(option)}
                  className={`p-2 cursor-pointer ${value.some((v) => v.id === option.id) ? "bg-gray-100" : ""}`}
                >
                  {getOptionLabel(option)}
                </li>
              )
            )
          )}
        </ul>
      )}
      {multiple && value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((v) => (
            <span key={v.id} className="bg-gray-200 rounded px-2 py-0.5 text-xs">
              {getOptionLabel(v)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
