const User = require('../models/User');
const Result = require('../models/Result');
const { isConnected } = require('../config/database');

// In-memory store for development without MongoDB
const mockUsers = new Map();

const syncUser = async (req, res) => {
  try {
    let { uid, name, email, photoURL, phone } = req.body;
    const hasName = typeof name === 'string' && name.trim().length > 0;
    const defaultName = hasName ? name.trim() : email || phone || 'User';
    
    // If MongoDB is not connected, return mock user
    if (!isConnected()) {
      // Only mankumishar0@gmail.com can be super_admin
      const isSuperAdminEmail = email === 'mankumishar0@gmail.com';
      const mockUser = {
        id: 'mock-' + uid,
        uid: uid,
        name: hasName ? name.trim() : 'Test User',
        email: email || 'test@example.com',
        role: isSuperAdminEmail ? 'super_admin' : 'student', // Default to student unless specific email
        isBlocked: false,
        photoURL: photoURL || null,
        phone: phone || null
      };
      mockUsers.set(uid, mockUser);
      return res.status(200).json({
        success: true,
        user: mockUser
      });
    }
    
    // Only mankumishar0@gmail.com can be super_admin
    const isSuperAdminEmail = email === 'mankumishar0@gmail.com';
    
    let user = await User.findOne({ uid });
    
    if (user) {
      if (!user.name && hasName) {
        user.name = name.trim();
      }
      user.email = email || user.email;
      user.photoURL = photoURL || user.photoURL;
      user.phone = phone || user.phone;
      user.lastLogin = new Date();
      // Update role if email matches super admin
      if (isSuperAdminEmail) {
        user.role = 'super_admin';
      }
      await user.save();
    } else {
      user = await User.create({
        uid,
        name: defaultName,
        email,
        photoURL,
        phone,
        role: isSuperAdminEmail ? 'super_admin' : 'student'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      let users = Array.from(mockUsers.values());
      if (role) users = users.filter(u => u.role === role);
      if (search) {
        users = users.filter(u => 
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res.status(200).json({ success: true, users });
    }
    
    let query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query).select('-__v').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['student', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      // Find user by id (which could be mock-uid or just uid)
      let user = null;
      for (const [uid, u] of mockUsers.entries()) {
        if (u._id === id || u.id === id) {
          user = u;
          break;
        }
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.role = role;
      return res.status(200).json({ success: true, user });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      // Find user by id
      let user = null;
      for (const [uid, u] of mockUsers.entries()) {
        if (u._id === id || u.id === id) {
          user = u;
          break;
        }
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.isBlocked = isBlocked;
      return res.status(200).json({ success: true, user });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Toggle block error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const results = await Result.find({ userId: user._id })
      .populate('testId', 'testName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked,
        photoURL: user.photoURL,
        lastLogin: user.lastLogin
      },
      recentResults: results
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, photoURL } = req.body;
    const uid = req.user.uid;
    const updateFields = {};

    if (typeof name === 'string' && name.trim().length > 0) {
      updateFields.name = name.trim();
    }
    if (typeof phone === 'string') {
      updateFields.phone = phone.trim();
    }
    if (typeof photoURL === 'string') {
      updateFields.photoURL = photoURL.trim();
    }

    if (!isConnected()) {
      const user = mockUsers.get(uid);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      if (updateFields.name) user.name = updateFields.name;
      if (updateFields.phone !== undefined) user.phone = updateFields.phone;
      if (updateFields.photoURL !== undefined) user.photoURL = updateFields.photoURL;
      
      return res.status(200).json({ success: true, user });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      updateFields,
      { new: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked,
        photoURL: user.photoURL,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  syncUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBlock,
  getUserProfile,
  updateUserProfile,
  mockUsers
};
