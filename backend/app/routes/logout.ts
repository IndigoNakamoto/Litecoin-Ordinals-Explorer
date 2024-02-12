import express, { Request, Response } from 'express';

const router = express.Router();

// POST /logout - Clear session or token
router.post('/', (req: Request, res: Response) => {
    // Your logic to clear session or token goes here
    // For example, if using sessions:
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        return res.status(200).json({ message: 'Logout successful' });
    });
});

export default router;
