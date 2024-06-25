import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { user} from './schemas/user.schema';
import mongoose, { Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt'; // Import bcrypt for hashing passwords

@Injectable()
export class UserService {
    constructor(
        @InjectModel(user.name) private userModel: mongoose.Model<user>,
        @InjectModel('PendingUser') private pendingUserModel: mongoose.Model<user>,
      ) {}



      // Create a new pending user
      async create(userData: Partial<user>): Promise<user> {
        try {
          const newPendingUser = new this.pendingUserModel(userData);
          return await newPendingUser.save();
        } catch (error) {
          console.log(error);
          throw error;
        }
      }



      // Approve a pending user and move them to the regular user collection
      async approveUser(userId: string): Promise<user> {
        try {
          const pendingUser = await this.pendingUserModel.findById(userId);
          if (!pendingUser) {
            throw new Error('Pending user not found');
          }
    
          const user = new this.userModel(pendingUser.toObject());
          await user.save();
          await this.pendingUserModel.findByIdAndDelete(userId);
    
          return user;
        } catch (error) {
          console.log(error);
          throw error;
        }
      }



      // Delete a pending user by their ID
      async deletePendingUser(userId: string): Promise<user> {
        try {
          const deletedUser = await this.pendingUserModel.findByIdAndDelete(userId);
          if (!deletedUser) {
            throw new Error('Pending user not found');
          }
          return deletedUser;
        } catch (error) {
          console.log(error);
          throw error;
        }
      }


    // Get user notifications by their email address
    async getUserNotificationsByEmail(email: string): Promise<any[]> {
        try {
            // Find the user by email
            const user = await this.userModel.findOne({ email }).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Return the notifications array for the user
            return user.notifications;
        } catch (error) {
            console.error('Error retrieving user notifications by email:', error);
            throw error;
        }
    }


    // Get user ID by their email address
    async getUserIdByEmail(email: string): Promise<string> {
        // Query the database to find the user ID based on the email address
        const user = await this.userModel.findOne({ email: email }).exec();
        if (!user) {
            throw new Error('User not found');
        }
        return user._id;
    }



    // Create a notification for a user
    async createNotification(senderId: string, recipientId: string, message: string): Promise<void> {
        try {
            // Find sender and recipient users
            const sender = await this.userModel.findById(senderId);
            const recipient = await this.userModel.findById(recipientId);
            
            if (!sender || !recipient) {
                throw new NotFoundException('Sender or recipient not found');
            }
    
            // Generate a unique identifier for the notification
    
            // Create notification object with the generated UUID
            const notification = {
                sender: sender._id,
                recipient: recipient._id,
                message: message,
                createdAt: new Date()
            };
    
            // Add notification to recipient's notifications array
            recipient.notifications.push(notification);
    
            // Save changes to recipient user document
            await recipient.save();
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
    


    async removeNotificationByEmailAndTimestamp(email: string, message: string, createdAtDate: string): Promise<void> {
        try {
            // Find the user by email
            const user = await this.userModel.findOne({ email });
    
            if (!user) {
                throw new NotFoundException('User not found');
            }
    
            // Find the notification by message and createdAt
            const index = user.notifications.findIndex(notification =>
                notification.message === message && notification.createdAt.toISOString() === new Date(createdAtDate).toISOString());
    
            if (index === -1) {
                throw new NotFoundException('Notification not found');
            }
    
            // Remove the notification from the array
            user.notifications.splice(index, 1);
    
            // Save changes to user document
            await user.save();
        } catch (error) {
            console.error('Error removing notification:', error);
            throw error;
        }
    }
    

    
    
    
    





    async getAllNotifications(userId: string): Promise<any[]> {
        try {
            // Find the user by ID
            const user = await this.userModel.findById(userId);

            // If user not found, throw NotFoundException
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Return the notifications of the user
            return user.notifications;
        } catch (error) {
            console.error('Error retrieving notifications:', error);
            throw error;
        }
    }





    async updateNotificationSettings(email: string, isEnabled: boolean): Promise<void> {
        try {
            // Find the user by email
            const user = await this.userModel.findOne({ email }).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Update the notification setting
            user.notificationsEnabled = isEnabled;

            // Save the updated user document
            await user.save();
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }



    async getNotificationSettingsByEmail(email: string): Promise<any> {
    try {
        // Query the database to find the user's notification settings based on the email address
        const user = await this.userModel.findOne({ email: email }).exec();
        if (!user) {
            throw new Error('User not found');
        }
        // Return the user's notification settings
        return { notificationsEnabled: user.notificationsEnabled };
    } catch (error) {
        console.error('Error retrieving user notification settings:', error);
        throw error;
    }
}



    /* admin code    ---------  */

    

    


    async findAllPending(): Promise<user[]> {
        return this.pendingUserModel.find().exec();
      }


    async findAll(): Promise<user[]> {
        return this.userModel.find().exec();
      }

      
      async deleteUsers(userId: string): Promise<void> {
        try {
          // Find the user by ID and delete it from the database
          await this.userModel.findByIdAndDelete(userId).exec();
        } catch (error) {
          // Handle any errors that occur during deletion
          throw new Error(`Failed to delete user with ID ${userId}`);
        }
      }

      async updateUser(userId: string, updatedUserData: Partial<user>): Promise<user> {
        // Find the user by ID
        const user = await this.userModel.findById(userId);
    
        // If user not found, throw NotFoundException
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        // Update the user with the provided data
        Object.assign(user, updatedUserData);
    
        // Save the updated user
        return await user.save();
      }








    /* ---------------      */






    async findByEmailAndPassword(email: string, password: string): Promise<user | null> {
        return await this.userModel.findOne({ email, password }).exec();
    }

    async findByEmail(email: string): Promise<user | null> {
        return await this.userModel.findOne({ email }).exec();
    }
    



    async findById(userId: string): Promise<user | null> {
        try {
            // Validate userId
            if (!Types.ObjectId.isValid(userId)) {
                throw new NotFoundException('Invalid user ID');
            }

            const objectId = new Types.ObjectId(userId);
            const user = await this.userModel.findById(objectId);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }


    async verifyToken(token: string, session: Record<string, any>): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            jwt.verify(token, 'OZPKEZELQLEQZKLEMLZMELMQLEMQZ', async (err, decoded: any) => {
                if (err) {
                    // Handle the invalid token error here
                    console.error('Error verifying token:', err);
                    resolve(false); // Return false or handle the error as needed
                } else {
                    // Token verification successful, additional validation logic can be added here
                    resolve(true);
                }
            });
        });
    }



    async getUserInfo(userId: string): Promise<any> {
        try {
            // Find the user by user ID
            const existingUser = await this.userModel.findById(userId);
            if (!existingUser) {
                throw new NotFoundException('User not found');
            }
    
            // Extract the required user information
            const userInfo = {
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                department: existingUser.department
            };
    
            return userInfo;
        } catch (error) {
            console.error('Error retrieving user information:', error);
            throw error;
        }
    }




    async getUserInfoById(userId: string): Promise<any> {
        try {
            // Find the user by user ID
            const existingUser = await this.userModel.findById(userId);
            if (!existingUser) {
                throw new NotFoundException('User not found');
            }
    
            // Extract the required user information
            const userInfo = {
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                department: existingUser.department
            };
    
            return userInfo;
        } catch (error) {
            console.error('Error retrieving user information:', error);
            throw error;
        }
    }
    
    
    



    async updatePassword(userId: string, newPassword: string): Promise<void> {
        try {
            // Hash the new password before updating
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Find the user by ID
            const userToUpdate = await this.userModel.findById(userId);

            // If user not found, throw an error
            if (!userToUpdate) {
                throw new Error('User not found');
            }

            // Update the user's password with the hashed password
            userToUpdate.password = hashedPassword;

            // Save the updated user
            await userToUpdate.save();
        } catch (error) {
            throw new Error(`Failed to update password: ${error.message}`);
        }
    }


    


    



    async deleteUser(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id).exec();
    }



    async getUser(userId: string): Promise<user | null> {
        try {
            // Validate userId
            if (!Types.ObjectId.isValid(userId)) {
                throw new NotFoundException('Invalid user ID');
            }
    
            const objectId = new Types.ObjectId(userId);
            const user = await this.userModel.findById(objectId);
    
            if (!user) {
                throw new NotFoundException('User not found');
            }
    
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

}
