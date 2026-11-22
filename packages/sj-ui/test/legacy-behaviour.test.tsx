// Behaviour KB code relies on, checked on the legacy components. Pixels are checked in Storybook.
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FlowButton } from "../src/legacy/flow-button";
import { Switch } from "../src/legacy/switch";
import { FormControlLabel } from "../src/legacy/form-control-label";

describe("FlowButton", () => {
  it("does not call onClick while the spinner shows, as in KB", () => {
    const onClick = vi.fn();
    const { rerender } = render(<FlowButton shouldShowSpinner onClick={onClick}>Betala</FlowButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    rerender(<FlowButton onClick={onClick}>Betala</FlowButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("passes HTML attributes and renders a link for href", () => {
    render(<FlowButton href="/vidare" title="Vidare" data-test="x">Vidare</FlowButton>);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/vidare");
    expect(link.getAttribute("title")).toBe("Vidare");
    expect(link.getAttribute("data-test")).toBe("x");
  });
});

describe("Switch", () => {
  it("is a native checkbox input with role switch, and onChange gets the real input", () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    render(<Switch name="direct" aria-label="Direkt" onChange={onChange} inputRef={ref} onFocus={() => {}} />);
    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(ref.current).toBe(input);
    fireEvent.click(input);
    const [event, checked] = onChange.mock.calls[0];
    expect(checked).toBe(true);
    expect(event.target.value).toBe("on");
    expect(event.target.name).toBe("direct");
  });
});

describe("FormControlLabel", () => {
  it("hands checked, name, onChange and value to the control, as MUI does", () => {
    const onChange = vi.fn();
    render(<FormControlLabel label="Direkt" checked name="direct" value="yes" onChange={onChange} control={<Switch name="" />} />);
    const input = screen.getByRole("switch", { name: "Direkt" }) as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(input.value).toBe("yes");
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalled();
  });
});
