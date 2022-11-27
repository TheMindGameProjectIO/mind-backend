import hbs from "@/setups/view"
import { HbsTemplate } from "./enum"

export const render = (template: HbsTemplate, data: any) => {
    return hbs.render(`./public/views/${template}.handlebars`, data)
}