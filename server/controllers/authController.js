import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId, username) => {
  return jwt.sign(
    { id: userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password, age, gender, country } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Hash password with strong salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      age: age || null,
      gender: gender || 'Other',
      country: country || 'Unknown',
      isOnline: false
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.username);

    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      age: user.age,
      country: user.country
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last seen
    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.username);

    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      age: user.age,
      country: user.country
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed: ' + error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must contain uppercase, lowercase, number, and special character' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Find user and verify current password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Change password failed: ' + error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name && name.trim()) {
      const trimmedName = name.trim();
      
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' });
      }

      if (trimmedName.length > 50) {
        return res.status(400).json({ message: 'Name must be less than 50 characters' });
      }

      user.username = trimmedName;
    }

    await user.save();

    // Return updated user data
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      age: user.age,
      country: user.country
    };

    res.json({ 
      message: 'Profile updated successfully',
      user: userData 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Update profile failed: ' + error.message });
  }
};
