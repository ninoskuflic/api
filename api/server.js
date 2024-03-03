// See https://github.com/typicode/json-server#module
const jsonServer = require('json-server')

const server = jsonServer.create()

// Uncomment to allow write operations
const fs = require('fs')
const path = require('path')
const filePath = path.join('db.json')
const data = fs.readFileSync(filePath, "utf-8");
const db = JSON.parse(data);
const router = jsonServer.router(db)

// Comment out to allow write operations
// const router = jsonServer.router('db.json')

const middlewares = jsonServer.defaults({ static: path.join(__dirname, 'public') })

server.use(middlewares)
// Add this before server.use(router)
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
    '/harry-potter': ['POST', 'PUT', 'DELETE', 'PATCH'],
};

// Middleware to restrict methods dynamically
server.use((req, res, next) => {
    const path = req.originalUrl.split('?')[0]; // Get the path without query parameters
    if (methodRestrictions[path] && methodRestrictions[path].includes(req.method)) {
        res.sendStatus(403); // Forbidden
    } else {
        next();
    }
});

server.use(router)
server.listen(3000, () => {
    console.log('JSON Server is running')
})

// Export the Server API
module.exports = server