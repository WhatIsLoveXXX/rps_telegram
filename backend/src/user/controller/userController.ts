import { Request, Response } from 'express';
import { UserService } from '../service/userService';

/**
 * Controller handling user-related operations such as authorization, wallet updates,
 * balance top-up, and withdrawal.
 */
export class UserController {
    /**
     * Authorizes a user. If the user already exists, responds with 200 OK.
     * Otherwise, creates a new user and responds with 201 Created.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @returns JSON response indicating authorization status or error
     */
    static async authorize(req: Request, res: Response) {
        const user = res.locals.initData?.user;
        const userId = user.id;
        const firstName = user.first_name;
        const lastName = user.last_name;
        const photoUrl = user.photo_url;
        const username = user.username;

        const isUserExists = await UserService.isExist(userId);

        if (isUserExists) {
            return res.status(200).json({ message: 'Authorized' });
        }

        try {
            const user = await UserService.createUser(userId, username, firstName, lastName, photoUrl);
            return res.status(201).json({ message: 'User created from Telegram', user });
        } catch (err) {
            console.error('Failed to create user:', err);
            return res.status(401).json({ error: err });
        }
    }

    /**
     * Updates the user's wallet address.
     *
     * @param req - Express request object (expects `walletAddress` in the body)
     * @param res - Express response object
     * @returns JSON response indicating success or error
     */
    static async updateWallet(req: Request, res: Response) {
        try {
            const userId = res.locals.initData?.user?.id;
            const { walletAddress } = req.body;
            await UserService.updateWallet(userId, walletAddress);
            return res.status(201).json({ message: 'Wallet was updated for', userId });
        } catch (err) {
            console.error('Failed to update wallet:', err);
            return res.status(400).json({ error: 'Internal server error' });
        }
    }

    /**
     * Retrieves a user by their Telegram user ID.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @returns JSON response with user data or error
     */
    static async getUserById(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;

        try {
            const user = await UserService.getUserById(userId, true);
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json(user);
        } catch (err) {
            console.error('Failed to get user by ID:', err);
            return res.status(400).json({ error: 'Failed to get user by ID:', userId });
        }
    }

    /**
     * Tops up a user's balance with a given amount and BOC (Bag of Cells).
     *
     * @param req - Express request object (expects `amount` and `boc` in the body)
     * @param res - Express response object
     * @returns JSON response with updated user data or error
     */
    static async topUpBalance(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { amount, boc } = req.body;

        if (!userId || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid userId or amount' });
        }

        try {
            const user = await UserService.topUpBalance(userId, amount, boc);
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json({ message: `Balance topped up by ${amount}`, user });
        } catch (err) {
            console.error('Top up error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Withdraws a specified amount from the user's balance.
     *
     * @param req - Express request object (expects `amount` in the body)
     * @param res - Express response object
     * @returns JSON response with updated user data or error
     */
    static async withdrawBalance(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { amount } = req.body;

        try {
            const result = await UserService.withdrawBalance(userId, amount);
            if (typeof result === 'string') {
                return res.status(400).json({ error: result });
            }

            return res.json({ message: `Balance withdrawn by ${amount}`, user: result });
        } catch (err) {
            console.error('Withdraw error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
