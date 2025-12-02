/**
 * Opens a form in a new window
 * @param formId - The ID of the form to open
 * @param title - Optional window title
 */
export function openFormInNewWindow(formId: string, title: string = 'Form') {
  const width = 1000;
  const height = 800;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  const url = `/form?formId=${encodeURIComponent(formId)}`;
  
  window.open(
    url,
    `form-${formId}`,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
}

/**
 * Gets the form window's reference
 */
export function getFormWindow(formId: string) {
  return window.open(
    `/form?formId=${encodeURIComponent(formId)}`,
    `form-${formId}`,
    'width=1000,height=800,resizable=yes,scrollbars=yes'
  );
}
