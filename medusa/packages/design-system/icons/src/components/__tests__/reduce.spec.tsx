  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Reduce from "../reduce"

  describe("Reduce", () => {
    it("should render the icon without errors", async () => {
      render(<Reduce data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })