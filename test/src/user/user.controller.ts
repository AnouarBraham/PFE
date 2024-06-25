import { Body, Controller, Post, Get, Session, Res, NotFoundException,Delete, Param, Query, Put, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { user } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'; // Import JWT library




@Controller('user')
export class UserController {
    userModel: any;
    constructor(private userService: UserService) {}



    // Endpoint for user signup
    @Post('signup')
    async signUp(
    @Body() userData: user,
    @Res() res: Response,
    ): Promise<any> {
    try {
        // Check if the email is already in use
        const existingUser = await this.userService.findByEmail(userData.email);
        if (existingUser) {
            // If email is already in use, return a 409 Conflict status
            return res.status(409).json({ message: 'Email is already in use' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userWithHashedPassword = { ...userData, password: hashedPassword };

        // Create a new user and send verification email
        const createdUser = await this.userService.create(userWithHashedPassword);

        return res.status(201).json({ message: 'User created successfully', user: createdUser });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Failed to create user' });
        }
    }


    @Post('signin')
    async signIn(
    @Body() userData: { email: string, password: string, sessionToken: string },
    @Session() session: Record<string, any>, // Add this parameter to get access to the session object
    @Res() res: Response,
    ): Promise<any> {
    try {
        // Verify the session token
        const tokenValid = await this.userService.verifyToken(userData.sessionToken, session);
        if (!tokenValid) {
            return res.status(401).send({ message: 'Invalid or expired token' });
        }

        // Check if there's an existing session

        if (session.user) {
            return res.send({ message: 'Already logged in', token: session.token });
        }

        // Proceed with login using credentials
        const user = await this.userService.findByEmail(userData.email);

        // Check if the user exists and if the password matches
        if (user && await bcrypt.compare(userData.password, user.password)) {
            // Generate session token
            const token = jwt.sign({ userId: user._id }, 'OZPKEZELQLEQZKLEMLZMELMQLEMQZ', { expiresIn: '1h' });

            // Set session properties
            session.user = user;
            session.token = token;

            // Return response with session token
            return res.send({ message: 'Login successful!', token });
        } else {
            // User not found or password does not match
            return res.status(401).send({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).send({ message: 'Internal server error' });
        }
    }


    // Endpoint to approve a pending user
    @Put('approve/:id')
    async approveUser(@Param('id') id: string): Promise<user> {
    return this.userService.approveUser(id);
    }


    // Endpoint to send a notification
    @Post('send-notification')
    async sendNotification(
        @Body() notificationData: { senderEmail: string, recipientEmail: string, message: string },
        @Res() res: Response
    ): Promise<void> {
        try {
            // Retrieve user IDs based on email addresses
            const senderId = await this.userService.getUserIdByEmail(notificationData.senderEmail);
            const recipientId = await this.userService.getUserIdByEmail(notificationData.recipientEmail);

            // Call the service method to create and send notification
            await this.userService.createNotification(senderId, recipientId, notificationData.message);

            // Send success response
            res.status(200).json({ message: 'Notification sent successfully' });
        } catch (error) {
            // Handle errors
            console.error('Error sending notification:', error);
            res.status(500).json({ message: 'Failed to send notification' });
        }
    }



    // Endpoint to remove a notification by email, message, and timestamp
    @Delete('remove-notification/:email/:message/:createdAt') // Update route parameter
    async removeNotification(
        @Param('email') email: string,
        @Param('message') message: string,
        @Param('createdAt') createdAt: string,
        @Res() res: Response
    ): Promise<void> {
        try {

            // Call the service method to remove the notification
            await this.userService.removeNotificationByEmailAndTimestamp(email, message, createdAt);
            
            res.status(HttpStatus.OK).json({ message: 'Notification removed successfully' });
        } catch (error) {
            console.error('Error removing notification:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to remove notification' });
        }
    }







    // Endpoint to get user notifications by email
    @Get('notifications')
    async getUserNotificationsByEmail(@Query('email') email: string, @Res() res: Response): Promise<void> {
        try {
            // Get the user's notifications and notification settings
            const notifications = await this.userService.getUserNotificationsByEmail(email);
            const notificationSettings = await this.userService.getNotificationSettingsByEmail(email);

            // Check if notifications are enabled for the user
            if (notificationSettings.notificationsEnabled) {
                // Return notifications only if notifications are enabled
                res.status(HttpStatus.OK).json(notifications);
            } else {
                // Return an empty array if notifications are not enabled
                res.status(HttpStatus.OK).json([]);
            }
        } catch (error) {
            // Handle errors
            console.error('Error retrieving user notifications:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to retrieve user notifications' });
        }
    }


    // Endpoint to update notification settings for a user
    @Post('update-notification-settings')
    async updateNotificationSettings(@Body('email') email: string, @Body('isEnabled') isEnabled: boolean) {
        await this.userService.updateNotificationSettings(email, isEnabled);
        return { message: 'Notification settings updated successfully' };
    }




    @Get("getusers")
    async findAll(): Promise<user[]> {
    return this.userService.findAll();
    }

    @Get("getusersPending")
    async findAllPending(): Promise<user[]> {
    return this.userService.findAllPending();
    }


    @Delete('delete/:userId')
    async deleteUser(@Param('userId') userId: string, @Res() res: Response): Promise<void> {
      try {
        // Call the deleteUser method from the UserService to delete the user
        await this.userService.deleteUsers(userId);
        // Return a success message if the user is deleted successfully
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        // If the user is not found, throw a NotFoundException
        if (error instanceof NotFoundException) {
          res.status(404).json({ message: error.message });
        } else {
          // Handle other errors
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    }

    @Delete('pending/:id')
    async deletePendingUser(@Param('id') id: string): Promise<user> {
      return this.userService.deletePendingUser(id);
    }

    
    @Put('update/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updatedUserData: Partial<user>,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Call the updateUser method from the UserService to update the user
      const updatedUser = await this.userService.updateUser(userId, updatedUserData);
      
      // Return the updated user
      res.status(200).json(updatedUser);
    } catch (error) {
      // If the user is not found, throw a NotFoundException
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        // Handle other errors
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }




    @Get('role')
    async getUserRoleByEmail(@Query('email') email: string, @Res() res: Response) {
        try {
            // Query the database using the provided email to get the user's details including the role
            const user = await this.userService.findByEmail(email);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Return the user's role
            return res.send({ role: user.role });
        } catch (error) {
            // Handle errors
            console.error('Error retrieving user role:', error);
            return res.status(500).send({ error: 'Failed to retrieve user role' });
        }
    }










    /*                         ------------------   */





@Get('getUser')
    async getUser(@Session() session: Record<string, any>) {
        try {
            // Retrieve the userID from the session
            const userId = session.user._id;

            // Query the database using the userID
            const user = await this.userService.findById(userId);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Update the user in the session
            session.user = user;

            // Return the updated user
            return user;
        } catch (error) {
            // Handle errors
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }
    


    

    @Get('home')
    getHome(@Session() session: Record<string, any>) {
        // Retrieve the userId from the session
        // Retrieve the user
        // Return name
        console.log(session.user);
    }

    @Get('logout')
    async logout(@Session() session: Record<string, any>, @Res() res: Response) {
        try {
            session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    res.status(500).send('Failed to log out');
                } else {
                    session = null;
                }
            });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).send('Failed to log out');
        } finally {
            res.clearCookie('connect.sid', { path: '/' });
            res.send("");
        }
    }



    @Get('session-token')
    async getSessionToken(@Session() session: Record<string, any>) {
 
    // Generate session token with user ID as payload
    const token = jwt.sign({ session }, 'OZPKEZELQLEQZKLEMLZMELMQLEMQZ', { expiresIn: '1h' });

    return { sessionToken: token };
}




@Get('userId')
    getUserId(@Session() session: Record<string, any>): string {
        try {
            // Check if the user is logged in
            if (!session.user) {
                throw new NotFoundException('User not logged in');
            }

            // Retrieve the userID from the session
            const userId = session.user._id;

            return userId;
        } catch (error) {
            // Handle errors
            throw new NotFoundException(`Failed to get user ID: ${error.message}`);
        }
    }



    
    @Get('userInfo')
    async getUserInfo(@Session() session: Record<string, any>, @Res() res: Response): Promise<any> {
        try {
            // Check if the user is logged in
            if (!session.user) {
                throw new NotFoundException('User not logged in');
            }

            // Retrieve the user ID from the session
            const userId = session.user._id;

            // Query the database using the user ID
            const userInfo = await this.userService.getUserInfo(userId);

            // Return the user information
            return res.send(userInfo);
        } catch (error) {
            // Handle errors
            console.error('Error retrieving user information:', error);
            return res.status(500).send({ error: 'Failed to retrieve user information' });
        }
    }



    @Get('userinfobyid/:userId')
  async getUserInfoById(@Param('userId') userId: string) {
    try {
      const userInfo = await this.userService.getUserInfoById(userId);
      return userInfo;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }





    @Post('changePassword')
    async changePassword(
        @Body('newPassword') newPassword: string,
        @Session() session: Record<string, any>, 
        @Res() res: Response,
    ): Promise<any> {
        try {
            // Ensure newPassword is not empty
            if (!newPassword) {
                return res.status(400).send({ message: 'New password is required' });
            }

            // Retrieve userId from session
            const userId = session.user._id;

            // Update password
            await this.userService.updatePassword(userId, newPassword);
            return res.send({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            return res.status(500).send({ message: 'Failed to change password' });
        }
    }








@Delete('delete')
async deleteCurrentUser(
    @Body('password') password: string, 
    @Session() session: Record<string, any>, 
    @Res() res: Response
): Promise<void> {
    try {
        // Check if user is logged in
        if (!session || !session.user || !session.user._id) {
            res.status(401).send('User is not logged in');
            return;
        }

        // Check if the password is provided in the request body
        if (!password) {
            res.status(400).send('Password is required for account deletion');
            return;
        }

        // Retrieve the user ID and the hashed password from the session
        const userId = session.user._id;
        const user = await this.userService.getUser(userId);

        // Verify if the provided password matches the user's actual password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).send('Incorrect password. Account deletion failed.');
            return;
        }

        // Delete the user account based on the user ID
        await this.userService.deleteUser(userId);

        // Log out the user after successful deletion
        session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Failed to log out');
            } else {
                res.clearCookie('connect.sid', { path: '/' });
                res.send({ message: 'Account deleted successfully' });
            }
        });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).send('Failed to delete account');
    }
}


}
