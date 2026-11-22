import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@sj-ui-sdk/sj-ui";
import { Bistro } from "@sj-ui-sdk/sj-ui/icons";

/* The new API, without the legacy layer. Same values as SJ's Stencil sj-button. */

const types = ["filled", "tinted", "outlined", "gray", "plain"] as const;
const colors = ["lov", "himmel2", "himmel", "gras", "varning", "raps"] as const;
const sizes = ["extraLarge", "large", "medium", "small"] as const;

function Matrix({ size, disabled }: { size: (typeof sizes)[number]; disabled: boolean }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {types.map((type) => (
        <div key={type} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <code style={{ width: 80 }}>{type}</code>
          {(type === "filled" || type === "tinted" ? colors : (["lov"] as const)).map((color) => (
            <Button key={color} type={type} color={color} size={size} disabled={disabled}>
              {color}
            </Button>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <code style={{ width: 80 }}>ikon</code>
        <Button size={size} icon={<Bistro />}>Bistro</Button>
        <Button size={size} icon={<Bistro />} iconPosition="right">Bistro</Button>
        <Button size={size} showSpinner>Laddar</Button>
        <Button size={size} type="gray" icon={<Bistro />} isSymbolButton>Bistro</Button>
      </div>
    </div>
  );
}

const meta: Meta<typeof Matrix> = {
  title: "Nytt API/Button",
  component: Matrix,
  args: { size: "extraLarge", disabled: false },
  argTypes: { size: { control: "inline-radio", options: sizes } },
};
export default meta;
export const Alla: StoryObj<typeof Matrix> = {};
