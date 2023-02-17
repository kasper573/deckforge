export function createHighlighter<Id>(
  idAttribute: string,
  formatId: (id: Id) => string = compatibleHtmlAttributeValue
) {
  function setId(id?: Id) {
    if (id !== undefined) {
      document.body.setAttribute(idAttribute, formatId(id));
    } else {
      document.body.removeAttribute(idAttribute);
    }
  }

  const selector = (idOrIds: Id | Id[]) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return ids.map((id) => `[${idAttribute}="${formatId(id)}"] &`).join(", ");
  };

  return {
    setId,
    selector,
  };
}

function compatibleHtmlAttributeValue(value: unknown): string {
  return JSON.stringify(value).replace(/"/g, "&quot;");
}
