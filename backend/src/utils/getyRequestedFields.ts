export function getRequestedFields(info: any): string[] {
  const selections = info.fieldNodes[0].selectionSet?.selections || [];
  const fields: string[] = [];
  selections.forEach((selection: any) => {
    if (selection.name.value === 'address') {
      const addressFields = selection.selectionSet?.selections.map((s: any) => `address.${s.name.value}`) || [];
      fields.push('address', ...addressFields);
    } else {
      fields.push(selection.name.value);
    }
  });
  return fields;
}

export function getNestedRequestedFields(info: any): string[] {
  const selections = info;
  const fields: string[] = [];
  selections.forEach((selection: any) => {
    if (selection.name.value === 'address') {
      const addressFields = selection.selectionSet?.selections.map((s: any) => `address.${s.name.value}`) || [];
      fields.push('address', ...addressFields);
    } else {
      fields.push(selection.name.value);
    }
  });
  return fields;
}