import customExpress from './src/config/customExpress';
import  * as dotenv from "dotenv-safe";
dotenv.config();

// const customExpress = require('./src/config/customExpress');
// require("dotenv-safe").config();

const init = async () => {
    const consign = await import('consign');
    const port = 8080;
    const app = customExpress(consign.default);

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`)
    });
}


init();