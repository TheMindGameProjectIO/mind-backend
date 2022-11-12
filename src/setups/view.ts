import {create} from "express-handlebars";

const hbs = create({
    layoutsDir: 'public/views/layouts',
    defaultLayout: 'main',
    extname: 'handlebars'
});

export default hbs