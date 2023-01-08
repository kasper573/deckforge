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

export function loadFile({ accept }: { accept?: string }) {
  return new Promise<File | undefined>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    if (accept !== undefined) {
      input.accept = accept;
    }
    input.onchange = () => {
      const [file] = input.files ? Array.from(input.files) : [];
      resolve(file);
    };
    input.click();
  });
}
