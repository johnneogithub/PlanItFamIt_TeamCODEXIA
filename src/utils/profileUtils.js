export const checkProfileStatus = (profileData) => {
  try {
    // Check if profileData exists and has required fields
    if (!profileData) return false;

    // Check if all required fields are filled
    const requiredFields = ['name', 'email', 'age', 'gender', 'phone', 'location'];
    const hasAllFields = requiredFields.every(field => 
      profileData[field] && profileData[field].toString().trim() !== ''
    );

    return hasAllFields;
  } catch (error) {
    console.error("Error checking profile status:", error);
    return false;
  }
}; 