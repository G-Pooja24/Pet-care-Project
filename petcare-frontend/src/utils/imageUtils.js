export const getPhotoUrl = (photo) => {
    if (!photo) return null;

    // Return as is if it's already an absolute URL or data URI
    if (photo.startsWith("http") || photo.startsWith("data:")) {
        return photo;
    }

    // Prepend base URL for relative paths
    // Ensure we don't double slashes if the photo path starts with /
    const baseUrl = "http://localhost:9090";
    let cleanPath = photo.startsWith("/") ? photo : `/${photo}`;

    // Common standard: assume images are served from /uploads if no other path provided
    if (!cleanPath.startsWith("/uploads/") && !cleanPath.startsWith("/images/")) {
        cleanPath = `/uploads${cleanPath}`;
    }

    return `${baseUrl}${cleanPath}`;
};
