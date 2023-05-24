
const CSSStyleMap = {
    stroke: "stroke",
    strokeWidth: "stroke-width",
    strokeDasharray: "stroke-dasharray",
    fill: "fill",
    fillOpacity: "fill-opacity",
    id: "id",
    className: "class"
}

const defaultAttributes = {
    stroke: "black",
    strokeWidth: 1,
    strokeDasharray: "",
    fill: "none",
    fillOpacity: 0.8
}

class SVGAttributes {
    constructor(args = defaultAttributes) {
        for(const property in args) {
            this[property] = args[property]
        }
        this.stroke = args.stroke ?? defaultAttributes.stroke
        this.strokeWidth = args.strokeWidth ?? defaultAttributes.strokeWidth
        this.strokeDasharray = args.strokeDasharray ?? defaultAttributes.strokeDasharray
        this.fill = args.fill ?? defaultAttributes.fill
        this.fillOpacity = args.fillOpacity ?? defaultAttributes.fillOpacity
    }

    toJSON() {
        let attrCSSStyle = Object.keys(this)
            .reduce( (acc, key) =>
                    acc + (this[key] ? `${CSSStyleMap[key]}="${this[key]}" ` : "")
            , "")
        return attrCSSStyle
    }
}

// let attr = new SVGAttributes()
// console.log(typeof attr, attr)
//
// console.log(JSON.stringify(attr))
// attr2 = {...attr, strokeWidth: 3}
// console.log(typeof attr2, attr2)
// console.log(JSON.stringify(attr2))

export default SVGAttributes