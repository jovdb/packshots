import { FileInput } from "@mantine/core";

export function ImageSelection({
  onSelect,
  onSelectError = (message) => alert(message),
}: {
  onSelect(data: { url: string; name: string }): void;
  onSelectError?(error: string): void;
}) {
  const max = 4 * 1024 * 1024;
  return (
    <FileInput
      accept="image/*"
      size="xs"
      placeholder="Click to open file"
      onChange={(file) => {
        if (!file) return;
        if (file.size > max) {
          const maxSizeString = Math.ceil(max / 1024 / 102.4) / 10;
          const currentSizeString = Math.ceil(file.size / 1024 / 102.4) / 10;
          const message = `file '${file.name}' is too large: ${currentSizeString} MB (maximum: ${maxSizeString} MB)`;
          onSelectError(message);
          return;
        }
        onSelect({
          name: file.name,
          url: URL.createObjectURL(file),
        });
      }}
    />
  );
}
