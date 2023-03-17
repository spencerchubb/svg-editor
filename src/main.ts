import './style.css';

export { };

type AttributeValue = string | number;

type HTMLAttribute = {
  type: string,
  value: AttributeValue,
};

type HTMLObj = {
  tag: string,
  id: string,
  value?: HTMLAttribute,
  cx?: HTMLAttribute,
  cy?: HTMLAttribute,
  r?: HTMLAttribute,
  rx?: HTMLAttribute,
  ry?: HTMLAttribute,
  x?: HTMLAttribute,
  y?: HTMLAttribute,
  x1?: HTMLAttribute,
  y1?: HTMLAttribute,
  x2?: HTMLAttribute,
  y2?: HTMLAttribute,
  width?: HTMLAttribute,
  height?: HTMLAttribute,
  stroke?: HTMLAttribute,
  "stroke-width"?: HTMLAttribute,
  d?: HTMLAttribute,
  points?: HTMLAttribute,
  fill?: HTMLAttribute,
};

function iterAttributes(obj: HTMLObj, callback: (key: string, attribute: HTMLAttribute) => void): any[] {
  if (!obj) return [];
  return Object.keys(obj).map(key => {
    if (key === "tag" || key === "id") return;
    return callback(key, (obj as any)[key]);
  });
}

function getSelectedSVG(): HTMLObj {
  return state.svgData[state.editData.selectedSVG];
}

/** Array.findIndex() returns -1 if not found. */
const NO_SVG_SELECTED = -1;

type State = {
  svgData: HTMLObj[],
  editData: {
    selectedSVG: number,
  },
};

let state: State = {
  svgData: [],
  editData: {
    selectedSVG: NO_SVG_SELECTED,
  },
};

const copyButton = document.querySelector("#copy") as HTMLElement;
const svgContainer = document.querySelector("#svgContainer") as HTMLElement;
const editContainer = document.querySelector("#editContainer") as HTMLElement;

function renderSvg() {
  console.log("renderSVG", state.svgData);
  svgContainer.innerHTML = getSvgString((obj: HTMLObj) => {
    // hack?
    (obj as any)["stroke"] = "deepskyblue";
    (obj as any)["stroke-width"] = 2;
  });
}

svgContainer.addEventListener("click", (event) => {
  const id = (event.target as HTMLElement).id;
  const index = state.svgData.findIndex(ele => ele.id === id);

  state.editData.selectedSVG = index;

  renderSvg();
  renderEdit();
});

const shapes: HTMLObj[] = [
  {
    tag: "circle",
    id: "",
    cx: {
      type: "number",
      value: 25,
    },
    cy: {
      type: "number",
      value: 25,
    },
    r: {
      type: "number",
      value: 25,
    },
  },
  {
    tag: "ellipse",
    id: "",
    cx: {
      type: "number",
      value: 50,
    },
    cy: {
      type: "number",
      value: 25,
    },
    rx: {
      type: "number",
      value: 50,
    },
    ry: {
      type: "number",
      value: 25,
    },
  },
  {
    tag: "line",
    id: "",
    x1: {
      type: "number",
      value: 0,
    },
    y1: {
      type: "number",
      value: 0,
    },
    x2: {
      type: "number",
      value: 25,
    },
    y2: {
      type: "number",
      value: 25,
    },
    stroke: {
      type: "text",
      value: "black",
    },
    "stroke-width": {
      type: "number",
      value: 3,
    },
  },
  {
    tag: "path",
    id: "",
    d: {
      type: "text",
      value: `M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z`,
    },
  },
  {
    tag: "polygon",
    id: "",
    points: {
      type: "text",
      value: "0,100 50,25 50,75 100,0",
    },
  },
  {
    tag: "polyline",
    id: "",
    points: {
      type: "text",
      value: "0,100 50,25 50,75 100,0",
    },
    fill: {
      type: "text",
      value: "none",
    },
    stroke: {
      type: "text",
      value: "black",
    },
    ["stroke-width"]: {
      type: "number",
      value: 3,
    },
  },
  {
    tag: "rect",
    id: "",
    x: {
      type: "number",
      value: 0,
    },
    y: {
      type: "number",
      value: 0,
    },
    width: {
      type: "number",
      value: 100,
    },
    height: {
      type: "number",
      value: 50,
    },
    rx: {
      type: "number",
      value: 10,
    },
    ry: {
      type: "number",
      value: 10,
    },
  },
];

function renderEdit() {
  console.log("renderEdit", state.editData);
  const htmlObj = getSelectedSVG();
  const controls = htmlObj
    ? iterAttributes(htmlObj, (key, attribute) => {
      return `<p>${key}</p>
        ${getHtmlString({
        tag: "input",
        id: key,
        value: attribute,
      })}`;
    }).join("")
    : [];
  editContainer.innerHTML = `
  <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
    ${shapes.map(shape => `
      <button id="add${shape.tag}">Add ${shape.tag}</button>
    `).join("")}
  </div>
  <div style="height: 12px;"></div>
  ${htmlObj ? `<button id="delete">Delete ${htmlObj.tag}</button>` : ""}
  <div style="height: 12px;"></div>
  ${controls}
  `;
}

editContainer.addEventListener("click", (event) => {
  const id = (event.target as HTMLElement).id;

  const shapeStr = getShapeFromID(id);
  if (shapeStr) {
    let shape = shapes.find(shape => shape.tag === shapeStr);
    // deep copy so we don't modify the original
    shape = JSON.parse(JSON.stringify(shape));
    if (!shape) {
      console.error("no shape with tag:", shapeStr);
      return;
    }
    shape.id = getRandID();
    state.svgData.push(shape);
    state.editData.selectedSVG = state.svgData.length - 1;
    renderSvg();
    renderEdit();
    return;
  }

  if (id === "delete") {
    const elementID = state.svgData[state.editData.selectedSVG].id;
    state.svgData = state.svgData.filter(ele => ele.id !== elementID);
    state.editData.selectedSVG = NO_SVG_SELECTED;
    renderSvg();
    renderEdit();
    return;
  }
});
editContainer.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  const id = target.id;
  const value = target.value;
  const elementID = getSelectedSVG().id;
  const ele = state.svgData.find(ele => ele.id === elementID);
  if (!ele) {
    console.error("no element with id:", elementID);
    return;
  }
  // hack?
  (ele as any)[id].value = value;
  renderSvg();
});

copyButton.addEventListener("click", () => {
  const text = getSvgString(() => { });
  navigator.clipboard.writeText(text)
    .then(() => {
      alert("SVG code copied!\n" + text);
    }).catch((err) => {
      alert("Copy failed 😢\n" + err);
    });
});

function getSvgString(_: (obj: HTMLObj) => void) {
  const out = `<svg>${state.svgData.map(ele => {
    const htmlObj = { ...ele };

    // if (state.editData && ele.id === state.editData.id) {
    //   onSelected(htmlObj);
    // }

    return getHtmlString(htmlObj);
  }).join("")}</svg>`;
  // console.log({ out });
  return out;
}

function getHtmlString(element: HTMLObj) {
  const tag = element.tag;
  const id = element.id ? `id="${element.id}"` : "";
  const out = `<${tag} ${id} ${iterAttributes(element, (key, attribute) => {
    return `${key}="${attribute.value}"`;
  }).join(" ")}></${tag}>`;
  // console.log({ out });
  return out;
}

// Returns the shape from the ID if it is a shape, or false if it is not a shape.
function getShapeFromID(id: string) {
  if (id.length <= 3) return false;
  if (id.substring(0, 3) !== "add") return false;
  return id.substring(3);
}

/**
 * Generates an ID with "good enough" randomness.
 * Highly unlikely that it will generate the same ID twice.
 */
function getRandID() {
  return Math.floor(Math.random() * Date.now()).toString(16)
}

renderSvg();

renderEdit();
