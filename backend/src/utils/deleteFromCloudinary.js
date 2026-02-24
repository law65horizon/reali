import cloudinary from '../config/cloudinary.js'

export const deleteFromCloudinary = async (assetIds) => {
  try {
    // We use .api for Admin functions
    const result = await cloudinary.api.delete_resources_by_asset_ids(assetIds, {
      invalidate: true,
      resource_type: 'image'
    });
    console.log(result)
    return result;
  } catch (error) {
    console.error("Cloudinary bulk delete failed:", error);
  }
};