import express, { Request, Response } from 'express';

const router = express.Router();

// GET /users - Fetch all users
router.get('/', (req: Request, res: Response) => {
    // Your logic to fetch all users goes here
    // For demonstration purposes, let's send a dummy response
    const users = [{ id: 1, name: 'John', email: 'john@gmail.com' }, { id: 2, name: 'Jane', email: 'jane@gmail.com' }];
    res.json(users);
});

// POST /users - Create a new user
router.post('/', (req: Request, res: Response) => {
    // Your logic to create a new user goes here
    // For demonstration purposes, let's send a dummy response with the created user
    const newUser = req.body; // Assuming the user data is sent in the request body
    res.status(201).json(newUser); // Respond with the created user
});

export default router;