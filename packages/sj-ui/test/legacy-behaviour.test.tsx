// Behaviour KB code relies on, checked on the legacy components. Pixels are checked in Storybook.
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FlowButton } from "../src/legacy/flow-button";
import { Switch } from "../src/legacy/switch";
import { FormControlLabel } from "../src/legacy/form-control-label";
import { Select } from "../src/legacy/select";
import { MenuItem } from "../src/legacy/menu-item";
import { DatePicker, type DatePickerProps } from "../src/legacy/date-picker";
import { useState } from "react";

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

describe("Select", () => {
  const open = async () => {
    fireEvent.click(screen.getByRole("combobox"));
    return await screen.findAllByRole("option");
  };

  it("gives onChange event.target.value with the option's own type, and the MenuItem as child", async () => {
    const onChange = vi.fn();
    render(
      <Select labelId="n" labelText="Antal" name="count" value={2} onChange={onChange}>
        <MenuItem value={1}>Ett</MenuItem>
        <MenuItem value={2}>Två</MenuItem>
        <MenuItem value={3}>Tre</MenuItem>
      </Select>,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Två");
    const options = await open();
    fireEvent.click(options[2]);
    const [event, child] = onChange.mock.calls[0];
    expect(event.target.value).toBe(3);
    expect(event.target.name).toBe("count");
    expect((child as { props: { children: string } }).props.children).toBe("Tre");
  });

  it("matches values like MUI: a number option equals its string value", async () => {
    render(
      <Select labelId="s" labelText="Antal" value="2" onChange={() => {}}>
        <MenuItem value={1}>Ett</MenuItem>
        <MenuItem value={2}>Två</MenuItem>
      </Select>,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Två");
  });

  it("multiple: onChange gets the whole array, and the trigger joins the labels", async () => {
    const onChange = vi.fn();
    render(
      <Select labelId="m" labelText="Tillval" multiple value={["wifi"]} onChange={onChange}>
        <MenuItem value="frukost">Frukost</MenuItem>
        <MenuItem value="wifi">Wifi</MenuItem>
      </Select>,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Wifi");
    const options = await open();
    fireEvent.click(options[0]);
    // MUI appends in click order, not option order.
    expect(onChange.mock.calls[0][0].target.value).toEqual(["wifi", "frukost"]);
  });

  it("labels the combobox with labelId, marks it required by default, and calls onOpen", async () => {
    const onOpen = vi.fn();
    render(
      <Select labelId="lbl" labelText="Antal" value="" onOpen={onOpen}>
        <MenuItem value="1">Ett</MenuItem>
      </Select>,
    );
    const combo = screen.getByRole("combobox");
    expect(combo.getAttribute("aria-labelledby")).toBe("lbl");
    expect(document.getElementById("lbl")?.textContent).toBe("Antal");
    expect(combo.getAttribute("aria-required")).toBe("true");
    await open();
    expect(onOpen).toHaveBeenCalled();
  });

  it("does not choose a disabled MenuItem", async () => {
    const onChange = vi.fn();
    render(
      <Select labelId="d" labelText="Antal" value="1" onChange={onChange}>
        <MenuItem value="1">Ett</MenuItem>
        <MenuItem value="2" disabled>Två</MenuItem>
      </Select>,
    );
    const options = await open();
    fireEvent.click(options[1]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("MenuItem on its own", () => {
  it("renders KB's row: an li with role menuitem and a divider after it", () => {
    const { container } = render(<ul><MenuItem onClick={() => {}}>Rad</MenuItem></ul>);
    expect(screen.getByRole("menuitem").tagName).toBe("LI");
    expect(container.querySelector(".sj-legacy-menu-divider")).not.toBeNull();
  });
  it("renders a link for href, and the variant's role otherwise", () => {
    render(<ul><MenuItem href="/x">Länk</MenuItem><MenuItem variant="checkbox" selected>Val</MenuItem></ul>);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/x");
    expect(screen.getByRole("menuitemcheckbox").getAttribute("aria-checked")).toBe("true");
  });
});

describe("DatePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-22T10:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  // The parent code KB's docs show: onChange keeps what is typed, onAccept a finished date.
  function Picker({ initial = "2026-11-24", ...props }: Partial<DatePickerProps> & { initial?: string }) {
    const [value, setValue] = useState(initial);
    return (
      <DatePicker
        id="d"
        label="Utresa"
        value={value}
        {...props}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange?.(e);
        }}
        onAccept={(d) => {
          setValue(d);
          props.onAccept?.(d);
        }}
      />
    );
  }
  const field = () => screen.getByLabelText("Utresa") as HTMLInputElement;

  it("shows the date the SJ way, and ISO while the field has focus", () => {
    render(<Picker />);
    expect(field().value).toBe("Tisdag 24 november");
    fireEvent.focus(field());
    expect(field().value).toBe("2026-11-24");
  });

  it("says Idag and Imorgon, the year only when it isn't this year, and honours customTranslation", () => {
    const { rerender } = render(<DatePicker id="d" label="Utresa" value="2026-11-22" />);
    expect(field().value).toBe("Idag 22 november");
    rerender(<DatePicker id="d" label="Utresa" value="2026-11-23" lang="en" />);
    expect(field().value).toBe("Tomorrow, 23 November");
    rerender(<DatePicker id="d" label="Utresa" value="2027-01-01" />);
    expect(field().value).toBe("Fredag 1 januari 2027");
    rerender(<DatePicker id="d" label="Utresa" value="2026-11-22" customTranslation={{ sv: { today: "I dag" } }} />);
    expect(field().value).toBe("I dag 22 november");
  });

  it("masks typing as KB does and calls onChange for every keystroke", () => {
    const seen: string[] = [];
    render(<Picker initial="" onChange={(e) => seen.push(e.target.value)} />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "20261" } });
    expect(field().value).toBe("2026-1");
    fireEvent.change(field(), { target: { value: "2026-122" } });
    expect(field().value).toBe("2026-12-2");
    expect(seen).toEqual(["20261", "2026-122"]);
    expect(field().maxLength).toBe(10);
  });

  it("accepts a finished date on Enter and on blur, adding a zero to a one-digit day", () => {
    const onAccept = vi.fn();
    render(<Picker initial="" onAccept={onAccept} />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "2026-12-24" } });
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onAccept).toHaveBeenLastCalledWith("2026-12-24");
    fireEvent.change(field(), { target: { value: "2026-12-5" } });
    fireEvent.blur(field());
    expect(onAccept).toHaveBeenLastCalledWith("2026-12-05");
    expect(field().value).toBe("Lördag 5 december");
  });

  it("does not accept a date that doesn't exist", () => {
    const onAccept = vi.fn();
    render(<Picker initial="" onAccept={onAccept} />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "2026-02-30" } });
    fireEvent.blur(field());
    expect(onAccept).not.toHaveBeenCalled();
    expect(field().value).toBe("2026-02-30");
  });

  it("names the calendar button as KB, with the journey direction", () => {
    const { rerender } = render(<DatePicker id="d" label="Utresa" value="2026-11-24" journeyDirection="outward" />);
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe("Utresa, Valt datum tisdag 24 november 2026, Tryck för att öppna kalendern ");
    rerender(<DatePicker id="d" label="Utresa" value="" />);
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe("Tryck för att öppna kalendern ");
    expect(screen.getByRole("button").getAttribute("aria-haspopup")).toBe("dialog");
  });

  it("formats with displayFormat and passes customAttribute on as KB's test ids", () => {
    render(<DatePicker id="d" label="Utresa" value="2026-11-24" displayFormat="dd/MM/yyyy" customAttribute={{ attribute: "data-testid", value: "date" }} />);
    expect(field().value).toBe("24/11/2026");
    expect(field().getAttribute("data-testid")).toBe("date-Input");
    expect(screen.getByRole("button").getAttribute("data-testid")).toBe("date-CalendarButton");
  });

  it("sets aria-required unless required is false, and shows errorHelperText as an error", () => {
    const { rerender } = render(<DatePicker id="d" label="Utresa" value="" errorHelperText="Välj ett datum" />);
    expect(field().getAttribute("aria-required")).toBe("true");
    expect(screen.getByText("Välj ett datum")).toBeTruthy();
    rerender(<DatePicker id="d" label="Utresa" value="" required={false} />);
    expect(field().getAttribute("aria-required")).toBe("false");
  });

  it("accepts the TextField props KB's types allow, which KB ignores", () => {
    render(<DatePicker id="d" label="Utresa" value="" name="out" onFocus={() => {}} inputProps={{}} variant="outlined" />);
    expect(field()).toBeTruthy();
  });
});
