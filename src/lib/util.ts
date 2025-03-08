export function extractFilePath(url: string): string {
  // Regular expression to find the file path part of the URL
  const regex = /firebasestorage\.app\/o(\/images%2F[^?]+)/;

  // Check if the URL matches the expected pattern
  const match = url.match(regex);

  if (match && match[1]) {
    // Decode the URL-encoded file path
    return decodeURIComponent(match[1]);
  }

  // If no match, return it directly
  return url;
}
