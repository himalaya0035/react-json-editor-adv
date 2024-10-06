import { useCallback, useState } from "react";
import { DefaultTextElementProps } from "../../../types/JsonEditor.types";
import { Input } from "../../ui/input";
import { debounce, validateValue } from "../../../functions/functions";
import { DEBOUNCE_DELAY, GLOBAL_EDITING_MODE, INLINE_EDITING_MODE } from "../../../constants/constants";
import { Check } from "lucide-react";
import { Button } from "../../ui/button";
import { useJsonEditorContext } from "../jsonEditor";
import InlineCancelButton from "../inlineElements/inlineCancelButton";
import ResetButton from "../inlineElements/resetButton";

function DefaultTextInput({
  value,
  readModeValue,
  path,
  fieldValidations
}: DefaultTextElementProps) {
  const [textInputValue, setTextInputValue] = useState(value);
  const [localValidationError, setLocalValidationError] = useState('')
  const {
    handleOnChange,
    handleOnSubmit,
    editingMode,
    setSelectedFieldsForEditing,
    validations,
    setValidations,
    debouncing
  } = useJsonEditorContext();

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let result = null;
    if (fieldValidations){
      result = validateValue(value,fieldValidations)
      setLocalValidationError(result || '')
    }
    setTextInputValue(value);
    debouncedOnChange(value,result || "");
  };

  // Memoize debounced onChange with useCallback, recreating when onChange updates.
  // This prevents stale closures and ensures the component uses the latest onChange.
  const debouncedOnChange = useCallback(
    debounce((value: string,validationMessage? : string) => {
      const updatedValidations = {
        ...validations,
        [path] : validationMessage
      }
      handleOnChange(value, path,updatedValidations);
      if (fieldValidations){
        setValidations(prev => {
          return {
            ...prev,
            [path] :  validationMessage
          }
        })
      }
    }, debouncing ? DEBOUNCE_DELAY : 0),
    [handleOnChange]
  );

  const handleTextInputSubmit = () => {
    handleOnSubmit(textInputValue, path);
    if (editingMode === INLINE_EDITING_MODE) {
      setSelectedFieldsForEditing((prev) => {
        return {
          ...prev,
          [path]: false,
        };
      });
    }
  };

  const disabled = readModeValue === textInputValue;
  const validationMessage = localValidationError || validations[path]

  return (
    <>
      <Input value={textInputValue} onChange={handleTextInputChange} />
      {editingMode !== GLOBAL_EDITING_MODE && !validationMessage && (
        <Button
          variant={"outline"}
          disabled={disabled}
          size={"icon"}
          className={`${disabled && "hidden"}`}
          title="Submit"
          onClick={handleTextInputSubmit}
        >
          <Check size={14} />
        </Button>
      )}
      {editingMode === INLINE_EDITING_MODE && <InlineCancelButton path={path} />}
      {(editingMode !== INLINE_EDITING_MODE && !disabled) && <ResetButton path={path} callBack={() => {
        setTextInputValue(readModeValue || "" as string)
        setLocalValidationError("")
      }} />}
      <span className="text-sm">{validationMessage}</span>
    </>
  );
}

export default DefaultTextInput;
