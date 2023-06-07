const defaultAttributes = {
    stroke: "black",
    strokeWidth: 1,
    fill: "none",
    fillOpacity: 1.0
}

class SVGAttributes {
    constructor(args = defaultAttributes) {
        for(const property in args) {
            this[property] = args[property]
        }
        this.stroke = args.stroke || defaultAttributes.stroke
        this.strokeWidth = args.strokeWidth || defaultAttributes.strokeWidth
        this.fill = args.fill || defaultAttributes.fill
        this.fillOpacity = args.fillOpacity || defaultAttributes.fillOpacity
    }

    toAttributesString() {
        return Object.keys(this)
            .reduce( (acc, key) =>
                    acc + (this[key] !== undefined ? this.toAttrString(key, this[key]) : "")
            , ``)
    }

    toAttrString(key, value) {
        const SVGKey = key === "className" ? "class" : this.convertCamelToKebabCase(key);
        return value === null ? `${SVGKey} ` : `${SVGKey}="${value.toString()}" `
    }

    convertCamelToKebabCase(str) {
        return str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .join('-')
            .toLowerCase();
    }
}

export function convertToString(attrs) {
    return new SVGAttributes(attrs).toAttributesString()
}

export default SVGAttributes