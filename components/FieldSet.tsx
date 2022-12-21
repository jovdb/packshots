import { Checkbox, Paper, Text } from "@mantine/core";
import { PropsWithChildren } from "react";

export const FieldSet = ({
  label,
  checked,
  onChecked,
  children,
}: PropsWithChildren<{
  label: string;
  checked?: boolean;
  onChecked?: (checked: boolean) => void;
}>) => (
  <Paper p={8} m={5} withBorder style={{ background: "transparent" }}>
    {onChecked
      ? (
        <Checkbox
          size="xs"
          label={label}
          styles={{
            label: { fontWeight: "bold", fontSize: "1.2em" },
          }}
          checked={checked}
          onChange={(e) => {
            const isChecked = e.currentTarget.checked;
            onChecked(isChecked);
          }}
        />
      )
      : <Text size="sm" style={{ fontWeight: "bold" }}>{label}</Text>}

    {children}
  </Paper>
);
