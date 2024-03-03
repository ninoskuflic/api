// See https://github.com/typicode/json-server#module
const jsonServer = require('json-server')

const server = jsonServer.create()

// Uncomment to allow write operations
const fs = require('fs')
const path = require('path')
const filePath = path.join('db.json')
const data = fs.readFileSync(filePath, 'utf-8');
const db = JSON.parse(data);
const router = jsonServer.router(db)

// Comment out to allow write operations
// const router = jsonServer.router('db.json')

const middlewares = jsonServer.defaults({ static: path.join(__dirname, 'public') })

server.use(middlewares)
server.use(jsonServer.rewriter({
    // '/api/*': '/$1',
    '/quotes/:category': '/quotes?category=:category',
    '/billing/card/:type': '/billing?card_type=:type',
    '/tasks/category/:category': '/tasks?category=:category',
}))

// Configuration object for method restrictions
const methodRestrictions = {
    '/stoic': ['POST', 'PUT', 'DELETE', 'PATCH'],
    '/futurama': ['POST', 'PUT', 'DELETE', 'PATCH'],
    '/family-guy': ['POST', 'PUT', 'DELETE', 'PATCH'],
    '/the-simpsons': ['POST', 'PUT', 'DELETE', 'PATCH'],
    '/rick-and-morty': ['POST', 'PUT', 'DELETE', 'PATCH'],
    '/game-of-thrones': ['POST', 'PUT', 'DELETE', 'PATCH'],
    '/harry-potter': ['POST', 'PUT', 'DELETE', 'PATCH']
};

// Cache object to store route checks
const routeCache = {};

// Middleware to restrict methods dynamically
server.use((req, res, next) => {
    const url = req.originalUrl.split('?')[0]; // Get the path without query parameters

    // Check if the route is already cached
    if (routeCache[url]) {
        if (routeCache[url].includes(req.method)) {
            return res.status(403).json({ error: `We're sorry, but you do not have permission to perform the desired action (${req.method}).` });
        }
    } else {
        // Perform route check and cache the result
        for (const route in methodRestrictions) {
            if (url.startsWith(route)) {
                routeCache[url] = methodRestrictions[route];
                if (methodRestrictions[route].includes(req.method)) {
                    return res.status(403).json({ error: `We're sorry, but you do not have permission to perform the desired action (${req.method}).` });
                }
            }
        }
        routeCache[url] = null; // Cache the absence of restrictions
    }
    next();
});

// Custom route handler for /route/random
server.get('*/random', (req, res) => {
    let path = req.path.replace('/random', ''); // Remove '/random' from the request path
    if (path.charAt(0) === '/') {
        path = path.substring(1); // Remove the leading slash
    }
    const items = db[path];
    if (items && Array.isArray(items) && items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        const randomItem = items[randomIndex];
        res.json(randomItem);
    } else {
        res.status(404).json({ error: 'No data found for the specified path' });
    }
});

server.use(router)
server.listen(3000, () => {
    console.log('JSON Server is running')
})

// Export the Server API
module.exports = server