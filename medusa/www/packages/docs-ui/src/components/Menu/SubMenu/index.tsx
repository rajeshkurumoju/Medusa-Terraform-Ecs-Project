"use client"

import React, { useState } from "react"
import { Menu, MenuProps } from ".."
import clsx from "clsx"
import { MenuItemSubMenu } from "types"
import { ChevronRight } from "@medusajs/icons"

type MenuSubMenuProps = Pick<MenuProps, "itemsOnClick"> & {
  item: MenuItemSubMenu
}

export const MenuSubMenu = ({ item, itemsOnClick }: MenuSubMenuProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="px-docs_0.25 relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className={clsx(
          "flex py-docs_0.25 px-docs_0.5",
          "gap-docs_0.5 rounded-docs_xs",
          "hover:bg-medusa-bg-component-hover",
          "text-medusa-fg-base justify-between"
        )}
        onClick={() => itemsOnClick?.(item)}
      >
        <span className="text-compact-small">{item.title}</span>
        <span className="text-medusa-fg-subtle mt-[2.5px] block">
          <ChevronRight />
        </span>
      </span>
      {open && (
        <div className="absolute top-0 left-[calc(100%-8px)] w-max">
          <Menu itemsOnClick={itemsOnClick} items={item.items} />
        </div>
      )}
    </div>
  )
}
