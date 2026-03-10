import { router } from "../server/routes/ar.js"; // Or appropriately compiled path
// wait, since it's typescript, let's just write a ts script and run it with tsx!
import arRouter from "../server/routes/ar";

const routes = [];
arRouter.stack.forEach(layer => {
    if (layer.route) {
        routes.push({
            path: layer.route.path,
            methods: Object.keys(layer.route.methods)
        });
    }
});

console.log("REGISTERED AR ROUTES:");
console.dir(routes, { maxArrayLength: null });
