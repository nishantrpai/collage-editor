import type { Layout } from "./types"

export const defaultLayouts: Layout[] = [
  {
    id: "2x2",
    name: "2x2 Grid",
    areas: `
      "cell1 cell2"
      "cell3 cell4"
    `,
    cells: [{ id: "cell1" }, { id: "cell2" }, { id: "cell3" }, { id: "cell4" }],
    gap: 8,
  },
  {
    id: "1x3-2x1",
    name: "1x3-2x1",
    areas: `
      "cell1 cell1"
      "cell2 cell3"
    `,
    cells: [{ id: "cell1" }, { id: "cell2" }, { id: "cell3" }],
    gap: 8,
  },
  {
    id: "2x3",
    name: "2x3",
    areas: `
      "cell1 cell2 cell3"
      "cell4 cell5 cell6"
    `,
    cells: [{ id: "cell1" }, { id: "cell2" }, { id: "cell3" }, { id: "cell4" }, { id: "cell5" }, { id: "cell6" }],
    gap: 8,
  },
  {
    id: "2x3-alt",
    name: "2x3 Alt",
    areas: `
      "cell1 cell1 cell2"
      "cell3 cell4 cell2"
    `,
    cells: [{ id: "cell1" }, { id: "cell2" }, { id: "cell3" }, { id: "cell4" }],
    gap: 8,
  },
]

