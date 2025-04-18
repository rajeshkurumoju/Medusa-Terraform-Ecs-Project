  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Brackets from "../brackets"

  describe("Brackets", () => {
    it("should render the icon without errors", async () => {
      render(<Brackets data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })