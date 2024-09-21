import DefaultTextInput from "../defaultElements/defaultTextInput";
import DefaultNumberInput from "../defaultElements/defaultNumberInput";
import DefaultDateInput from "../defaultElements/defaultDateInput";
import DefaultSelectInput from "../defaultElements/defaultSelectInput";
import DefaultRadioInput from "../defaultElements/defaultRadioInput";
import DefaultTextAreaElement from "../defaultElements/defaultTextAreaInput";
import { getValueByPath, removeArrayIndexFromPropertyPath } from "../../../functions/functions";
import { RenderValueProps } from "../../../types/JsonEditor.types";
import DefaultValueElement from "../defaultElements/defaultValueElement";
import { useJsonEditorContext } from "../jsonEditor";
import { INLINE_EDITING_MODE } from "../../../constants/constants";

function RenderValue({
  value,
  path
}: RenderValueProps) {

  const {
    isEditing,
    editingMode,
    editJsonState,
    editableFields,
    nonEditableFields,
    allFieldsEditable,
    selectedFieldsForEditing
  } = useJsonEditorContext();
  
  // Ex: need to convert "a.1.b" => "a.b", because editable lookup does not account for indices
  const pathWithoutArrayIndices = removeArrayIndexFromPropertyPath(path);
  const isFieldPresentInEditabeLookup =
    editableFields && editableFields.hasOwnProperty(pathWithoutArrayIndices);
  const isFieldPresentInNonEditableLookup =
    nonEditableFields && nonEditableFields.hasOwnProperty(pathWithoutArrayIndices);

  // render a editable input field when:
  // The editor is in editing mode and,
  // Either all fields are editable or the field is in the editableFields lookup and,
  // The field is not present in the nonEditableFields lookup.  
  if (
    (
      isEditing &&
      (allFieldsEditable || isFieldPresentInEditabeLookup) &&
      !isFieldPresentInNonEditableLookup && editingMode !== INLINE_EDITING_MODE
    ) 
    || 
    (
      editingMode === INLINE_EDITING_MODE && selectedFieldsForEditing[path] && !isFieldPresentInNonEditableLookup
    )
   ){
    const editableValue = getValueByPath(editJsonState, path);
    if (
      isFieldPresentInEditabeLookup &&
      editableFields[pathWithoutArrayIndices] !== true
    ) {
      const editableField = editableFields[pathWithoutArrayIndices];
      switch (editableField.type) {
        case "string": {
          const fieldValidations = editableField?.validations
          return (
            <DefaultTextInput
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              value={editableValue as string}
              readModeValue={value as string}
              fieldValidations={fieldValidations}
            />
          );
        }
        case "number": {
          const fieldValidations = editableField?.validations
          return (
            <DefaultNumberInput
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              value={editableValue as number}
              readModeValue={value as number}
              fieldValidations={fieldValidations}
            />
          );
        }
        case "select": {
          return (
            <DefaultSelectInput
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              value={editableValue as string}
              readModeValue={value as string}
              options={editableField.options}
            />
          );
        }
        case "date": {
          return (
            <DefaultDateInput
              value={editableValue as string}
              readModeValue={value as string}
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              format={editableField.format}
            />
          );
        }
        case "radio": {
          return (
            <DefaultRadioInput
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              value={editableValue as string}
              readModeValue={value as string}
              options={editableField.options}
            />
          );
        }
        case "textArea": {
          const fieldValidations = editableField?.validations
          return (
            <DefaultTextAreaElement
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              value={editableValue as string}
              readModeValue={value as string}
              fieldValidations={fieldValidations}
            />
          );
        }
        default: {
          return (
            <DefaultTextInput
              path={path}
              pathWithoutArrayIndices={pathWithoutArrayIndices}
              value={editableValue as string}
              readModeValue={value as string}
            />
          );
        }
      }
    } else {
      return (
        <DefaultTextInput
          path={path}
          pathWithoutArrayIndices={pathWithoutArrayIndices}
          value={editableValue as string}
          readModeValue={value as string}
        />
      );
    }
  }

  return (
    <DefaultValueElement
      value={value as string}
      path={path}
      pathWithoutArrayIndices={pathWithoutArrayIndices}
      isFieldPresentInNonEditableLookup={isFieldPresentInNonEditableLookup}
    />
  ) 
}

export default RenderValue;
