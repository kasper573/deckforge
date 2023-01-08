export function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

export function createJSONFile(
  json: Record<string, unknown>,
  fileName: string
) {
  return new File([JSON.stringify(json)], fileName, {
    type: "application/json",
  });
}
