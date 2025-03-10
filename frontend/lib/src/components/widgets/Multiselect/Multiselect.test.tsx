/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2024)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"

import { act, fireEvent, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import { render } from "@streamlit/lib/src/test_util"
import { WidgetStateManager } from "@streamlit/lib/src/WidgetStateManager"
import {
  LabelVisibilityMessage as LabelVisibilityMessageProto,
  MultiSelect as MultiSelectProto,
} from "@streamlit/lib/src/proto"
import * as Utils from "@streamlit/lib/src/theme/utils"
import { mockConvertRemToPx } from "@streamlit/lib/src/mocks/mocks"

import Multiselect, { Props } from "./Multiselect"

const getProps = (
  elementProps: Partial<MultiSelectProto> = {},
  widgetProps: Partial<Props> = {}
): Props => ({
  element: MultiSelectProto.create({
    id: "1",
    label: "Label",
    default: [0],
    options: ["a", "b", "c"],
    placeholder: "Please select",
    ...elementProps,
  }),
  width: 0,
  disabled: false,
  widgetMgr: new WidgetStateManager({
    sendRerunBackMsg: vi.fn(),
    formsDataChanged: vi.fn(),
  }),
  ...widgetProps,
})

describe("Multiselect widget", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.spyOn(Utils, "convertRemToPx").mockImplementation(mockConvertRemToPx)
  })

  it("renders without crashing", () => {
    const props = getProps()
    render(<Multiselect {...props} />)

    const multiSelect = screen.getByTestId("stMultiSelect")
    expect(multiSelect).toBeInTheDocument()
  })

  it("sets widget value on mount", () => {
    const props = getProps()
    vi.spyOn(props.widgetMgr, "setIntArrayValue")

    render(<Multiselect {...props} />)
    expect(props.widgetMgr.setIntArrayValue).toHaveBeenCalledWith(
      props.element,
      props.element.default,
      {
        fromUi: false,
      },
      undefined
    )
  })

  it("can pass fragmentId to setIntArrayValue", () => {
    const props = getProps(undefined, { fragmentId: "myFragmentId" })
    vi.spyOn(props.widgetMgr, "setIntArrayValue")

    render(<Multiselect {...props} />)
    expect(props.widgetMgr.setIntArrayValue).toHaveBeenCalledWith(
      props.element,
      props.element.default,
      {
        fromUi: false,
      },
      "myFragmentId"
    )
  })

  it("has correct className and style", () => {
    const props = getProps()
    render(<Multiselect {...props} />)
    const multiSelect = screen.getByTestId("stMultiSelect")

    expect(multiSelect).toHaveClass("stMultiSelect")
    expect(multiSelect).toHaveStyle(`width: ${props.width}px`)
  })

  it("renders a label", () => {
    const props = getProps()
    render(<Multiselect {...props} />)

    const widgetLabel = screen.queryByText(`${props.element.label}`)
    expect(widgetLabel).toBeInTheDocument()
  })

  it("pass labelVisibility prop to StyledWidgetLabel correctly when hidden", () => {
    const props = getProps({
      labelVisibility: {
        value: LabelVisibilityMessageProto.LabelVisibilityOptions.HIDDEN,
      },
    })
    render(<Multiselect {...props} />)
    expect(screen.getByTestId("stWidgetLabel")).toHaveStyle(
      "visibility: hidden"
    )
  })

  it("pass labelVisibility prop to StyledWidgetLabel correctly when collapsed", () => {
    const props = getProps({
      labelVisibility: {
        value: LabelVisibilityMessageProto.LabelVisibilityOptions.COLLAPSED,
      },
    })
    render(<Multiselect {...props} />)
    expect(screen.getByTestId("stWidgetLabel")).toHaveStyle("display: none")
  })

  describe("placeholder", () => {
    it("renders when it's empty", () => {
      const props = getProps({ default: [] })
      render(<Multiselect {...props} />)

      const placeholder = screen.getByText("Please select")
      expect(placeholder).toBeInTheDocument()
    })

    it("renders with empty options", () => {
      const props = getProps({ default: [], options: [] })
      render(<Multiselect {...props} />)

      const placeholder = screen.getByText("No options to select.")
      expect(placeholder).toBeInTheDocument()
    })
  })

  it("renders options", async () => {
    const user = userEvent.setup()
    const props = getProps({ default: [] })
    render(<Multiselect {...props} />)

    const expandListButton = screen.getAllByTitle("open")[0]
    await user.click(expandListButton)

    const options = screen.getAllByRole("option")
    expect(options.length).toBe(props.element.options.length)
    options.forEach((option, idx) => {
      expect(option).toHaveTextContent(props.element.options[idx])
    })
  })

  it("filters based on label, not value", async () => {
    const user = userEvent.setup()
    const props = getProps({ default: [] })
    render(<Multiselect {...props} />)

    const multiSelect = screen.getByRole("combobox")

    await user.type(multiSelect, "1")
    expect(screen.getByText("No results")).toBeInTheDocument()

    await user.clear(multiSelect)
    await user.type(multiSelect, "a")
    const match = screen.getByRole("option")
    expect(match).toHaveTextContent("a")
  })

  it("can be disabled", () => {
    const props = getProps({}, { disabled: true })
    render(<Multiselect {...props} />)
    const multiSelect = screen.getByRole("combobox")
    expect(multiSelect).toBeDisabled()
  })

  it("can select multiple options", async () => {
    const user = userEvent.setup()
    const props = getProps()
    render(<Multiselect {...props} />)

    const multiSelect = screen.getByRole("combobox")
    // TODO: Utilize user-event instead of fireEvent
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(multiSelect, { target: { value: "b" } })
    const match = screen.getByRole("option")
    await user.click(match)

    const selections = screen.getAllByRole("button")
    expect(selections[0]).toHaveTextContent("a")
    expect(selections[1]).toHaveTextContent("b")
  })

  it("can remove options", async () => {
    const user = userEvent.setup()
    const props = getProps()
    render(<Multiselect {...props} />)

    // Clear current selection
    const deleteOptionButton = screen.getAllByTitle("Delete")[0]
    await user.click(deleteOptionButton)

    // Should now see all options available again
    const expandListButton = screen.getAllByTitle("open")[0]
    await user.click(expandListButton)

    const options = screen.getAllByRole("option")
    expect(options.length).toBe(props.element.options.length)
    options.forEach((option, idx) => {
      expect(option).toHaveTextContent(props.element.options[idx])
    })
  })

  it("can clear all", async () => {
    const user = userEvent.setup()
    const props = getProps()
    render(<Multiselect {...props} />)

    // Clear all selections
    const clearAllButton = screen.getByRole("button", { name: "Clear all" })
    await user.click(clearAllButton)

    // Should now see all options available again
    const expandListButton = screen.getAllByTitle("open")[0]
    await user.click(expandListButton)

    const options = screen.getAllByRole("option")
    expect(options.length).toBe(props.element.options.length)
    options.forEach((option, idx) => {
      expect(option).toHaveTextContent(props.element.options[idx])
    })
  })

  it("resets its value when form is cleared", async () => {
    // Create a widget in a clearOnSubmit form
    const user = userEvent.setup()
    const props = getProps({ formId: "form" })
    props.widgetMgr.setFormSubmitBehaviors("form", true)

    vi.spyOn(props.widgetMgr, "setIntArrayValue")

    render(<Multiselect {...props} />)

    // Change the widget value
    const multiSelect = screen.getByRole("combobox")
    // TODO: Utilize user-event instead of fireEvent
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(multiSelect, { target: { value: "b" } })
    const match = screen.getByRole("option")
    // Select b
    await user.click(match)

    // Options list should only have c available - a & b selected
    const remainingOptions = screen.getAllByRole("option")
    expect(remainingOptions.length).toBe(1)
    expect(remainingOptions[0]).toHaveTextContent("c")

    expect(props.widgetMgr.setIntArrayValue).toHaveBeenCalledWith(
      props.element,
      [0, 1],
      {
        fromUi: true,
      },
      undefined
    )

    act(() => {
      // "Submit" the form
      props.widgetMgr.submitForm("form", undefined)
    })

    // Our widget should be reset, and the widgetMgr should be updated
    const expandListButton = screen.getAllByTitle("open")[0]
    await user.click(expandListButton)
    // Options list should only have b & c available - default a selected
    const updatedOptions = screen.getAllByRole("option")
    expect(updatedOptions.length).toBe(2)
    expect(updatedOptions[0]).toHaveTextContent("b")
    expect(updatedOptions[1]).toHaveTextContent("c")

    expect(props.widgetMgr.setIntArrayValue).toHaveBeenLastCalledWith(
      props.element,
      props.element.default,
      {
        fromUi: true,
      },
      undefined
    )
  })

  describe("properly invalidates going over max selections", () => {
    it("has correct noResultsMsg when maxSelections is not passed", async () => {
      const user = userEvent.setup()
      const props = getProps(
        MultiSelectProto.create({
          id: "1",
          label: "Label",
          default: [0],
          options: ["a", "b", "c"],
        })
      )
      render(<Multiselect {...props} />)

      // Type something with no matches
      const multiSelect = screen.getByRole("combobox")
      await user.type(multiSelect, "z")

      expect(screen.getByText("No results")).toBeInTheDocument()
    })

    it("has correct noResultsMsg when no match and selections < maxSelections", async () => {
      const user = userEvent.setup()
      const props = getProps(
        MultiSelectProto.create({
          id: "1",
          label: "Label",
          default: [0],
          options: ["a", "b", "c"],
          maxSelections: 3,
        })
      )
      render(<Multiselect {...props} />)

      // Type something with no matches
      const multiSelect = screen.getByRole("combobox")
      await user.type(multiSelect, "z")

      expect(screen.getByText("No results")).toBeInTheDocument()
    })

    it("has correct noResultsMsg when maxSelections reached", async () => {
      const user = userEvent.setup()
      const props = getProps(
        MultiSelectProto.create({
          id: "1",
          label: "Label",
          default: [0],
          options: ["a", "b", "c"],
          maxSelections: 2,
        })
      )
      render(<Multiselect {...props} />)

      // Select another option, b
      const multiSelect = screen.getByRole("combobox")
      // TODO: Utilize user-event instead of fireEvent
      // eslint-disable-next-line testing-library/prefer-user-event
      fireEvent.change(multiSelect, { target: { value: "b" } })
      const match = screen.getByRole("option")
      await user.click(match)

      expect(
        screen.getByText(
          "You can only select up to 2 options. Remove an option first."
        )
      ).toBeInTheDocument()
    })

    it("does not allow for more selection when an option is picked & maxSelections === 1", async () => {
      const user = userEvent.setup()
      const props = getProps(
        MultiSelectProto.create({
          id: "1",
          label: "Label",
          default: [0],
          options: ["a", "b", "c"],
          maxSelections: 1,
        })
      )
      render(<Multiselect {...props} />)

      const multiSelect = screen.getByRole("combobox")
      await user.click(multiSelect)

      expect(
        screen.getByText(
          "You can only select up to 1 option. Remove an option first."
        )
      ).toBeInTheDocument()
    })

    it("does allow an option to be removed when we are at max selections", async () => {
      const user = userEvent.setup()
      const props = getProps(
        MultiSelectProto.create({
          id: "1",
          label: "Label",
          default: [0, 1],
          options: ["a", "b", "c"],
          maxSelections: 2,
        })
      )
      render(<Multiselect {...props} />)

      // Clear a selection
      const deleteOptionButton = screen.getAllByTitle("Delete")[0]
      await user.click(deleteOptionButton)

      // Options list should only have a & c available - b selected
      const expandListButton = screen.getAllByTitle("open")[0]
      await user.click(expandListButton)
      const updatedOptions = screen.getAllByRole("option")
      expect(updatedOptions.length).toBe(2)
      expect(updatedOptions[0]).toHaveTextContent("a")
      expect(updatedOptions[1]).toHaveTextContent("c")
    })
  })
})
