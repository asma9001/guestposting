const path = require("path");
const User = require("../models/User");
const { successResponse, errorResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');
const Business = require("../models/Business");

const updateProfileSetting = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 🚨 req.body se pure data ki copy banayein direct pass na karein
    const updatedData = { ...req.body };

    // 📸 Check karein agar user ne file upload ki hai (Multer)
    if (req.file) {
      // Server URL set karein (.env se ya default localhost)
      const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
      
    // Beech mein se 'avatars/' hata dein aur '/api/' shuru mein shamil karein
const imageUrl = `${serverUrl}/api/uploads/${path.basename(req.file.filename)}`;
      
      updatedData.avatar = imageUrl;
    }

    // ⚙️ Security Check: Agar req.body mein password aa raha ho to use yahan se delete kar dein
    // Kyunki password change karne ka aapka alag function hai (updatePassword)
    delete updatedData.password; 

    const user = await User.findByIdAndUpdate(
      id, 
      { $set: updatedData }, 
      { new: true, runValidators: true } // validators run karna achhi practice hai
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Baqi functions (updatePassword, updateBusiness) bilkul perfect hain, unhein waise hi rehne dein.



const updatePassword = async (req, res) => {
  try {
    console.log('Request body:', req.body); // ✅ Debug
    console.log('Request params:', req.params); // ✅ Debug
    console.log('Request user:', req.user); // ✅ Debug
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id || req.user.id; // 

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'New passwords do not match');
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) return errorResponse(res, 404, 'User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return errorResponse(res, 400, 'Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
const updateBusiness = async (req, res) => {
  try {
    console.log('Request body:', req.body); 
    console.log('Request params:', req.params); 
    const userId = req.params.id || req.user.id;
    
    const {
      companyName,
      regNumber,
      vatNumber,
      address,
      country,
      city,
      postalCode,
    } = req.body;

    // ✅ Authorization check
    if (req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Cannot update other user's business"
      });
    }

    // ✅ Get user and check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    // 🚨 STAGE 1 GLOBAL VALIDATION: Khali submittion ko rokne ke liye
    // Agar saari fields khali hain (User ne kuch bhi nahi likha)
    if (
      (!companyName || companyName.trim() === '') &&
      (!regNumber || regNumber.trim() === '') &&
      (!vatNumber || vatNumber.trim() === '') &&
      (!address || address.trim() === '') &&
      (!country || country.trim() === '') &&
      (!city || city.trim() === '') &&
      (!postalCode || postalCode.trim() === '')
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in the details before updating."
      });
    }

    // 🚨 STAGE 2 STRICT VALIDATION FOR PUBLISHERS:
    const errors = [];
    if (user.role === 'publisher') {
      if (!companyName || companyName.trim() === '') errors.push('Company name is required');
      if (!regNumber || regNumber.trim() === '') errors.push('Registration number is required');
      if (!vatNumber || vatNumber.trim() === '') errors.push('VAT number is required');
      if (!address || address.trim() === '') errors.push('Address is required');
      if (!country || country.trim() === '') errors.push('Country is required');
      if (!city || city.trim() === '') errors.push('City is required');
      if (!postalCode || postalCode.trim() === '') errors.push('Postal code is required');

      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({
          success: false,
          message: errors[0], // Pehli error message jo toast par dikhani hai
          errors: errors
        });
      }
    }

    // ✅ Find or create business
    let business = await Business.findOne({ userId });
    let isCreating = false;

    if (!business) {
      isCreating = true;
      business = new Business({ userId });
    }

    // ✅ Update fields (Sirf wahi values save karein jo empty na hon)
    if (companyName) business.companyName = companyName;
    if (regNumber) business.regNumber = regNumber;
    if (vatNumber) business.vatNumber = vatNumber;
    if (address) business.address = address;
    if (country) business.country = country;
    if (city) business.city = city;
    if (postalCode) business.postalCode = postalCode;

    business.updatedAt = new Date();
    await business.save();

    res.status(isCreating ? 201 : 200).json({
      success: true,
      message: isCreating
        ? 'Business information created successfully'
        : 'Business information updated successfully',
      data: business
    });
  } catch (error) {
    console.error('❌ Update Business Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  updateProfileSetting,
  updatePassword,
    updateBusiness,
};